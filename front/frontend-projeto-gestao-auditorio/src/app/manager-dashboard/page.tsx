'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Menu, Search, Bell, Clock, CalendarCheck, UserPlus, Calendar, 
    AlertCircle, MapPin, Mail, Check, X, CheckCircle2, XCircle, Info,
    LayoutDashboard, Map, ChevronRight
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';
import Link from 'next/link';

// --- INTERFACES ---
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

// --- HELPERS ---
const formatDate = (dateString: string) => {
    if (!dateString) return '--/--';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const StatCard = ({ title, value, subtext, active }: { title: string, value: string | number, subtext?: string, active?: boolean }) => (
    <div className={`p-6 rounded-[24px] shadow-sm border transition-all duration-300 ${
        active ? 'bg-[#003399] text-white border-[#003399]' : 'bg-white text-slate-700 border-slate-100 hover:shadow-md'
    }`}>
        <p className={`text-sm font-medium mb-2 ${active ? 'text-blue-100' : 'text-slate-500'}`}>{title}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        {subtext && <p className={`text-xs mt-2 ${active ? 'text-blue-200/80' : 'text-slate-400'}`}>{subtext}</p>}
    </div>
);

// --- COMPONENTE PRINCIPAL ---
function ManagerDashboard() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    
    // Estados de Interface
    const [activeTab, setActiveTab] = useState<'hours' | 'bookings' | 'users'>('hours');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dbUserName, setDbUserName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Estados de Dados
    const [hourRequests, setHourRequests] = useState<AdditionalHoursResponseDTO[]>([]);
    const [schedulingRequests, setSchedulingRequests] = useState<SchedulingRequestDTO[]>([]);
    const [userRequests, setUserRequests] = useState<UserRegistrationResponseDTO[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Modais e Formulários
    const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [hoursForm, setHoursForm] = useState({ hours: '', justification: '' });
    const [userForm, setUserForm] = useState({ name: '', email: '', role: 'ROLE_USER', cpf: '', rg: '', phone: '', password: '' });

    // Modal de Revisão
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewComment, setReviewComment] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<{ id: string; requesterId?: string; approved: boolean; type: 'HOURS' | 'SCHEDULING' | 'USER'; } | null>(null);

    // Alerta Personalizado
    const [customAlert, setCustomAlert] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' | 'info' });
    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setCustomAlert({ isOpen: true, title, message, type });
    };

    // --- FETCHES ---
    const fetchUserProfile = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/manager/user/me', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) { const data = await response.json(); if (data.name) setDbUserName(data.name); }
        } catch (error) { console.error(error); }
    };

    const fetchAllData = useCallback(async (isBackgroundUpdate = false) => {
        if (!token) return;
        if (!isBackgroundUpdate) setIsLoading(true);
        
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            // 1. Horas Extras
            const hoursRes = await fetch('http://localhost:8080/manager/additional-hours-request/pending-manager-review', { headers });
            if (hoursRes.ok) {
                const hoursData = await hoursRes.json();
                const pendingHours = (hoursData.content || hoursData).filter((i: any) => i.status === 'PENDING_MANAGER_REVIEW' || i.status === 'PENDING');
                setHourRequests(pendingHours.map((item: any) => ({ ...item, requesterName: item.requesterName || `ID: ${item.requesterId?.substring(0,8)}...` })));
            }

            // 2. Agendamentos
            const schedRes = await fetch('http://localhost:8080/manager/scheduling/pending', { headers });
            if (schedRes.ok) {
                const schedData = await schedRes.json();
                setSchedulingRequests((schedData.content || schedData).filter((item: any) => item.status === 'PENDING')); 
            } 

            // 3. Usuários
            const usersRes = await fetch('http://localhost:8080/manager/users/pending', { headers });
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUserRequests((usersData.content || usersData).filter((u: any) => u.status === 'PENDING'));
            }

            // 4. Estatísticas
            const statsRes = await fetch('http://localhost:8080/manager/dashboard/stats', { headers });
            if (statsRes.ok) setStats(await statsRes.json());

        } catch (err: any) {
            console.error("Falha na conexão:", err);
            if (!isBackgroundUpdate) showAlert("Erro de Conexão", "Não foi possível carregar os dados.", "error");
        } finally {
            if (!isBackgroundUpdate) setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        fetchUserProfile();
        fetchAllData(false); 
        const interval = setInterval(() => fetchAllData(true), 60000); 
        return () => clearInterval(interval);
    }, [token, fetchAllData]);

    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/'); 
    };

    // --- AÇÕES ---
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
                    comments: reviewComment || (selectedRequest.approved ? 'Aprovado pelo gestor' : 'Recusado pelo gestor'),
                    requestedHours: 0, justification: "", status: null
                });
            } else if (selectedRequest.type === 'SCHEDULING') {
                endpoint = `/manager/scheduling/${selectedRequest.approved ? 'approve' : 'reject'}/${selectedRequest.id}`;
                method = 'POST';
                if (!selectedRequest.approved) body = JSON.stringify({ rejectionReason: reviewComment });
            } else if (selectedRequest.type === 'USER') {
                endpoint = `/manager/user/${selectedRequest.approved ? 'approve' : 'reject'}/${selectedRequest.id}`;
                method = 'POST';
                if (!selectedRequest.approved) body = JSON.stringify({ rejectionReason: reviewComment });
            }

            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: body ? body : undefined
            });

            if (response.ok || response.status === 201 || response.status === 204) {
                if (selectedRequest.type === 'HOURS') setHourRequests(prev => prev.filter(req => req.additionalHoursRequestId !== selectedRequest.id));
                else if (selectedRequest.type === 'SCHEDULING') setSchedulingRequests(prev => prev.filter(req => req.schedulingId !== selectedRequest.id));
                else if (selectedRequest.type === 'USER') setUserRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
                
                setReviewModalOpen(false);
                showAlert("Sucesso", `Solicitação ${selectedRequest.approved ? 'aprovada' : 'rejeitada'} com sucesso!`, "success");
            } else {
                const errorData = await response.json().catch(() => null);
                showAlert("Erro", errorData?.message || 'Falha ao processar solicitação', "error");
            }
        } catch (error) { showAlert("Erro de Conexão", "Não foi possível conectar ao servidor.", "error"); }
    };

    const handleSubmitHours = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hoursForm.hours || !hoursForm.justification) return;

        try {
            const payload = {
                requestedHours: parseFloat(hoursForm.hours), justification: hoursForm.justification, comments: hoursForm.justification,
                additionalHoursRequestId: null, companyId: null, requesterId: null, status: null, isApproved: false
            };

            const response = await fetch('http://localhost:8080/manager/additional-hours-request', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)
            });

            if (response.ok) {
                const newRequest = await response.json();
                setHourRequests(prev => [{ ...newRequest, requesterName: newRequest.requesterName || dbUserName || 'Eu (Gestor)' }, ...prev]);
                showAlert("Sucesso", "Solicitação de horas enviada com sucesso!", "success");
                setHoursForm({ hours: '', justification: '' });
                setIsHoursModalOpen(false);
                fetchAllData(true); 
            } else {
                const errorData = await response.json().catch(() => null);
                showAlert("Erro", errorData?.message || 'Verifique os dados informados.', "error");
            }
        } catch (error) { showAlert("Erro de Conexão", "Falha ao enviar solicitação.", "error"); }
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                username: userForm.name, email: userForm.email, cpf: userForm.cpf, rgNumber: userForm.rg,
                phoneNumber: userForm.phone, password: userForm.password
            };

            const response = await fetch('http://localhost:8080/manager/users', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)
            });

            if (response.ok) {
                showAlert("Sucesso", "Novo usuário cadastrado com sucesso!", "success");
                setIsUserModalOpen(false);
                setUserForm({ name: '', email: '', role: 'ROLE_USER', cpf: '', rg: '', phone: '', password: '' });
            } else {
                const errorData = await response.json().catch(() => null);
                showAlert("Erro", errorData?.message || 'Verifique os dados (CPF/Email duplicado?)', "error");
            }
        } catch (error) { showAlert("Erro de Conexão", "Falha ao conectar com o servidor.", "error"); }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            
            {/* --- TOP NAVBAR --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shrink-0">
                <div className="flex items-center gap-4 md:gap-6">
                    <button className="text-slate-600 hover:text-[#003399] transition-colors xl:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/manager-dashboard')}>
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/></svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">Órbita</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href="/manager-dashboard" className="text-[#003399] font-semibold transition-colors">Painel Geral</Link>
                        <Link href="/calendar" className="hover:text-[#003399] transition-colors">Agendar</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    
                    <div className="flex items-center gap-5">
                        <span className="text-[15px] font-medium text-slate-600 hidden md:block">
                            {dbUserName ? dbUserName.split(' ')[0] : (user?.name?.split(' ')[0] || 'Gestor')}
                        </span>
                        <button onClick={handleLogout} className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors">Sair</button>
                    </div>
                </div>
            </header>

            {/* --- MENU MOBILE --- */}
            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href="/manager-dashboard" className="text-[#003399] font-semibold">Painel Geral</Link>
                        <Link href="/calendar" className="hover:text-[#003399]">Agendar</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399]">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Painel do Gestor</h2>
                            <p className="text-slate-500 mt-1 text-sm">Gerencie solicitações, orçamentos e equipe.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsHoursModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#003399] text-[#003399] rounded-xl text-sm font-bold hover:bg-blue-50 transition shadow-sm"><Clock size={16} /> Solicitar Horas</button>
                            <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#003399] text-white rounded-xl text-sm font-bold hover:bg-[#002266] transition shadow-md"><UserPlus size={16} /> Cadastrar Membro</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard title="Total de Pendências" value={hourRequests.length + schedulingRequests.length + userRequests.length} active={true} />
                        <StatCard title="Agendamentos Aguardando" value={schedulingRequests.length} />
                        <StatCard title="Novos Colaboradores" value={userRequests.length} />
                        <StatCard title="Solicitações de Horas" value={hourRequests.length} />
                    </div>

                    {/* --- GRÁFICOS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* GRÁFICO DE BARRAS (Fluxo de Uso) */}
                        <div className="lg:col-span-2 bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Fluxo de Uso (Últimos Meses)</h3>
                            <div className="flex-1 flex items-end justify-between gap-2 px-2 min-h-[220px]">
                                {!stats ? <p className="w-full text-center text-slate-400 self-center">Carregando dados...</p> : (
                                    stats.monthlyHistory.map((item, i) => {
                                        // Usa o limite de horas como teto para o gráfico, ou o maior valor do histórico se ultrapassar
                                        const maxVal = Math.max(...stats.monthlyHistory.map(h => h.usedHours), stats.limitHours || 10);
                                        const heightPercent = (item.usedHours / maxVal) * 100;
                                        // Calcula a percentagem exata deste mês em relação ao limite da cota
                                        const percentOfLimit = stats.limitHours ? Math.round((item.usedHours / stats.limitHours) * 100) : 0;
                                        
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-3 w-full group mt-8">
                                                {/* overflow-visible permite que o texto flutue fora da barra sem ser cortado */}
                                                <div className="w-full bg-[#F0F2F5] rounded-t-xl relative h-48 flex items-end overflow-visible">
                                                    <div className="w-full bg-[#003399] rounded-t-xl transition-all duration-700 opacity-80 group-hover:opacity-100" style={{ height: `${heightPercent}%` }}></div>
                                                    
                                                    {/* Rótulo permanente acima da barra (Horas + Porcentagem) */}
                                                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                                        <span className="text-xs font-bold text-slate-700">{item.usedHours}h</span>
                                                        <span className="text-[9px] font-bold text-[#003399] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md mt-0.5">
                                                            {percentOfLimit}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.month}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* GRÁFICO CIRCULAR (Orçamento) */}
                        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 w-full text-left">Orçamento de Horas</h3>
                            
                            <div className="relative w-48 h-48 rounded-full mb-8 shadow-inner border-8 border-[#F0F2F5]" style={{ background: `conic-gradient(#003399 0% ${stats?.usagePercentage || 0}%, transparent ${stats?.usagePercentage || 0}% 100%)` }}>
                                <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Aprovadas</span>
                                    <span className="text-4xl font-bold text-[#003399]">{stats ? Math.round(stats.usagePercentage) : 0}%</span>
                                </div>
                            </div>
                            
                            <div className="w-full space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
                                    <span className="flex items-center gap-2 font-medium text-slate-600"><div className="w-3 h-3 rounded-full bg-[#003399]"></div> Aprovadas</span>
                                    <span className="font-bold text-slate-800">{stats?.consumedHours || 0}h</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 font-medium text-slate-600"><div className="w-3 h-3 rounded-full bg-[#F0F2F5] border border-slate-300"></div> Disponíveis</span>
                                    <span className="font-bold text-slate-800">{stats?.availableHours || 0}h</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* --- ÁREA DE PENDÊNCIAS (ABAS) --- */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="flex border-b border-slate-100 p-2 gap-2 bg-[#F0F2F5]/50 flex-wrap md:flex-nowrap">
                            <button onClick={() => setActiveTab('hours')} className={`flex-1 min-w-[120px] py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'hours' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                                <Clock size={18} /> Horas Extras <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{hourRequests.length}</span>
                            </button>
                            <button onClick={() => setActiveTab('bookings')} className={`flex-1 min-w-[120px] py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'bookings' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                                <CalendarCheck size={18} /> Agendamentos <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{schedulingRequests.length}</span>
                            </button>
                            <button onClick={() => setActiveTab('users')} className={`flex-1 min-w-[120px] py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                                <UserPlus size={18} /> Colaboradores <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{userRequests.length}</span>
                            </button>
                        </div>

                        <div className="p-6 md:p-8 min-h-[350px]">
                            {isLoading ? (
                                <div className="flex flex-col justify-center items-center h-40 text-slate-400 font-medium">Buscando pendências...</div>
                            ) : (
                                <div className="space-y-4">
                                    {/* HORAS EXTRAS */}
                                    {activeTab === 'hours' && (
                                        hourRequests.length === 0 ? <p className="text-center text-slate-400 py-10 font-medium">Nenhuma solicitação pendente.</p> :
                                        hourRequests.map(req => (
                                            <div key={req.additionalHoursRequestId} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003399] font-bold text-lg flex items-center justify-center shrink-0">{req.requestedHours}h</div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-base">{req.requesterName}</h4>
                                                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{req.justification}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                    <button onClick={() => openReviewModal(req.additionalHoursRequestId, false, 'HOURS', req.requesterId)} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm"><X size={16}/> Rejeitar</button>
                                                    <button onClick={() => openReviewModal(req.additionalHoursRequestId, true, 'HOURS', req.requesterId)} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-bold text-sm"><Check size={16}/> Aprovar</button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {/* AGENDAMENTOS */}
                                    {activeTab === 'bookings' && (
                                        schedulingRequests.length === 0 ? <p className="text-center text-slate-400 py-10 font-medium">Nenhum agendamento pendente.</p> :
                                        schedulingRequests.map(req => (
                                            <div key={req.schedulingId} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#003399] flex items-center justify-center shrink-0"><MapPin size={24}/></div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-base">{req.name} <span className="text-sm font-medium text-slate-500 ml-1">em {req.venueName || 'Espaço'}</span></h4>
                                                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                            <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{formatDate(req.startAt)}</span>
                                                            <span>• {formatTime(req.startAt)} - {formatTime(req.endAt)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                    <button onClick={() => openReviewModal(req.schedulingId, false, 'SCHEDULING')} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm"><X size={16}/> Rejeitar</button>
                                                    <button onClick={() => openReviewModal(req.schedulingId, true, 'SCHEDULING')} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-[#003399] text-white rounded-lg hover:bg-[#002266] transition-colors font-bold text-sm shadow-sm"><Check size={16}/> Aprovar</button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {/* USUÁRIOS */}
                                    {activeTab === 'users' && (
                                        userRequests.length === 0 ? <p className="text-center text-slate-400 py-10 font-medium">Nenhum cadastro pendente.</p> :
                                        userRequests.map(req => (
                                            <div key={req.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#F0F2F5] text-slate-500 flex items-center justify-center shrink-0"><UserPlus size={24}/></div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-base">{req.username}</h4>
                                                        <p className="text-sm text-slate-500 mt-1 font-medium">{req.email} • {req.companyName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                    <button onClick={() => openReviewModal(req.id, false, 'USER')} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm"><X size={16}/> Rejeitar</button>
                                                    <button onClick={() => openReviewModal(req.id, true, 'USER')} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-bold text-sm"><Check size={16}/> Aprovar</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAIS DE CRIAÇÃO E REVISÃO --- */}

            {/* Solicitar Horas */}
            {isHoursModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setIsHoursModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#003399]"><Clock size={32} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">Solicitar Horas</h3>
                            <p className="text-sm text-slate-500 mt-2">Peça horas adicionais para a sua cota mensal.</p>
                        </div>
                        <form onSubmit={handleSubmitHours} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Quantidade de Horas</label>
                                <input type="number" required value={hoursForm.hours} onChange={e => setHoursForm({...hoursForm, hours: e.target.value})} className="w-full px-4 py-3 bg-[#F0F2F5] rounded-xl border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" placeholder="Ex: 10" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Justificativa</label>
                                <textarea required rows={3} value={hoursForm.justification} onChange={e => setHoursForm({...hoursForm, justification: e.target.value})} className="w-full px-4 py-3 bg-[#F0F2F5] rounded-xl border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition resize-none" placeholder="Descreva o motivo..." />
                            </div>
                            <button type="submit" className="w-full py-3.5 rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition shadow-md mt-4">Enviar Pedido</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Novo Usuário */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsUserModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        <div className="mb-6 mt-2">
                            <h3 className="text-2xl font-bold text-slate-800">Novo Colaborador</h3>
                            <p className="text-sm text-slate-500 mt-1">Cadastre um membro da sua equipe.</p>
                        </div>
                        <form onSubmit={handleSubmitUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Nome Completo</label>
                                <input type="text" required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#003399] outline-none transition" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Email</label>
                                    <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#003399] outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Telefone</label>
                                    <input type="text" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#003399] outline-none transition" placeholder="(XX) XXXXX-XXXX" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">CPF</label>
                                    <input type="text" required value={userForm.cpf} onChange={e => setUserForm({...userForm, cpf: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#003399] outline-none transition" placeholder="Só números" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">RG</label>
                                    <input type="text" required value={userForm.rg} onChange={e => setUserForm({...userForm, rg: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#003399] outline-none transition" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Senha Inicial</label>
                                <input type="password" required value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#003399] outline-none transition" />
                            </div>
                            <button type="submit" className="w-full py-3.5 rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition shadow-md mt-4 flex items-center justify-center gap-2"><UserPlus size={18}/> Cadastrar Conta</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Revisão de Pedido */}
            {reviewModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setReviewModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedRequest?.approved ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                {selectedRequest?.approved ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">{selectedRequest?.approved ? "Aprovar Solicitação" : "Rejeitar Solicitação"}</h3>
                        </div>

                        <form onSubmit={submitReview} className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${selectedRequest?.approved ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {selectedRequest?.approved ? "Observações (Opcional)" : "Motivo da Rejeição (Obrigatório)"}
                                </label>
                                <textarea required={!selectedRequest?.approved} rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-slate-200 transition resize-none" placeholder={selectedRequest?.approved ? "Deixe um comentário..." : "Especifique o motivo da rejeição..."} />
                            </div>
                            <button type="submit" className={`w-full py-3.5 rounded-xl text-white font-bold transition shadow-md mt-4 ${selectedRequest?.approved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                Confirmar {selectedRequest?.approved ? "Aprovação" : "Rejeição"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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

export default withAuth(ManagerDashboard, ['ROLE_MANAGER']);