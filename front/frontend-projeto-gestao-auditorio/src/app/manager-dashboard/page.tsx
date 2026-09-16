'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    PieChart,
    Map,
    LogOut,
    Check,
    X,
    Menu,
    User,
    Clock,
    CalendarCheck,
    UserPlus,
    Calendar,
    Save,
    AlertCircle,
    MapPin,
    Mail
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';

// --- Interfaces (DTOs) ---

interface AdditionalHoursResponseDTO {
    additionalHoursRequestId: string;
    companyId: string;
    requesterId: string;
    requestedHours: number;
    justification: string;
    status: string;
    requesterName?: string;
    createdAt?: string;
}

interface SchedulingRequestDTO {
    schedulingId: string;
    name: string;
    description: string;
    startAt: string;
    endAt: string;
    venueId: string;
    venueName?: string;
    requesterName?: string;
    status: string;
}

interface UserRegistrationResponseDTO {
    id: string;
    username: string;
    status: string;
    companyName: string;
    email?: string;
}

interface DashboardStats {
    limitHours: number;
    consumedHours: number;
    availableHours: number;
    usagePercentage: number;
    monthlyHistory: { month: string; usedHours: number }[];
}

// --- Helpers de Formatação ---
const formatDate = (dateString: string) => {
    if (!dateString) return '--/--';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// --- Componente de Modal Reutilizável ---
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Componentes Visuais Auxiliares ---
const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 mb-1 cursor-pointer transition-colors border-l-4 ${
            active
                ? 'bg-[#2d3748] border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-[#2d3748]'
        }`}
    >
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const StatCard = ({ title, value, isDark = false }: { title: string; value: string | number; isDark?: boolean }) => (
    <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'bg-white text-slate-700 border-slate-200'}`}>
        <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{title}</h4>
        <p className="text-3xl font-bold">{value}</p>
    </div>
);

// --- Componente Principal ---

function ManagerDashboard() {
    const { user, token } = useAuth();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<'hours' | 'bookings' | 'users'>('hours');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- Dados ---
    const [hourRequests, setHourRequests] = useState<AdditionalHoursResponseDTO[]>([]);
    const [schedulingRequests, setSchedulingRequests] = useState<SchedulingRequestDTO[]>([]);
    const [userRequests, setUserRequests] = useState<UserRegistrationResponseDTO[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Modais de Criação ---
    const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [hoursForm, setHoursForm] = useState({ hours: '', justification: '' });

    const [userForm, setUserForm] = useState({ 
        name: '', 
        email: '', 
        role: 'ROLE_USER',
        cpf: '',
        rg: '',
        phone: '',
        password: '' 
    });

    // --- CONTROLE DE REVISÃO (Aprovar/Rejeitar) ---
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewComment, setReviewComment] = useState("");
    
    const [selectedRequest, setSelectedRequest] = useState<{
        id: string; 
        requesterId?: string; 
        approved: boolean;
        type: 'HOURS' | 'SCHEDULING' | 'USER'; 
    } | null>(null);


    // --- FUNÇÃO DE BUSCA (Polling) ---
    const fetchAllData = useCallback(async (isBackgroundUpdate = false) => {
        if (!token) return;

        if (!isBackgroundUpdate) setIsLoading(true);
        setError(null);
        
        try {
            // 1. Horas Extras
            const hoursResponse = await fetch('/manager/additional-hours-request/pending-manager-review', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (hoursResponse.ok) {
                const hoursData = await hoursResponse.json();
                const rawHours = hoursData.content || hoursData;
                const pendingHours = rawHours.filter((i: any) => i.status === 'PENDING_MANAGER_REVIEW' || i.status === 'PENDING');
                
                setHourRequests(pendingHours.map((item: any) => ({
                    ...item,
                    requesterName: item.requesterName || `ID: ${item.requesterId?.substring(0,8)}...` 
                })));
            }

            // 2. Agendamentos
            const schedResponse = await fetch('/manager/scheduling/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (schedResponse.ok) {
                const schedData = await schedResponse.json();
                const rawList = schedData.content || schedData;
                const pendingSchedulings = rawList.filter((item: any) => item.status === 'PENDING');
                setSchedulingRequests(pendingSchedulings); 
            } 

            // 3. Usuários
            const usersResponse = await fetch('/manager/users/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                const rawUsers = usersData.content || usersData;
                const pendingUsers = rawUsers.filter((u: any) => u.status === 'PENDING');
                setUserRequests(pendingUsers);
            }

            // 4. Busca Estatísticas do Dashboard (NOVO)
            try {
                const statsResponse = await fetch('/manager/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (statsResponse.ok) {
                    setStats(await statsResponse.json());
                }
            } catch (e) {
                console.error("Erro ao buscar stats", e);
            }

        } catch (err: any) {
            console.error("Falha na conexão:", err);
            if (!isBackgroundUpdate) {
                setError("Erro ao carregar dados. Verifique a conexão.");
            }
        } finally {
            if (!isBackgroundUpdate) setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAllData(false); 
        const interval = setInterval(() => fetchAllData(true), 60000); 
        return () => clearInterval(interval);
    }, [fetchAllData]);

    const openReviewModal = (id: string, approved: boolean, type: 'HOURS' | 'SCHEDULING' | 'USER', requesterId?: string) => {
        setSelectedRequest({ id, requesterId, approved, type });
        setReviewComment(""); 
        setReviewModalOpen(true);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;

        try {
            let endpoint = '';
            let method = '';
            let body = null;

            if (selectedRequest.type === 'HOURS') {
                endpoint = '/manager/additional-hours-request/review';
                method = 'PUT';
                body = JSON.stringify({
                    additionalHoursRequestId: selectedRequest.id,
                    requesterId: selectedRequest.requesterId, 
                    isApproved: selectedRequest.approved,
                    comments: reviewComment,
                    requestedHours: 0, justification: "", status: "PENDING" 
                });
            } else if (selectedRequest.type === 'SCHEDULING') {
                if (selectedRequest.approved) {
                    endpoint = `/manager/scheduling/approve/${selectedRequest.id}`;
                    method = 'POST';
                } else {
                    endpoint = `/manager/scheduling/reject/${selectedRequest.id}`;
                    method = 'POST';
                    body = JSON.stringify({ rejectionReason: reviewComment });
                }
            } else if (selectedRequest.type === 'USER') {
                if (selectedRequest.approved) {
                    endpoint = `/manager/user/approve/${selectedRequest.id}`;
                    method = 'POST';
                } else {
                    endpoint = `/manager/user/reject/${selectedRequest.id}`;
                    method = 'POST';
                    body = JSON.stringify({ rejectionReason: reviewComment });
                }
            }

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: body ? body : undefined
            });

            if (response.ok || response.status === 201 || response.status === 204) {
                if (selectedRequest.type === 'HOURS') {
                    setHourRequests(prev => prev.filter(req => req.additionalHoursRequestId !== selectedRequest.id));
                } else if (selectedRequest.type === 'SCHEDULING') {
                    setSchedulingRequests(prev => prev.filter(req => req.schedulingId !== selectedRequest.id));
                } else if (selectedRequest.type === 'USER') {
                    setUserRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
                }
                setReviewModalOpen(false);
            } else {
                const errorData = await response.json().catch(() => null);
                alert(`Erro: ${errorData?.message || 'Falha ao processar solicitação'}`);
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            alert("Erro de conexão com o servidor.");
        }
    };

    // --- ENVIO DE SOLICITAÇÃO DE HORAS (REAL) ---
    const handleSubmitHours = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação simples
        if (!hoursForm.hours || !hoursForm.justification) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        try {
            // Montando o objeto conforme o AdditionalHoursRequestDTO do Java
            const payload = {
                requestedHours: parseFloat(hoursForm.hours), // Converte string para double
                justification: hoursForm.justification,
                comments: hoursForm.justification, // Usamos a justificativa como comentário inicial do histórico
                // Os campos abaixo são ignorados pelo método managerDirectRequest, 
                // mas enviamos null/false para manter a estrutura do DTO válida se necessário
                additionalHoursRequestId: null,
                companyId: null,
                requesterId: null,
                status: null,
                isApproved: false
            };

            const response = await fetch('/manager/additional-hours-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const newRequest = await response.json();
                
                // Formata o objeto retornado para bater com a interface da lista (adiciona nome se faltar)
                const formattedRequest: AdditionalHoursResponseDTO = {
                    ...newRequest,
                    requesterName: newRequest.requesterName || user?.name || 'Eu (Gestor)' 
                };

                // Adiciona no topo da lista visualmente
                setHourRequests(prev => [formattedRequest, ...prev]);
                
                // Limpa e fecha
                alert("Solicitação de horas enviada com sucesso!");
                setHoursForm({ hours: '', justification: '' });
                setIsHoursModalOpen(false);
                
                // Opcional: Atualizar os gráficos de saldo
                fetchAllData(true); 
            } else {
                const errorData = await response.json().catch(() => null);
                alert(`Erro ao solicitar: ${errorData?.message || 'Verifique os dados.'}`);
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            alert("Erro de conexão ao tentar enviar solicitação.");
        }
    };

    // --- CRIAÇÃO DE USUÁRIO (REAL) ---
    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Monta o DTO conforme o Java espera (ManagerCreateUserDTO)
            const payload = {
                username: userForm.name,
                email: userForm.email,
                cpf: userForm.cpf,
                rgNumber: userForm.rg,
                phoneNumber: userForm.phone,
                password: userForm.password // Em produção, o ideal é enviar email de convite
            };

            const response = await fetch('/manager/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Usuário cadastrado com sucesso!");
                setIsUserModalOpen(false);
                // Limpa o form
                setUserForm({ name: '', email: '', role: 'ROLE_USER', cpf: '', rg: '', phone: '', password: '' });
                // Atualiza listas (se você tiver uma lista de usuários ativos, atualize-a aqui)
            } else {
                const errorData = await response.json().catch(() => null);
                alert(`Erro ao criar usuário: ${errorData?.message || 'Verifique os dados (CPF/Email duplicado?)'}`);
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro de conexão.");
        }
    };    

    const getModalText = () => {
        if (!selectedRequest?.approved) return "Ao rejeitar, a solicitação será encerrada e o solicitante notificado.";
        switch(selectedRequest.type) {
            case 'HOURS': return "Aprovar solicitação de horas extras?";
            case 'SCHEDULING': return "Aprovar este agendamento?";
            case 'USER': return "Aprovar cadastro deste novo usuário?";
            default: return "";
        }
    }

    return (
        <div className="flex min-h-screen bg-[#f1f5f9] font-sans text-slate-800">
            
            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1c2434] text-white transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-center h-20 border-b border-gray-700">
                    <h1 className="text-2xl font-bold tracking-wider">SPACE<span className="text-blue-500">M.</span></h1>
                </div>
                <nav className="mt-8">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={true} onClick={() => router.push('/manager-dashboard')} />
                    <SidebarItem icon={Map} label="Meus Espaços" active={false} onClick={() => router.push('/our-spaces')} />
                    <SidebarItem icon={Calendar} label="Novo Agendamento" active={false} onClick={() => router.push('/calendar')} />
                    <SidebarItem icon={LogOut} label="Sair" onClick={() => router.push('/')} />
                </nav>
            </aside>

            {/* CONTEÚDO */}
            <div className="flex-1 lg:ml-64 transition-all duration-300">
                
                <header className="sticky top-0 z-40 bg-[#f1f5f9]/90 backdrop-blur-sm p-6 flex justify-between items-center border-b border-white/50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 bg-white rounded-md shadow-sm"><Menu size={20} /></button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
                            <p className="text-sm text-gray-500">Bem-vindo de volta, {user?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsHoursModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition shadow-sm text-sm font-medium"><Clock size={16} /> Solicitar Horas</button>
                        <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md text-sm font-medium"><UserPlus size={16} /> Novo Usuário</button>
                    </div>
                </header>

                <main className="p-6 pt-2">
                    
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Pendências" value={hourRequests.length + schedulingRequests.length + userRequests.length} />
                        <StatCard title="Agendamentos" value={schedulingRequests.length} isDark={true} />
                        <StatCard title="Novos Usuários" value={userRequests.length} />
                        <StatCard title="Horas Pendentes" value={hourRequests.length} />
                    </div>

                    {/* --- GRÁFICOS (COM DADOS REAIS) --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        
                        {/* Card Esquerda: Gráfico de Barras */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            <h3 className="font-bold text-lg text-slate-800 mb-6">Fluxo de Uso (Últimos 12 Meses)</h3>
                            
                            <div className="flex-1 flex items-end justify-between gap-2 px-2 min-h-[200px]">
                                {!stats ? (
                                    <p className="w-full text-center text-gray-400 self-center">Carregando gráfico...</p>
                                ) : (
                                    stats.monthlyHistory.map((item, i) => {
                                        // Calcula altura relativa (máximo assumido de 100h para escala visual, ou use o maior valor da lista)
                                        const maxVal = Math.max(...stats.monthlyHistory.map(h => h.usedHours), 10); // Evita divisão por zero
                                        const heightPercent = (item.usedHours / maxVal) * 100;
                                        
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-2 w-full group">
                                                <div className="w-full bg-slate-100 rounded-t-md relative h-48 flex items-end">
                                                    <div 
                                                        className="w-full bg-blue-600 rounded-t-md transition-all duration-500 group-hover:bg-blue-700" 
                                                        style={{ height: `${heightPercent}%` }}
                                                    ></div>
                                                    {/* Tooltip simples */}
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                        {item.usedHours}h
                                                    </div>
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium">{item.month}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Card Direita: Status de HORAS (Pizza) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            <h3 className="font-bold text-lg text-slate-800 mb-6">Orçamento de Horas</h3>
                            
                            <div className="flex-1 flex flex-col items-center justify-center">
                                {/* Gráfico Circular CSS */}
                                <div 
                                    className="relative w-48 h-48 rounded-full mb-4" 
                                    style={{ 
                                        background: `conic-gradient(#3b82f6 0% ${stats?.usagePercentage || 0}%, #cbd5e1 ${stats?.usagePercentage || 0}% 100%)` 
                                    }}
                                >
                                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
                                        <span className="text-gray-400 text-xs uppercase font-bold">Utilizadas</span>
                                        <span className="text-3xl font-bold text-slate-800">
                                            {stats ? Math.round(stats.usagePercentage) : 0}%
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full space-y-3 mt-2">
                                    <div className="flex justify-between items-center text-sm border-b border-dashed pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Consumidas
                                        </div>
                                        <span className="font-bold text-slate-700">{stats?.consumedHours || 0}h</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-slate-300"></span> Disponíveis
                                        </div>
                                        <span className="font-bold text-slate-700">{stats?.availableHours || 0}h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ABAS E LISTAGEM */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="flex border-b border-slate-200">
                            <button onClick={() => setActiveTab('hours')} className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'hours' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <Clock size={18} /> Horas Extras ({hourRequests.length})
                            </button>
                            <button onClick={() => setActiveTab('bookings')} className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <CalendarCheck size={18} /> Agendamentos ({schedulingRequests.length})
                            </button>
                            <button onClick={() => setActiveTab('users')} className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <UserPlus size={18} /> Novos Usuários ({userRequests.length})
                            </button>
                        </div>

                        <div className="p-6 min-h-[300px]">
                            {isLoading && <p className="text-center text-gray-400 py-10">Carregando dados...</p>}
                            {!isLoading && error && <div className="p-4 bg-red-50 text-red-600 rounded-lg flex gap-2"><AlertCircle size={20}/> {error}</div>}
                            
                            {/* --- ABA: HORAS EXTRAS --- */}
                            {!isLoading && !error && activeTab === 'hours' && (
                                <div className="space-y-3">
                                    {hourRequests.length === 0 && <p className="text-center text-gray-400 py-10">Nenhuma solicitação de hora extra pendente.</p>}
                                    {hourRequests.map((req) => (
                                        <div key={req.additionalHoursRequestId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4 transition hover:border-blue-200">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">{req.requestedHours}h</div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-lg">{req.requesterName}</p>
                                                    <p className="text-sm text-slate-600 mb-1">{req.justification}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                <button onClick={() => openReviewModal(req.additionalHoursRequestId, true, 'HOURS', req.requesterId)} className="flex items-center gap-1 px-3 py-2 bg-white border border-green-200 text-green-600 rounded-md hover:bg-green-50 transition-colors text-sm font-medium"><Check size={16}/> Aprovar</button>
                                                <button onClick={() => openReviewModal(req.additionalHoursRequestId, false, 'HOURS', req.requesterId)} className="flex items-center gap-1 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"><X size={16}/> Rejeitar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* --- ABA: AGENDAMENTOS (REAL) --- */}
                            {!isLoading && !error && activeTab === 'bookings' && (
                                <div className="space-y-3">
                                    {schedulingRequests.length === 0 && <p className="text-center text-gray-400 py-10">Nenhum agendamento pendente.</p>}
                                    {schedulingRequests.map((req) => (
                                        <div key={req.schedulingId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4 transition hover:border-purple-200">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0"><MapPin size={24} /></div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-lg">{req.name} <span className="text-sm font-normal text-gray-500">no {req.venueName || 'Espaço'}</span></p>
                                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-sm text-slate-600">
                                                        <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(req.startAt)}</span>
                                                        <span className="flex items-center gap-1"><Clock size={14}/> {formatTime(req.startAt)} - {formatTime(req.endAt)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">{req.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                <button onClick={() => openReviewModal(req.schedulingId, true, 'SCHEDULING')} className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"><Check size={16}/> Aprovar</button>
                                                <button onClick={() => openReviewModal(req.schedulingId, false, 'SCHEDULING')} className="flex items-center gap-1 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"><X size={16}/> Rejeitar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* --- ABA: USUÁRIOS (REAL) --- */}
                            {!isLoading && !error && activeTab === 'users' && (
                                <div className="space-y-3">
                                    {userRequests.length === 0 && <p className="text-center text-gray-400 py-10">Nenhum cadastro de usuário pendente.</p>}
                                    {userRequests.map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><User size={20} /></div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{req.username}</p>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        {req.email && <><Mail size={12}/> {req.email}</>}
                                                        <span>• {req.companyName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => openReviewModal(req.id, true, 'USER')} className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200"><Check size={18}/></button>
                                                <button onClick={() => openReviewModal(req.id, false, 'USER')} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200"><X size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* --- MODAIS --- */}
            <Modal isOpen={isHoursModalOpen} onClose={() => setIsHoursModalOpen(false)} title="Solicitar Horas">
                <form onSubmit={handleSubmitHours} className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1">Horas</label><input type="number" className="w-full p-2 border rounded" value={hoursForm.hours} onChange={e => setHoursForm({...hoursForm, hours: e.target.value})}/></div>
                    <div><label className="block text-sm font-medium mb-1">Motivo</label><textarea className="w-full p-2 border rounded" value={hoursForm.justification} onChange={e => setHoursForm({...hoursForm, justification: e.target.value})}/></div>
                    <div className="flex justify-end gap-2"><button type="button" onClick={() => setIsHoursModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancelar</button><button className="px-4 py-2 bg-blue-600 text-white rounded">Enviar</button></div>
                </form>
            </Modal>
            <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Cadastrar Novo Colaborador">
                <form onSubmit={handleSubmitUser} className="space-y-3">
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Nome Completo</label>
                        <input type="text" required className="w-full p-2 border rounded" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})}/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" required className="w-full p-2 border rounded" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Telefone</label>
                            <input type="text" placeholder="(XX) XXXXX-XXXX" className="w-full p-2 border rounded" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">CPF</label>
                            <input type="text" required placeholder="apenas números" className="w-full p-2 border rounded" value={userForm.cpf} onChange={e => setUserForm({...userForm, cpf: e.target.value})}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">RG</label>
                            <input type="text" required className="w-full p-2 border rounded" value={userForm.rg} onChange={e => setUserForm({...userForm, rg: e.target.value})}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Senha Inicial</label>
                        <input type="password" required className="w-full p-2 border rounded" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})}/>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2">
                            <UserPlus size={18}/> Cadastrar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL DE REVISÃO (Unificado) --- */}
            <Modal 
                isOpen={reviewModalOpen} 
                onClose={() => setReviewModalOpen(false)} 
                title={selectedRequest?.approved ? "Confirmar Aprovação" : "Rejeitar Solicitação"}
            >
                <form onSubmit={submitReview} className="space-y-4">
                    <div className={`p-3 rounded text-sm ${selectedRequest?.approved ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {getModalText()}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {selectedRequest?.approved ? "Observações (Opcional)" : "Motivo da Rejeição (Obrigatório)"}
                        </label>
                        <textarea 
                            required={!selectedRequest?.approved}
                            rows={3} 
                            className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500" 
                            value={reviewComment} 
                            onChange={(e) => setReviewComment(e.target.value)} 
                            placeholder={selectedRequest?.approved ? "Ex: Aprovado." : "Ex: Documentação incompleta / CPF inválido."}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setReviewModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
                        <button type="submit" className={`px-4 py-2 text-sm text-white rounded-md flex items-center gap-2 shadow-sm ${selectedRequest?.approved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                            {selectedRequest?.approved ? <Check size={16} /> : <X size={16} />}
                            {selectedRequest?.approved ? "Aprovar" : "Rejeitar"}
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}

export default withAuth(ManagerDashboard, ['ROLE_MANAGER']);