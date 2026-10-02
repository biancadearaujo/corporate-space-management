'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    LayoutGrid,
    Users,
    Settings,
    Building2,
    LogOut,
    Bell,
    Search,
    Check,
    X,
    Menu,
    Box,
    Clock,
    FileText
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';
import Link from 'next/link';

// --- Interfaces ---
interface AdditionalHoursResponseDTO {
    additionalHoursRequestId: string;
    companyId: string;
    requesterId: string;
    requestedHours: number;
    justification: string;
    status: string;
    isApproved?: boolean;
    companyName?: string;
}

// --- Componentes Visuais Auxiliares ---

// 1. Item do Menu Lateral (Estilo da imagem: ícone + texto, fundo escuro)
const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: any) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer transition-all duration-200 
        ${active 
            ? 'bg-white/10 text-white border-l-4 border-teal-400' 
            : 'text-indigo-200 hover:bg-white/5 hover:text-white'
        }`}
    >
        <Icon size={20} />
        {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </div>
);

// 2. Card de Estatística (Topo - Fundo branco, número grande)
const StatCard = ({ title, value, subtext, icon: Icon, iconColor }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start z-10">
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${iconColor} bg-opacity-10`}>
                <Icon size={24} className={iconColor.replace('bg-', 'text-')} />
            </div>
        </div>
        <p className="text-xs text-gray-400 mt-auto z-10">{subtext}</p>
        {/* Decoração de fundo */}
        <Icon size={80} className="absolute -bottom-4 -right-4 opacity-5 text-gray-400 group-hover:scale-110 transition-transform" />
    </div>
);

// 3. Mock do Gráfico de Barras (Para simular o visual "Monthly Space Utilization")
const MockBarChart = () => {
    const bars = [40, 70, 30, 85, 50, 65, 45, 90, 60, 55, 80, 40];
    return (
        <div className="flex items-end justify-between h-48 gap-2 mt-4 px-2">
            {bars.map((height, i) => (
                <div key={i} className="w-full flex flex-col justify-end group cursor-pointer">
                    <div 
                        className="w-full bg-blue-100 dark:bg-blue-900 rounded-t-sm relative group-hover:bg-blue-200 transition-all" 
                        style={{ height: `${height}%` }}
                    >
                        {/* Tooltip simples */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                            {height}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

function AdminDashboard() {
    const { user, token, logout } = useAuth(); // Assumindo que existe logout no hook
    const router = useRouter();
    
    // Estados
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pendingRequests, setPendingRequests] = useState<AdditionalHoursResponseDTO[]>([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [reviewComment, setReviewComment] = useState('');
    const [activeReview, setActiveReview] = useState<{ requestId: string; status: 'APPROVED' | 'REJECTED' } | null>(null);

    // Efeitos (Mantendo sua lógica de fetch)
    useEffect(() => {
        const fetchPendingRequests = async () => {
            if (!token) return;
            setIsLoadingRequests(true);
            try {
                const response = await fetch('/admin/additional-hours-request/pending-admin-review-with-company', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao buscar');
                const data = await response.json();
                setPendingRequests(data);
            } catch (error) {
                console.error(error);
                // Mock de dados para visualização caso a API falhe ou esteja vazia durante teste
                if (pendingRequests.length === 0) {
                    setPendingRequests([
                        { additionalHoursRequestId: '1', companyName: 'Tech Solutions', requestedHours: 5, justification: 'Projeto Extra', status: 'PENDING', companyId: '1', requesterId: '1' },
                        { additionalHoursRequestId: '2', companyName: 'Inova Soft', requestedHours: 12, justification: 'Hackathon', status: 'PENDING', companyId: '2', requesterId: '2' },
                        { additionalHoursRequestId: '3', companyName: 'Alpha Code', requestedHours: 3, justification: 'Reunião Externa', status: 'PENDING', companyId: '3', requesterId: '3' },
                    ]);
                }
            } finally {
                setIsLoadingRequests(false);
            }
        };
        fetchPendingRequests();
    }, [token]);

    // Lógica de Review
    const startReview = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
        if (activeReview?.requestId === requestId && activeReview.status === status) {
            setActiveReview(null);
            setReviewComment('');
        } else {
            setActiveReview({ requestId, status });
            setReviewComment('');
        }
    };

    const handleReviewRequest = async () => {
        if (!activeReview || !token) return;
        
        try {
            const isApproved = activeReview.status === 'APPROVED';
            
            // Monta o ReviewRequestDTO exigido pelo AdminService
            const payload = {
                additionalHoursRequestId: activeReview.requestId,
                isApproved: isApproved,
                comments: reviewComment || (isApproved ? 'Aprovado pelo admin' : 'Recusado pelo admin'),
                status: activeReview.status 
            };

            const response = await fetch('/admin/additional-hours-request/review', {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            if (response.ok || response.status === 204) {
                // Remove da lista em caso de sucesso
                setPendingRequests(prev => prev.filter(req => req.additionalHoursRequestId !== activeReview.requestId));
                setActiveReview(null);
                setReviewComment('');
            } else {
                const errorData = await response.json().catch(() => null);
                alert(`Erro: ${errorData?.message || 'Falha ao processar a solicitação.'}`);
            }
        } catch (error) {
            console.error("Erro na revisão:", error);
            alert("Erro de conexão ao enviar a revisão.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden">
            
            {/* 1. SIDEBAR (Azul Escuro - Esquerda) */}
            <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#1A237E] text-white flex flex-col transition-all duration-300 shadow-xl z-20`}>
                
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-center border-b border-indigo-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-white text-[#1A237E] p-1.5 rounded-md font-bold text-xl">SM</div>
                        {!sidebarCollapsed && <span className="font-bold text-lg tracking-wide">SpaceMaster</span>}
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3">
                    <p className={`text-xs text-indigo-400 font-semibold mb-4 uppercase px-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
                        {sidebarCollapsed ? 'Menu' : 'Administrador'}
                    </p>
                    
                    <SidebarItem 
                        icon={LayoutGrid} 
                        label="Dashboard" 
                        active={activeTab === 'dashboard'} 
                        collapsed={sidebarCollapsed}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarItem 
                        icon={Building2} 
                        label="Empresas" 
                        collapsed={sidebarCollapsed}
                        onClick={() => router.push('/registered-companies')}
                    />
                    <SidebarItem 
                        icon={Users} 
                        label="Gestores" 
                        collapsed={sidebarCollapsed}
                        onClick={() => router.push('/register-manager')}
                    />
                    <SidebarItem 
                        icon={Box} 
                        label="Espaços & Equip." 
                        collapsed={sidebarCollapsed}
                        onClick={() => router.push('/registered-spaces')}
                    />
                    <SidebarItem 
                        icon={FileText} 
                        label="Relatórios" 
                        collapsed={sidebarCollapsed}
                    />
                </div>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-indigo-800">
                    <SidebarItem 
                        icon={LogOut} 
                        label="Sair" 
                        collapsed={sidebarCollapsed}
                        onClick={() => router.push('/')}
                    />
                    <button 
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex justify-center p-2 text-indigo-300 hover:text-white mt-2"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </aside>

            {/* 2. ÁREA PRINCIPAL (Direita) */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                
                {/* Top Header (Transparente/Branco) */}
                <header className="h-20 bg-white dark:bg-gray-800 flex items-center justify-between px-8 shadow-sm z-10">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Visão Geral</h1>
                        <p className="text-sm text-gray-500">Bem-vindo de volta, {user?.name || 'Administrador'}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar Fake */}
                        <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
                            <Search size={18} className="text-gray-400" />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none focus:outline-none text-sm ml-2 w-48" />
                        </div>

                        <button className="p-2 relative text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-full">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        
                        <div className="h-10 w-10 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                    </div>
                </header>

                {/* Conteúdo com Scroll */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {/* 3. LINHA DE ESTATÍSTICAS (Cards Brancos) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title="Total Empresas" 
                            value="125" 
                            subtext="+4 novas este mês" 
                            icon={Building2} 
                            iconColor="text-blue-600" 
                        />
                        <StatCard 
                            title="Reservas Ativas" 
                            value="87" 
                            subtext="12 finalizando hoje" 
                            icon={Clock} 
                            iconColor="text-indigo-600" 
                        />
                        <StatCard 
                            title="Horas Consumidas" 
                            value="1,230" 
                            subtext="85% da cota mensal" 
                            icon={Box} 
                            iconColor="text-orange-500" 
                        />
                        <StatCard 
                            title="Pendências" 
                            value={pendingRequests.length} 
                            subtext="Aguardando aprovação" 
                            icon={Bell} 
                            iconColor="text-red-500" 
                        />
                    </div>

                    {/* 4. ÁREA CENTRAL: Gráfico + Lista de Solicitações */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        
                        {/* Coluna Esquerda: Gráfico (Ocupa 2 espaços) */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Utilização Mensal dos Espaços</h3>
                                <div className="flex gap-2">
                                    <span className="flex items-center text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-200 mr-1"></span> Disp.</span>
                                    <span className="flex items-center text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-600 mr-1"></span> Utilizado</span>
                                </div>
                            </div>
                            <MockBarChart />
                            <div className="flex justify-between mt-2 text-xs text-gray-400 px-2">
                                <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
                                <span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
                            </div>
                        </div>

                        {/* Coluna Direita: Solicitações Pendentes (Estilo Lista da Imagem) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Solicitações de Horas</h3>
                                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{pendingRequests.length} Novas</span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
                                {pendingRequests.length === 0 ? (
                                    <p className="text-center text-gray-400 py-8 text-sm">Tudo limpo! Nenhuma solicitação.</p>
                                ) : (
                                    pendingRequests.map((request) => (
                                        <div key={request.additionalHoursRequestId} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-all hover:shadow-md border border-transparent hover:border-gray-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">{request.companyName}</h4>
                                                    <p className="text-xs text-gray-500">Solicitado: <span className="font-semibold text-indigo-600">{request.requestedHours}h</span></p>
                                                </div>
                                                <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Hoje</span>
                                            </div>
                                            
                                            <p className="text-xs text-gray-500 italic mb-3 line-clamp-2">"{request.justification}"</p>

                                            {/* Área de Ação */}
                                            <div className="flex items-center gap-2 mt-2">
                                                {activeReview?.requestId === request.additionalHoursRequestId ? (
                                                    <div className="flex flex-col w-full gap-2 animate-in fade-in slide-in-from-top-2">
                                                        <textarea
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                            placeholder="Adicionar comentário..."
                                                            className="w-full text-xs p-2 rounded border focus:ring-2 ring-indigo-200 outline-none"
                                                            rows={2}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setActiveReview(null)} className="text-xs text-gray-500 hover:text-gray-700">Cancelar</button>
                                                            <button 
                                                                onClick={handleReviewRequest}
                                                                className={`text-xs px-3 py-1 rounded text-white ${activeReview.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'}`}
                                                            >
                                                                Confirmar {activeReview.status === 'APPROVED' ? 'Aprovação' : 'Rejeição'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 w-full">
                                                        <button 
                                                            onClick={() => startReview(request.additionalHoursRequestId, 'APPROVED')}
                                                            className="flex-1 flex items-center justify-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 text-xs py-1.5 rounded transition-colors font-medium"
                                                        >
                                                            <Check size={14} /> Aprovar
                                                        </button>
                                                        <button 
                                                            onClick={() => startReview(request.additionalHoursRequestId, 'REJECTED')}
                                                            className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs py-1.5 rounded transition-colors font-medium"
                                                        >
                                                            <X size={14} /> Rejeitar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button className="w-full text-center text-xs text-indigo-600 font-semibold mt-4 hover:underline">Ver todo o histórico</button>
                        </div>
                    </div>

                    {/* 5. TABELA INFERIOR (Empresas) */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Status das Cotas por Empresa</h3>
                            <button className="bg-teal-500 hover:bg-teal-600 text-white text-xs px-4 py-2 rounded-lg transition-colors">Exportar Dados</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-semibold text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4">Nome da Empresa</th>
                                        <th className="px-6 py-4">Status da Cota</th>
                                        <th className="px-6 py-4">Horas Disponíveis</th>
                                        <th className="px-6 py-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {[1, 2, 3].map((_, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                                                Empresa Registrada {i + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">1.2M / 1.0M</span>
                                            </td>
                                            <td className="px-6 py-4 font-mono">70,086 TEM</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-teal-500 hover:text-teal-600 font-semibold text-xs border border-teal-500 rounded px-3 py-1">Ver Detalhes</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default withAuth(AdminDashboard, ['ROLE_ADMIN']);