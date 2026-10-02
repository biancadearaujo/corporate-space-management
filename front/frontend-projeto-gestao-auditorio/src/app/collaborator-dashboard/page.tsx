'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
    CalendarDays,
    Clock,
    Search,
    Bell,
    Trash2,
    Plus,
    CheckCircle2,
    XCircle,
    Clock3,
    Pencil,
    X,
    Menu
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';

// --- HELPER DE DATA ---
function parseApiDate(dateString: string | null | undefined): Date {
    if (!dateString) return new Date(NaN);
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return new Date(dateString + (dateString.includes('Z') ? '' : 'Z'));
    }
    if (!dateString.endsWith('Z') && dateString.includes('T')) {
         return new Date(dateString + 'Z');
    }
    return date;
}

// --- INTERFACES DTO ---
interface AdditionalHoursResponseDTO {
    additionalHoursRequestId: string;
    requestedHours: number;
    justification: string;
    status: string;
    comments?: string;
    createdAt?: string;
}

interface UnifiedSchedulingDTO {
    id: string;
    name: string;
    description: string;
    venueName: string;
    startAt: string;
    endAt: string;
    status: string;
    type: string;
}

interface NotificationDTO {
    id: string;
    title: string;
    message: string;
    type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
    read: boolean;
    time: string;
}

// --- COMPONENTES VISUAIS ---
const StatCard = ({ label, value, subtext, active }: { label: string, value: string | number, subtext?: string, active?: boolean }) => (
    <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 ${
        active 
        ? 'bg-[#003399] text-white border-[#003399]' 
        : 'bg-white text-slate-700 border-slate-100 hover:shadow-md'
    }`}>
        <p className={`text-sm font-medium mb-2 ${active ? 'text-blue-100' : 'text-slate-500'}`}>{label}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        {subtext && <p className={`text-xs mt-2 ${active ? 'text-blue-200/80' : 'text-slate-400'}`}>{subtext}</p>}
    </div>
);

// --- COMPONENTE PRINCIPAL ---
function CollaboratorDashboard() {
    const { user, token, logout } = useAuth();
    const router = useRouter();

    const [myHoursRequests, setMyHoursRequests] = useState<AdditionalHoursResponseDTO[]>([]);
    const [unifiedSchedulings, setUnifiedSchedulings] = useState<UnifiedSchedulingDTO[]>([]);
    const [isLoadingHours, setIsLoadingHours] = useState(true);
    const [isLoadingReservations, setIsLoadingReservations] = useState(true);
    
    const [newRequestHours, setNewRequestHours] = useState('');
    const [newRequestJustification, setNewRequestJustification] = useState('');
    const [isSubmittingHours, setIsSubmittingHours] = useState(false);

    // --- ESTADOS DO MODAL DE EDIÇÃO ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [quota, setQuota] = useState({ used: 0, total: 0 });

    // --- ESTADOS DE ERRO E CONFIRMAÇÃO ---
    const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

    // --- ESTADOS DE NAVEGAÇÃO E BUSCA ---
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- LÓGICA DE NOTIFICAÇÕES ---
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const response = await fetch('/collaborator/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map((n: any) => ({
                    id: n.id, title: n.title, message: n.message, type: n.type, read: n.read,
                    time: new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                }));
                setNotifications(formattedData);
            }
        } catch (error) { console.error(error); }
    };

    const fetchQuota = async () => {
        if (!token) return;
        try {
            const response = await fetch('/collaborator/quota', { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (response.ok) { 
                const data = await response.json(); 
                setQuota({ 
                    used: data?.usedHours || 0, 
                    total: data?.totalHours || 0 
                }); 
            }
        } catch (error) { 
            console.error("Erro ao buscar cota:", error); 
        }
    };

    useEffect(() => {
        fetchHoursRequests();
        fetchUnifiedSchedulings();
        fetchQuota(); // <-- Adicionado aqui
        const interval = setInterval(() => { 
            fetchHoursRequests(); 
            fetchUnifiedSchedulings(); 
            fetchQuota(); // <-- Adicionado aqui
        }, 60000); 
        return () => clearInterval(interval);
    }, [token]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try { await fetch(`/collaborator/notifications/${id}/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } }); } catch (e) {}
    };

    const handleClearNotifications = async () => {
        setNotifications([]);
        setIsNotifOpen(false);
        try { await fetch('/collaborator/notifications', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); } catch (e) {}
    };

    // --- HELPERS VISUAIS ---
    const formatStatus = (status: string) => {
        switch (status) {
            case 'PENDING_MANAGER_REVIEW': return 'Análise: Gestor';
            case 'PENDING_ADMIN_REVIEW': return 'Análise: Admin';
            case 'APPROVED': return 'Aprovado';
            case 'REJECTED': return 'Recusado';
            default: return 'Pendente';
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle2 size={14} />;
            case 'REJECTED': return <XCircle size={14} />;
            default: return <Clock3 size={14} />;
        }
    };

    const formatReservationStatus = (status: string) => {
        switch (status) {
            case 'CONFIRMED': case 'APPROVED': return 'Confirmada';
            case 'PENDING': return 'Pendente';
            case 'REJECTED': return 'Recusada';
            default: return status;
        }
    };

    const getReservationStyles = (status: string) => {
        switch (status) {
            case 'CONFIRMED': case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'REJECTED': return 'bg-red-50 text-red-600 border border-red-200';
            case 'PENDING': default: return 'bg-amber-50 text-amber-600 border border-amber-200';
        }
    };

    const formatReservationDate = (dateString: string) => {
        const date = parseApiDate(dateString);
        if (isNaN(date.getTime())) return 'Data n/d';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const date = parseApiDate(dateString);
        if (isNaN(date.getTime())) return '--:--';
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const canEditReservation = (status: string) => status === 'PENDING';
    const canCancelReservation = (startAt: string) => {
        const eventDate = parseApiDate(startAt);
        const now = new Date();
        const diffInMs = eventDate.getTime() - now.getTime();
        return diffInMs > (48 * 60 * 60 * 1000);
    };

    // --- FETCHES DE DADOS ---
    const fetchHoursRequests = async () => {
        if (!token) return;
        try {
            const response = await fetch('/collaborator/hours-requests', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) { const data = await response.json(); setMyHoursRequests(data.content || []); }
        } catch (error) { } finally { setIsLoadingHours(false); }
    };

    const fetchUnifiedSchedulings = async () => {
        if (!token) return;
        try {
            const response = await fetch('/collaborator/unified-scheduling', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) { const data = await response.json(); setUnifiedSchedulings(data.content || []); }
        } catch (error) { } finally { setIsLoadingReservations(false); }
    };

    const handleSubmitHoursRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRequestHours || !newRequestJustification) return;
        setIsSubmittingHours(true);
        try {
            const response = await fetch('/collaborator/hours-requests', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestedHours: parseFloat(newRequestHours), justification: newRequestJustification })
            });
            if (response.ok) {
                const created = await response.json();
                setMyHoursRequests([created, ...myHoursRequests]);
                setNewRequestHours(''); setNewRequestJustification('');
                toast.success('Solicitação de horas enviada!');
            }
        } catch (error) { toast.error("Erro de conexão."); } finally { setIsSubmittingHours(false); }
    };

    const requestDelete = (id: string) => {
        setConfirmDelete({ isOpen: true, id });
    };

    const executeDelete = async () => {
        const id = confirmDelete.id;
        if (!id) return;
        setConfirmDelete({ isOpen: false, id: null });
        
        const itemToDelete = unifiedSchedulings.find(r => r.id === id);
        if (!itemToDelete) return;
        
        const isPending = itemToDelete.status === 'PENDING';
        const endpoint = isPending ? `/collaborator/scheduling-request/${id}` : `/collaborator/scheduling/${id}`;
        
        try {
            const response = await fetch(endpoint, { 
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
            });
            
            if (response.ok) {
                setUnifiedSchedulings(prev => prev.filter(r => r.id !== id));
                toast.success(isPending ? "Solicitação excluída!" : "Agendamento cancelado!");
            } else {
                const errorMsg = await response.text(); 
                setErrorModal({ isOpen: true, title: 'Não foi possível cancelar', message: errorMsg });
            }
        } catch (e) { setErrorModal({ isOpen: true, title: 'Erro de conexão', message: 'Não foi possível comunicar com o servidor.' }); }
    };

    const handleEditClick = (reservation: UnifiedSchedulingDTO) => {
        setEditingId(reservation.id);
        setEditName(reservation.name);
        const start = parseApiDate(reservation.startAt);
        const end = parseApiDate(reservation.endAt);
        setEditDate(start.toISOString().split('T')[0]);
        setEditStartTime(start.toISOString().substring(11, 16));
        setEditEndTime(end.toISOString().substring(11, 16));
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        setIsSavingEdit(true);
        const startAtISO = `${editDate}T${editStartTime}:00`;
        const endAtISO = `${editDate}T${editEndTime}:00`;
        try {
            const response = await fetch(`/collaborator/scheduling/${editingId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, startAt: startAtISO, endAt: endAtISO })
            });
            if (response.ok) {
                setUnifiedSchedulings(prev => prev.map(item => item.id === editingId ? { ...item, name: editName, startAt: startAtISO, endAt: endAtISO } : item));
                setIsEditModalOpen(false);
                toast.success("Agendamento atualizado com sucesso!");
            } else {
                let backendMessage = await response.text();
                const msgLower = backendMessage.toLowerCase();
                
                if (msgLower.includes('already') || msgLower.includes('overlap')) {
                    setErrorModal({ isOpen: true, title: 'Horário Indisponível', message: 'O novo horário selecionado já está ocupado por outra reserva.' });
                } else if (msgLower.includes('limit exceeded')) {
                    setErrorModal({ isOpen: true, title: 'Limite de Horas', message: 'A sua empresa não tem horas disponíveis suficientes para esta alteração.' });
                } else {
                    setErrorModal({ isOpen: true, title: 'Falha na atualização', message: backendMessage });
                }
            }
        } catch (error) { 
            setErrorModal({ isOpen: true, title: 'Erro', message: 'Falha ao conectar com o servidor.' }); 
        } finally { setIsSavingEdit(false); }
    };

    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/'); 
    };

    useEffect(() => {
        fetchHoursRequests();
        fetchUnifiedSchedulings();
        const interval = setInterval(() => { fetchHoursRequests(); fetchUnifiedSchedulings(); }, 60000); 
        return () => clearInterval(interval);
    }, [token]);

    const approvedHours = myHoursRequests.filter(r => r.status === 'APPROVED').reduce((acc, curr) => acc + (Number(curr.requestedHours) || 0), 0);

    const now = new Date();

    const filteredSchedulings = [...unifiedSchedulings]
        .filter((item) => {
            const endDate = parseApiDate(item.endAt);
            return endDate >= now;
        })
        .sort((a, b) => {
            if (a.status === 'REJECTED' && b.status !== 'REJECTED') return 1;
            if (a.status !== 'REJECTED' && b.status === 'REJECTED') return -1;
            return parseApiDate(a.startAt).getTime() - parseApiDate(b.startAt).getTime();
        })
        .filter((item) => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return item.venueName?.toLowerCase().includes(searchLower) || 
                   item.name?.toLowerCase().includes(searchLower) || 
                   formatReservationStatus(item.status).toLowerCase().includes(searchLower);
        });
    
    const currentMonthHoursRequests = myHoursRequests.filter((req) => {
        if (!req.createdAt) return true; 
        
        const reqDate = new Date(req.createdAt);
        const today = new Date();
        
        return reqDate.getMonth() === today.getMonth() && 
               reqDate.getFullYear() === today.getFullYear();
    });

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            
            {/* --- TOP NAVBAR --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4 md:gap-6">
                    <button className="text-slate-600 hover:text-[#003399] transition-colors xl:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/collaborator-dashboard')}>
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/></svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">brisa</span>
                    </div>
                </div>

                <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                    <div className="w-full bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003399]/20 focus-within:border-[#003399]">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input type="text" placeholder="Buscar reservas ou espaços..." className="bg-transparent border-none outline-none text-slate-700 w-full text-base placeholder-slate-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href="/collaborator-dashboard" className="text-[#003399] transition-colors">Dashboard</Link>
                        <Link href="/calendar" className="hover:text-[#003399] transition-colors">Reservas</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
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
                        <span className="text-[15px] font-medium text-slate-600 hidden md:block">{user?.name?.split(' ')[0] || 'Usuário'}</span>
                        <button onClick={handleLogout} className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors">Sair</button>
                    </div>
                </div>
            </header>

            {/* --- MENU MOBILE --- */}
            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <div className="md:hidden bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input type="text" placeholder="Buscar reservas..." className="bg-transparent border-none outline-none text-slate-700 w-full text-base" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href="/collaborator-dashboard" className="text-[#003399]">Dashboard</Link>
                        <Link href="/calendar" className="hover:text-[#003399]">Reservas</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399]">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Olá, {user?.name?.split(' ')[0] || 'Colaborador'}</h2>
                        <p className="text-slate-500 mt-1 text-sm">Acompanhe suas reservas e solicitações de horas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard 
                            label="Minhas Reservas" 
                            value={unifiedSchedulings.length} 
                            active={true} 
                            subtext="Histórico total" 
                        />
                        <StatCard 
                            label="Próximas Reservas" 
                            value={filteredSchedulings.length} 
                        />
                        <StatCard 
                            label="Consumo do Mês" 
                            value={`${(quota?.total || 0).toFixed(1).replace('.0', '')}h / ${(quota?.used || 0).toFixed(1).replace('.0', '')}h`} 
                            subtext="Da cota mensal da empresa" 
                        />
                        <StatCard 
                            label="Horas Extras Aprovadas" 
                            value={`${(approvedHours || 0).toFixed(1).replace('.0', '')}h`} 
                            subtext="Saldo bônus atual" 
                        />
                    </div>

                    <div className="w-full bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Próximas Reservas</h3>
                            <button onClick={() => router.push('/calendar')} className="flex items-center gap-2 px-5 py-2.5 bg-[#003399] text-white rounded-lg text-sm font-medium hover:bg-[#002266] transition-colors">
                                <Plus size={16} /> Nova Reserva
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                            {isLoadingReservations ? <p className="text-slate-500">Buscando reservas...</p> : filteredSchedulings.length === 0 ? <p className="text-slate-400 text-sm">Nenhuma reserva encontrada.</p> : 
                                filteredSchedulings.map((res) => {
                                    const isEditable = canEditReservation(res.status);
                                    const isCancelable = canCancelReservation(res.startAt);
                                    return (
                                        <div key={res.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow bg-white gap-4">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[#003399] ${['CONFIRMED', 'APPROVED'].includes(res.status) ? 'bg-indigo-50' : 'bg-slate-50 text-slate-400'}`}>
                                                    <CalendarDays size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-base">{res.venueName}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                        <span className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{formatReservationDate(res.startAt)}</span>
                                                        <span>•</span>
                                                        <span>{formatTime(res.startAt)} - {formatTime(res.endAt)}</span>
                                                    </div>
                                                    {res.name && <p className="text-xs text-slate-400 mt-1.5 italic">"{res.name}"</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${getReservationStyles(res.status)}`}>
                                                    {(res.status === 'CONFIRMED' || res.status === 'APPROVED') && <CheckCircle2 size={12} />}
                                                    {res.status === 'REJECTED' && <XCircle size={12} />}
                                                    {res.status === 'PENDING' && <Clock3 size={12} />}
                                                    {formatReservationStatus(res.status)}
                                                </span>
                                                {res.status !== 'REJECTED' && (
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => isEditable && handleEditClick(res)} disabled={!isEditable} className={`p-2 rounded-lg transition ${isEditable ? 'text-slate-400 hover:text-[#003399] hover:bg-indigo-50' : 'text-slate-200 cursor-not-allowed'}`}><Pencil size={18} /></button>
                                                        <button onClick={() => isCancelable && requestDelete(res.id)} disabled={!isCancelable} className={`p-2 rounded-lg transition ${isCancelable ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-200 cursor-not-allowed'}`}><Trash2 size={18} /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100">
                            {/* Título com mb-6 para empurrar a lista para baixo */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Status de Solicitações</h3>
                            </div>
                            
                            {/* Container com o mesmo espaçamento (space-y-4 max-h-[350px]) de Próximas Reservas */}
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                                {isLoadingHours ? (
                                    <p className="text-slate-500 pt-2">Buscando...</p>
                                ) : currentMonthHoursRequests.length === 0 ? (
                                    <p className="text-slate-400 text-sm pt-2">Nenhuma solicitação feita este mês.</p>
                                ) : (
                                    currentMonthHoursRequests.map(req => (
                                        <div key={req.additionalHoursRequestId} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-sm transition-shadow">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#003399] text-lg">{req.requestedHours}h</span>
                                                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Solicitadas</span>
                                                </div>
                                                <p className="text-sm text-slate-500 truncate max-w-[250px] md:max-w-xs mt-1" title={req.justification}>{req.justification}</p>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusStyles(req.status)}`}>
                                                {getStatusIcon(req.status)}<span>{formatStatus(req.status)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Nova Solicitação</h3>
                            <form onSubmit={handleSubmitHoursRequest} className="space-y-4">
                                <div>
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Quantidade de Horas</Label>
                                    <Input type="number" placeholder="Ex: 4" className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-4 h-11 outline-none text-sm transition-all" value={newRequestHours} onChange={(e) => setNewRequestHours(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Justificativa</Label>
                                    <textarea placeholder="Motivo da solicitação..." rows={3} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-4 py-3 outline-none text-sm resize-none transition-all" value={newRequestJustification} onChange={(e) => setNewRequestJustification(e.target.value)} />
                                </div>
                                <Button disabled={isSubmittingHours} className="w-full bg-[#003399] text-white rounded-lg h-11 font-medium hover:bg-[#002266] transition-colors mt-2">{isSubmittingHours ? 'Enviando...' : 'Enviar Pedido'}</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAIS DE AVISOS E CONFIRMAÇÕES --- */}
            
            {/* Modal de Erros */}
            <Dialog open={errorModal.isOpen} onOpenChange={(open) => setErrorModal(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="sm:max-w-[400px] rounded-[24px] p-6 sm:p-8 border-slate-100 shadow-2xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
                        <XCircle className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-800 mb-2">{errorModal.title}</DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm mb-6 leading-relaxed">{errorModal.message}</DialogDescription>
                    <Button onClick={() => setErrorModal(prev => ({ ...prev, isOpen: false }))} className="w-full bg-[#003399] hover:bg-[#002266] text-white font-bold rounded-xl h-12 transition-all shadow-md">
                        Voltar
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog open={confirmDelete.isOpen} onOpenChange={(open) => setConfirmDelete({ isOpen: open, id: null })}>
                <DialogContent className="sm:max-w-[400px] rounded-[24px] p-6 sm:p-8 border-slate-100 shadow-2xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
                        <Trash2 className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-800 mb-2">Cancelar Reserva</DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Tem certeza que deseja cancelar esta reserva? Esta ação não poderá ser desfeita.
                    </DialogDescription>
                    <div className="flex gap-3 w-full">
                        <Button variant="outline" onClick={() => setConfirmDelete({ isOpen: false, id: null })} className="flex-1 rounded-xl h-12 border-slate-200 text-slate-600 font-medium hover:bg-slate-50">Voltar</Button>
                        <Button onClick={executeDelete} className="flex-1 rounded-xl h-12 bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-md">Sim, Cancelar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Edição de Agendamento */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[450px] max-h-[95vh] overflow-y-auto rounded-[20px] border-slate-100 p-0 shadow-2xl flex flex-col">
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 shrink-0">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-slate-800">Editar Reserva</DialogTitle>
                            <DialogDescription className="text-slate-500 mt-1 text-sm">Atualize os detalhes do seu agendamento pendente.</DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleSaveEdit} className="px-6 py-5 flex flex-col gap-4">
                        <div>
                            <Label htmlFor="editName" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Título do Evento</Label>
                            <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700" required />
                        </div>

                        <div>
                            <Label htmlFor="editDate" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Data</Label>
                            <Input id="editDate" type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700" required />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="editStartTime" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Início</Label>
                                <Input id="editStartTime" type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700" required />
                            </div>
                            <div>
                                <Label htmlFor="editEndTime" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Fim</Label>
                                <Input id="editEndTime" type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700" required />
                            </div>
                        </div>

                        <DialogFooter className="mt-4 gap-2 sm:gap-0 shrink-0">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-lg border-slate-200 text-slate-600 font-medium hover:bg-slate-50 h-10 px-5">Cancelar</Button>
                            <Button type="submit" disabled={isSavingEdit} className="rounded-lg bg-[#003399] text-white font-medium hover:bg-[#002266] transition-colors shadow-sm disabled:opacity-70 h-10 px-5">
                                {isSavingEdit ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}

export default withAuth(CollaboratorDashboard, ['ROLE_COLLABORATOR']);