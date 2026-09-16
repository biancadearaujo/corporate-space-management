'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { 
    Users, Building2, Settings, LogOut, Search, Plus, User,
    Home, Briefcase, Layers, MoreVertical, CheckCircle2, Phone,
    ChevronLeft, ChevronRight, UserMinus, X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
const SidebarItem = ({ icon: Icon, label, isActive = false, onClick }: { icon: any, label: string, isActive?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const FeedbackMessage = ({ feedback }: { feedback: Feedback | null }) => {
    if (!feedback) return null;
    const isSuccess = feedback.type === 'success';
    return (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${isSuccess ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
            <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} />
            {feedback.message}
        </div>
    );
};

// Componente Modal Simples
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-[#1B2559]">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
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
    const { user } = useAuth();
    const router = useRouter();

    // Estados Gerais
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]); 
    
    // Estado para Modal de Vínculo (NOVO)
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({ email: '', companyId: '' });

    // Paginação
    const [managerPage, setManagerPage] = useState(0);
    const managersPerPage = 4;

    // Estado do Formulário de Cadastro
    const [managerFormData, setManagerFormData] = useState({
        username: '', email: '', password: '', cpf: '', phoneNumber: '', rgNumber: '', companyId: '',
    });

    // --- FETCH DATA ---
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            // 1. Buscar Empresas
            const companiesRes = await axios.get('http://localhost:8080/admin/company', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (companiesRes.data && Array.isArray(companiesRes.data.content)) {
                setCompanies(companiesRes.data.content);
            }

            // 2. Buscar Gestores
            const managersRes = await axios.get('http://localhost:8080/admin/users/managers', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setManagers(managersRes.data);

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- LÓGICA DE PAGINAÇÃO ---
    const startIndex = managerPage * managersPerPage;
    const endIndex = startIndex + managersPerPage;
    const visibleManagers = managers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(managers.length / managersPerPage);

    // --- HANDLERS DE CRIAÇÃO (NOVO USUÁRIO) ---
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setManagerFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');

        try {
            await axios.post('http://localhost:8080/admin/users', {
                ...managerFormData,
                username: managerFormData.username, 
                role: 'MANAGER', 
                cpf: managerFormData.cpf.replace(/[^\d]/g, ''), 
                rgNumber: managerFormData.rgNumber.replace(/[^\d]/g, ''),
                photoUrl: 'https://picsum.photos/200/300',
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setFeedback({ type: 'success', message: 'Gestor cadastrado com sucesso!' });
            
            // Limpa o form
            setManagerFormData({ username: '', email: '', password: '', cpf: '', phoneNumber: '', rgNumber: '', companyId: '' });
            
            fetchData(); 
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao cadastrar.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLER: VINCULAR GESTOR EXISTENTE (NOVO) ---
    const handleLinkManager = async (e: FormEvent) => {
        e.preventDefault();
        if (!linkData.email || !linkData.companyId) return alert("Preencha todos os campos.");
        
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:8080/admin/assign-manager', {
                email: linkData.email,
                targetCompanyId: linkData.companyId
            }, { headers: { Authorization: `Bearer ${token}` } });

            setFeedback({ type: 'success', message: 'Gestor vinculado com sucesso!' });
            setLinkData({ email: '', companyId: '' });
            setIsLinkModalOpen(false);
            fetchData(); // Atualiza a lista
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erro: Usuário não encontrado ou erro no servidor.' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLER: REMOVER ACESSO DE GESTOR (Rebaixar) ---
    const handleDemoteManager = async (id: string) => {
        if (!window.confirm("Tem certeza? O usuário deixará de ser Gestor e se tornará um Colaborador comum.")) return;
        
        const token = localStorage.getItem('token');
        try {
            // Chama o PATCH para mudar o cargo para COLLABORATOR
            await axios.put(`http://localhost:8080/admin/users/${id}/role`, 
                { role: 'COLLABORATOR' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setFeedback({ type: 'success', message: 'Acesso de gestor removido com sucesso.' });
            
            // Remove da lista visualmente (pois esta lista só mostra managers)
            setManagers(prev => prev.filter(m => m.id !== id));
            
        } catch (error) {
            setFeedback({ type: 'error', message: 'Erro ao alterar o cargo.' });
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F4F7FE]">
            {/* --- SIDEBAR --- */}
            <aside className="w-72 bg-[#111C44] flex flex-col p-6 fixed h-full z-20 transition-all">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <h1 className="text-white text-xl font-bold tracking-wide">SPACE MASTER</h1>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-gray-500 text-xs font-bold px-3 mb-2 uppercase tracking-wider">Menu Principal</p>
                    <SidebarItem icon={Home} label="Dashboard" onClick={() => router.push('/admin-dashboard')} />
                    <SidebarItem icon={Users} label="Gestores" isActive={true} />
                    <SidebarItem icon={Building2} label="Empresas" />
                    <SidebarItem icon={Layers} label="Espaços" onClick={() => router.push('/our-spaces')} />
                </div>
                <div className="mt-auto"><SidebarItem icon={LogOut} label="Sair" onClick={() => router.push('/')} /></div>
            </aside>

            {/* --- ÁREA PRINCIPAL --- */}
            <main className="flex-1 ml-72 p-8 transition-all">
                <header className="flex justify-between items-center mb-8">
                    <div><p className="text-gray-500 text-sm mb-1">Páginas / Gestores</p><h2 className="text-2xl font-bold text-[#1B2559]">Gerenciamento de Gestores</h2></div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm">
                        <div className="relative bg-[#F4F7FE] rounded-full px-4 py-2 flex items-center gap-2 text-gray-500 w-64"><Search size={18} /><input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm w-full" /></div>
                        <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white cursor-pointer">{user?.name?.charAt(0) || <User size={18}/>}</div>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    {/* 1. FORMULÁRIO DE CADASTRO */}
                    <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
                        
                        {/* CABEÇALHO ATUALIZADO COM OS BOTÕES */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-[#1B2559]">Gerenciar Gestores</h3>
                            <div className="flex gap-2">
                                {/* BOTÃO NOVO: VINCULAR EXISTENTE */}
                                <button 
                                    onClick={() => setIsLinkModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-md transition-all text-sm"
                                >
                                    <Search size={16} /> Vincular Existente
                                </button>

                                {/* Botão Salvar Cadastro */}
                                <button 
                                    type="submit" form="managerForm" disabled={isLoading}
                                    className="bg-[#05CD99] hover:bg-[#04b989] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-md shadow-green-200 disabled:opacity-50 transition-all text-sm"
                                >
                                    <Plus size={16} /> Novo Cadastro
                                </button>
                            </div>
                        </div>

                        <FeedbackMessage feedback={feedback} />
                        
                        <form id="managerForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-6">
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Nome de Usuário</label><input type="text" name="username" required value={managerFormData.username} onChange={handleChange} placeholder="Ex: joaosilva" className="w-full p-3 bg-transparent border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-gray-700" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Corporativo</label><input type="email" name="email" required value={managerFormData.email} onChange={handleChange} placeholder="email@empresa.com" className="w-full p-3 bg-transparent border border-gray-200 rounded-xl focus:border-blue-500 outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Senha</label><input type="password" name="password" required value={managerFormData.password} onChange={handleChange} placeholder="••••••••" className="w-full p-3 bg-transparent border border-gray-200 rounded-xl focus:border-blue-500 outline-none" /></div>
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">CPF</label><input type="text" name="cpf" required value={managerFormData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full p-3 bg-transparent border border-gray-200 rounded-xl focus:border-blue-500 outline-none" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">RG</label><input type="text" name="rgNumber" required value={managerFormData.rgNumber} onChange={handleChange} placeholder="00.000.000-0" className="w-full p-3 bg-transparent border border-gray-200 rounded-xl focus:border-blue-500 outline-none" /></div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label><input type="tel" name="phoneNumber" required value={managerFormData.phoneNumber} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full p-3 bg-transparent border border-gray-200 rounded-xl focus:border-blue-500 outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Empresa Vinculada</label>
                                    <select name="companyId" required value={managerFormData.companyId} onChange={handleChange} className="w-full p-3 bg-transparent border border-gray-200 rounded-xl focus:border-blue-500 outline-none text-gray-700">
                                        <option value="" disabled>Selecione uma empresa</option>
                                        {companies.map(c => (<option key={c.companyId} value={c.companyId}>{c.name}</option>))}
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* --- 2. LISTA DE GESTORES PAGINADA --- */}
                    <div className="bg-white rounded-[20px] p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-[#1B2559]">Lista de Gestores Cadastrados</h3>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Nome</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Empresa</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-4 px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Contato</th>
                                        <th className="text-right py-4 px-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {managers.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">Nenhum gestor cadastrado ainda.</td></tr>
                                    ) : (
                                        visibleManagers.map((mgr, index) => (
                                            <tr key={mgr.id || index} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                            {(mgr.name || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-[#1B2559] font-bold text-sm">{mgr.name || 'Sem Nome'}</p>
                                                            <p className="text-gray-400 text-xs">ID: {(mgr.id || '').slice(0,8)}...</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-sm font-bold text-[#1B2559]">{mgr.companyName || 'Sem Empresa'}</p>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /><span className="text-sm font-medium text-[#1B2559]">Ativo</span></div>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-600">
                                                    <div className="flex flex-col">
                                                        <span>{mgr.email}</span>
                                                        {mgr.phone && <div className="flex items-center gap-1 text-xs text-gray-400"><Phone size={10}/>{mgr.phone}</div>}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleDemoteManager(mgr.id)} 
                                                            className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 border border-red-100" 
                                                            title="Remover acesso administrativo (tornar colaborador)"
                                                        >
                                                            <UserMinus size={16} />
                                                            <span className="text-xs font-semibold">Remover Gestão</span>
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
                        <div className="p-4 flex items-center justify-end gap-4 border-t border-gray-100 mt-2">
                            <span className="text-sm text-gray-500">Página {managerPage + 1} de {totalPages || 1}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setManagerPage(p => Math.max(0, p - 1))} disabled={managerPage === 0} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronLeft size={16} /></button>
                                <button onClick={() => setManagerPage(p => Math.min(totalPages - 1, p + 1))} disabled={managerPage >= totalPages - 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL DE VINCULAR GESTOR EXISTENTE (NOVO) */}
            <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Vincular Gestor Existente">
                <form onSubmit={handleLinkManager} className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Busque por um usuário já existente (Colaborador, Gestor de outra empresa ou Solicitante Pendente) para torná-lo Gestor aqui.
                    </p>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email do Usuário</label>
                        <input 
                            type="email" 
                            required 
                            placeholder="usuario@email.com" 
                            className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                            value={linkData.email}
                            onChange={e => setLinkData({...linkData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nova Empresa</label>
                        <select 
                            required 
                            className="w-full p-2 border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-500"
                            value={linkData.companyId}
                            onChange={e => setLinkData({...linkData, companyId: e.target.value})}
                        >
                            <option value="" disabled>Selecione...</option>
                            {companies.map(c => (<option key={c.companyId} value={c.companyId}>{c.name}</option>))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition-colors">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
                            <CheckCircle2 size={16}/> Vincular
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}