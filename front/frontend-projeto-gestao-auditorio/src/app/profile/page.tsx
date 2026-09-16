'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, CalendarDays, Clock, LogOut, User, Search, Bell, 
    MapPin, Edit2, Save, X, Mail, Phone, Building2, Briefcase, 
    ShieldCheck, KeyRound, Building, ArrowRightLeft, Trash2, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';

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

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

// --- 2. COMPONENTE PRINCIPAL ---

function ProfilePage() {
    const { user, token, signOut } = useAuth() as any;
    const router = useRouter();

    // --- ESTADOS DE INTERFACE ---
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    
    // Estados dos Modais
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // NOVO
    
    // Estados de Ação
    const [isRequestingNewCompany, setIsRequestingNewCompany] = useState(false);
    const [isExitingCompany, setIsExitingCompany] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false); // NOVO

    // Estados de Notificação e Busca
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Campos dos Formulários
    const [newCompanyCnpj, setNewCompanyCnpj] = useState('');
    const [newCompanyEmail, setNewCompanyEmail] = useState('');
    
    // Estado para Troca de Senha (NOVO)
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
        if (signOut) signOut();
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
        router.push('/');
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

    // --- Handler: Troca de Senha (NOVO) ---
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
            // Chama o endpoint que criamos no backend
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
                // Se o backend retornar erro, geralmente é "Senha atual incorreta"
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
        <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-800 overflow-hidden relative">
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#111C44] flex-shrink-0 flex flex-col py-6 px-4 text-white">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">M</div>
                    <span className="text-xl font-bold tracking-wide">SPACE MASTER</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => router.push('/collaborator-dashboard')} />
                    <SidebarItem icon={CalendarDays} label="Reservas" onClick={() => router.push('/calendar')} />
                    <SidebarItem icon={MapPin} label="Espaços" onClick={() => router.push('/our-spaces')} />
                    <SidebarItem icon={Clock} label="Horas Extras" onClick={() => {}} />
                    <SidebarItem icon={User} label="Perfil" active onClick={() => {}} />
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-700">
                    <SidebarItem icon={LogOut} label="Sair" onClick={handleLogout} />
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-0">
                <header className="h-20 bg-[#F4F7FE] flex items-center justify-between px-8 pt-4 relative z-20">
                    <div><p className="text-sm text-slate-500">Páginas / Perfil</p><h2 className="text-2xl font-bold text-[#1B2559]">Meu Perfil</h2></div>
                    
                    {/* HEADER DINÂMICO */}
                    <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm px-4">
                        <div className="relative bg-[#F4F7FE] rounded-full px-3 py-2 flex items-center gap-2">
                            <Search size={16} className="text-slate-500" />
                            <input 
                                placeholder="Buscar..." 
                                className="bg-transparent border-none text-sm outline-none w-32 placeholder-slate-500" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearchSubmit}
                            />
                        </div>

                        <div className="relative">
                            <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-1 text-slate-400 hover:text-blue-600 transition-colors outline-none">
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                            </button>
                            {isNotifOpen && (
                                <>
                                    <div className="fixed inset-0 z-30" onClick={() => setIsNotifOpen(false)}></div>
                                    <div className="absolute right-[-60px] mt-4 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                            <h4 className="font-bold text-[#1B2559] text-sm">Notificações</h4>
                                            {notifications.length > 0 && <button onClick={handleClearNotifications} className="text-xs text-blue-600 hover:underline">Limpar tudo</button>}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-slate-400 text-sm"><div className="flex justify-center mb-2"><Bell size={24} className="opacity-20" /></div>Nenhuma notificação nova.</div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div key={notif.id} onClick={() => handleMarkAsRead(notif.id)} className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}>
                                                        <div className="flex gap-3">
                                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type === 'SUCCESS' ? 'bg-green-500' : notif.type === 'WARNING' ? 'bg-yellow-500' : notif.type === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                            <div>
                                                                <h5 className={`text-sm font-bold mb-0.5 ${notif.read ? 'text-slate-600' : 'text-[#1B2559]'}`}>{notif.title}</h5>
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

                        <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold">{formData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* HEADER DO PERFIL */}
                    <div className="bg-white rounded-[20px] shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="h-40 bg-gradient-to-r from-blue-600 to-blue-400 w-full"></div>
                        <div className="px-8 pb-8">
                            <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-12 gap-6">
                                <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl z-10">
                                    <div className="w-full h-full rounded-full bg-[#111C44] text-white flex items-center justify-center text-4xl font-bold border-4 border-white">
                                        {isFetching ? '...' : (formData.name?.charAt(0) || 'U')}
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left mb-2">
                                    <h3 className="text-2xl font-bold text-[#1B2559]">{isFetching ? 'Carregando...' : formData.name}</h3>
                                    <p className="text-slate-500 font-medium">{formData.role}</p>
                                </div>
                                <div className="flex gap-8 md:gap-12 py-4 px-8 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col items-center"><span className="text-2xl font-bold text-[#1B2559]">{stats.reservationsCount}</span><span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Reservas</span></div>
                                    <div className="w-px h-10 bg-slate-200"></div>
                                    <div className="flex flex-col items-center"><span className="text-2xl font-bold text-[#1B2559]">{stats.approvedHours.toFixed(1).replace('.0', '')}h</span><span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Horas</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* FORMULÁRIO */}
                        <div className="lg:col-span-2 bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <div><h3 className="text-lg font-bold text-[#1B2559]">Informações Gerais</h3><p className="text-sm text-slate-500">Gerencie seus dados pessoais e profissionais.</p></div>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition"><Edit2 size={16} /> Editar</button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"><X size={16} /> Cancelar</button>
                                        <button onClick={handleSaveProfile} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-md shadow-blue-500/20"><Save size={16} /> {isLoading ? 'Salvando...' : 'Salvar'}</button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Nome Completo</label><div className={`flex items-center px-4 py-3 rounded-xl border ${isEditing ? 'border-blue-500 bg-white' : 'border-slate-100 bg-slate-50'}`}><User size={18} className="text-slate-400 mr-3" /><input type="text" name="name" disabled={!isEditing} value={formData.name} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-700 font-medium disabled:text-slate-500" /></div></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Email Corporativo</label><div className="flex items-center px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 cursor-not-allowed"><Mail size={18} className="text-slate-400 mr-3" /><input type="email" disabled value={formData.email} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium" /></div></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Telefone</label><div className={`flex items-center px-4 py-3 rounded-xl border ${isEditing ? 'border-blue-500 bg-white' : 'border-slate-100 bg-slate-50'}`}><Phone size={18} className="text-slate-400 mr-3" /><input type="text" name="phone" disabled={!isEditing} value={formData.phone} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-700 font-medium disabled:text-slate-500" placeholder="(xx) xxxxx-xxxx" /></div></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Empresa</label><div className="flex items-center px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 cursor-not-allowed"><Building2 size={18} className="text-slate-400 mr-3" /><input type="text" disabled value={formData.company} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium" /></div></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Cargo</label><div className={`flex items-center px-4 py-3 rounded-xl border ${isEditing ? 'border-blue-500 bg-white' : 'border-slate-100 bg-slate-50'}`}><Briefcase size={18} className="text-slate-400 mr-3" /><input type="text" disabled value={formData.role} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium disabled:text-slate-500" /></div></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Departamento</label><div className={`flex items-center px-4 py-3 rounded-xl border ${isEditing ? 'border-blue-500 bg-white' : 'border-slate-100 bg-slate-50'}`}><MapPin size={18} className="text-slate-400 mr-3" /><input type="text" name="department" disabled={!isEditing} value={formData.department} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-700 font-medium disabled:text-slate-500" /></div></div>
                            </div>
                        </div>
                        
                        {/* CARDS LATERAIS */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-600 rounded-lg text-white"><Building size={20} /></div><h4 className="font-bold text-[#1B2559]">Vínculo Corporativo</h4></div>
                                <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">{formData.company ? formData.company.charAt(0) : 'E'}</div><div><p className="text-xs text-slate-400 font-semibold uppercase">Empresa Atual</p><p className="text-sm font-bold text-[#1B2559]">{formData.company}</p></div></div>
                                <button onClick={() => setIsCompanyModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2559] text-white rounded-xl text-sm font-medium hover:bg-[#2c3b80] transition shadow-md shadow-blue-900/20"><ArrowRightLeft size={16} /> Gerenciar Vínculo</button>
                            </div>
                            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-blue-50 rounded-lg text-blue-600"><ShieldCheck size={20} /></div><h4 className="font-bold text-[#1B2559]">Segurança</h4></div>
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Mantenha sua conta segura alterando sua senha periodicamente.</p>
                                {/* BOTÃO DE ALTERAR SENHA ATIVADO */}
                                <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"><KeyRound size={16} /> Alterar Senha</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL EMPRESA */}
            {isCompanyModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setIsCompanyModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Building size={28} /></div>
                            <h3 className="text-xl font-bold text-[#1B2559]">Gerenciar Empresa</h3>
                            <p className="text-sm text-slate-500 mt-2">Cadastre-se em outra organização ou encerre seu vínculo atual.</p>
                        </div>
                        <form onSubmit={handleRequestNewCompany} className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">CNPJ da Nova Empresa</label><input type="text" placeholder="00.000.000/0001-00" value={newCompanyCnpj} onChange={(e) => setNewCompanyCnpj(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-center text-lg font-medium tracking-wide" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">E-mail para esta nova conta</label><input type="email" placeholder="novo.email@exemplo.com" value={newCompanyEmail} onChange={(e) => setNewCompanyEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" /><p className="text-xs text-slate-400 mt-1 ml-1">Necessário informar um e-mail diferente do atual.</p></div>
                            <button type="submit" disabled={!newCompanyCnpj || !newCompanyEmail || isRequestingNewCompany} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2">{isRequestingNewCompany ? 'Enviando...' : 'Solicitar Acesso'}</button>
                        </form>
                        <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400 font-medium">Área de Perigo</span></div></div>
                        <button onClick={handleExitCompany} disabled={isExitingCompany} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition disabled:opacity-50">{isExitingCompany ? 'Saindo...' : <><Trash2 size={18} /> Sair da Empresa Atual</>}</button>
                        <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 flex items-start gap-2"><AlertTriangle size={16} className="shrink-0 mt-0.5" /><p>Ao sair da empresa, sua conta atual e dados vinculados a ela serão excluídos.</p></div>
                    </div>
                </div>
            )}

            {/* MODAL ALTERAR SENHA (NOVO) */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><KeyRound size={28} /></div>
                            <h3 className="text-xl font-bold text-[#1B2559]">Alterar Senha</h3>
                            <p className="text-sm text-slate-500 mt-2">Para sua segurança, confirme sua senha atual antes de criar a nova.</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Senha Atual</label>
                                <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
                                <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
                                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                            </div>

                            <button type="submit" disabled={!passwords.current || !passwords.new || isSavingPassword} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 mt-2">
                                {isSavingPassword ? 'Salvando...' : 'Confirmar Alteração'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuth(ProfilePage, ['ROLE_COLLABORATOR']);