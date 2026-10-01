'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    CalendarDays,
    Clock,
    LogOut,
    User,
    Search,
    Bell,
    Trash2,
    MapPin,
    Plus,
    CheckCircle2,
    XCircle,
    Clock3,
    Pencil,
    X 
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';

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

// Interface para Notificações
interface NotificationDTO {
    id: string;
    title: string;
    message: string;
    type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
    read: boolean;
    time: string;
}

// --- COMPONENTES VISUAIS ---
const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            active 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const StatCard = ({ label, value, subtext, active }: { label: string, value: string | number, subtext?: string, active?: boolean }) => (
    <div className={`p-5 rounded-2xl shadow-sm border transition-all ${
        active 
        ? 'bg-blue-600 text-white border-blue-600' 
        : 'bg-white text-slate-700 border-slate-100 hover:shadow-md'
    }`}>
        <p className={`text-sm font-medium mb-1 ${active ? 'text-blue-100' : 'text-slate-500'}`}>{label}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        {subtext && <p className={`text-xs mt-2 ${active ? 'text-blue-200' : 'text-slate-400'}`}>{subtext}</p>}
    </div>
);

// --- COMPONENTE PRINCIPAL ---
function CollaboratorDashboard() {
    const { user, token, logout } = useAuth();
    const router = useRouter();

    // --- ESTADOS GERAIS ---
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

    // --- ESTADOS DE NOTIFICAÇÃO (SININHO) ---
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);

    // --- ESTADOS DA BUSCA ---
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Função que busca Notificações
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

    // 2. POLLING NOTIFICAÇÕES (30s)
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const unreadCount = notifications.filter(n => !n.read).length;

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
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
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
            case 'CONFIRMED': case 'APPROVED': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'REJECTED': return 'bg-red-50 text-red-600 border border-red-200';
            case 'PENDING': default: return 'bg-amber-50 text-amber-600 border border-amber-200';
        }
    };

    // --- HELPER DE DATA CORRIGIDO ---
    
    const formatReservationDate = (dateString: string) => {
        const date = parseApiDate(dateString);
        if (isNaN(date.getTime())) return 'Data n/d';
        
        // REMOVI O 'timeZone: UTC'. Agora ele usa o horário do seu computador (Brasil)
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const formatTime = (dateString: string) => {
        const date = parseApiDate(dateString);
        if (isNaN(date.getTime())) return '--:--';
        
        // REMOVI O 'timeZone: UTC'. Agora 12:00 UTC vira 09:00 BRT automaticamente
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // --- REGRAS DE NEGÓCIO ---
    const canEditReservation = (status: string) => status === 'PENDING';
    
    const canCancelReservation = (startAt: string) => {
        const eventDate = parseApiDate(startAt);
        const now = new Date();
        const diffInMs = eventDate.getTime() - now.getTime();
        const hours48InMs = 48 * 60 * 60 * 1000;
        return diffInMs > hours48InMs;
    };

    // --- FETCHES DE DADOS ---
    const fetchHoursRequests = async () => {
        if (!token) return;
        // setIsLoadingHours(true); // Comentado para não piscar a tela no polling
        try {
            const response = await fetch('/collaborator/hours-requests', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) { const data = await response.json(); setMyHoursRequests(data.content || []); }
        } catch (error) { console.error(error); } finally { setIsLoadingHours(false); }
    };

    const fetchUnifiedSchedulings = async () => {
        if (!token) return;
        // setIsLoadingReservations(true); // Comentado para não piscar a tela no polling
        try {
            const response = await fetch('/collaborator/unified-scheduling', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) { const data = await response.json(); setUnifiedSchedulings(data.content || []); }
        } catch (error) { console.error(error); } finally { setIsLoadingReservations(false); }
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
            }
        } catch (error) { console.error(error); } finally { setIsSubmittingHours(false); }
    };

    const handleDeleteReservation = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este item?")) return;
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
                alert(isPending ? "Solicitação excluída!" : "Agendamento cancelado!");
            } else {
                const errorMsg = await response.text(); 
                alert(`Não foi possível excluir: ${errorMsg}`);
            }
        } catch (e) { console.error(e); alert("Erro de conexão."); }
    };

    // --- LÓGICA DE EDIÇÃO ---
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
                alert("Agendamento atualizado com sucesso!");
            } else {
                const errorText = await response.text();
                alert(`Erro ao atualizar: ${errorText}`);
            }
        } catch (error) { console.error(error); alert("Erro ao conectar."); } finally { setIsSavingEdit(false); }
    };

    const handleLogout = () => {
    // Chama a função logout do contexto (que limpa o localStorage e os estados)
    if (logout) {
        logout();
    } else {
        // Fallback de segurança caso a função não seja importada
        localStorage.removeItem('token');
    }
    
    // Usa o replace em vez de push para impedir a volta pela seta do navegador
    router.replace('/'); 
};

    // --- POLLING DE DADOS (AQUI ESTÁ A MUDANÇA) ---
    useEffect(() => {
        // 1. Busca inicial
        fetchHoursRequests();
        fetchUnifiedSchedulings();

        // 2. Configura o intervalo para 60 segundos (1 minuto)
        const interval = setInterval(() => {
            fetchHoursRequests();
            fetchUnifiedSchedulings();
        }, 60000); 

        // 3. Limpa ao sair
        return () => clearInterval(interval);
    }, [token]);

    const approvedHours = myHoursRequests.filter(r => r.status === 'APPROVED').reduce((acc, curr) => acc + (Number(curr.requestedHours) || 0), 0);

    const sortedSchedulings = [...unifiedSchedulings].sort((a, b) => {
        if (a.status === 'REJECTED' && b.status !== 'REJECTED') return 1;
        if (a.status !== 'REJECTED' && b.status === 'REJECTED') return -1;
        return parseApiDate(a.startAt).getTime() - parseApiDate(b.startAt).getTime();
    });

    // --- ORDENAÇÃO E FILTRO ---
    const filteredSchedulings = [...unifiedSchedulings]
        .sort((a, b) => {
            // Mantém a ordenação que fizemos antes
            if (a.status === 'REJECTED' && b.status !== 'REJECTED') return 1;
            if (a.status !== 'REJECTED' && b.status === 'REJECTED') return -1;
            return parseApiDate(a.startAt).getTime() - parseApiDate(b.startAt).getTime();
        })
        .filter((item) => {
            // Se a busca estiver vazia, retorna tudo
            if (!searchTerm) return true;
            
            const searchLower = searchTerm.toLowerCase();
            
            // Busca pelo Nome do Espaço (venueName)
            const matchesVenue = item.venueName?.toLowerCase().includes(searchLower);
            
            // Busca pelo Nome do Agendamento (name) - se existir
            const matchesName = item.name?.toLowerCase().includes(searchLower);
            
            // Busca pelo Status (ex: "pendente") - Opcional
            const matchesStatus = formatReservationStatus(item.status).toLowerCase().includes(searchLower);

            return matchesVenue || matchesName || matchesStatus;
        });

    return (
        <div className="flex h-screen bg-[#F4F7FE] font-sans text-slate-800 overflow-hidden relative">
            {/* SIDEBAR - MANTIDO IGUAL */}
            <aside className="w-64 bg-[#111C44] flex-shrink-0 flex flex-col py-6 px-4 text-white">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">M</div>
                    <span className="text-xl font-bold tracking-wide">SPACE MASTER</span>
                </div>
                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active onClick={() => router.push('/collaborator-dashboard')} />
                    <SidebarItem icon={CalendarDays} label="Reservas" onClick={() => router.push('/calendar')} />
                    <SidebarItem icon={MapPin} label="Espaços" onClick={() => router.push('/our-spaces')} />
                    <SidebarItem icon={Clock} label="Horas Extras" onClick={() => {}} />
                    <SidebarItem icon={User} label="Perfil" onClick={() => router.push('/profile')} />
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-700">
                    <SidebarItem icon={LogOut} label="Sair" onClick={handleLogout} />
                </div>
            </aside>

            {/* MAIN - MANTIDO IGUAL */}
            <main className="flex-1 flex flex-col overflow-hidden relative z-0">
                <header className="h-20 bg-[#F4F7FE] flex items-center justify-between px-8 pt-4 relative z-20">
                    <div>
                        <p className="text-sm text-slate-500">Páginas / Dashboard</p>
                        <h2 className="text-2xl font-bold text-[#1B2559]">Colaborador</h2>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm px-4">
                        <div className="relative bg-[#F4F7FE] rounded-full px-3 py-2 flex items-center gap-2">
                            <Search size={16} className="text-slate-500" />
                            <input 
                                placeholder="Buscar espaço ou evento..." 
                                className="bg-transparent border-none text-sm outline-none w-48 placeholder-slate-500" // Aumentei um pouco a largura (w-48)
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        {/* SININHO - Lógica já estava certa */}
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

                        <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard label="Minhas Reservas" value={unifiedSchedulings.length} active={true} subtext="Histórico total" />
                        <StatCard label="Próximas Reservas" value={unifiedSchedulings.filter(r => { const d = parseApiDate(r.startAt); return d >= new Date() && r.status !== 'REJECTED'; }).length} />
                        <StatCard label="Horas Aprovadas" value={`${approvedHours.toFixed(1).replace('.0', '')}h`} subtext="Total acumulado" />
                        <StatCard label="Solicitações Totais" value={myHoursRequests.length} subtext="Histórico de pedidos" />
                    </div>

                    <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-[#1B2559]">Minhas Próximas Reservas</h3>
                            <button onClick={() => router.push('/calendar')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                                <Plus size={16} /> Nova Reserva
                            </button>
                        </div>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                            {isLoadingReservations ? <p>Carregando...</p> : filteredSchedulings.length === 0 ? <p className="text-slate-400 text-sm">Sem reservas encontradas.</p> : 
                                filteredSchedulings.map((res) => {
                                    const isEditable = canEditReservation(res.status);
                                    const isCancelable = canCancelReservation(res.startAt);
                                    return (
                                        <div key={res.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow bg-white gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 ${['CONFIRMED', 'APPROVED'].includes(res.status) ? 'bg-blue-50' : 'bg-gray-50 text-gray-400'}`}>
                                                    <CalendarDays size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#1B2559] text-base">{res.venueName}</h4>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{formatReservationDate(res.startAt)}</span>
                                                        <span>•</span>
                                                        <span>{formatTime(res.startAt)} - {formatTime(res.endAt)}</span>
                                                    </div>
                                                    {res.name && <p className="text-xs text-slate-400 mt-1 italic">"{res.name}"</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${getReservationStyles(res.status)}`}>
                                                    {(res.status === 'CONFIRMED' || res.status === 'APPROVED') && <CheckCircle2 size={12} />}
                                                    {res.status === 'REJECTED' && <XCircle size={12} />}
                                                    {res.status === 'PENDING' && <Clock3 size={12} />}
                                                    {formatReservationStatus(res.status)}
                                                </span>
                                                {res.status !== 'REJECTED' && (
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => isEditable && handleEditClick(res)} disabled={!isEditable} title={isEditable ? "Editar Reserva" : "Não é possível editar após aprovação"} className={`p-2 rounded-lg transition ${isEditable ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-200 cursor-not-allowed'}`}><Pencil size={18} /></button>
                                                        <button onClick={() => isCancelable && handleDeleteReservation(res.id)} disabled={!isCancelable} title={isCancelable ? "Cancelar Reserva" : "Cancelamento permitido apenas com 48h de antecedência"} className={`p-2 rounded-lg transition ${isCancelable ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-200 cursor-not-allowed'}`}><Trash2 size={18} /></button>
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
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                             <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-[#1B2559]">Status de Solicitações</h3></div>
                             <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                {isLoadingHours ? <p>Carregando...</p> : myHoursRequests.length === 0 ? <p className="text-slate-400 text-sm">Nenhuma solicitação.</p> :
                                myHoursRequests.map(req => (
                                    <div key={req.additionalHoursRequestId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2"><span className="font-bold text-[#1B2559] text-lg">{req.requestedHours}h</span><span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Solicitadas</span></div>
                                            <p className="text-sm text-slate-500 truncate max-w-[250px] md:max-w-xs" title={req.justification}>{req.justification}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusStyles(req.status)}`}>{getStatusIcon(req.status)}<span>{formatStatus(req.status)}</span></div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-[#1B2559] mb-2">Nova Solicitação</h3>
                            <form onSubmit={handleSubmitHoursRequest} className="space-y-3">
                                <input type="number" placeholder="Qtd. Horas" className="w-full bg-[#F4F7FE] rounded-xl px-4 py-3 outline-none text-sm" value={newRequestHours} onChange={(e) => setNewRequestHours(e.target.value)} />
                                <textarea placeholder="Justificativa..." rows={3} className="w-full bg-[#F4F7FE] rounded-xl px-4 py-3 outline-none text-sm resize-none" value={newRequestJustification} onChange={(e) => setNewRequestJustification(e.target.value)} />
                                <button disabled={isSubmittingHours} className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 transition">{isSubmittingHours ? 'Enviando...' : 'Enviar'}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* --- MODAL DE EDIÇÃO --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-[#1B2559]">Editar Agendamento</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-slate-400 transition"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Evento</label>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-slate-600" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
                                    <input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-slate-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
                                    <input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-slate-600" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition">Cancelar</button>
                                <button type="submit" disabled={isSavingEdit} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">{isSavingEdit ? 'Salvando...' : 'Salvar Alterações'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuth(CollaboratorDashboard, ['ROLE_COLLABORATOR']);