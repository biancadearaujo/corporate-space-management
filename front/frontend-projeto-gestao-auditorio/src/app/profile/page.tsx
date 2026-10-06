'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    MapPin, Edit2, Save, X, Mail, Phone, Building2, Briefcase, 
    ShieldCheck, KeyRound, Building, ArrowRightLeft, Trash2, 
    AlertTriangle, Search, Bell, Menu, User, Clock, CheckCircle2, XCircle, Info, Image as ImageIcon // <-- Importar ImageIcon
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';
import Link from 'next/link';
import Image from 'next/image';

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
    const { user, token, logout, hasRole } = useAuth() as any;
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

    // Campos dos Formulários
    const [newCompanyCnpj, setNewCompanyCnpj] = useState('');
    const [newCompanyEmail, setNewCompanyEmail] = useState('');
    
    // Estado para Troca de Senha
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // --- ESTADOS DE DADOS ---
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: '', company: '', department: '', avatar: '',
    });

    const [stats, setStats] = useState({
        reservationsCount: 0,
        approvedHours: 0
    });

    // Função para obter o prefixo correto do endpoint consoante a Role do utilizador
    const getApiPrefix = () => {
        if (hasRole('ROLE_ADMIN')) return 'http://localhost:8080/admin';
        if (hasRole('ROLE_MANAGER')) return 'http://localhost:8080/manager';
        return 'http://localhost:8080/collaborator';
    };

    // --- ESTADOS DO ALERTA PERSONALIZADO ---
    const [customAlert, setCustomAlert] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'success' as 'success' | 'error' | 'info' | 'confirm',
        onConfirm: null as (() => void) | null
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setCustomAlert({ isOpen: true, title, message, type, onConfirm: null });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setCustomAlert({ isOpen: true, title, message, type: 'confirm', onConfirm });
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

    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) return;

            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const prefix = getApiPrefix();

                // 1. Busca os Dados do Perfil de forma independente
                try {
                    const profileRes = await fetch(`${prefix}/user/me`, { headers });
                    if (profileRes.ok) {
                        const data = await profileRes.json();
                        
                        let empresa = 'Sem Empresa';
                        if (data.companyName) empresa = data.companyName;
                        else if (data.company && data.company.name) empresa = data.company.name;
                        else if (typeof data.company === 'string') empresa = data.company;

                        setFormData({
                            name: data.name || data.username || '',
                            email: data.email || '',
                            phone: formatPhoneNumber(data.phone || data.phoneNumber || ''),
                            role: translateRole(data.role || ''),
                            company: empresa, 
                            department: data.department || '',
                            avatar: data.avatarUrl || data.photoUrl || '' // <-- avatar preenchido
                        });
                    }
                } catch (e) {
                    console.error("Erro ao buscar perfil:", e);
                }
                
                // 2. Busca as Reservas de forma independente
                try {
                    const schedulingRes = await fetch(`${prefix}/unified-scheduling`, { headers });
                    if (schedulingRes.ok) {
                        const data = await schedulingRes.json();
                        const content = data.content || data || [];
                        const approvedReservations = content.filter((r: any) => r.status === 'APPROVED' || r.status === 'CONFIRMED');
                        setStats(prev => ({ ...prev, reservationsCount: approvedReservations.length }));
                    }
                } catch (e) {
                    console.error("Endpoint de reservas não encontrado para este perfil.");
                }

                // 3. Busca as Horas de forma independente
                try {
                    const hoursRes = await fetch(`${prefix}/hours-requests`, { headers });
                    if (hoursRes.ok) {
                        const data = await hoursRes.json();
                        const content = data.content || data || [];
                        const totalHours = content
                            .filter((r: any) => r.status === 'APPROVED')
                            .reduce((acc: number, curr: any) => acc + (Number(curr.requestedHours || curr.hours) || 0), 0);
                        setStats(prev => ({ ...prev, approvedHours: totalHours }));
                    }
                } catch (e) {
                    console.error("Endpoint de horas não encontrado para este perfil.");
                }

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
            const response = await fetch(`${getApiPrefix()}/user/me`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                // <-- Enviar avatar (photoUrl) no payload
                body: JSON.stringify({ 
                    name: formData.name, 
                    phoneNumber: formData.phone,
                    photoUrl: formData.avatar 
                })
            });

            if (response.ok) {
                setIsEditing(false);
                showAlert("Perfil Atualizado", "Os seus dados foram salvos com sucesso!", "success");
            } else {
                const errorData = await response.json(); 
                showAlert("Erro ao Salvar", errorData.message || 'Verifique os dados informados.', "error");
            }
        } catch (error) { 
            console.error(error); 
            showAlert("Erro de Conexão", "Não foi possível conectar ao servidor.", "error"); 
        } finally { 
            setIsLoading(false); 
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.new !== passwords.confirm) {
            showAlert("Senhas Diferentes", "A nova senha e a confirmação não coincidem.", "error");
            return;
        }
        if (passwords.new.length < 6) {
            showAlert("Senha Curta", "A nova senha deve ter pelo menos 6 caracteres.", "error");
            return;
        }

        setIsSavingPassword(true);
        try {
            const response = await fetch('http://localhost:8080/collaborator/user/change-password', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
            });

            if (response.ok) {
                showAlert("Senha Alterada", "A sua senha foi atualizada com sucesso!", "success");
                setIsPasswordModalOpen(false);
                setPasswords({ current: '', new: '', confirm: '' });
            } else {
                const errorText = await response.text(); 
                showAlert("Erro", errorText || "Senha atual incorreta ou erro no servidor.", "error");
            }
        } catch (error) {
            console.error(error);
            showAlert("Erro de Conexão", "Não foi possível conectar ao servidor.", "error");
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleRequestNewCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyCnpj || !newCompanyEmail) return;
        
        setIsRequestingNewCompany(true);
        try {
            const response = await fetch('http://localhost:8080/collaborator/request-new-company', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ cnpj: newCompanyCnpj, newEmail: newCompanyEmail })
            });

            if (response.ok) {
                showAlert(
                    "Solicitação Enviada", 
                    "Quando aprovada pelo Gestor, poderá fazer login utilizando o novo e-mail informado.", 
                    "success"
                );
                setIsCompanyModalOpen(false);
                setNewCompanyCnpj('');
                setNewCompanyEmail('');
            } else {
                const errorText = await response.text();
                showAlert("Erro na Solicitação", errorText, "error");
            }
        } catch (error) { 
            console.error(error); 
            showAlert("Erro de Conexão", "Não foi possível conectar ao servidor.", "error"); 
        } finally { 
            setIsRequestingNewCompany(false); 
        }
    };

    const handleExitCompany = () => {
        showConfirm(
            "Atenção: Ação Irreversível",
            "Ao sair da empresa, a sua conta atual e todos os dados vinculados serão EXCLUÍDOS permanentemente. Deseja mesmo continuar?",
            async () => {
                setIsExitingCompany(true);
                try {
                    const response = await fetch('http://localhost:8080/collaborator/company/exit', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok || response.status === 204) {
                        showAlert("Conta Encerrada", "Você saiu da empresa e a sua conta foi encerrada.", "success");
                        setTimeout(() => handleLogout(), 2500); 
                    } else {
                        const msg = await response.text();
                        showAlert("Erro ao Sair", msg, "error");
                    }
                } catch (error) { 
                    console.error(error); 
                    showAlert("Erro de Conexão", "Não foi possível conectar ao servidor.", "error"); 
                } finally { 
                    setIsExitingCompany(false); 
                }
            }
        );
    };

    // --- 6. RENDERIZAÇÃO ---
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            
            {/* --- TOP NAVBAR PADRONIZADO (Sem barra de pesquisa) --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
                
                {/* Lado Esquerdo: Logo e Menu Mobile */}
                <div className="flex items-center gap-4 md:gap-6">
                    <button className="text-slate-600 hover:text-[#003399] transition-colors xl:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleDashboardClick}>
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/></svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">Órbita</span>
                    </div>
                </div>

                {/* Lado Direito: Navegação e Perfil */}
                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href="#" onClick={(e) => { e.preventDefault(); handleDashboardClick(); }} className="hover:text-[#003399] transition-colors">Dashboard</Link>
                        <Link href="/calendar" className="hover:text-[#003399] transition-colors">Reservas</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="#" className="text-[#003399] font-semibold transition-colors">Perfil</Link>
                    </nav>
                    
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    
                    <div className="flex items-center gap-5">
                        {/* Notificações */}
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
                            {formData.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Usuário'}
                        </span>
                        <button onClick={handleLogout} className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors">
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                    
                    {/* --- HEADER DO PERFIL --- */}
                    {/* Alinhamento ao centro (items-center) para que o Avatar fique perfeitamente alinhado com os cartões mais curtos */}
                    <div className={`grid gap-6 lg:gap-8 mb-6 mt-4 lg:mt-8 items-center ${hasRole('ROLE_ADMIN') ? 'grid-cols-1 justify-items-center' : 'grid-cols-1 md:grid-cols-3'}`}>
                        
                        {/* 1. Avatar e Nome */}
                        <div className="flex flex-col items-center justify-center">
                            {/* A div precisa ter 'relative' e 'overflow-hidden' para o next/image funcionar com 'fill' */}
                            <div className="relative w-28 h-28 rounded-full bg-[#003399] text-white flex items-center justify-center text-5xl font-bold mb-4 shadow-sm overflow-hidden">
                                {isFetching ? (
                                    '...'
                                ) : formData.avatar ? (
                                    <Image 
                                        src={formData.avatar} 
                                        alt={`Foto de ${formData.name}`}
                                        fill
                                        sizes="112px"
                                        className="object-cover"
                                    />
                                ) : (
                                    formData.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 text-center leading-tight">
                                {formData.name || 'Usuário'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-1 text-center">
                                {formData.role || 'Colaborador'}
                            </p>
                        </div>

                        {/* 2 e 3. Minhas Reservas e Horas Totais (Ocultos para Administrador) */}
                        {!hasRole('ROLE_ADMIN') && (
                            <>
                                <div className="p-6 rounded-2xl shadow-sm border transition-all duration-300 bg-[#003399] text-white border-[#003399] w-full">
                                    <p className="text-sm font-medium mb-2 text-blue-100">Minhas Reservas</p>
                                    <h3 className="text-3xl font-bold">{stats.reservationsCount}</h3>
                                    <p className="text-xs mt-2 text-blue-200/80">Histórico total</p>
                                </div>

                                <div className="p-6 rounded-2xl shadow-sm border transition-all duration-300 bg-white text-slate-700 border-slate-100 w-full">
                                    <div className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-500">
                                        <Clock size={16} className="text-[#003399]" />
                                        Horas Totais
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-800">
                                        {stats.approvedHours.toFixed(1).replace('.0', '')}h
                                    </h3>
                                    <p className="text-xs mt-2 text-slate-400">Acumulado</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* --- FORMULÁRIO E CARDS LATERAIS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        
                        {/* --- FORMULÁRIO DE INFORMAÇÕES PESSOAIS --- */}
                        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Informações Pessoais</h3>
                                    <p className="text-sm text-slate-500 mt-1">Mantenha seus dados de contato sempre atualizados.</p>
                                </div>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#003399] border border-[#003399] rounded-xl text-sm font-bold hover:bg-blue-50 transition shadow-sm">
                                        <Edit2 size={16} /> Editar
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition"><X size={16} /> Cancelar</button>
                                        <button onClick={handleSaveProfile} disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 bg-[#003399] text-white rounded-xl text-sm font-bold hover:bg-[#002266] transition shadow-md"><Save size={16} /> {isLoading ? 'Salvando...' : 'Salvar'}</button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                {/* --- NOVO CAMPO: URL DA FOTO --- */}
                                {/* Este campo só aparece quando o utilizador está a editar */}
                                {isEditing && (
                                    <div className="col-span-1 md:col-span-2 space-y-2 mb-2 animate-in fade-in">
                                        <label className="text-[11px] font-bold text-[#003399] uppercase tracking-wider ml-1 flex items-center gap-1.5">
                                            <ImageIcon size={14} /> Foto de Perfil (URL)
                                        </label>
                                        <div className="flex items-center px-4 py-3.5 rounded-xl border border-[#003399] bg-white ring-2 ring-[#003399]/10 transition-all">
                                            <input 
                                                type="url" 
                                                name="avatar" 
                                                value={formData.avatar} 
                                                onChange={handleInputChange} 
                                                placeholder="https://exemplo.com/minha-foto.jpg" 
                                                className="bg-transparent outline-none w-full text-sm text-slate-800 font-medium" 
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400 ml-1 mt-1">Cole o link (URL) da sua imagem. Formatos suportados: JPG, PNG.</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#003399] uppercase tracking-wider ml-1">Nome Completo</label>
                                    <div className={`flex items-center px-4 py-3.5 rounded-xl border transition-all ${isEditing ? 'border-[#003399] bg-white ring-2 ring-[#003399]/10' : 'border-slate-300 bg-white'}`}>
                                        <User size={18} className="text-slate-400 mr-3" />
                                        <input type="text" name="name" disabled={!isEditing} value={formData.name} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-800 font-medium disabled:text-slate-600" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#003399] uppercase tracking-wider ml-1">Email Corporativo</label>
                                    <div className="flex items-center px-4 py-3.5 rounded-xl border border-slate-300 bg-white cursor-not-allowed opacity-80">
                                        <Mail size={18} className="text-slate-400 mr-3" />
                                        <input type="email" disabled value={formData.email} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#003399] uppercase tracking-wider ml-1">Telefone</label>
                                    <div className={`flex items-center px-4 py-3.5 rounded-xl border transition-all ${isEditing ? 'border-[#003399] bg-white ring-2 ring-[#003399]/10' : 'border-slate-300 bg-white'}`}>
                                        <Phone size={18} className="text-slate-400 mr-3" />
                                        <input type="text" name="phone" disabled={!isEditing} value={formData.phone} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-800 font-medium disabled:text-slate-600" placeholder="(xx) xxxxx-xxxx" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#003399] uppercase tracking-wider ml-1">Empresa</label>
                                    <div className="flex items-center px-4 py-3.5 rounded-xl border border-slate-300 bg-white cursor-not-allowed opacity-80">
                                        <Building2 size={18} className="text-slate-400 mr-3" />
                                        <input type="text" disabled value={formData.company} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#003399] uppercase tracking-wider ml-1">Cargo</label>
                                    <div className="flex items-center px-4 py-3.5 rounded-xl border border-slate-300 bg-white cursor-not-allowed opacity-80">
                                        <Briefcase size={18} className="text-slate-400 mr-3" />
                                        <input type="text" disabled value={formData.role} className="bg-transparent outline-none w-full text-sm text-slate-500 font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#003399] uppercase tracking-wider ml-1">Departamento</label>
                                    <div className={`flex items-center px-4 py-3.5 rounded-xl border transition-all ${isEditing ? 'border-[#003399] bg-white ring-2 ring-[#003399]/10' : 'border-slate-300 bg-white'}`}>
                                        <MapPin size={18} className="text-slate-400 mr-3" />
                                        <input type="text" name="department" disabled={!isEditing} value={formData.department} onChange={handleInputChange} className="bg-transparent outline-none w-full text-sm text-slate-800 font-medium disabled:text-slate-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* --- CARDS LATERAIS --- */}
                        <div className="lg:col-span-1 flex flex-col gap-6 lg:gap-8">
                            
                            {/* Card: Vínculo (Oculto para Administrador) */}
                            {!hasRole('ROLE_ADMIN') && (
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-blue-50 rounded-lg text-[#003399]"><Building size={20} /></div>
                                            <h4 className="font-bold text-slate-800 text-lg">Vínculo Corporativo</h4>
                                        </div>
                                        <div className="mb-8 p-4 bg-[#F0F2F5] rounded-xl flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 shadow-sm shrink-0">
                                                {formData.company ? formData.company.charAt(0) : 'E'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Empresa Atual</p>
                                                <p className="text-sm font-bold text-slate-800 uppercase mt-0.5 truncate">{formData.company}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsCompanyModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-[#003399] text-[#003399] rounded-xl text-sm font-bold hover:bg-blue-50 transition shadow-sm mt-auto">
                                        <ArrowRightLeft size={16} /> Gerenciar Vínculo
                                    </button>
                                </div>
                            )}
                            
                            {/* Card: Segurança */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-[#003399]"><ShieldCheck size={20} /></div>
                                        <h4 className="font-bold text-slate-800 text-lg">Segurança</h4>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Mantenha sua conta segura alterando sua senha periodicamente.</p>
                                </div>
                                <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-[#003399] text-[#003399] rounded-xl text-sm font-bold hover:bg-blue-50 transition shadow-sm mt-auto">
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
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsCompanyModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        
                        <div className="text-center mb-6 mt-2">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#003399]"><Building size={32} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">Gerenciar Empresa</h3>
                            <p className="text-sm text-slate-500 mt-2">Cadastre-se noutra organização ou encerre o seu vínculo atual.</p>
                        </div>

                        <form onSubmit={handleRequestNewCompany} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">CNPJ da Nova Empresa</label>
                                <input type="text" placeholder="00.000.000/0001-00" value={newCompanyCnpj} onChange={(e) => setNewCompanyCnpj(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition text-center text-lg font-medium tracking-wide" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">E-mail para nova conta</label>
                                <input type="email" placeholder="novo.email@exemplo.com" value={newCompanyEmail} onChange={(e) => setNewCompanyEmail(e.target.value)} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" />
                                <p className="text-xs text-slate-400 mt-1.5 ml-1 font-medium">Necessário informar um e-mail diferente do atual.</p>
                            </div>
                            <button type="submit" disabled={!newCompanyCnpj || !newCompanyEmail || isRequestingNewCompany} className="w-full py-3.5 rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                                {isRequestingNewCompany ? 'Enviando...' : 'Solicitar Acesso'}
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-wider text-[10px]">Área de Perigo</span></div>
                        </div>

                        <button type="button" onClick={handleExitCompany} disabled={isExitingCompany} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 transition disabled:opacity-50">
                            {isExitingCompany ? 'Processando...' : <><Trash2 size={18} /> Sair da Empresa Atual</>}
                        </button>
                        <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3.5 text-xs text-red-700 flex items-start gap-2 font-medium">
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                            <p>Ao sair da empresa, a sua conta atual e os dados vinculados a ela serão excluídos permanentemente.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL ALTERAR SENHA --- */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 relative">
                        <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        
                        <div className="text-center mb-6 mt-2">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#003399]"><KeyRound size={32} /></div>
                            <h3 className="text-2xl font-bold text-slate-800">Alterar Senha</h3>
                            <p className="text-sm text-slate-500 mt-2">Confirme a sua senha atual antes de criar uma nova.</p>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Senha Atual</label>
                                <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Nova Senha</label>
                                <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">Confirmar Nova Senha</label>
                                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-4 py-3 bg-white rounded-xl border border-slate-300 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 outline-none transition" />
                            </div>

                            <button type="submit" disabled={!passwords.current || !passwords.new || isSavingPassword} className="w-full py-3.5 rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition shadow-md disabled:opacity-50 mt-4">
                                {isSavingPassword ? 'Salvando...' : 'Confirmar Alteração'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- COMPONENTE DE ALERTA PERSONALIZADO --- */}
            {customAlert.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 md:p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="flex justify-center mb-4">
                            {customAlert.type === 'success' && <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 size={32} /></div>}
                            {customAlert.type === 'error' && <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center"><XCircle size={32} /></div>}
                            {customAlert.type === 'info' && <div className="w-16 h-16 bg-blue-50 text-[#003399] rounded-full flex items-center justify-center"><Info size={32} /></div>}
                            {customAlert.type === 'confirm' && <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center"><AlertTriangle size={32} /></div>}
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{customAlert.title}</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed whitespace-pre-line">{customAlert.message}</p>
                        
                        {customAlert.type === 'confirm' ? (
                            <div className="flex gap-3">
                                <button onClick={() => setCustomAlert({ ...customAlert, isOpen: false })} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => {
                                        setCustomAlert({ ...customAlert, isOpen: false });
                                        if (customAlert.onConfirm) customAlert.onConfirm();
                                    }} 
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-md"
                                >
                                    Confirmar
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setCustomAlert({ ...customAlert, isOpen: false })} className={`w-full py-3.5 text-white rounded-xl font-bold transition shadow-md ${customAlert.type === 'error' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-[#003399] hover:bg-[#002266]'}`}>
                                Entendi
                            </button>
                        )}
                    </div>
                </div>
            )}
            
        </div>
    );
}

export default withAuth(ProfilePage, ['ROLE_COLLABORATOR', 'ROLE_MANAGER', 'ROLE_ADMIN']);