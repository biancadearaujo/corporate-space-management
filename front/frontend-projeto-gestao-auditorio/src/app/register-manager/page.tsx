'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { 
    Users, Building2, Settings, LogOut, Search, Plus, User,
    Home, Briefcase, Layers, MoreVertical, CheckCircle2, Phone,
    ChevronLeft, ChevronRight, UserMinus, X, Menu, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// --- INTERFACES ---
interface Company {
    companyId: string;
    name: string;
    cnpj: string;
}

interface Manager {
    id: string;           
    name: string;         
    email: string;        
    phone: string;        
    role: string;         
    department: string;   
    companyName: string;  
}

interface Feedback {
    type: 'success' | 'error';
    message: string;
}

// --- COMPONENTES VISUAIS ---
const FeedbackMessage = ({ feedback }: { feedback: Feedback | null }) => {
    if (!feedback) return null;
    const isSuccess = feedback.type === 'success';
    return (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium animate-in fade-in zoom-in-95 duration-200 ${isSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {feedback.message}
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
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

export default function RegisterManagerPage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();

    // Estados Gerais
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dbUserName, setDbUserName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]); 
    
    // Estado para Modal de Vínculo
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({ email: '', companyId: '' });
    const [linkFeedback, setLinkFeedback] = useState<Feedback | null>(null);

    // Paginação
    const [managerPage, setManagerPage] = useState(0);
    const managersPerPage = 4;

    // Estado do Formulário de Cadastro
    const [managerFormData, setManagerFormData] = useState({
        username: '', email: '', password: '', cpf: '', phoneNumber: '', rgNumber: '', companyId: '',
    });

    // --- FETCH DATA (CORRIGIDO: BLINDADO CONTRA FALHAS ISOLADAS) ---
    const fetchData = async () => {
        const authToken = token || localStorage.getItem('token');
        if (!authToken) return;
        
        const config = { headers: { Authorization: `Bearer ${authToken}` } };

        // 1. Busca Perfil (Se falhar, não quebra o resto)
        try {
            const userRes = await axios.get('http://localhost:8080/admin/user/me', config);
            if (userRes.data && (userRes.data.name || userRes.data.username)) {
                setDbUserName(userRes.data.name || userRes.data.username);
            }
        } catch (error) {
            console.error('Aviso: Erro ao buscar perfil:', error);
        }

        // 2. Busca Empresas (Se falhar, não quebra os gestores)
        try {
            const companiesRes = await axios.get('http://localhost:8080/admin/company', config);
            if (companiesRes.data && Array.isArray(companiesRes.data.content)) {
                setCompanies(companiesRes.data.content);
            }
        } catch (error) {
            console.error('Erro ao buscar empresas:', error);
        }

        // 3. Busca Gestores
        try {
            const managersRes = await axios.get('http://localhost:8080/admin/users/managers', config);
            if (managersRes.data) {
                setManagers(managersRes.data);
            }
        } catch (error) {
            console.error('Erro ao buscar gestores:', error);
        }
    };

    useEffect(() => { fetchData(); }, [token]);

    // --- LÓGICA DE PAGINAÇÃO ---
    const startIndex = managerPage * managersPerPage;
    const endIndex = startIndex + managersPerPage;
    const visibleManagers = managers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(managers.length / managersPerPage);

    // --- HANDLERS NAVBAR ---
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

    // --- HANDLERS DE CRIAÇÃO (NOVO USUÁRIO) ---
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setManagerFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!managerFormData.companyId) {
            setFeedback({ type: 'error', message: 'Por favor, selecione uma empresa vinculada.' });
            return;
        }

        setIsLoading(true);
        const authToken = token || localStorage.getItem('token');

        try {
            await axios.post('http://localhost:8080/admin/user', {
                username: managerFormData.username,
                email: managerFormData.email,
                password: managerFormData.password,
                cpf: managerFormData.cpf.replace(/[^\d]/g, ''), 
                rgNumber: managerFormData.rgNumber.replace(/[^\d]/g, ''),
                phoneNumber: managerFormData.phoneNumber,
                companyId: managerFormData.companyId,
                photoUrl: 'https://picsum.photos/200/300'
            }, { headers: { Authorization: `Bearer ${authToken}` } });
            
            setFeedback({ type: 'success', message: 'Gestor cadastrado com sucesso!' });
            setManagerFormData({ username: '', email: '', password: '', cpf: '', phoneNumber: '', rgNumber: '', companyId: '' });
            fetchData(); 
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao cadastrar. Verifique se o e-mail ou CPF já existem.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLER: ABRIR MODAL DE VÍNCULO ---
    const openLinkModal = () => {
        setLinkFeedback(null);
        setLinkData({ email: '', companyId: '' });
        setIsLinkModalOpen(true);
    };

    // --- HANDLER: VINCULAR GESTOR EXISTENTE ---
    const handleLinkManager = async (e: FormEvent) => {
        e.preventDefault();
        setLinkFeedback(null);

        if (!linkData.email || !linkData.companyId) {
            setLinkFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
            return;
        }
        
        setIsLoading(true);
        const authToken = token || localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8080/admin/assign-manager', {
                email: linkData.email,
                targetCompanyId: linkData.companyId
            }, { headers: { Authorization: `Bearer ${authToken}` } });

            setFeedback({ type: 'success', message: 'Gestor vinculado com sucesso!' });
            setIsLinkModalOpen(false);
            fetchData(); 
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            setLinkFeedback({ type: 'error', message: err.response?.data?.message || 'Erro: Usuário não encontrado no sistema.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLER: REMOVER ACESSO DE GESTOR (Rebaixar) ---
    const handleDemoteManager = async (id: string) => {
        if (!window.confirm("Tem certeza? O usuário deixará de ser Gestor e se tornará um Colaborador comum.")) return;
        
        const authToken = token || localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:8080/admin/users/${id}/role`, 
                { role: 'COLLABORATOR' },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            setFeedback({ type: 'success', message: 'Acesso de gestor removido com sucesso.' });
            setManagers(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erro ao alterar o cargo.' });
        }
    };

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
                        <Link href="/registered-companies" className="hover:text-[#003399] transition-colors">Empresas</Link>
                        <Link href="/register-manager" className="text-[#003399] font-semibold transition-colors">Gestores</Link>
                        <Link href="/registered-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    <div className="flex items-center gap-5">
                        <button className="relative p-2 text-slate-400 hover:text-[#003399] transition-colors bg-white rounded-full border border-slate-200 shadow-sm outline-none">
                            <Bell size={18} />
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
                        <Link href="/registered-companies" className="hover:text-[#003399]">Empresas</Link>
                        <Link href="/register-manager" className="text-[#003399] font-semibold">Gestores</Link>
                        <Link href="/registered-spaces" className="hover:text-[#003399]">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            {/* --- ÁREA PRINCIPAL (Sem Sidebar) --- */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Gestores</h2>
                    <p className="text-sm text-slate-500 mt-1">Crie ou vincule gestores para administrar as empresas cadastradas.</p>
                </header>

                <div className="flex flex-col gap-6">
                    {/* 1. FORMULÁRIO DE CADASTRO */}
                    <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100">
                        
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                            <h3 className="text-lg font-bold text-slate-800">Novo Gestor</h3>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={openLinkModal}
                                    className="bg-slate-50 hover:bg-slate-100 text-[#003399] border border-blue-100 px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-colors text-sm"
                                >
                                    <Search size={16} /> Vincular Existente
                                </button>
                                <button 
                                    type="submit" form="managerForm" disabled={isLoading}
                                    className="bg-[#003399] hover:bg-[#002266] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm disabled:opacity-50 transition-colors text-sm"
                                >
                                    <Plus size={16} /> Cadastrar e Salvar
                                </button>
                            </div>
                        </div>

                        {/* Alerta Geral do Formulário */}
                        <FeedbackMessage feedback={feedback} />
                        
                        <form id="managerForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nome de Usuário</label>
                                    <input type="text" name="username" required value={managerFormData.username} onChange={handleChange} placeholder="Ex: joaosilva" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Corporativo</label>
                                    <input type="email" name="email" required value={managerFormData.email} onChange={handleChange} placeholder="email@empresa.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Senha</label>
                                    <input type="password" name="password" required value={managerFormData.password} onChange={handleChange} placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all" />
                                </div>
                            </div>
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CPF</label>
                                        <input type="text" name="cpf" required value={managerFormData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">RG</label>
                                        <input type="text" name="rgNumber" required value={managerFormData.rgNumber} onChange={handleChange} placeholder="00.000.000-0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Telefone</label>
                                    <input type="tel" name="phoneNumber" required value={managerFormData.phoneNumber} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Empresa Vinculada</label>
                                    <select name="companyId" required value={managerFormData.companyId} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all">
                                        <option value="" disabled>Selecione uma empresa</option>
                                        {companies.map(c => (<option key={c.companyId} value={c.companyId}>{c.name}</option>))}
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* --- 2. LISTA DE GESTORES PAGINADA --- */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="text-xl font-bold text-slate-800">Lista de Gestores</h3>
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input type="text" placeholder="Buscar na tabela..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003399]/20 w-64 transition-all" />
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-[#F0F2F5]/50 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Empresa</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Contato</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {managers.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-12 text-slate-400 font-medium">Nenhum gestor cadastrado ainda.</td></tr>
                                    ) : (
                                        visibleManagers.map((mgr, index) => (
                                            <tr key={mgr.id || index} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-[#003399] flex items-center justify-center font-bold text-sm shrink-0">
                                                            {(mgr.name || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-800 font-bold text-sm">{mgr.name || 'Sem Nome'}</p>
                                                            <p className="text-slate-400 text-[10px] uppercase font-mono tracking-widest mt-0.5">ID: {(mgr.id || '').slice(0,8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-slate-700">{mgr.companyName || 'Sem Empresa'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                                                        ATIVO
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-700">{mgr.email}</span>
                                                        {mgr.phone && <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5"><Phone size={10}/>{mgr.phone}</div>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleDemoteManager(mgr.id)} 
                                                            className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-2 border border-red-100 opacity-0 group-hover:opacity-100" 
                                                            title="Remover acesso administrativo (tornar colaborador)"
                                                        >
                                                            <UserMinus size={14} />
                                                            <span className="text-[11px] font-bold uppercase tracking-wider">Remover Gestão</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* --- CONTROLES DE PAGINAÇÃO --- */}
                        <div className="p-4 flex items-center justify-end gap-4 border-t border-slate-100 bg-white">
                            <span className="text-sm font-medium text-slate-500">Página {managerPage + 1} de {totalPages || 1}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setManagerPage(p => Math.max(0, p - 1))} disabled={managerPage === 0} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
                                <button onClick={() => setManagerPage(p => Math.min(totalPages - 1, p + 1))} disabled={managerPage >= totalPages - 1} className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL DE VINCULAR GESTOR EXISTENTE */}
            <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Vincular Gestor Existente">
                
                {/* O FEEDBACK DE ERRO AGORA APARECE AQUI DENTRO */}
                <FeedbackMessage feedback={linkFeedback} />

                <form onSubmit={handleLinkManager} className="space-y-5">
                    <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        Busque por um usuário já existente no sistema (Colaborador, ou Solicitante Pendente) para torná-lo um Gestor.
                    </p>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email do Usuário</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="usuario@email.com" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all"
                            value={linkData.email}
                            onChange={e => setLinkData({...linkData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Vincular a Empresa</label>
                        <select 
                            required 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] outline-none text-sm transition-all"
                            value={linkData.companyId}
                            onChange={e => setLinkData({...linkData, companyId: e.target.value})}
                        >
                            <option value="" disabled>Selecione...</option>
                            {companies.map(c => (<option key={c.companyId} value={c.companyId}>{c.name}</option>))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="bg-[#003399] hover:bg-[#002266] text-white text-sm font-bold px-6 py-2 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                            <CheckCircle2 size={16}/> {isLoading ? 'Vinculando...' : 'Vincular'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}