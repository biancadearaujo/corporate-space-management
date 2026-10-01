'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Bell,
    Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppointmentModal from './appointment-modal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Venue, VenueApiResponse } from '@/interfaces';
import Link from 'next/link';

// --- CORREÇÃO DE HORA (Sem o 'Z' para o JS não alterar o fuso) ---
function parseApiDate(dateString: string | null | undefined): Date {
    if (!dateString) return new Date(NaN);
    
    const cleanString = dateString.split('.')[0].replace('Z', '').replace(/\+.*$/, '');
    
    const parts = cleanString.split(/[T ]/); // Separa a data da hora
    
    if (parts.length === 2) {
        const [year, month, day] = parts[0].split('-').map(Number);
        const [hour, minute, second] = parts[1].split(':').map(Number);
        
        return new Date(year, month - 1, day, hour, minute, second || 0);
    }
    
    return new Date(dateString);
}

interface Appointment {
    schedulingId: string;
    name: string;
    description: string;
    startAt: string;
    endAt: string;
    createdAt: string;
    createdBy: string;
    companyId: string;
    venueId: string;
    cnpj?: string;
    equipmentsId: string[] | null;
    updateAt: string | null;
}

interface ApiPageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
}

const DayAppointmentsModal = ({ isOpen, onClose, date, appointments, venues }: any) => {
    if (!isOpen || !date) return null;
    const getVenueName = (venueId: string) => venues.find((v: any) => v.venueId === venueId)?.name || 'Espaço desconhecido';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-[24px] p-6 border-slate-100 shadow-2xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-slate-800 text-xl font-bold">
                        Agenda de {date.toLocaleDateString('pt-BR')}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {appointments.length > 0 ? (
                        appointments
                            .sort((a: any, b: any) => parseApiDate(a.startAt).getTime() - parseApiDate(b.startAt).getTime())
                            .map((appt: any) => (
                                <div key={appt.schedulingId} className="p-4 bg-slate-50 rounded-2xl border-l-4 border-[#003399] hover:bg-slate-100 transition-colors">
                                    <p className="font-bold text-slate-800 text-[15px]">{appt.name}</p>
                                    <p className="text-sm text-slate-500 font-medium mt-1">
                                        {parseApiDate(appt.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {parseApiDate(appt.endAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-2 font-medium bg-white px-2 py-1 inline-block rounded-md border border-slate-200">
                                        Espaço: {getVenueName(appt.venueId)}
                                    </p>
                                </div>
                            ))
                    ) : (
                        <p className="text-slate-400 text-center py-6 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            Nenhum agendamento para este dia.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function AppointmentCalendar() {
    const { user, hasRole, token, logout } = useAuth();
    const router = useRouter(); 
    
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth());
    const [year, setYear] = useState(currentDate.getFullYear());
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [view, setView] = useState('week');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [loadingAvailableTimes, setLoadingAvailableTimes] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [allCompanies, setAllCompanies] = useState<{ id: string; cnpj: string }[]>([]);
    const [companyFilter, setCompanyFilter] = useState<string>('all');
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [dayModalDate, setDayModalDate] = useState<Date | null>(null);

    const userRoleNormalized: 'COLLABORATOR' | 'MANAGER' | 'ADMIN' | null = 
        hasRole('ROLE_ADMIN') ? 'ADMIN' : 
        hasRole('ROLE_MANAGER') ? 'MANAGER' : 
        hasRole('ROLE_COLLABORATOR') ? 'COLLABORATOR' : null;

    useEffect(() => {
        if ((view === 'week' || view === 'day') && scrollContainerRef.current) {
            const timeoutId = setTimeout(() => {
                if (scrollContainerRef.current) {
                    const currentHour = new Date().getHours();
                    const targetHour = Math.max(0, currentHour - 1);
                    const targetId = `scroll-to-hour-${String(targetHour).padStart(2, '0')}`;
                    const targetElement = scrollContainerRef.current.querySelector(`#${targetId}`);
                    
                    if (targetElement) {
                        // Desconta 65px da altura do cabeçalho para a hora não ficar escondida
                        scrollContainerRef.current.scrollTop = (targetElement as HTMLElement).offsetTop - 65;
                    }
                }
            }, 100); 
            return () => clearTimeout(timeoutId);
        }
    }, [view, selectedDate]);

    useEffect(() => {
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        else delete axios.defaults.headers.common['Authorization'];
    }, [token]);

    const fetchAppointments = useCallback(async () => {
        if (!user || !token) return setAppointments([]);
        const isAdmin = hasRole('ROLE_ADMIN');
        const isManager = hasRole('ROLE_MANAGER');
        const isCollaborator = hasRole('ROLE_COLLABORATOR');

        let endpoint = '';
        if (isAdmin) endpoint = 'http://localhost:8080/admin/scheduling';
        else if (isManager) endpoint = 'http://localhost:8080/manager/scheduling';
        else if (isCollaborator) endpoint = 'http://localhost:8080/collaborator/scheduling';
        else return;

        try {
            const response = await axios.get<ApiPageResponse<Appointment>>(endpoint);
            const fetchedAppointments = response.data?.content || [];
            setAppointments(fetchedAppointments);

            if (isAdmin) {
                const companies = fetchedAppointments.reduce((acc, curr) => {
                    if (curr.companyId && !acc.some((c) => c.id === curr.companyId)) {
                        acc.push({ id: curr.companyId, cnpj: curr.cnpj || 'CNPJ não informado' });
                    }
                    return acc;
                }, [] as { id: string; cnpj: string }[]);
                setAllCompanies(companies);
            }
        } catch (error) {
            toast.error('Não foi possível carregar os agendamentos.');
            setAppointments([]);
        }
    }, [user, token, hasRole]);

    useEffect(() => {
        const fetchVenues = async () => {
            if (!token) return;
            try {
                const response = await axios.get<VenueApiResponse>('http://localhost:8080/venue');
                setVenues(response.data?.content || []);
            } catch (error) {
                toast.error('Erro ao carregar a lista de espaços.');
            }
        };
        fetchVenues();
    }, [token]);

    useEffect(() => {
        if (user) fetchAppointments();
    }, [user, fetchAppointments]);

    const fetchAvailableTimes = useCallback(
        async (venueId: string, subVenueId: string | null, date: Date) => {
            setLoadingAvailableTimes(true);
            setAvailableTimes([]);
            const selectedVenue = venues.find((v) => v.venueId === venueId);
            if (!selectedVenue) {
                toast.error('Espaço não encontrado.');
                setLoadingAvailableTimes(false);
                return;
            }
            if (selectedVenue.venueType === 'AUDITORIUM') {
                setLoadingAvailableTimes(false);
                return;
            }
            try {
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                let effectiveOpeningTime = selectedVenue.openingTime || '00:00:00';
                let effectiveClosingTime = selectedVenue.closingTime || '23:59:59';
                if (selectedVenue.divisible && subVenueId) {
                    const selectedSubVenue = selectedVenue.subVenues?.find((sv) => sv.id === subVenueId);
                    if (selectedSubVenue) {
                        effectiveOpeningTime = selectedSubVenue.openingTime;
                        effectiveClosingTime = selectedSubVenue.closingTime;
                    }
                }
                const daySpecificHours = selectedVenue.openingHours?.find((oh) => oh.dayOfWeek === dayOfWeek);
                if (daySpecificHours) {
                    effectiveOpeningTime = daySpecificHours.openingTime;
                    effectiveClosingTime = daySpecificHours.closingTime;
                }
                const times = [];
                const [openH, openM] = effectiveOpeningTime.split(':').map(Number);
                const [closeH, closeM] = effectiveClosingTime.split(':').map(Number);
                let currentHour = openH;
                let currentMinute = openM;
                const now = new Date();
                const isTodaySelected = date.toDateString() === now.toDateString();
                while (currentHour < closeH || (currentHour === closeH && currentMinute < closeM)) {
                    const slotDateTime = new Date(date);
                    slotDateTime.setHours(currentHour, currentMinute, 0, 0);
                    if (isTodaySelected && slotDateTime.getTime() <= now.getTime()) {
                        currentMinute += 30;
                        if (currentMinute >= 60) { currentHour += 1; currentMinute -= 60; }
                        continue;
                    }
                    const timeSlotStart = slotDateTime.getTime();
                    const timeSlotEnd = new Date(slotDateTime.getTime() + 30 * 60000).getTime();
                    
                    const isBooked = appointments.some((appointment) => {
                        const existingStart = parseApiDate(appointment.startAt).getTime();
                        const existingEnd = parseApiDate(appointment.endAt).getTime();
                        return (timeSlotStart < existingEnd && timeSlotEnd > existingStart);
                    });

                    if (!isBooked) times.push(`${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
                    
                    currentMinute += 30;
                    if (currentMinute >= 60) { currentHour += 1; currentMinute -= 60; }
                }
                setAvailableTimes(times);
            } catch (error) {
                toast.error('Erro ao carregar horários disponíveis.');
            } finally {
                setLoadingAvailableTimes(false);
            }
        },
        [venues, appointments],
    );

    const companyColors = ['bg-[#003399]', 'bg-[#00B4D8]', 'bg-[#F28C28]', 'bg-[#2A9D8F]', 'bg-[#9D4EDD]', 'bg-[#E63946]'];
    const getCompanyColor = (companyId: string) => {
        if (!companyId) return 'bg-slate-400';
        const hash = companyId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        return companyColors[Math.abs(hash % companyColors.length)];
    };

    const filteredAppointments = hasRole('ROLE_ADMIN') && companyFilter !== 'all'
        ? appointments.filter((appt) => appt.companyId === companyFilter)
        : appointments;

    const getAppointmentsForDate = (date: Date): Appointment[] => {
        return filteredAppointments.filter((appointment) => {
            const apptDate = parseApiDate(appointment.startAt);
            return (
                apptDate.getDate() === date.getDate() &&
                apptDate.getMonth() === date.getMonth() &&
                apptDate.getFullYear() === date.getFullYear()
            );
        });
    };

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(month, year);
        const firstDay = getFirstDayOfMonth(month, year);
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };
    
    const getMonthName = (month: number) => new Date(year, month).toLocaleString('pt-BR', { month: 'long' });
    const previousMonth = () => { const newDate = new Date(year, month - 1, 1); setMonth(newDate.getMonth()); setYear(newDate.getFullYear()); };
    const nextMonth = () => { const newDate = new Date(year, month + 1, 1); setMonth(newDate.getMonth()); setYear(newDate.getFullYear()); };
    
    const getWeekDays = () => {
        const date = new Date(selectedDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diff));
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            weekDays.push(nextDay);
        }
        return weekDays;
    };

    const timeSlots = Array.from({ length: 24 * 2 }, (_, i) => {
        const totalMinutes = i * 30;
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    });

    const formatDateHeader = (date: Date) => date.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' });
    const getDayName = (date: Date) => date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
    const isToday = (date: Date) => new Date().toDateString() === date.toDateString();
    const isSelected = (date: Date) => selectedDate.toDateString() === date.toDateString();
    const handleDateSelect = (date: Date | null) => { if (date) setSelectedDate(date); };
    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setMonth(today.getMonth());
        setYear(today.getFullYear());
    };
    const handleDayHeaderClick = (date: Date) => {
        setDayModalDate(date);
        setIsDayModalOpen(true);
    };

    const handleDashboardClick = () => {
        const roles = user?.roles || []; 
        if (roles.includes('ROLE_ADMIN')) router.push('/admin-dashboard');
        else if (roles.includes('ROLE_MANAGER')) router.push('/manager-dashboard');
        else if (roles.includes('ROLE_COLLABORATOR')) router.push('/collaborator-dashboard');
        else router.push('/');
    };

    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/'); 
    };

    // Visão MENSAL
    const renderMonthView = () => {
        const days = generateCalendarDays();
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
                    {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day) => (
                        <div key={day} className="py-3 text-center text-[11px] uppercase tracking-wider font-bold text-slate-400">{day}</div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((day, index) => {
                            if (day === null) return <div key={`empty-${index}`} className="h-28 bg-transparent"></div>;
                            const date = new Date(year, month, day);
                            return (
                                <div key={`day-${day}`} className="h-28 border border-slate-200 rounded-xl p-2 hover:border-[#003399] transition-all bg-white cursor-pointer group" onClick={() => handleDateSelect(date)}>
                                    <button className={`h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${isToday(date) ? 'bg-[#003399] text-white shadow-md' : isSelected(date) ? 'bg-indigo-50 text-[#003399]' : 'text-slate-600 group-hover:bg-slate-50'}`}>
                                        {day}
                                    </button>
                                    <div className="text-xs mt-2 space-y-1">
                                        {getAppointmentsForDate(date).slice(0, 2).map((appt) => (
                                            <div key={appt.schedulingId} className={`rounded-md px-2 py-1 truncate text-[10px] font-bold ${hasRole('ROLE_ADMIN') ? getCompanyColor(appt.companyId) : 'bg-[#003399]'} text-white shadow-sm`} title={appt.name}>
                                                {appt.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // Visão SEMANAL (ALINHAMENTO PERFEITO ESTILO GOOGLE AGENDA)
    const renderWeekView = () => {
        const weekDays = getWeekDays();
        return (
            <div className="flex flex-col h-full bg-white relative">
                {/* 1. SCROLL CONTAINER ABRANGENDO CABEÇALHO E GRADE */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white relative">
                    
                    {/* CABEÇALHO FIXO DENTRO DO SCROLL (Isso garante alinhamento milimétrico) */}
                    <div className="flex sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                        <div className="w-[60px] md:w-[80px] shrink-0 border-r border-slate-200 bg-white"></div>
                        <div className="flex-1 grid grid-cols-7">
                            {weekDays.map((date, index) => (
                                <div key={index} className="py-2.5 text-center border-r border-slate-200 last:border-r-0 bg-white flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">{getDayName(date)}</span>
                                    <div onClick={() => handleDayHeaderClick(date)} className={`text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer ${isToday(date) ? 'bg-[#003399] text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}>
                                        {date.getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* CORPO DO CALENDÁRIO */}
                    <div className="flex z-0 relative">
                        <div className="w-[60px] md:w-[80px] shrink-0 border-r border-slate-200 bg-white flex flex-col">
                            {timeSlots.map((time) => {
                                const [hour, minute] = time.split(':');
                                const isFullHour = minute === '00';
                                return (
                                    <div key={time} id={isFullHour ? `scroll-to-hour-${hour}` : undefined} className="h-14 relative w-full flex justify-end pr-2 border-b border-slate-100 last:border-b-0">
                                        {isFullHour && (
                                            <span className="absolute -top-2.5 text-[10px] font-medium text-slate-400 bg-white px-1 z-10">
                                                {time}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="flex-1 grid grid-cols-7 relative">
                            {weekDays.map((date, dayIndex) => {
                                const dayAppointments = getAppointmentsForDate(date);
                                const appointmentsByVenue = dayAppointments.reduce((acc, appt) => { (acc[appt.venueId] = acc[appt.venueId] || []).push(appt); return acc; }, {} as Record<string, Appointment[]>);
                                return (
                                    <div key={dayIndex} className="border-r border-slate-200 last:border-r-0 relative bg-white flex flex-col">
                                        {timeSlots.map((time) => <div key={`grid-${time}`} className="h-14 border-b border-slate-100 w-full"></div>)}
                                        {Object.values(appointmentsByVenue).flatMap((venueAppointments) => {
                                            return venueAppointments.map((appointment, indexInSlot) => {
                                                const start = parseApiDate(appointment.startAt);
                                                const end = parseApiDate(appointment.endAt);
                                                const pixelsPerMinute = 56 / 30; // h-14 = 56px
                                                const startTimeInMinutes = start.getHours() * 60 + start.getMinutes();
                                                const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                                                const top = startTimeInMinutes * pixelsPerMinute;
                                                const height = durationInMinutes * pixelsPerMinute;
                                                const totalInSlot = venueAppointments.length;
                                                const width = `calc(${100 / totalInSlot}% - 4px)`;
                                                const left = `calc(${(100 / totalInSlot) * indexInSlot}% + 2px)`;
                                                const color = hasRole('ROLE_ADMIN') ? getCompanyColor(appointment.companyId) : 'bg-[#003399]';
                                                
                                                return (
                                                    <div key={appointment.schedulingId} className={`absolute rounded-xl p-2 text-white cursor-pointer overflow-hidden ${color} shadow-sm hover:shadow-md transition-shadow border border-white/20`} style={{ top: `${top}px`, height: `${height}px`, width, left, zIndex: 10 + indexInSlot }} title={`${appointment.name}`}>
                                                        <p className="text-[10px] font-bold truncate leading-tight tracking-wide">{appointment.name}</p>
                                                    </div>
                                                );
                                            });
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Visão DIÁRIA
    const renderDayView = () => {
        const dayAppointments = getAppointmentsForDate(selectedDate);
        return (
            <div className="flex flex-col h-full bg-white relative">
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-white relative">
                    <div className="flex sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
                        <div className="w-[60px] md:w-[80px] shrink-0 border-r border-slate-200 bg-white"></div>
                        <div className="flex-1 p-2 text-center bg-white flex flex-col items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider mb-1">{getDayName(selectedDate)}</span>
                            <div className={`text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center transition-colors ${isToday(selectedDate) ? 'bg-[#003399] text-white shadow-md' : 'text-slate-700'}`}>
                                {selectedDate.getDate()}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex z-0 relative">
                        <div className="w-[60px] md:w-[80px] shrink-0 border-r border-slate-200 bg-white flex flex-col">
                            {timeSlots.map((time) => {
                                 const [hour, minute] = time.split(':');
                                 const isFullHour = minute === '00';
                                return (
                                    <div key={time} id={isFullHour ? `scroll-to-hour-${hour}` : undefined} className="h-14 relative w-full flex justify-end pr-2 border-b border-slate-100 last:border-b-0">
                                        {isFullHour && (
                                            <span className="absolute -top-2.5 text-[10px] font-medium text-slate-400 bg-white px-1 z-10">
                                                {time}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex-1 relative bg-white flex flex-col">
                            {timeSlots.map((time) => <div key={`grid-${time}`} className="h-14 border-b border-slate-100 w-full"></div>)}
                            {dayAppointments.map((appointment) => {
                                const start = parseApiDate(appointment.startAt);
                                const end = parseApiDate(appointment.endAt);
                                const pixelsPerMinute = 56 / 30; 
                                const startTimeInMinutes = start.getHours() * 60 + start.getMinutes();
                                const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                                const top = startTimeInMinutes * pixelsPerMinute;
                                const height = durationInMinutes * pixelsPerMinute;
                                const color = hasRole('ROLE_ADMIN') ? getCompanyColor(appointment.companyId) : 'bg-[#003399]';
                                return (
                                    <div key={appointment.schedulingId} className={`absolute rounded-xl p-3 left-0 right-0 mx-3 text-white cursor-pointer ${color} shadow-md hover:shadow-lg transition-all border border-white/20`} style={{ top: `${top}px`, height: `${height}px`, zIndex: 10 }} title={`${appointment.name}`}>
                                        <div className="text-sm font-bold tracking-wide">{appointment.name}</div>
                                        <div className="text-[11px] opacity-90 mt-1.5 font-medium">{`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`} - {` ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans overflow-hidden">
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shrink-0">
                <div className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-[#003399] transition-colors xl:hidden"><Menu size={28} strokeWidth={1.5} /></button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleDashboardClick}>
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/></svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">brisa</span>
                    </div>
                </div>

                <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                    <div className="w-full bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003399]/20 focus-within:border-[#003399]">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input type="text" placeholder="Buscar reservas ou espaços..." className="bg-transparent border-none outline-none text-slate-700 w-full text-base placeholder-slate-500" />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href="/collaborator-dashboard" className="hover:text-[#003399] transition-colors">Dashboard</Link>
                        <Link href="#" className="text-[#003399] transition-colors">Reservas</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399] transition-colors">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    <div className="flex items-center gap-5">
                        <button className="relative p-2 text-slate-400 hover:text-[#003399] transition-colors bg-white rounded-full border border-slate-200 shadow-sm outline-none">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <span className="text-[15px] font-medium text-slate-600 hidden md:block">{user?.name?.split(' ')[0] || 'Usuário'}</span>
                        <button onClick={handleLogout} className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors">Sair</button>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <div className="md:hidden bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-slate-700 w-full text-base" />
                    </div>
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href="/collaborator-dashboard" className="hover:text-[#003399]">Dashboard</Link>
                        <Link href="#" className="text-[#003399]">Reservas</Link>
                        <Link href="/our-spaces" className="hover:text-[#003399]">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            <main className="flex-1 flex overflow-hidden p-6 lg:p-8 gap-8 pt-6 max-w-[1800px] mx-auto w-full">
                <div className="hidden lg:flex w-[320px] flex-col gap-6 shrink-0 overflow-y-auto hide-scrollbar">
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 capitalize">{getMonthName(month)} {year}</h3>
                            <div className="flex gap-1 bg-slate-50 border border-slate-100 rounded-lg p-1">
                                <Button variant="ghost" size="icon" onClick={previousMonth} className="h-7 w-7 text-slate-500 hover:text-[#003399] hover:bg-white rounded-md"><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 text-slate-500 hover:text-[#003399] hover:bg-white rounded-md"><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center mb-6">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (<div key={idx} className="text-[10px] font-bold text-slate-400 mb-2">{day}</div>))}
                            {generateCalendarDays().map((day, index) => {
                                if (day === null) return <div key={`empty-${index}`} className="h-8"></div>;
                                const date = new Date(year, month, day);
                                const isSel = isSelected(date);
                                const isT = isToday(date);
                                return (
                                    <button key={`day-${day}`} className={`h-9 w-9 rounded-full text-sm font-bold flex items-center justify-center mx-auto transition-all ${isT ? 'bg-[#003399] text-white shadow-md' : isSel ? 'bg-indigo-50 text-[#003399]' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => handleDateSelect(date)}>
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                        <Button className="w-full bg-[#003399] hover:bg-[#002266] text-white font-bold py-6 rounded-xl shadow-md transition-all flex items-center justify-center mb-4 text-[15px]" onClick={() => setIsAppointmentModalOpen(true)}>
                            <Plus className="h-5 w-5 mr-2" /> Agendar Horário
                        </Button>
                        {hasRole('ROLE_ADMIN') && (
                            <div className="mt-2">
                                <label className="text-[11px] font-bold text-slate-500 mb-2 block uppercase tracking-wider">Filtrar por Empresa</label>
                                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                                    <SelectTrigger className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 text-slate-700 font-medium rounded-xl h-12">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas as empresas</SelectItem>
                                        {allCompanies.map((company) => (<SelectItem key={company.id} value={company.id}>{company.cnpj}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden min-w-[600px]">
                    <div className="p-6 lg:px-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10 shrink-0">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-slate-800">{view === 'month' ? 'Visão Mensal' : view === 'week' ? 'Visão Semanal' : 'Visão Diária'}</h2>
                            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 hidden md:block">{formatDateHeader(selectedDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#F0F2F5] p-1.5 rounded-xl border border-slate-200/60 w-max">
                            <Button variant="ghost" onClick={() => setView('day')} className={`rounded-lg text-[13px] font-bold h-9 px-4 transition-all ${view === 'day' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Dia</Button>
                            <Button variant="ghost" onClick={() => setView('week')} className={`rounded-lg text-[13px] font-bold h-9 px-4 transition-all ${view === 'week' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Semana</Button>
                            <Button variant="ghost" onClick={() => setView('month')} className={`rounded-lg text-[13px] font-bold h-9 px-4 transition-all ${view === 'month' ? 'bg-white text-[#003399] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Mês</Button>
                            <div className="w-px h-5 bg-slate-300 mx-1"></div>
                            <Button variant="ghost" onClick={goToToday} className="text-[13px] font-bold text-[#003399] hover:bg-white h-9 px-4 transition-colors">Hoje</Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative bg-[#FAFAFA]/50 p-4 lg:p-6 pt-0 flex flex-col">
                        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                            {view === 'day' && renderDayView()}
                            {view === 'week' && renderWeekView()}
                            {view === 'month' && renderMonthView()}
                        </div>
                    </div>
                </div>
            </main>

            {isAppointmentModalOpen && (
                <AppointmentModal
                    isOpen={isAppointmentModalOpen}
                    onClose={() => setIsAppointmentModalOpen(false)}
                    venues={venues}
                    fetchAvailableTimes={fetchAvailableTimes}
                    availableTimes={availableTimes}
                    loadingTimes={loadingAvailableTimes}
                    userRole={userRoleNormalized}
                    onAppointmentCreated={fetchAppointments}
                />
            )}
            <DayAppointmentsModal
                isOpen={isDayModalOpen}
                onClose={() => setIsDayModalOpen(false)}
                date={dayModalDate}
                appointments={dayModalDate ? getAppointmentsForDate(dayModalDate) : []}
                venues={venues}
            />
        </div>
    );
}