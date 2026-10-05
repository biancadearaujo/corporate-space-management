'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Building2, Bell, Menu, Check, X, CheckCircle2, XCircle, Info
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

interface CompanyQuotaSummaryDTO {
    companyId: string;
    companyName: string;
    totalHoursLimit: number;
    usedHours: number;
}

interface MonthlyCreationDTO {
    month: string;
    count: number;
}

// --- Componentes Visuais Auxiliares ---
const StatCard = ({ title, value, subtext, active }: { title: string, value: string | number, subtext?: string, active?: boolean }) => (
    <div className={`p-6 rounded-[24px] shadow-sm border transition-all duration-300 ${
        active ? 'bg-[#003399] text-white border-[#003399]' : 'bg-white text-slate-700 border-slate-100 hover:shadow-md'
    }`}>
        <p className={`text-sm font-medium mb-2 ${active ? 'text-blue-100' : 'text-slate-500'}`}>{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        {subtext && <p className={`text-xs mt-2 ${active ? 'text-blue-200/80' : 'text-slate-400'}`}>{subtext}</p>}
    </div>
);

// --- NOVO: Gráfico Real Dinâmico ---
const RealBarChart = ({ data }: { data: MonthlyCreationDTO[] }) => {
    if (!data || data.length === 0) {
        return <div className="h-[220px] flex items-center justify-center text-slate-400">Nenhum histórico disponível.</div>;
    }

    const maxHours = Math.max(...data.map(item => item.count || 0), 1);

    return (
        <div className="flex items-end justify-between gap-2 px-2 min-h-[220px]">
            {data.map((item, i) => {
                const val = item.count || 0;
                const monthName = item.month || ''; 
                
                const heightPercent = (val / maxHours) * 100;

                return (
                    <div key={i} className="w-full flex flex-col justify-end items-center group cursor-pointer h-full gap-3 mt-4">
                        <div className="w-full bg-[#F0F2F5] rounded-t-xl relative h-48 flex items-end overflow-visible">
                            <div 
                                className="w-full bg-[#003399] rounded-t-xl transition-all duration-700 opacity-80 group-hover:opacity-100" 
                                style={{ height: `${heightPercent}%` }}
                            ></div>
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-600">{val}h</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate w-full text-center">
                            {monthName}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// --- Componente Principal ---
function AdminDashboard() {
    const { user, token, logout } = useAuth(); 
    const router = useRouter();
    
    // Estados de Interface
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dbUserName, setDbUserName] = useState<string>('');

    // Estados de Dados (Agora com monthlyHistory)
    const [pendingRequests, setPendingRequests] = useState<AdditionalHoursResponseDTO[]>([]);
    const [companiesQuotas, setCompaniesQuotas] = useState<CompanyQuotaSummaryDTO[]>([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalCompanies: 0,
        activeReservations: 0,
        consumedHours: 0,
        monthlyHistory: [] as MonthlyCreationDTO[] 
    });
    
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    
    // Estados de Ação
    const [reviewComment, setReviewComment] = useState('');
    const [activeReview, setActiveReview] = useState<{ requestId: string; status: 'APPROVED' | 'REJECTED' } | null>(null);

    // Alerta Personalizado
    const [customAlert, setCustomAlert] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' | 'info' });
    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setCustomAlert({ isOpen: true, title, message, type });
    };

    // Efeitos
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!token) return;
            try {
                const response = await fetch('http://localhost:8080/admin/user/me', { headers: { 'Authorization': `Bearer ${token}` } });
                if (response.ok) { const data = await response.json(); if (data.name || data.username) setDbUserName(data.name || data.username); }
            } catch (error) { console.error("Erro ao buscar perfil:", error); }
        };
        fetchUserProfile();
    }, [token]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) return;
            setIsLoadingRequests(true);
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                // 1. Busca pendências
                const requestsRes = await fetch('http://localhost:8080/admin/additional-hours-request/pending-admin-review-with-company', { headers });
                if (requestsRes.ok) setPendingRequests(await requestsRes.json());

                // 2. Busca estatísticas e mapeia os novos dados pro estado
                const statsRes = await fetch('http://localhost:8080/admin/dashboard/stats', { headers });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setDashboardStats({
                        totalCompanies: statsData.totalActiveCompanies || 0, // Ajustado para bater com o Java
                        activeReservations: statsData.activeReservations || 0,
                        consumedHours: statsData.totalConsumedHours || 0,    // Ajustado para bater com o Java
                        monthlyHistory: statsData.monthlyCreations || []     // Ajustado para o gráfico
                    });
                }

                // 3. Busca tabela de cotas por empresa
                const companiesRes = await fetch('http://localhost:8080/admin/company-hours-quota/with-quota', { headers });
                if (companiesRes.ok) setCompaniesQuotas(await companiesRes.json());

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setIsLoadingRequests(false);
            }
        };
        fetchAllData();
    }, [token]);

    // Handlers
    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/'); 
    };

    const handleDashboardClick = () => {
        const roles = user?.roles || []; 
        if (roles.includes('ROLE_ADMIN')) router.push('/admin-dashboard');
        else if (roles.includes('ROLE_MANAGER')) router.push('/manager-dashboard');
        else if (roles.includes('ROLE_COLLABORATOR')) router.push('/collaborator-dashboard');
        else router.push('/');
    };

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
            
            const payload = {
                additionalHoursRequestId: activeReview.requestId,
                isApproved: isApproved,
                comments: reviewComment || (isApproved ? 'Aprovado pelo admin' : 'Recusado pelo admin'),
                status: activeReview.status 
            };

            const response = await fetch('http://localhost:8080/admin/additional-hours-request/review', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok || response.status === 204) {
                setPendingRequests(prev => prev.filter(req => req.additionalHoursRequestId !== activeReview.requestId));
                setActiveReview(null);
                setReviewComment('');
                showAlert("Sucesso", `Solicitação ${isApproved ? 'aprovada' : 'rejeitada'} com sucesso!`, "success");
            } else {
                const errorData = await response.json().catch(() => null);
                showAlert("Erro", errorData?.message || 'Falha ao processar a solicitação.', "error");
            }
        } catch (error) {
            console.error("Erro na revisão:", error);
            showAlert("Erro de Conexão", "Não foi possível conectar ao servidor.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            
            {/* --- TOP NAVBAR --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shrink-0">
                <div className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-[#003399] transition-colors xl:hidden">
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleDashboardClick}>
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/></svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">Órbita</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href="/admin-dashboard" className="text-[#003399] font-semibold transition-colors">Painel Geral</Link>
                        <Link href="/registered-companies" className="hover:text-[#003399] transition-colors">Empresas</Link>
                        <Link href="/register-manager" className="hover:text-[#003399] transition-colors">Gestores</Link>
                        <Link href="/registered-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    <div className="flex items-center gap-5">
                        <button className="relative p-2 text-slate-400 hover:text-[#003399] transition-colors bg-white rounded-full border border-slate-200 shadow-sm outline-none">
                            <Bell size={18} />
                            {pendingRequests.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>}
                        </button>
                        <span className="text-[15px] font-medium text-slate-600 hidden md:block">
                            {dbUserName ? dbUserName.split(' ')[0] : (user?.name?.split(' ')[0] || 'Admin')}
                        </span>
                        <button onClick={handleLogout} className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors">Sair</button>
                    </div>
                </div>
            </header>

            {/* --- MENU MOBILE --- */}
            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href="/admin-dashboard" className="text-[#003399] font-semibold">Painel Geral</Link>
                        <Link href="/registered-companies" className="hover:text-[#003399]">Empresas</Link>
                        <Link href="/register-manager" className="hover:text-[#003399]">Gestores</Link>
                        <Link href="/registered-spaces" className="hover:text-[#003399]">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Painel Administrativo</h2>
                            <p className="text-slate-500 mt-1 text-sm">Visão geral do sistema e aprovações pendentes.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard title="Total de Empresas" value={dashboardStats.totalCompanies} active={true} />
                        <StatCard title="Reservas Ativas" value={dashboardStats.activeReservations} />
                        <StatCard title="Horas Consumidas" value={dashboardStats.consumedHours} subtext="No mês atual" />
                        <StatCard title="Pendências" value={pendingRequests.length} subtext="Aguardando admin" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* GRÁFICO DINÂMICO */}
                        <div className="lg:col-span-2 bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Utilização Mensal (Geral)</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="w-3 h-3 rounded-full bg-[#003399]"></div> Total de Horas
                                </div>
                            </div>
                            <RealBarChart data={dashboardStats.monthlyHistory} />
                        </div>

                        {/* LISTA DE SOLICITAÇÕES */}
                        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Solicitações de Horas</h3>
                                {pendingRequests.length > 0 && <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-1 rounded-md">{pendingRequests.length} Novas</span>}
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[350px]">
                                {isLoadingRequests ? (
                                    <p className="text-center text-slate-400 py-8 font-medium">Buscando...</p>
                                ) : pendingRequests.length === 0 ? (
                                    <p className="text-center text-slate-400 py-8 font-medium">Nenhuma solicitação pendente.</p>
                                ) : (
                                    pendingRequests.map((request) => (
                                        <div key={request.additionalHoursRequestId} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{request.companyName}</h4>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <span className="text-[10px] font-bold text-[#003399] bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{request.requestedHours}h</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed" title={request.justification}>"{request.justification}"</p>

                                            <div className="flex flex-col gap-2">
                                                {activeReview?.requestId === request.additionalHoursRequestId ? (
                                                    <div className="flex flex-col gap-2 bg-[#F0F2F5] p-2 rounded-xl">
                                                        <textarea
                                                            value={reviewComment}
                                                            onChange={(e) => setReviewComment(e.target.value)}
                                                            placeholder={activeReview.status === 'APPROVED' ? "Comentário (opcional)..." : "Motivo da rejeição..."}
                                                            className="w-full text-xs p-2 rounded-lg border-transparent focus:ring-2 focus:ring-[#003399]/20 outline-none resize-none bg-white"
                                                            rows={2}
                                                            required={activeReview.status === 'REJECTED'}
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setActiveReview(null)} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2">Cancelar</button>
                                                            <button onClick={handleReviewRequest} className={`text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-sm ${activeReview.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                                                Confirmar {activeReview.status === 'APPROVED' ? 'Aprovação' : 'Rejeição'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 w-full">
                                                        <button onClick={() => startReview(request.additionalHoursRequestId, 'REJECTED')} className="flex-1 flex justify-center items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[11px] py-2 rounded-lg transition-colors font-bold uppercase tracking-wider">
                                                            <X size={14} /> Recusar
                                                        </button>
                                                        <button onClick={() => startReview(request.additionalHoursRequestId, 'APPROVED')} className="flex-1 flex justify-center items-center gap-1.5 bg-[#003399] hover:bg-[#002266] text-white text-[11px] py-2 rounded-lg transition-colors font-bold uppercase tracking-wider shadow-sm">
                                                            <Check size={14} /> Aprovar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 5. TABELA INFERIOR (Empresas) */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-slate-800">Status das Cotas por Empresa</h3>
                            <button className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-slate-200 shadow-sm uppercase tracking-wider">Exportar</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-[#F0F2F5]/50 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Nome da Empresa</th>
                                        <th className="px-6 py-4">Status da Cota</th>
                                        <th className="px-6 py-4">Horas Disponíveis</th>
                                        <th className="px-6 py-4 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {companiesQuotas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">
                                                Nenhuma empresa com cota registrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        companiesQuotas.map((company, i) => (
                                            <tr key={company.companyId || i} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#003399] shrink-0"><Building2 size={16}/></div>
                                                    {company.companyName}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50 text-[#003399] border border-blue-100 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider">
                                                        {company.usedHours || 0}h / {company.totalHoursLimit || 0}h
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-600">
                                                    {(company.totalHoursLimit || 0) - (company.usedHours || 0)}h
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => router.push('/registered-companies')} className="text-[#003399] hover:bg-blue-50 font-bold text-[11px] uppercase tracking-wider rounded-md px-3 py-1.5 transition-colors">Ver Detalhes</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>

            {/* Alerta Customizado */}
            {customAlert.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 md:p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="flex justify-center mb-4">
                            {customAlert.type === 'success' && <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 size={32} /></div>}
                            {customAlert.type === 'error' && <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><XCircle size={32} /></div>}
                            {customAlert.type === 'info' && <div className="w-16 h-16 bg-blue-50 text-[#003399] rounded-full flex items-center justify-center"><Info size={32} /></div>}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{customAlert.title}</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed whitespace-pre-line">{customAlert.message}</p>
                        <button onClick={() => setCustomAlert({ ...customAlert, isOpen: false })} className={`w-full py-3.5 text-white rounded-xl font-bold transition shadow-md ${customAlert.type === 'error' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-[#003399] hover:bg-[#002266]'}`}>
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuth(AdminDashboard, ['ROLE_ADMIN']);