'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    MapPin, Edit2, Save, X, Mail, Phone, Building2, Briefcase, 
    ShieldCheck, KeyRound, Building, ArrowRightLeft, Trash2, AlertTriangle, Search, Bell, Menu, User
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';
import Link from 'next/link';

// --- 1. INTERFACES E HELPERS ---

interface NotificationDTO {
    id: string;
    title: string;
    message: string;
    type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
    read: boolean;
    time: string;
}

const translateRole = (role: string) => {
    const map: Record<string, string> = {
        'MANAGER': 'Gestor',
        'COLLABORATOR': 'Colaborador',
        'ADMIN': 'Administrador',
        'ROLE_MANAGER': 'Gestor',
        'ROLE_COLLABORATOR': 'Colaborador',
        'ROLE_ADMIN': 'Administrador'
    };
    return map[role] || role;
};

const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length > 11) return value.slice(0, 15);
    return numericValue
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2');
};

// --- 2. COMPONENTE PRINCIPAL ---

function ProfilePage() {
    const { user, token, logout } = useAuth() as any;
    const router = useRouter();

    // --- ESTADOS DE INTERFACE ---
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Estados dos Modais
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    // Estados de Ação
    const [isRequestingNewCompany, setIsRequestingNewCompany] = useState(false);
    const [isExitingCompany, setIsExitingCompany] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Estados de Notificação e Busca
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Campos dos Formulários
    const [newCompanyCnpj, setNewCompanyCnpj] = useState('');
    const [newCompanyEmail, setNewCompanyEmail] = useState('');
    
    // Estado para Troca de Senha
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // --- ESTADOS DE DADOS ---
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: '', company: '', department: '',
    });

    const [stats, setStats] = useState({
        reservationsCount: 0,
        approvedHours: 0
    });

    // --- LÓGICA DA BUSCA (REDIRECT) ---
    const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.push(`/collaborator-dashboard?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    // --- 3. LÓGICA DE NOTIFICAÇÕES ---
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const response = await fetch('/collaborator/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    read: n.read,
                    time: new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                }));
                setNotifications(formattedData);
            }
        } catch (error) {
            console.error("Erro ao buscar notificações:", error);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await fetch(`/collaborator/notifications/${id}/read`, { 
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) { console.error(e); }
    };

    const handleClearNotifications = async () => {
        setNotifications([]);
        setIsNotifOpen(false);
        try {
            await fetch('/collaborator/notifications', { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) { console.error(e); }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(), 30000);
        return () => clearInterval(interval);
    }, [token]);


    // --- 4. BUSCA DE DADOS DO PERFIL ---
    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) return;

            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const [profileRes, schedulingRes, hoursRes] = await Promise.all([
                    fetch('/collaborator/user/me', { headers }),
                    fetch('/collaborator/unified-scheduling', { headers }),
                    fetch('/collaborator/hours-requests', { headers })
                ]);

                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: formatPhoneNumber(data.phone || ''),
                        role: translateRole(data.role || ''),
                        company: data.companyName || 'Sem Empresa', 
                        department: data.department || ''
                    });
                }

                if (schedulingRes.ok) {
                    const data = await schedulingRes.json();
                    setStats(prev => ({ ...prev, reservationsCount: (data.content || []).length }));
                }

                if (hoursRes.ok) {
                    const data = await hoursRes.json();
                    const totalHours = (data.content || [])
                        .filter((r: any) => r.status === 'APPROVED')
                        .reduce((acc: number, curr: any) => acc + (Number(curr.requestedHours) || 0), 0);
                    setStats(prev => ({ ...prev, approvedHours: totalHours }));
                }

            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchAllData();
    }, [token]);

    // --- 5. HANDLERS GERAIS ---

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/collaborator/user/me', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, phoneNumber: formData.phone })
            });

            if (response.ok) {
                setIsEditing(false);
                alert("Perfil atualizado com sucesso!");
            } else {
                const errorData = await response.json(); 
                alert(`Erro ao salvar: ${errorData.message || 'Verifique os dados'}`);
            }
        } catch (error) { console.error(error); alert("Erro de conexão."); } finally { setIsLoading(false); }
    };

    // --- Handler: Troca de Senha ---
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.new !== passwords.confirm) {
            alert("A nova senha e a confirmação não coincidem.");
            return;
        }
        if (passwords.new.length < 6) {
            alert("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setIsSavingPassword(true);
        try {
            const response = await fetch('/collaborator/user/change-password', {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ 
                    currentPassword: passwords.current, 
                    newPassword: passwords.new 
                })
            });

            if (response.ok) {
                alert("Senha alterada com sucesso!");
                setIsPasswordModalOpen(false);
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const errorText = await response.text(); 
                alert(`Erro: ${errorText || "Não foi possível alterar a senha."}`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleRequestNewCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyCnpj || !newCompanyEmail) return;
        setIsRequestingNewCompany(true);
        try {
            const response = await fetch('/collaborator/request-new-company', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ cnpj: newCompanyCnpj, newEmail: newCompanyEmail })
            });

            if (response.ok) {
                alert("Solicitação enviada com sucesso!\n\nQuando aprovada, você poderá fazer login utilizando o novo e-mail informado.");
                setIsCompanyModalOpen(false);
                setNewCompanyCnpj('');
                setNewCompanyEmail('');
            } else {
                const errorText = await response.text();
                alert(`Erro na solicitação: ${errorText}`);
            }
        } catch (error) { console.error(error); alert("Erro ao conectar com o servidor."); } finally { setIsRequestingNewCompany(false); }
    };

    const handleExitCompany = async () => {
        const confirmExit = window.confirm("ATENÇÃO: Ao sair da empresa, sua conta atual será EXCLUÍDA permanentemente. Deseja continuar?");
        if (!confirmExit) return;
        setIsExitingCompany(true);
        try {
            const response = await fetch('/collaborator/company/exit', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok || response.status === 204) {
                alert("Você saiu da empresa e sua conta foi encerrada.");
                handleLogout(); 
            } else {
                const msg = await response.text();
                alert(`Erro ao sair: ${msg}`);
            }
        } catch (error) { console.error(error); alert("Erro de conexão."); } finally { setIsExitingCompany(false); }
    };

    // --- 6. RENDERIZAÇÃO ---
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            
            {/* --- TOP NAVBAR (ESTILO ARCHDAILY/BRISA) --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4 md:gap-6">
                    <button 
                        className="text-slate-600 hover:text-[#003399] transition-colors xl:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleDashboardClick}>
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/>
                                <path d="M4 14h8v12"/>
                                <path d="M12 2v12l8-4"/>
                            </svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">
                            brisa
                        </span>
                    </div>
                </div>

                <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                    <div className="w-full bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003399]/20 focus-within:border-[#003399]">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input 
                            placeholder="Buscar reservas ou espaços..." 
                            className="bg-transparent border-none text-sm outline-none w-full placeholder-slate-500 text-slate-700" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href="#" onClick={(e) => { e.preventDefault(); handleDashboardClick(); }} className="hover:text-[#003399] transition-colors">Dashboard</Link>
                        <Link href="/calendar" className="hover:text-[#003399] transition-colors">Reservas</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="#" className="text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    
                    <div className="flex items-center gap-5">
                        <div className="relative flex items-center">
                            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2 text-slate-400 hover:text-[#003399] transition-colors bg-white rounded-full border border-slate-200 shadow-sm outline-none">
                                <Bell size={18} />
                                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>}
                            </button>
                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setIsNotifOpen(false)}></div>
                                    <div className="absolute right-0 top-12 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                            <h4 className="font-bold text-slate-800 text-sm">Notificações</h4>
                                            {notifications.length > 0 && <button onClick={handleClearNotifications} className="text-xs text-[#003399] hover:underline">Limpar tudo</button>}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-slate-400 text-sm"><div className="flex justify-center mb-2"><Bell size={24} className="opacity-20" /></div>Nenhuma notificação nova.</div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div key={notif.id} onClick={() => handleMarkAsRead(notif.id)} className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}>
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type === 'SUCCESS' ? 'bg-emerald-500' : notif.type === 'WARNING' ? 'bg-amber-500' : notif.type === 'ERROR' ? 'bg-red-500' : 'bg-[#003399]'}`}></div>
                                                            <div>
                                                                <h5 className={`text-sm font-bold mb-0.5 ${notif.read ? 'text-slate-600' : 'text-slate-800'}`}>{notif.title}</h5>
                                                                <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                                                                <span className="text-[10px] text-slate-400 mt-2 block font-medium">{notif.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <span className="text-[15px] font-medium text-slate-600 hidden md:block">
                            {user?.name?.split(' ')[0] || 'Usuário'}
                        </span>
                        <button onClick={handleLogout} className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MENU MOBILE EXPANSÍVEL --- */}
            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <div className="md:hidden bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="bg-transparent border-none outline-none text-slate-700 w-full text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                        />
                    </div>
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href="#" onClick={(e) => { e.preventDefault(); handleDashboardClick(); }} className="hover:text-[#003399]">Dashboard</Link>
                        <Link href="/calendar" className="hover:text-[#003399]">Reservas</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399]">Espaços</Link>
                        <Link href="#" className="text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
                    
                    {/* HEADER DO PERFIL */}
                    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                        {/* Area Colorida / Capa (Substituído o gradiente escuro por algo limpo) */}
                        <div className="h-32 bg-gradient-to-r from-blue-50 to-[#F0F2F5] w-full border-b border-slate-100"></div>
                        
                        <div className="px-8 pb-8">
                            <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-10 gap-6">
                                
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-md z-10">
                                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#003399] to-[#0055ff] text-white flex items-center justify-center text-3xl font-bold border border-white">
                                        {isFetching ? '...' : (formData.name?.charAt(0) || 'U')}
                                    </div>
                                </div>
                                
                                {/* Info Principal */}
                                <div className="flex-1 text-center md:text-left mb-2">
                                    <h3 className="text-2xl font-bold text-slate-800">{isFetching ? 'Carregando...' : formData.name}</h3>
                                    <p className="text-slate-500 font-medium mt-0.5">{formData.role}</p>
                                </div>
                                
                                {/* Estatísticas Rápidas */}
                                <div className="flex gap-10 py-4 px-8 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold text-slate-800">{stats.reservationsCount}</span>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Reservas</span>
                                    </div>
                                    <div className="w-px h-10 bg-slate-200"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold text-slate-800">{stats.approvedHours.toFixed(1).replace('.0', '')}h</span>
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Horas</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* FORMULÁRIO DE INFORMAÇÕES */}
                        <div className="lg:col-span-2 bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 h-full">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Informações Pessoais</h3>
                                    <p className="text-sm text-slate-500 mt-1">Mantenha seus dados de contato sempre atualizados.</p>
                                </div>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-[#003399] border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-100 transition"><Edit2 size={16} /> Editar</button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"><X size={16} /> Cancelar</button>
                                        <button onClick={handleSaveProfile} disabled={isLoading} className="flex items-center gap-2 px-5 py-2 bg-[#003399] text-white rounded-xl text-sm font-medium hover:bg-[#002266] transition shadow-md"><Save size={16} /> {isLoading ? 'Salvando...' : 'Salvar'}</button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nome Completo</label>
                                    <div className={`flex items-center px-4 py-3 rounded-xl border transition-all ${isEditing ? 'border-[#003399] bg-white ring-2 ring-[#003399]/10' : 'border-slate-100 bg-[#F0F2F5]'}`}>
                                        <User size={18} className="text-slate-400 mr-3" />
                                        <input type="text" name="name" disabled={!isEditing} value={formData.name} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-700 font-medium disabled:text-slate-500" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Corporativo</label>
                                    <div className="flex items-center px-4 py-3 rounded-xl border border-slate-100 bg-[#F0F2F5] cursor-not-allowed">
                                        <Mail size={18} className="text-slate-400 mr-3" />
                                        <input type="email" disabled value={formData.email} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Telefone</label>
                                    <div className={`flex items-center px-4 py-3 rounded-xl border transition-all ${isEditing ? 'border-[#003399] bg-white ring-2 ring-[#003399]/10' : 'border-slate-100 bg-[#F0F2F5]'}`}>
                                        <Phone size={18} className="text-slate-400 mr-3" />
                                        <input type="text" name="phone" disabled={!isEditing} value={formData.phone} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-700 font-medium disabled:text-slate-500" placeholder="(xx) xxxxx-xxxx" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Empresa</label>
                                    <div className="flex items-center px-4 py-3 rounded-xl border border-slate-100 bg-[#F0F2F5] cursor-not-allowed">
                                        <Building2 size={18} className="text-slate-400 mr-3" />
                                        <input type="text" disabled value={formData.company} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cargo</label>
                                    <div className={`flex items-center px-4 py-3 rounded-xl border ${isEditing ? 'border-slate-200 bg-white' : 'border-slate-100 bg-[#F0F2F5] cursor-not-allowed'}`}>
                                        <Briefcase size={18} className="text-slate-400 mr-3" />
                                        <input type="text" disabled value={formData.role} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Departamento</label>
                                    <div className={`flex items-center px-4 py-3 rounded-xl border transition-all ${isEditing ? 'border-[#003399] bg-white ring-2 ring-[#003399]/10' : 'border-slate-100 bg-[#F0F2F5]'}`}>
                                        <MapPin size={18} className="text-slate-400 mr-3" />
                                        <input type="text" name="department" disabled={!isEditing} value={formData.department} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-700 font-medium disabled:text-slate-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* CARDS LATERAIS */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            
                            {/* Card: Vínculo */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-[#003399]"><Building size={20} /></div>
                                    <h4 className="font-bold text-slate-800 text-lg">Vínculo Corporativo</h4>
                                </div>
                                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 shadow-sm">
                                        {formData.company ? formData.company.charAt(0) : 'E'}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Empresa Atual</p>
                                        <p className="text-[15px] font-bold text-slate-800">{formData.company}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsCompanyModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
                                    <ArrowRightLeft size={16} /> Gerenciar Vínculo
                                </button>
                            </div>
                            
                            {/* Card: Segurança */}
                            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-[#003399]"><ShieldCheck size={20} /></div>
                                    <h4 className="font-bold text-slate-800 text-lg">Segurança</h4>
                                </div>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">Mantenha sua conta segura alterando sua senha periodicamente.</p>
                                <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                                    <KeyRound size={16} /> Alterar Senha
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAL EMPRESA --- */}
            {isCompanyModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setIsCompanyModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#003399]"><Building size={32} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">Gerenciar Empresa</h3>
                            <p className="text-sm text-slate-500 mt-2">Cadastre-se em outra organização ou encerre seu vínculo atual.</p>
                        </div>

                        <form onSubmit={handleRequestNewCompany} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CNPJ da Nova Empresa</label>
                                <input type="text" placeholder="00.000.000/0001-00" value={newCompanyCnpj} onChange={(e) => setNewCompanyCnpj(e.target.value)} className="w-full px-4 py-3 bg-[#F0F2F5] rounded-xl border border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition text-center text-lg font-medium tracking-wide" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-mail para nova conta</label>
                                <input type="email" placeholder="novo.email@exemplo.com" value={newCompanyEmail} onChange={(e) => setNewCompanyEmail(e.target.value)} className="w-full px-4 py-3 bg-[#F0F2F5] rounded-xl border border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" />
                                <p className="text-xs text-slate-400 mt-1.5 ml-1 font-medium">Necessário informar um e-mail diferente do atual.</p>
                            </div>
                            <button type="submit" disabled={!newCompanyCnpj || !newCompanyEmail || isRequestingNewCompany} className="w-full py-3.5 rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                {isRequestingNewCompany ? 'Enviando...' : 'Solicitar Acesso'}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-wider text-[10px]">Área de Perigo</span></div>
                        </div>

                        <button onClick={handleExitCompany} disabled={isExitingCompany} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition disabled:opacity-50">
                            {isExitingCompany ? 'Saindo...' : <><Trash2 size={18} /> Sair da Empresa Atual</>}
                        </button>
                        <div className="mt-4 bg-red-50/50 border border-red-100 rounded-xl p-3.5 text-xs text-red-700 flex items-start gap-2 font-medium">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <p>Ao sair da empresa, sua conta atual e dados vinculados a ela serão excluídos permanentemente.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ALTERAR SENHA --- */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#003399]"><KeyRound size={32} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">Alterar Senha</h3>
                            <p className="text-sm text-slate-500 mt-2">Confirme sua senha atual antes de criar uma nova.</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Senha Atual</label>
                                <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-3 bg-[#F0F2F5] rounded-xl border border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nova Senha</label>
                                <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-3 bg-[#F0F2F5] rounded-xl border border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirmar Nova Senha</label>
                                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-3 bg-[#F0F2F5] rounded-xl border border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" />
                            </div>

                            <button type="submit" disabled={!passwords.current || !passwords.new || isSavingPassword} className="w-full py-3.5 rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition shadow-md disabled:opacity-50 mt-4">
                                {isSavingPassword ? 'Salvando...' : 'Confirmar Alteração'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuth(ProfilePage, ['ROLE_COLLABORATOR', 'ROLE_MANAGER', 'ROLE_ADMIN']);