'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutGrid, Users, Settings, LogOut, Pencil, Trash2, Check, X,
    ChevronLeft, ChevronRight, Search, Bell, Briefcase, FileText,
    AlertCircle, Lock, RefreshCcw, ArrowRight
} from 'lucide-react';
import axios from 'axios';

// --- 1. INTERFACES ---

interface CompanyQuota {
    companyId: string;
    name: string;
    email: string;
    cnpj: string;
    monthlyLimitHours: number;
    consumedHours: number;
    additionalHoursApproved: number;
    createdAt?: string; 
}

interface AdminAlertItem {
    text: string;
    type: 'red' | 'orange' | 'blue';
}

// Dados do Gráfico vindos do Backend
interface MonthlyCreationData {
    month: string;
    count: number;
}

interface AdminStats {
    totalConsumedHours: number;
    totalActiveCompanies: number;
    totalAlerts: number;
    alertsList: AdminAlertItem[];
    monthlyCreations: MonthlyCreationData[]; // <--- NOVO CAMPO VITAL
}

interface PendingHourRequest {
    additionalHoursRequestId: string;
    requesterName: string;
    requestedHours: number;
    justification: string;
}

interface CompanyUpdatePayload { companyId: string; name: string; cnpj: string; email: string; }
interface CreateCompanyPayload { name: string; email: string; cnpj: string; monthlyLimitHours: number; additionalHoursApproved: number; }
interface CompanyResponse { content: CompanyQuota[]; number: number; totalPages: number; totalElements: number; }

// --- 2. COMPONENTES VISUAIS ---

const StatCard = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-w-[150px]">
        <span className="text-gray-500 text-sm font-medium mb-2">{label}</span>
        <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            {icon && <div className="text-blue-600">{icon}</div>}
        </div>
    </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const AlertItem = ({ text, type, onDismiss }: { text: string, type: 'red' | 'orange' | 'blue', onDismiss: () => void }) => {
    const bgColors = { red: 'bg-red-50 text-red-600', orange: 'bg-orange-50 text-orange-600', blue: 'bg-blue-50 text-blue-600' };
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${bgColors[type]}`}>
                    <AlertCircle size={16} />
                </div>
                <span className="text-sm text-gray-600 font-medium">{text}</span>
            </div>
            <button onClick={onDismiss} className="px-3 py-1 text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition hover:text-blue-600">Ver</button>
        </div>
    )
}

// --- GRÁFICO DINÂMICO CORRIGIDO ---
// Agora ele recebe os dados prontos (data), não calcula mais.
const DynamicBarChart = ({ data }: { data: MonthlyCreationData[] }) => {
    
    // Se ainda não carregou os dados, mostra placeholder
    if (!data || data.length === 0) {
        return <div className="h-32 flex items-center justify-center text-gray-300 text-xs mt-6">Carregando gráfico...</div>;
    }

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="flex items-end justify-between h-32 gap-3 px-2 mt-6 w-full border-b border-gray-200 pb-1">
            {data.map((item, i) => {
                let heightPercentage = (item.count / maxCount) * 100;
                // Garante altura mínima visual
                if (item.count > 0 && heightPercentage < 10) heightPercentage = 10;

                return (
                    <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group relative">
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            {item.count} {item.count === 1 ? 'nova' : 'novas'}
                        </div>
                        <div 
                            className={`w-full rounded-t-sm transition-all duration-500 ${item.count > 0 ? 'bg-blue-600 group-hover:bg-blue-700' : 'bg-gray-100 h-1'}`}
                            style={{ height: item.count > 0 ? `${heightPercentage}%` : '4px' }} 
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${i === data.length - 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {item.month}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

// --- 3. COMPONENTE PRINCIPAL ---
export default function RegisteredCompaniesPage() {
    const { user } = useAuth();
    const router = useRouter();

    // --- Estados ---
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [companyQuotas, setCompanyQuotas] = useState<CompanyQuota[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalServerPages, setTotalServerPages] = useState(1);
    const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active');

    // Estado Stats (Agora inclui monthlyCreations)
    const [adminStats, setAdminStats] = useState<AdminStats>({
        totalConsumedHours: 0, 
        totalActiveCompanies: 0, 
        totalAlerts: 0, 
        alertsList: [],
        monthlyCreations: [] 
    });

    // Modal Pendências
    const [isPendingHoursModalOpen, setIsPendingHoursModalOpen] = useState(false);
    const [pendingHoursList, setPendingHoursList] = useState<PendingHourRequest[]>([]);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectingId, setRejectingId] = useState<string | null>(null);

    // Modal CRUD
    const [selectedCompanyQuota, setSelectedCompanyQuota] = useState<CompanyQuota | null>(null);
    const [editableCompanyData, setEditableCompanyData] = useState<CompanyUpdatePayload | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCompanyData, setNewCompanyData] = useState<CreateCompanyPayload>({ name: '', email: '', cnpj: '', monthlyLimitHours: 0, additionalHoursApproved: 0 });

    // --- API CALLS ---
    
    // MUDANÇA AQUI: size=4 (Limite de 4 empresas por página)
    const fetchCompanyQuotas = useCallback(async (page = 0, size = 4) => {
        setLoading(true);
        try {
            const authToken = localStorage.getItem('token');
            const endpoint = viewMode === 'active' 
                ? `http://localhost:8080/admin/company?page=${page}&size=${size}`
                : `http://localhost:8080/admin/company/deleted?page=${page}&size=${size}`;

            const response = await axios.get<CompanyResponse>(endpoint, { headers: { Authorization: `Bearer ${authToken}` } });
            setCompanyQuotas(response.data.content);
            setCurrentPage(response.data.number);
            setTotalServerPages(response.data.totalPages);
        } catch (err) {
            console.error(err);
            setCompanyQuotas([]);
        } finally {
            setLoading(false);
        }
    }, [viewMode]); 

    const fetchStats = useCallback(async () => {
        try {
            const authToken = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/admin/dashboard/stats', { headers: { Authorization: `Bearer ${authToken}` } });
            setAdminStats(response.data);
        } catch (err) { console.error(err); }
    }, []);

    // --- EFEITOS ---
    useEffect(() => { setCurrentPage(0); fetchCompanyQuotas(0); }, [viewMode, fetchCompanyQuotas]);
    
    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(), 60000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    // --- HANDLERS DE NOTIFICAÇÃO ---
    const handleDismissAlert = (indexToRemove: number) => {
        setAdminStats(prev => ({
            ...prev,
            totalAlerts: Math.max(0, prev.totalAlerts - 1),
            alertsList: prev.alertsList.filter((_, i) => i !== indexToRemove)
        }));
    };

    const handleViewInactive = (index: number) => {
        setViewMode('deleted'); 
        handleDismissAlert(index); 
        setTimeout(() => {
            document.getElementById('companies-table')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleResolveHours = async () => {
        await openPendingHoursModal();
    };


    // --- HANDLERS DE HORAS EXTRAS ---
    const openPendingHoursModal = async () => {
        try {
            const authToken = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/admin/additional-hours-request/pending-admin-review', {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const formattedData = response.data.map((item: any) => ({
                additionalHoursRequestId: item.additionalHoursRequestId,
                requesterName: item.requesterName || "Usuário",
                requestedHours: item.requestedHours,
                justification: item.justification
            }));
            setPendingHoursList(formattedData);
            setIsPendingHoursModalOpen(true);
        } catch (err) { alert("Erro ao buscar detalhes."); }
    };

    const handleApproveHour = async (id: string) => {
        try {
            const authToken = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/admin/additional-hours-request/review`, 
                { additionalHoursRequestId: id, isApproved: true, comments: "Aprovado pelo Painel Admin" },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setPendingHoursList(prev => prev.filter(item => item.additionalHoursRequestId !== id));
            fetchStats(); 
        } catch (err) { alert("Erro ao aprovar."); }
    };

    const handleRejectHour = async (id: string) => {
        if (!rejectReason) return alert("Digite um motivo.");
        try {
            const authToken = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/admin/additional-hours-request/review`, 
                { additionalHoursRequestId: id, isApproved: false, comments: rejectReason }, 
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setPendingHoursList(prev => prev.filter(item => item.additionalHoursRequestId !== id));
            setRejectingId(null); setRejectReason("");
            fetchStats(); 
        } catch (err) { alert("Erro ao rejeitar."); }
    };

    // --- HANDLERS DE EMPRESA (CRUD) ---
    const createNewCompany = async () => {
        if (!newCompanyData.name || !newCompanyData.cnpj) return alert('Preencha os campos.');
        try {
            const authToken = localStorage.getItem('token');
            await axios.post('http://localhost:8080/admin/company', newCompanyData, { headers: { Authorization: `Bearer ${authToken}` } });
            alert('Cadastrado!');
            setNewCompanyData({ name: '', email: '', cnpj: '', monthlyLimitHours: 0, additionalHoursApproved: 0 });
            setIsCreateModalOpen(false);
            fetchCompanyQuotas(currentPage);
            fetchStats();
        } catch (err) { alert('Erro ao cadastrar.'); }
    };

    const saveChanges = async () => {
        if (!editableCompanyData) return;
        try {
            const authToken = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/admin/company/${editableCompanyData.companyId}`, editableCompanyData, { headers: { Authorization: `Bearer ${authToken}` } });
            alert('Salvo!'); setIsEditing(false); fetchCompanyQuotas(currentPage); closeModal();
        } catch (err) { alert('Erro ao salvar.'); }
    };

    const deleteCompany = async (companyId: string) => {
        if (!confirm('Mover para lixeira?')) return;
        try {
            const authToken = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/admin/company/${companyId}`, { headers: { Authorization: `Bearer ${authToken}` } });
            fetchCompanyQuotas(currentPage); fetchStats();
        } catch (err) { alert('Erro ao excluir.'); }
    };

    const restoreCompany = async (companyId: string) => {
        if (!confirm('Restaurar empresa?')) return;
        try {
            const authToken = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/admin/company/${companyId}/restore`, {}, { headers: { Authorization: `Bearer ${authToken}` } });
            fetchCompanyQuotas(currentPage); fetchStats();
        } catch (err) { alert('Erro ao restaurar.'); }
    };

    const openModal = (company: CompanyQuota) => { setSelectedCompanyQuota({ ...company }); setEditableCompanyData({ companyId: company.companyId, name: company.name, cnpj: company.cnpj, email: company.email }); setIsEditing(false); };
    const closeModal = () => { setSelectedCompanyQuota(null); setEditableCompanyData(null); setIsEditing(false); };

    // --- RENDER ---
    return (
        <div className="flex min-h-screen bg-[#F3F4F6] font-sans text-slate-800">
            {/* SIDEBAR */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1A1C2E] text-white transition-all duration-300 flex flex-col fixed h-full z-20`}>
                <div className="p-6 flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">M</div>
                    {sidebarOpen && <h1 className="font-bold text-lg tracking-wide">Administrator</h1>}
                </div>
                <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-slate-500 px-4 mb-2 uppercase tracking-wider">{sidebarOpen && 'Menu Principal'}</div>
                    <SidebarItem icon={LayoutGrid} label="Dashboard" onClick={() => router.push('/admin-dashboard')} />
                    <SidebarItem icon={Briefcase} label="Empresas" active={true} />
                    {/* ...outros menus... */}
                    <div className="p-4 border-t border-slate-700 mt-auto"><SidebarItem icon={LogOut} label="Sair" onClick={() => router.push('/')} /></div>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-white h-20 px-8 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200">
                    <div><h2 className="text-2xl font-bold text-gray-800">Empresas Registradas</h2><p className="text-sm text-gray-500">Gerencie o acesso e cotas dos parceiros</p></div>
                    <div className="flex items-center gap-4">
                        {viewMode === 'active' && (
                            <button onClick={() => setIsCreateModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-lg shadow-green-500/20"><span>+ Cadastrar Nova</span></button>
                        )}
                    </div>
                </header>

                <div className="p-8 space-y-6">
                    {/* Stats & Widgets */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-1">
                            <div className="flex justify-between items-start mb-4">
                                <div><h3 className="font-bold text-gray-800">Visão Geral</h3><p className="text-xs text-gray-400">Novas empresas por mês</p></div>
                                <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded">Stats</span>
                            </div>
                            <div className="mb-4"><span className="text-3xl font-bold text-gray-800">{adminStats.totalActiveCompanies}</span><span className="text-sm text-gray-500 ml-2">Empresas Ativas</span></div>
                            
                            {/* GRÁFICO AGORA USA adminStats.monthlyCreations */}
                            <DynamicBarChart data={adminStats.monthlyCreations} />
                        </div>

                        <div className="flex flex-col gap-6">
                            <StatCard label="Horas Consumidas (Total)" value={`${adminStats.totalConsumedHours.toFixed(1)}h`} icon={<div className="p-2 bg-blue-50 rounded-lg"><LayoutGrid size={20}/></div>} />
                            <StatCard label="Alertas Pendentes" value={adminStats.totalAlerts.toString()} icon={<div className="p-2 bg-red-50 text-red-500 rounded-lg"><Bell size={20}/></div>} />
                        </div>

                        {/* CARD DE ALERTAS DINÂMICO */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800">Pendências & Alerts</h3>
                                {adminStats.totalAlerts > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">{adminStats.totalAlerts}</span>}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto max-h-[200px] custom-scrollbar pr-2">
                                {adminStats.alertsList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                                        <Check size={24} className="text-green-200" />
                                        <span className="text-sm">Nenhum alerta no momento.</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {adminStats.alertsList.map((alert, index) => (
                                            <div key={index}>
                                                {alert.type === 'red' ? (
                                                    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 animate-in fade-in slide-in-from-right-4 duration-500">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-full bg-red-50 text-red-600"><AlertCircle size={16} /></div>
                                                            <span className="text-sm text-gray-600 font-medium">{alert.text}</span>
                                                        </div>
                                                        <button onClick={openPendingHoursModal} className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition shadow-sm">Resolver</button>
                                                    </div>
                                                ) : (
                                                    <AlertItem key={index} text={alert.text} type={alert.type} onDismiss={() => handleDismissAlert(index)} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabela Principal (Paginada com 4 itens) */}
                    <div id="companies-table" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex gap-4">
                                <button onClick={() => setViewMode('active')} className={`text-sm font-bold pb-1 transition ${viewMode === 'active' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Empresas Ativas</button>
                                <button onClick={() => setViewMode('deleted')} className={`text-sm font-bold pb-1 transition ${viewMode === 'deleted' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}`}>Lixeira / Inativas</button>
                            </div>
                            {viewMode === 'active' && <button className="text-sm text-blue-600 font-medium hover:underline">Ver Todas</button>}
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                                        <th className="px-6 py-4 font-semibold">Empresa</th>
                                        <th className="px-6 py-4 font-semibold">CNPJ / Email</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Spaces</th>
                                        <th className="px-6 py-4 font-semibold text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">Carregando dados...</td></tr>
                                    ) : companyQuotas.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhuma empresa encontrada.</td></tr>
                                    ) : companyQuotas.map((company) => (
                                        <tr key={company.companyId} className="hover:bg-gray-50 transition group border-b border-gray-50 last:border-0">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${viewMode === 'deleted' ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>{company.name.charAt(0).toUpperCase()}</div>
                                                    <span className={`font-semibold ${viewMode === 'deleted' ? 'text-gray-400' : 'text-gray-700'}`}>{company.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><div className="flex flex-col"><span className="text-gray-700">{company.cnpj}</span><span className="text-xs text-gray-400">{company.email}</span></div></td>
                                            <td className="px-6 py-4">
                                                {viewMode === 'active' ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${company.consumedHours > company.monthlyLimitHours ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                        <span className={`text-xs font-medium ${company.consumedHours > company.monthlyLimitHours ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'} px-2 py-1 rounded-full`}>{company.consumedHours > company.monthlyLimitHours ? 'Excedido' : 'Ativo'}</span>
                                                    </div>
                                                ) : <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Inativo</span>}
                                            </td>
                                            <td className="px-6 py-4"><span className="font-medium text-gray-600">{Math.floor(Math.random() * 20) + 1}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {viewMode === 'active' ? (
                                                        <>
                                                            <button onClick={() => openModal(company)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition" title="Editar"><Pencil size={18} /></button>
                                                            <button onClick={() => deleteCompany(company.companyId)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Excluir"><Trash2 size={18} /></button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => restoreCompany(company.companyId)} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition flex items-center gap-2 text-xs font-bold"><RefreshCcw size={16} /> Restaurar</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 flex items-center justify-end gap-4 border-t border-gray-100">
                            <span className="text-sm text-gray-500">Página {currentPage + 1} de {totalServerPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => fetchCompanyQuotas(currentPage - 1)} disabled={currentPage === 0} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={16} /></button>
                                <button onClick={() => fetchCompanyQuotas(currentPage + 1)} disabled={currentPage === totalServerPages - 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAL DE RESOLUÇÃO DE HORAS --- */}
            {isPendingHoursModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Aprovação de Horas Extras</h3>
                            <button onClick={() => setIsPendingHoursModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        
                        <div className="p-0 max-h-[60vh] overflow-y-auto">
                            {pendingHoursList.length === 0 ? (
                                <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                                    <Check size={40} className="text-green-500 mb-2"/>
                                    <p>Todas as pendências foram resolvidas!</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Solicitante</th>
                                            <th className="px-6 py-3">Horas</th>
                                            <th className="px-6 py-3">Justificativa</th>
                                            <th className="px-6 py-3 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-100">
                                        {pendingHoursList.map((item) => (
                                            <tr key={item.additionalHoursRequestId}>
                                                <td className="px-6 py-4 font-medium text-gray-700">{item.requesterName}</td>
                                                <td className="px-6 py-4"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold text-xs">+{item.requestedHours}h</span></td>
                                                <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={item.justification}>{item.justification}</td>
                                                <td className="px-6 py-4 text-right">
                                                    {rejectingId === item.additionalHoursRequestId ? (
                                                        <div className="flex items-center gap-2 justify-end animate-in fade-in">
                                                            <input autoFocus placeholder="Motivo..." className="border rounded px-2 py-1 text-xs w-32" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                                                            <button onClick={() => handleRejectHour(item.additionalHoursRequestId)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Check size={14}/></button>
                                                            <button onClick={() => setRejectingId(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded"><X size={14}/></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleApproveHour(item.additionalHoursRequestId)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition" title="Aprovar"><Check size={16}/></button>
                                                            <button onClick={() => { setRejectingId(item.additionalHoursRequestId); setRejectReason(""); }} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Rejeitar"><X size={16}/></button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAIS DE EMPRESA (MANTIDOS IGUAIS) --- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-green-800">Nova Empresa</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="text-xs font-bold text-gray-500 block">Nome</label><input value={newCompanyData.name} onChange={e => setNewCompanyData({...newCompanyData, name: e.target.value})} className="w-full border rounded p-2" /></div>
                            <div><label className="text-xs font-bold text-gray-500 block">CNPJ</label><input value={newCompanyData.cnpj} onChange={e => setNewCompanyData({...newCompanyData, cnpj: e.target.value})} className="w-full border rounded p-2" /></div>
                            <div><label className="text-xs font-bold text-gray-500 block">Email</label><input value={newCompanyData.email} onChange={e => setNewCompanyData({...newCompanyData, email: e.target.value})} className="w-full border rounded p-2" /></div>
                            <div><label className="text-xs font-bold text-gray-500 block">Limite Horas</label><input type="number" value={newCompanyData.monthlyLimitHours} onChange={e => setNewCompanyData({...newCompanyData, monthlyLimitHours: Number(e.target.value)})} className="w-full border rounded p-2" /></div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3"><button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600">Cancelar</button><button onClick={createNewCompany} className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button></div>
                    </div>
                </div>
            )}
            {selectedCompanyQuota && editableCompanyData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Editar Empresa</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="text-xs font-bold text-gray-500 block">Nome</label><input value={editableCompanyData.name} onChange={e => setEditableCompanyData({...editableCompanyData, name: e.target.value})} disabled={!isEditing} className="w-full border rounded p-2" /></div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-4 py-2 text-gray-600">Fechar</button>
                            {isEditing ? <button onClick={saveChanges} className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button> : <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Editar</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}