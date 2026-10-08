'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    Pencil, Trash2, X, ChevronLeft, ChevronRight, Search, Bell, 
    RefreshCcw, Menu, Building2, AlertTriangle, CheckCircle2, Info, XCircle
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

// --- INTERFACES ---
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

interface AdminStats {
    totalConsumedHours: number;
    totalActiveCompanies: number;
    totalAlerts: number;
    alertsList: AdminAlertItem[];
}

interface CompanyUpdatePayload { companyId: string; name: string; cnpj: string; email: string; }
interface CreateCompanyPayload { name: string; email: string; cnpj: string; monthlyLimitHours: number; additionalHoursApproved: number; }
interface CompanyResponse { content: CompanyQuota[]; number: number; totalPages: number; totalElements: number; }

// --- COMPONENTES VISUAIS ---
const StatCard = ({ title, value, icon: Icon, type = 'default' }: { title: string; value: string | number; icon: any; type?: 'default' | 'alert' | 'inactive' }) => {
    const styles = {
        default: "bg-[#003399] text-white border-[#003399] shadow-md",
        alert: "bg-orange-50 border-orange-100 text-orange-800",
        inactive: "bg-slate-50 border-slate-200 text-slate-600"
    };

    return (
        <div className={`p-6 rounded-[24px] border transition-all duration-300 min-w-[150px] ${styles[type]}`}>
            <p className={`text-sm font-medium mb-4 ${type === 'default' ? 'text-blue-100' : 'text-slate-500'}`}>{title}</p>
            <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{value}</span>
                <div className={`p-2 rounded-xl ${type === 'default' ? 'text-blue-200 bg-white/10' : type === 'alert' ? 'text-orange-500 bg-orange-100' : 'text-slate-400 bg-slate-200'}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function RegisteredCompaniesPage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();

    // Estados de Interface
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dbUserName, setDbUserName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados de Dados da Tabela
    const [companyQuotas, setCompanyQuotas] = useState<CompanyQuota[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalServerPages, setTotalServerPages] = useState(1);
    const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active');

    // Estados de Stats
    const [adminStats, setAdminStats] = useState<AdminStats>({
        totalConsumedHours: 0, totalActiveCompanies: 0, totalAlerts: 0, alertsList: []
    });

    // Estados dos Modais
    const [selectedCompanyQuota, setSelectedCompanyQuota] = useState<CompanyQuota | null>(null);
    const [editableCompanyData, setEditableCompanyData] = useState<CompanyUpdatePayload | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCompanyData, setNewCompanyData] = useState<CreateCompanyPayload>({ name: '', email: '', cnpj: '', monthlyLimitHours: 0, additionalHoursApproved: 0 });

    const [customAlert, setCustomAlert] = useState({ isOpen: false, title: '', message: '', type: 'success' as 'success' | 'error' | 'info' });
    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setCustomAlert({ isOpen: true, title, message, type });
    };

    // --- API CALLS ---
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

    const fetchCompanyQuotas = useCallback(async (page = 0, size = 10) => {
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
    useEffect(() => { fetchStats(); }, [fetchStats]);

    // --- HANDLERS DA NAVBAR ---
    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/login'); 
    };

    const handleDashboardClick = () => {
        const roles = user?.roles || []; 
        if (roles.includes('ROLE_ADMIN')) router.push('/admin-dashboard');
        else if (roles.includes('ROLE_MANAGER')) router.push('/manager-dashboard');
        else if (roles.includes('ROLE_COLLABORATOR')) router.push('/collaborator-dashboard');
        else router.push('/');
    };

    // --- FILTRO DE BUSCA (Local) ---
    const filteredCompanies = companyQuotas.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        company.cnpj.includes(searchTerm)
    );

    // --- HANDLERS DE EMPRESA (CRUD) ---
    const createNewCompany = async () => {
        if (!newCompanyData.name || !newCompanyData.cnpj) return showAlert('Atenção', 'Preencha os campos obrigatórios (Nome e CNPJ).', 'error');
        try {
            const authToken = localStorage.getItem('token');
            await axios.post('http://localhost:8080/admin/company', newCompanyData, { headers: { Authorization: `Bearer ${authToken}` } });
            showAlert('Sucesso', 'A empresa foi cadastrada com sucesso!', 'success');
            setNewCompanyData({ name: '', email: '', cnpj: '', monthlyLimitHours: 0, additionalHoursApproved: 0 });
            setIsCreateModalOpen(false);
            fetchCompanyQuotas(currentPage);
            fetchStats();
        } catch (err) { showAlert('Erro', 'Ocorreu um erro ao tentar cadastrar a empresa.', 'error'); }
    };

    const saveChanges = async () => {
        if (!editableCompanyData) return;
        try {
            const authToken = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/admin/company/${editableCompanyData.companyId}`, editableCompanyData, { headers: { Authorization: `Bearer ${authToken}` } });
            showAlert('Sucesso', 'Os dados da empresa foram atualizados!', 'success');
            setIsEditing(false); 
            fetchCompanyQuotas(currentPage); 
            closeModal();
        } catch (err) { showAlert('Erro', 'Ocorreu um erro ao salvar as alterações.', 'error'); }
    };

    const deleteCompany = async (companyId: string) => {
        if (!confirm('Deseja realmente mover esta empresa para a lixeira? Ela será inativada.')) return;
        try {
            const authToken = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/admin/company/${companyId}`, { headers: { Authorization: `Bearer ${authToken}` } });
            fetchCompanyQuotas(currentPage); fetchStats();
        } catch (err) { showAlert('Erro', 'Ocorreu um erro ao inativar a empresa.', 'error'); }
    };

    const restoreCompany = async (companyId: string) => {
        if (!confirm('Deseja restaurar esta empresa? Ela voltará a ter acesso ao sistema.')) return;
        try {
            const authToken = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/admin/company/${companyId}/restore`, {}, { headers: { Authorization: `Bearer ${authToken}` } });
            fetchCompanyQuotas(currentPage); fetchStats();
        } catch (err) { showAlert('Erro', 'Ocorreu um erro ao restaurar a empresa.', 'error'); }
    };

    const openModal = (company: CompanyQuota) => { 
        setSelectedCompanyQuota({ ...company }); 
        setEditableCompanyData({ companyId: company.companyId, name: company.name, cnpj: company.cnpj, email: company.email }); 
        setIsEditing(false); 
    };
    const closeModal = () => { setSelectedCompanyQuota(null); setEditableCompanyData(null); setIsEditing(false); };

    // --- RENDER ---
    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
            
            {/* --- TOP NAVBAR DA BRISA --- */}
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
                        <Link href="/admin-dashboard" className="hover:text-[#003399] transition-colors">Painel Geral</Link>
                        <Link href="/registered-companies" className="text-[#003399] font-semibold transition-colors">Empresas</Link>
                        <Link href="/register-manager" className="hover:text-[#003399] transition-colors">Gestores</Link>
                        <Link href="/registered-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399] transition-colors">Catálogo</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    <div className="flex items-center gap-5">
                        <button className="relative p-2 text-slate-400 hover:text-[#003399] transition-colors bg-white rounded-full border border-slate-200 shadow-sm outline-none">
                            <Bell size={18} />
                            {adminStats.totalAlerts > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>}
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
                        <Link href="/admin-dashboard" className="hover:text-[#003399]">Painel Geral</Link>
                        <Link href="/registered-companies" className="text-[#003399] font-semibold">Empresas</Link>
                        <Link href="/register-manager" className="hover:text-[#003399]">Gestores</Link>
                        <Link href="/registered-spaces" className="hover:text-[#003399]">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                
                {/* 1. RESUMO RÁPIDO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Empresas Ativas" value={adminStats.totalActiveCompanies} icon={Building2} type="default" />
                    <StatCard title="Alertas de Cota" value={adminStats.alertsList.filter(a => a.type === 'orange').length || 0} icon={AlertTriangle} type="alert" />
                    <StatCard title="Inativas / Lixeira" value={adminStats.alertsList.filter(a => a.type === 'blue').length || 0} icon={Trash2} type="inactive" />
                </div>

                {/* 2. TABELA DE EMPRESAS (O Foco) */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
                    
                    {/* Barra de Ações (Filtros e Cadastro) */}
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex bg-[#F0F2F5] p-1 rounded-xl w-fit">
                                <button onClick={() => setViewMode('active')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'active' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ativas</button>
                                <button onClick={() => setViewMode('deleted')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'deleted' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Lixeira</button>
                            </div>
                            
                            {/* Barra de Pesquisa */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar empresa ou CNPJ..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003399]/20 w-full sm:w-64"
                                />
                            </div>
                        </div>

                        {viewMode === 'active' && (
                            <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#003399] hover:bg-[#002266] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors">
                                + Nova Empresa
                            </button>
                        )}
                    </div>
                    
                    {/* Corpo da Tabela */}
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-[#F0F2F5]/50 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Empresa</th>
                                    <th className="px-6 py-4">Contato / CNPJ</th>
                                    <th className="px-6 py-4">Consumo de Horas</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Buscando empresas...</td></tr>
                                ) : filteredCompanies.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-medium">Nenhuma empresa encontrada para esta visualização.</td></tr>
                                ) : filteredCompanies.map((company) => {
                                    
                                    const percConsumo = (company.consumedHours / (company.monthlyLimitHours || 1)) * 100;
                                    const isExcedido = company.consumedHours > company.monthlyLimitHours;

                                    return (
                                        <tr key={company.companyId} className="hover:bg-slate-50 transition-colors group">
                                            {/* Empresa */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${viewMode === 'deleted' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 border border-indigo-100 text-[#003399]'}`}>
                                                        {company.name ? company.name.charAt(0).toUpperCase() : 'E'}
                                                    </div>
                                                    <span className={`font-bold ${viewMode === 'deleted' ? 'text-slate-400' : 'text-slate-800'}`}>{company.name}</span>
                                                </div>
                                            </td>
                                            
                                            {/* Contato */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">{company.cnpj}</span>
                                                    <span className="text-xs text-slate-400 truncate max-w-[150px]">{company.email}</span>
                                                </div>
                                            </td>

                                            {/* Consumo Visual */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 w-32">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                                        <span>{company.consumedHours}h</span>
                                                        <span>{company.monthlyLimitHours}h</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${isExcedido ? 'bg-red-500' : 'bg-[#003399]'}`} 
                                                            style={{ width: `${Math.min(percConsumo, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                {viewMode === 'active' ? (
                                                    <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-md border ${isExcedido ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
                                                        {isExcedido ? 'EXCEDIDO' : 'ATIVO'}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                                                        INATIVO
                                                    </span>
                                                )}
                                            </td>

                                            {/* Ações */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {viewMode === 'active' ? (
                                                        <>
                                                            <button onClick={() => openModal(company)} className="p-2 text-slate-400 hover:text-[#003399] hover:bg-blue-50 rounded-lg transition-colors" title="Ver / Editar"><Pencil size={18} /></button>
                                                            <button onClick={() => deleteCompany(company.companyId)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Inativar (Lixeira)"><Trash2 size={18} /></button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => restoreCompany(company.companyId)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                                            <RefreshCcw size={14} /> Restaurar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Paginação */}
                    <div className="p-4 flex items-center justify-end gap-4 border-t border-slate-100 bg-white">
                        <span className="text-sm font-medium text-slate-500">Página {currentPage + 1} de {totalServerPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => fetchCompanyQuotas(currentPage - 1)} disabled={currentPage === 0} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
                            <button onClick={() => fetchCompanyQuotas(currentPage + 1)} disabled={currentPage === totalServerPages - 1} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAL DE CRIAÇÃO --- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-[#003399] px-6 py-4 rounded-t-[24px] flex justify-between items-center">
                            <h3 className="font-bold text-lg text-white">Cadastrar Nova Empresa</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-blue-200 hover:text-white"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 block mb-1">Nome da Empresa</label><input value={newCompanyData.name} onChange={e => setNewCompanyData({...newCompanyData, name: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#003399]/20 text-sm" placeholder="Ex: Tech Solutions SA" /></div>
                            <div><label className="text-xs font-bold text-slate-500 block mb-1">CNPJ</label><input value={newCompanyData.cnpj} onChange={e => setNewCompanyData({...newCompanyData, cnpj: e.target.value})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#003399]/20 text-sm" placeholder="Apenas números" /></div>
                            <div><label className="text-xs font-bold text-slate-500 block mb-1">Email de Contato</label><input value={newCompanyData.email} onChange={e => setNewCompanyData({...newCompanyData, email: e.target.value})} type="email" className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#003399]/20 text-sm" placeholder="contato@empresa.com" /></div>
                            <div><label className="text-xs font-bold text-slate-500 block mb-1">Cota de Horas (Mensal)</label><input type="number" value={newCompanyData.monthlyLimitHours} onChange={e => setNewCompanyData({...newCompanyData, monthlyLimitHours: Number(e.target.value)})} className="w-full border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#003399]/20 text-sm" placeholder="Ex: 100" /></div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 rounded-b-[24px] flex justify-end gap-3 border-t border-slate-100">
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                            <button onClick={createNewCompany} className="bg-[#003399] hover:bg-[#002266] text-white text-sm font-bold px-6 py-2 rounded-xl shadow-sm transition-colors">Cadastrar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* --- MODAL DE EDIÇÃO (Agora Completo) --- */}
            {selectedCompanyQuota && editableCompanyData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-6 py-4 rounded-t-[24px] border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Detalhes da Empresa</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Nome da Empresa</label>
                                <input value={editableCompanyData.name} onChange={e => setEditableCompanyData({...editableCompanyData, name: e.target.value})} disabled={!isEditing} className={`w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#003399]/20 text-sm ${!isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">CNPJ</label>
                                <input value={editableCompanyData.cnpj} onChange={e => setEditableCompanyData({...editableCompanyData, cnpj: e.target.value})} disabled={!isEditing} className={`w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#003399]/20 text-sm ${!isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white border-slate-200'}`} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Email de Contato</label>
                                <input value={editableCompanyData.email} onChange={e => setEditableCompanyData({...editableCompanyData, email: e.target.value})} disabled={!isEditing} className={`w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#003399]/20 text-sm ${!isEditing ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white border-slate-200'}`} />
                            </div>
                            
                            {!isEditing && (
                                <div className="bg-blue-50 rounded-xl p-4 mt-4 border border-blue-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-[#003399] uppercase tracking-wider mb-1">Consumo de Cotas</p>
                                        <p className="text-sm text-slate-600 font-medium">{selectedCompanyQuota.consumedHours}h utilizadas de {selectedCompanyQuota.monthlyLimitHours}h</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full border-4 border-[#003399] flex items-center justify-center font-bold text-[#003399] text-xs">
                                        {Math.round((selectedCompanyQuota.consumedHours / Math.max(selectedCompanyQuota.monthlyLimitHours, 1)) * 100)}%
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50 px-6 py-4 rounded-b-[24px] border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                                {isEditing ? 'Cancelar' : 'Fechar'}
                            </button>
                            {isEditing ? (
                                <button onClick={saveChanges} className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-6 py-2 rounded-xl shadow-sm transition-colors">Salvar Alterações</button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="bg-[#003399] hover:bg-[#002266] text-white text-sm font-bold px-6 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-2">
                                    <Pencil size={16} /> Editar Dados
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {customAlert.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-sm p-6 md:p-8 text-center animate-in zoom-in-95 duration-200">
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