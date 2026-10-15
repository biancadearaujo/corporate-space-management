'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Menu, Search, Bell, CalendarCheck, Users, MapPin, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { withAuth } from '@/components/withAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SchedulingResponseDTO {
    schedulingId: string;
    name: string;
    startAt: string;
    endAt: string;
    venueId: string;
    venueName?: string;
    venue?: { name: string };
    spaceName?: string;
    requesterName?: string;
    createdBy?: string;
}

interface UserResponseDTO {
    id?: string;
    userId?: string;
    username: string;
    name?: string;
    email: string;
    role?: string;
}

function parseApiDate(dateString: string | null | undefined): Date {
    if (!dateString) return new Date(NaN);
    return new Date(dateString.replace(' ', 'T'));
}

const formatDate = (dateString: string) => {
    const date = parseApiDate(dateString);
    return isNaN(date.getTime()) ? '--/--' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (dateString: string) => {
    const date = parseApiDate(dateString);
    return isNaN(date.getTime()) ? '--:--' : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

function MyTeamPage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState<'bookings' | 'users'>('bookings');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dbUserName, setDbUserName] = useState<string>('');
    
    // --- ESTADOS DE PAGINAÇÃO ---
    const [bookingsPage, setBookingsPage] = useState(0);
    const [bookingsTotalPages, setBookingsTotalPages] = useState(1);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    
    const [usersPage, setUsersPage] = useState(0);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    const [approvedBookings, setApprovedBookings] = useState<SchedulingResponseDTO[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<UserResponseDTO[]>([]);
    const [venuesMap, setVenuesMap] = useState<Record<string, string>>({});

    const fetchUserProfile = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/manager/user/me', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) { const data = await response.json(); if (data.name || data.username) setDbUserName(data.name || data.username); }
        } catch (error) { console.error(error); }
    };

    const fetchVenues = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/venues', { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                const vMap: Record<string, string> = {};
                const venuesList = data.content || data;
                if (Array.isArray(venuesList)) venuesList.forEach((v: any) => { if (v.venueId && v.name) vMap[v.venueId] = v.name; });
                setVenuesMap(vMap);
            }
        } catch (error) { console.error("Erro ao buscar espaços", error); }
    };

    // --- FETCH DE AGENDAMENTOS (PAGINADO) ---
    const fetchBookings = useCallback(async () => {
        if (!token) return;
        setIsLoadingBookings(true);
        try {
            const res = await fetch(`http://localhost:8080/manager/scheduling?page=${bookingsPage}&size=10`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (res.ok) {
                const data = await res.json();
                setApprovedBookings(data.content || []);
                setBookingsTotalPages(data.totalPages || 1);
            }
        } catch (err) {
            console.error("Falha ao carregar agendamentos:", err);
        } finally {
            setIsLoadingBookings(false);
        }
    }, [token, bookingsPage]);

    // --- FETCH DE USUÁRIOS (PAGINADO) ---
    const fetchUsers = useCallback(async () => {
        if (!token) return;
        setIsLoadingUsers(true);
        try {
            const res = await fetch(`http://localhost:8080/manager/users?page=${usersPage}&size=10`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (res.ok) {
                const data = await res.json();
                setApprovedUsers(data.content || []);
                setUsersTotalPages(data.totalPages || 1);
            }
        } catch (err) {
            console.error("Falha ao carregar usuários:", err);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [token, usersPage]);

    useEffect(() => {
        if (!token) return;
        fetchUserProfile();
        fetchVenues(); 
    }, [token]);

    // Dispara a busca sempre que a página respectiva mudar
    useEffect(() => { fetchBookings(); }, [fetchBookings]);
    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/login'); 
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
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
                        <Link href="/manager-dashboard" className="hover:text-[#003399] transition-colors">Painel Geral</Link>
                        <Link href="/calendar" className="hover:text-[#003399] transition-colors">Agendar</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="/my-team" className="text-[#003399] font-semibold transition-colors">Minha Equipe</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                        <Link href="/about-us" className="hover:text-[#003399] font-semibold transition-colors">Sobre</Link>
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

            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href="/manager-dashboard" className="hover:text-[#003399]">Painel Geral</Link>
                        <Link href="/calendar" className="hover:text-[#003399]">Agendar</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399]">Espaços</Link>
                        <Link href="/my-team" className="text-[#003399] font-semibold">Minha Equipe</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                    
                    <div className="mb-2">
                        <Link href="/manager-dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#003399] font-semibold text-sm transition-colors mb-4">
                            <ChevronLeft size={16} /> Voltar ao Painel
                        </Link>
                    </div>

                    <div className="w-full relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#EAE6F5] to-[#FDFBF7] p-10 md:p-12 shadow-sm border border-white flex items-center justify-between">
                        <div className="max-w-2xl relative z-10">
                            <div className="inline-flex items-center px-4 py-1.5 bg-white/60 backdrop-blur-sm text-[#6C5B7B] rounded-full text-xs font-bold mb-6 tracking-wide shadow-sm">
                                ✨ Gestão de Equipe
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-[#355C7D] mb-4 leading-tight">
                                Acompanhe sua <br/>
                                <span className="text-[#C06C84]">operação.</span>
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
                                Visualize rapidamente os agendamentos confirmados e todos os colaboradores ativos vinculados à sua empresa.
                            </p>
                        </div>
                        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-white/40 to-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    </div>

                    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mt-8">
                        <div className="flex border-b border-slate-100 p-2 gap-2 bg-[#F0F2F5]/50 flex-wrap md:flex-nowrap">
                            <button onClick={() => setActiveTab('bookings')} className={`flex-1 min-w-[120px] py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'bookings' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                                <CalendarCheck size={18} /> Reuniões Agendadas
                            </button>
                            <button onClick={() => setActiveTab('users')} className={`flex-1 min-w-[120px] py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                                <Users size={18} /> Membros da Equipe
                            </button>
                        </div>

                        <div className="p-6 md:p-8 min-h-[400px]">
                            
                            {/* ABA: AGENDAMENTOS CONFIRMADOS */}
                            {activeTab === 'bookings' && (
                                <>
                                    {isLoadingBookings ? (
                                        <div className="flex flex-col justify-center items-center h-40 text-slate-400 font-medium">Buscando agendamentos...</div>
                                    ) : approvedBookings.length === 0 ? (
                                        <p className="text-center text-slate-400 py-10 font-medium">Sua empresa não possui agendamentos marcados.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {approvedBookings.map((req, index) => {
                                                const resolvedVenueName = req.venueName || req.venue?.name || req.spaceName || venuesMap[req.venueId] || 'Espaço não informado';
                                                const author = req.requesterName || req.createdBy || 'Sistema';
                                                return (
                                                <div key={req.schedulingId || index} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#003399] flex items-center justify-center shrink-0"><MapPin size={24}/></div>
                                                        <div>
                                                            <h4 className="text-slate-800 text-base">
                                                                {req.name ? (
                                                                    <>
                                                                        <span className="font-bold">{req.name}</span>
                                                                        <span className="font-normal text-slate-600"> 
                                                                            {' '}- {resolvedVenueName}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="font-normal text-slate-600">
                                                                        {resolvedVenueName}
                                                                    </span>
                                                                )}
                                                            </h4>
                                                            <div className="flex items-center text-sm text-slate-500 mt-1 font-medium">
                                                                <span>{formatDate(req.startAt)}</span>
                                                                <span className="ml-1.5">{formatTime(req.startAt)} - {formatTime(req.endAt)}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-400 mt-1.5 italic">Por: {author}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                        <span className="flex justify-center items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm">
                                                            <CheckCircle2 size={16}/> Confirmado
                                                        </span>
                                                    </div>
                                                </div>
                                            )})}
                                        </div>
                                    )}

                                    {/* Paginação de Agendamentos */}
                                    {!isLoadingBookings && bookingsTotalPages > 1 && (
                                        <div className="w-full flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
                                            <Button 
                                                variant="outline"
                                                onClick={() => setBookingsPage(prev => Math.max(0, prev - 1))}
                                                disabled={bookingsPage === 0}
                                                className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
                                            >
                                                Anterior
                                            </Button>
                                            <span className="text-sm font-bold text-[#003399] bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
                                                Página {bookingsPage + 1} de {bookingsTotalPages}
                                            </span>
                                            <Button 
                                                variant="outline"
                                                onClick={() => setBookingsPage(prev => Math.min(bookingsTotalPages - 1, prev + 1))}
                                                disabled={bookingsPage === bookingsTotalPages - 1}
                                                className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
                                            >
                                                Próxima
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* ABA: COLABORADORES ATIVOS */}
                            {activeTab === 'users' && (
                                <>
                                    {isLoadingUsers ? (
                                        <div className="flex flex-col justify-center items-center h-40 text-slate-400 font-medium">Buscando colaboradores...</div>
                                    ) : approvedUsers.length === 0 ? (
                                        <p className="text-center text-slate-400 py-10 font-medium">Você não possui colaboradores ativos na equipe.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {approvedUsers.map((req, index) => (
                                                <div key={req.id || req.userId || index} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-[#F0F2F5] text-slate-500 flex items-center justify-center shrink-0"><Users size={24}/></div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-base">{req.username || req.name}</h4>
                                                            <p className="text-sm text-slate-500 mt-1 font-medium">{req.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                        <span className="flex justify-center items-center gap-1.5 px-4 py-2 bg-blue-50 text-[#003399] rounded-lg font-bold text-sm">
                                                            Membro Ativo
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Paginação de Usuários */}
                                    {!isLoadingUsers && usersTotalPages > 1 && (
                                        <div className="w-full flex justify-center items-center gap-4 mt-8 pt-4 border-t border-slate-100">
                                            <Button 
                                                variant="outline"
                                                onClick={() => setUsersPage(prev => Math.max(0, prev - 1))}
                                                disabled={usersPage === 0}
                                                className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
                                            >
                                                Anterior
                                            </Button>
                                            <span className="text-sm font-bold text-[#003399] bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100">
                                                Página {usersPage + 1} de {usersTotalPages}
                                            </span>
                                            <Button 
                                                variant="outline"
                                                onClick={() => setUsersPage(prev => Math.min(usersTotalPages - 1, prev + 1))}
                                                disabled={usersPage === usersTotalPages - 1}
                                                className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl px-6"
                                            >
                                                Próxima
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuth(MyTeamPage, ['ROLE_MANAGER']);