'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation'; // 1. Importação do Router
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Settings,
    LayoutDashboard,
    Home,
    PieChart,
    FileText,
    LogOut,
    Menu
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

// --- Helpers e Interfaces ---

function parseApiDate(dateString: string | null | undefined): Date {
    if (!dateString) {
        return new Date(NaN);
    }
    if (!dateString.endsWith('Z')) {
        return new Date(dateString + 'Z');
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

// --- Componente Auxiliar para Item do Menu ---
const NavItem = ({ icon: Icon, label, active, collapsed, onClick, className }: any) => {
    return (
        <div 
            onClick={onClick}
            className={`relative flex items-center py-3 cursor-pointer transition-all duration-200
            ${active ? 'text-white' : 'text-gray-400 hover:text-white'}
            ${collapsed ? 'justify-center px-0' : 'gap-3 px-4 mx-3 rounded-xl'}
            ${active && !collapsed ? 'bg-white/10' : ''}
            ${className || ''}
            `}
        >
            <Icon size={20} />
            
            {!collapsed && (
                <span className="font-medium text-sm whitespace-nowrap">{label}</span>
            )}

            {active && (
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#4318FF] rounded-l-full ${collapsed ? 'block' : 'hidden'}`}></div>
            )}
            {active && !collapsed && (
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#4318FF] rounded-l-full"></div>
            )}
        </div>
    );
};

// --- Modal de Agendamentos do Dia ---
const DayAppointmentsModal = ({
    isOpen,
    onClose,
    date,
    appointments,
    venues,
}: {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    appointments: Appointment[];
    venues: Venue[];
}) => {
    if (!isOpen || !date) return null;

    const getVenueName = (venueId: string) => {
        return (
            venues.find((v) => v.venueId === venueId)?.name ||
            'Espaço desconhecido'
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-[#1B2559]">
                        Agendamentos para {date.toLocaleDateString('pt-BR')}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    {appointments.length > 0 ? (
                        appointments
                            .sort(
                                (a, b) =>
                                    parseApiDate(a.startAt).getTime() -
                                    parseApiDate(b.startAt).getTime(),
                            )
                            .map((appt) => (
                                <div
                                    key={appt.schedulingId}
                                    className="p-4 bg-[#F4F7FE] rounded-xl border-l-4 border-[#4318FF]"
                                >
                                    <p className="font-bold text-[#1B2559]">{appt.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {parseApiDate(appt.startAt).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            timeZone: 'UTC',
                                        })}{' '}
                                        -
                                        {parseApiDate(appt.endAt).toLocaleTimeString(
                                            'pt-BR',
                                            {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZone: 'UTC',
                                            },
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Espaço: {getVenueName(appt.venueId)}
                                    </p>
                                </div>
                            ))
                    ) : (
                        <p className="text-gray-500 text-center">Nenhum agendamento para este dia.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function AppointmentCalendar() {
    const { user, hasRole, token } = useAuth();
    const router = useRouter(); // 2. Instância do Router
    
    const currentDate = new Date();
    const [month, setMonth] = useState(currentDate.getMonth());
    const [year, setYear] = useState(currentDate.getFullYear());
    const [selectedDate, setSelectedDate] = useState(currentDate);
    const [view, setView] = useState('week');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

    const userRoleNormalized: 'COLLABORATOR' | 'MANAGER' | null = hasRole('ROLE_COLLABORATOR')
        ? 'COLLABORATOR'
        : hasRole('ROLE_MANAGER')
          ? 'MANAGER'
          : null;

    // --- Effects ---
    useEffect(() => {
        if ((view === 'week' || view === 'day') && scrollContainerRef.current) {
            const timeoutId = setTimeout(() => {
                if (scrollContainerRef.current) {
                    const currentHour = new Date().getHours();
                    const targetHour = Math.max(0, currentHour - 1);
                    const targetId = `scroll-to-hour-${String(targetHour).padStart(2, '0')}`;
                    
                    const targetElement = scrollContainerRef.current.querySelector(`#${targetId}`);
                    
                    if (targetElement) {
                        scrollContainerRef.current.scrollTop = (targetElement as HTMLElement).offsetTop;
                    }
                }
            }, 50);
    
            return () => clearTimeout(timeoutId);
        }
    }, [view, selectedDate]);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const fetchAppointments = useCallback(async () => {
        if (!user || !token) return setAppointments([]);

        const isAdmin = hasRole('ROLE_ADMIN');
        const isManager = hasRole('ROLE_MANAGER');
        const isCollaborator = hasRole('ROLE_COLLABORATOR');

        let endpoint = '';
        if (isAdmin) endpoint = 'http://localhost:8080/admin/scheduling';
        else if (isManager)
            endpoint = 'http://localhost:8080/manager/scheduling';
        else if (isCollaborator)
            endpoint = 'http://localhost:8080/collaborator/scheduling';
        else return;

        try {
            const response =
                await axios.get<ApiPageResponse<Appointment>>(endpoint);
            const fetchedAppointments = response.data?.content || [];
            setAppointments(fetchedAppointments);

            if (isAdmin) {
                const companies = fetchedAppointments.reduce(
                    (acc, curr) => {
                        if (
                            curr.companyId &&
                            !acc.some((c) => c.id === curr.companyId)
                        ) {
                            acc.push({
                                id: curr.companyId,
                                cnpj: curr.cnpj || 'CNPJ não informado',
                            });
                        }
                        return acc;
                    },
                    [] as { id: string; cnpj: string }[],
                );
                setAllCompanies(companies);
            }
        } catch (error) {
            console.error(
                `Erro ao buscar agendamentos para ${endpoint}:`,
                error,
            );
            toast.error('Não foi possível carregar os agendamentos.');
            setAppointments([]);
        }
    }, [user, token, hasRole]);

    useEffect(() => {
        const fetchVenues = async () => {
            if (!token) return;
            try {
                const response = await axios.get<VenueApiResponse>(
                    'http://localhost:8080/venue',
                );
                setVenues(response.data?.content || []);
            } catch (error) {
                console.error('Erro ao buscar espaços:', error);
                toast.error('Erro ao carregar a lista de espaços.');
            }
        };
        fetchVenues();
    }, [token]);

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
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
                const dayOfWeek = date
                    .toLocaleDateString('en-US', { weekday: 'long' })
                    .toUpperCase();
                let effectiveOpeningTime =
                    selectedVenue.openingTime || '00:00:00';
                let effectiveClosingTime =
                    selectedVenue.closingTime || '23:59:59';
                if (selectedVenue.divisible && subVenueId) {
                    const selectedSubVenue = selectedVenue.subVenues?.find(
                        (sv) => sv.id === subVenueId,
                    );
                    if (selectedSubVenue) {
                        effectiveOpeningTime = selectedSubVenue.openingTime;
                        effectiveClosingTime = selectedSubVenue.closingTime;
                    }
                }
                const daySpecificHours = selectedVenue.openingHours?.find(
                    (oh) => oh.dayOfWeek === dayOfWeek,
                );
                if (daySpecificHours) {
                    effectiveOpeningTime = daySpecificHours.openingTime;
                    effectiveClosingTime = daySpecificHours.closingTime;
                }
                const times = [];
                const [openH, openM] = effectiveOpeningTime
                    .split(':')
                    .map(Number);
                const [closeH, closeM] = effectiveClosingTime
                    .split(':')
                    .map(Number);
                let currentHour = openH;
                let currentMinute = openM;
                const now = new Date();
                const isTodaySelected =
                    date.toDateString() === now.toDateString();
                while (
                    currentHour < closeH ||
                    (currentHour === closeH && currentMinute < closeM)
                ) {
                    const slotDateTime = new Date(date);
                    slotDateTime.setHours(currentHour, currentMinute, 0, 0);
                    if (
                        isTodaySelected &&
                        slotDateTime.getTime() <= now.getTime()
                    ) {
                        currentMinute += 30;
                        if (currentMinute >= 60) {
                            currentHour += 1;
                            currentMinute -= 60;
                        }
                        continue;
                    }
                    const timeSlotStart = slotDateTime.getTime();
                    const timeSlotEnd = new Date(
                        slotDateTime.getTime() + 30 * 60000,
                    ).getTime();
                    
                    const isBooked = appointments.some((appointment) => {
                        const existingStart = parseApiDate(appointment.startAt).getTime();
                        const existingEnd = parseApiDate(appointment.endAt).getTime();
                        return (
                            timeSlotStart < existingEnd &&
                            timeSlotEnd > existingStart
                        );
                    });

                    if (!isBooked) {
                        times.push(
                            `${String(currentHour).padStart(2, '0')}:${String(
                                currentMinute,
                            ).padStart(2, '0')}`,
                        );
                    }
                    currentMinute += 30;
                    if (currentMinute >= 60) {
                        currentHour += 1;
                        currentMinute -= 60;
                    }
                }
                setAvailableTimes(times);
            } catch (error) {
                console.error('Erro ao buscar horários disponíveis:', error);
                toast.error('Erro ao carregar horários disponíveis.');
            } finally {
                setLoadingAvailableTimes(false);
            }
        },
        [venues, appointments],
    );

    // --- Visual Logic ---
    const companyColors = ['bg-[#4318FF]', 'bg-[#05CD99]', 'bg-[#FFB547]', 'bg-[#E31A1A]', 'bg-[#6AD2FF]', 'bg-[#FF56A5]'];
    const getCompanyColor = (companyId: string) => {
        if (!companyId) return 'bg-gray-500';
        const hash = companyId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        const index = Math.abs(hash % companyColors.length);
        return companyColors[index];
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
    const previousMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        setMonth(newDate.getMonth());
        setYear(newDate.getFullYear());
    };
    const nextMonth = () => {
        const newDate = new Date(year, month + 1, 1);
        setMonth(newDate.getMonth());
        setYear(newDate.getFullYear());
    };
    
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
    const handleNavigation = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        const step = direction === 'prev' ? -1 : 1;
        if (view === 'day') newDate.setDate(newDate.getDate() + step);
        else if (view === 'week') newDate.setDate(newDate.getDate() + step * 7);
        else newDate.setMonth(newDate.getMonth() + step);
        setSelectedDate(newDate);
        setMonth(newDate.getMonth());
        setYear(newDate.getFullYear());
    };

    // --- Renders (Mantidos iguais para grid de calendário) ---
    const renderMonthView = () => {
        const days = generateCalendarDays();
        return (
            <div className="grid grid-cols-7 gap-2">
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day) => (
                    <div key={day} className="p-2 text-center text-xs font-bold text-[#A3AED0]">{day}</div>
                ))}
                {days.map((day, index) => {
                    if (day === null) return <div key={`empty-${index}`} className="h-24 bg-transparent"></div>;
                    const date = new Date(year, month, day);
                    return (
                        <div
                            key={`day-${day}`}
                            className="h-24 border border-[#E0E5F2] rounded-xl p-1 hover:border-[#4318FF] transition-colors bg-white"
                            onClick={() => handleDateSelect(date)}
                        >
                            <button className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center ${isToday(date) ? 'bg-[#4318FF] text-white shadow-lg shadow-blue-500/30' : isSelected(date) ? 'bg-blue-100 text-[#4318FF]' : 'text-[#2B3674] hover:bg-gray-100'}`}>
                                {day}
                            </button>
                            <div className="text-xs mt-1 space-y-1">
                                {getAppointmentsForDate(date).slice(0, 2).map((appt) => (
                                    <div key={appt.schedulingId} className={`rounded px-1.5 py-0.5 truncate text-[10px] font-medium ${getCompanyColor(appt.companyId)} text-white`} title={appt.name}>
                                        {appt.name}
                                    </div>
                                ))}
                                {getAppointmentsForDate(date).length > 2 && (
                                    <div className="text-[#A3AED0] text-[10px] text-center cursor-pointer font-medium" onClick={(e) => { e.stopPropagation(); handleDayHeaderClick(date); }}>
                                        +{getAppointmentsForDate(date).length - 2} mais
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays();
        return (
            <div className="flex flex-col h-full">
                <div className="grid grid-cols-8 border-b border-[#E0E5F2]">
                    <div className="p-2 border-r border-[#E0E5F2]"></div>
                    {weekDays.map((date, index) => (
                        <div key={index} className="p-2 text-center border-r border-[#E0E5F2] last:border-r-0">
                            <div className="text-xs font-bold text-[#A3AED0]">{getDayName(date)}</div>
                            <div onClick={() => handleDayHeaderClick(date)} className={`text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1 cursor-pointer ${isToday(date) ? 'bg-[#4318FF] text-white shadow-md shadow-blue-500/40' : 'text-[#2B3674]'}`}>
                                {date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-8 flex-1">
                    <div className="border-r border-[#E0E5F2]">
                        {timeSlots.map((time) => {
                            const [hour, minute] = time.split(':');
                            const isFullHour = minute === '00';
                            return (
                                <div key={time} id={isFullHour ? `scroll-to-hour-${hour}` : undefined} className="h-16 border-b border-[#E0E5F2] last:border-b-0 px-2 text-xs font-medium text-[#A3AED0] text-right pr-2 flex items-center justify-end">
                                    <span>{time}</span>
                                </div>
                            );
                        })}
                    </div>
                    {weekDays.map((date, dayIndex) => {
                        const dayAppointments = getAppointmentsForDate(date);
                        const appointmentsByVenue = dayAppointments.reduce((acc, appt) => { (acc[appt.venueId] = acc[appt.venueId] || []).push(appt); return acc; }, {} as Record<string, Appointment[]>);
                        return (
                            <div key={dayIndex} className="border-r border-[#E0E5F2] last:border-r-0 relative">
                                {timeSlots.map((time) => <div key={time} className="h-16 border-b border-[#E0E5F2] last:border-b-0"></div>)}
                                {Object.values(appointmentsByVenue).flatMap((venueAppointments) => {
                                    return venueAppointments.map((appointment, indexInSlot) => {
                                        const start = parseApiDate(appointment.startAt);
                                        const end = parseApiDate(appointment.endAt);
                                        const pixelsPerMinute = 64 / 30;
                                        const startTimeInMinutes = start.getHours() * 60 + start.getMinutes();
                                        const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                                        const top = startTimeInMinutes * pixelsPerMinute;
                                        const height = durationInMinutes * pixelsPerMinute;
                                        const totalInSlot = venueAppointments.length;
                                        const width = `${100 / totalInSlot}%`;
                                        const left = `${(100 / totalInSlot) * indexInSlot}%`;
                                        const color = hasRole('ROLE_ADMIN') ? getCompanyColor(appointment.companyId) : 'bg-[#4318FF]';
                                        return (
                                            <div key={appointment.schedulingId} className={`absolute rounded-[6px] p-1.5 text-white cursor-pointer overflow-hidden ${color} shadow-sm border border-white/20`} style={{ top: `${top}px`, height: `${height}px`, width, left, zIndex: 10 + indexInSlot }} title={`${appointment.name} (${appointment.cnpj || 'N/A'})`}>
                                                <p className="text-[10px] font-bold truncate leading-tight">{appointment.name}</p>
                                            </div>
                                        );
                                    });
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayAppointments = getAppointmentsForDate(selectedDate);
        return (
            <div className="flex flex-col h-full">
                <div className="grid grid-cols-2 border-b border-[#E0E5F2]">
                    <div className="p-2 border-r border-[#E0E5F2]"></div>
                    <div className="p-2 text-center">
                        <div className="text-xs font-bold text-[#A3AED0]">{getDayName(selectedDate)}</div>
                        <div className={`text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1 ${isToday(selectedDate) ? 'bg-[#4318FF] text-white shadow-md' : 'text-[#2B3674]'}`}>{selectedDate.getDate()}</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 flex-1">
                    <div className="border-r border-[#E0E5F2]">
                        {timeSlots.map((time) => {
                             const [hour, minute] = time.split(':');
                             const isFullHour = minute === '00';
                            return (
                                <div key={time} id={isFullHour ? `scroll-to-hour-${hour}` : undefined} className="h-16 border-b border-[#E0E5F2] last:border-b-0 px-2 text-xs font-medium text-[#A3AED0] text-right pr-2 flex items-center justify-end">
                                    <span>{time}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="relative">
                        {timeSlots.map((time) => <div key={time} className="h-16 border-b border-[#E0E5F2] last:border-b-0"></div>)}
                        {dayAppointments.map((appointment) => {
                            const start = parseApiDate(appointment.startAt);
                            const end = parseApiDate(appointment.endAt);
                            const pixelsPerMinute = 64 / 30;
                            const startTimeInMinutes = start.getHours() * 60 + start.getMinutes();
                            const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                            const top = startTimeInMinutes * pixelsPerMinute;
                            const height = durationInMinutes * pixelsPerMinute;
                            const color = hasRole('ROLE_ADMIN') ? getCompanyColor(appointment.companyId) : 'bg-[#4318FF]';
                            return (
                                <div key={appointment.schedulingId} className={`absolute rounded-[10px] p-3 left-0 right-0 mx-2 text-white cursor-pointer ${color} shadow-lg shadow-indigo-500/20`} style={{ top: `${top}px`, height: `${height}px`, zIndex: 10 }} title={`${appointment.name} - ${appointment.description}`}>
                                    <div className="text-sm font-bold">{appointment.name}</div>
                                    <div className="text-xs opacity-90 mt-1 font-medium">{`${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`} - {` ${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-[#F4F7FE] font-sans overflow-hidden">
            <aside 
                className={`${isSidebarCollapsed ? 'w-[80px]' : 'w-[260px]'} bg-[#111C44] text-white flex flex-col py-6 transition-all duration-300 ease-in-out shadow-xl z-20 shrink-0 hidden md:flex`}
            >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-8 gap-3'} mb-10 transition-all`}>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl shrink-0">M</div>
                    {!isSidebarCollapsed && (
                        <h1 className="text-2xl font-bold tracking-wide whitespace-nowrap animate-in fade-in duration-300">GESTOR</h1>
                    )}
                </div>
                
                <nav className="flex-1 space-y-2 px-0">
                    {/* 3. Rota configurada aqui */}
                    <NavItem 
                        icon={LayoutDashboard} 
                        label="Dashboard" 
                        collapsed={isSidebarCollapsed}
                        onClick={() => router.push('/manager-dashboard')}
                    />
                    <NavItem 
                        icon={CalendarIcon} 
                        label="Calendário" 
                        active={true}
                        collapsed={isSidebarCollapsed} 
                    />
                    <NavItem 
                        icon={Home} 
                        label="Meus Espaços" 
                        collapsed={isSidebarCollapsed} 
                    />
                    <NavItem 
                        icon={PieChart} 
                        label="Relatórios" 
                        collapsed={isSidebarCollapsed} 
                    />
                    <NavItem 
                        icon={FileText} 
                        label="Solicitações" 
                        collapsed={isSidebarCollapsed} 
                    />
                </nav>

                <div className="mt-auto">
                    <NavItem 
                        icon={LogOut} 
                        label="Sair" 
                        collapsed={isSidebarCollapsed}
                        className="text-red-400 hover:text-red-300"
                    />
                    
                    <div className="border-t border-white/10 mt-2 pt-2 px-2">
                        <button 
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="w-full flex justify-center p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Área Principal */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                <header className="h-20 px-6 flex items-center justify-between bg-[#F4F7FE] shrink-0">
                    <div>
                        <p className="text-sm text-[#707EAE] font-medium">Páginas / Calendário</p>
                        <h2 className="text-[34px] font-bold text-[#2B3674] leading-tight">
                            Calendário
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2.5 rounded-full shadow-sm">
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#2B3674]" />
                            <Input
                                placeholder="Pesquisar..."
                                className="pl-9 w-48 bg-[#F4F7FE] border-none rounded-full text-sm h-9 focus-visible:ring-0"
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="text-[#A3AED0] hover:text-[#2B3674]">
                            <Settings className="h-5 w-5" />
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-[#111C44] text-white flex items-center justify-center text-xs font-bold">
                            AP
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex overflow-hidden p-6 gap-6 pt-2">
                    <div className="w-[300px] flex flex-col gap-6 shrink-0 overflow-y-auto hide-scrollbar">
                        <div className="bg-white rounded-[20px] p-5 shadow-sm flex flex-col h-auto min-h-[400px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-[#2B3674]">
                                    {getMonthName(month)} {year}
                                </h3>
                                <div className="flex gap-1 bg-[#F4F7FE] rounded-lg p-1">
                                    <Button variant="ghost" size="icon" onClick={previousMonth} className="h-6 w-6 text-[#4318FF] hover:bg-white rounded">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-6 w-6 text-[#4318FF] hover:bg-white rounded">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center mb-6">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                                    <div key={idx} className="text-xs font-bold text-[#A3AED0] mb-2">{day}</div>
                                ))}
                                {generateCalendarDays().map((day, index) => {
                                    if (day === null) return <div key={`empty-${index}`} className="h-8"></div>;
                                    const date = new Date(year, month, day);
                                    const isSel = isSelected(date);
                                    const isT = isToday(date);
                                    return (
                                        <button
                                            key={`day-${day}`}
                                            className={`h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center mx-auto transition-all ${isT ? 'bg-[#4318FF] text-white shadow-lg shadow-indigo-500/40' : isSel ? 'bg-gray-100 text-[#2B3674]' : 'text-[#2B3674] hover:bg-gray-100'}`}
                                            onClick={() => handleDateSelect(date)}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                className="w-full bg-[#05CD99] hover:bg-[#04b083] text-white font-bold py-6 rounded-xl shadow-lg shadow-green-500/20 mb-4"
                                onClick={() => setIsAppointmentModalOpen(true)}
                            >
                                <Plus className="h-5 w-5 mr-2" /> Novo Agendamento
                            </Button>

                            {hasRole('ROLE_ADMIN') && (
                                <div className="mt-2">
                                    <label className="text-xs font-bold text-[#A3AED0] mb-2 block uppercase tracking-wider">Empresa</label>
                                    <Select value={companyFilter} onValueChange={setCompanyFilter}>
                                        <SelectTrigger className="w-full bg-[#F4F7FE] border-none text-[#2B3674] font-medium rounded-xl h-12">
                                            <SelectValue placeholder="Filtrar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {allCompanies.map((company) => (
                                                <SelectItem key={company.id} value={company.id}>{company.cnpj}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-[20px] p-5 shadow-sm flex-1">
                            <h3 className="text-lg font-bold text-[#2B3674] mb-4">Próximas Reservas</h3>
                            <div className="space-y-3">
                                {filteredAppointments.length > 0 ? (
                                    filteredAppointments
                                        .filter((a) => parseApiDate(a.startAt) > new Date())
                                        .slice(0, 5)
                                        .map((appt) => (
                                            <div key={appt.schedulingId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F7FE] transition-colors cursor-pointer">
                                                <div className={`w-2 h-10 rounded-full ${getCompanyColor(appt.companyId)}`}></div>
                                                <div className="overflow-hidden">
                                                    <h4 className="text-sm font-bold text-[#2B3674] truncate">{appt.name}</h4>
                                                    <span className="text-xs text-[#A3AED0]">
                                                        {parseApiDate(appt.startAt).toLocaleDateString('pt-BR')} • {parseApiDate(appt.startAt).getHours()}:{String(parseApiDate(appt.startAt).getMinutes()).padStart(2, '0')}h
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <span className="text-sm text-[#A3AED0]">Sem agendamentos futuros.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-white rounded-[20px] shadow-sm overflow-hidden border border-transparent">
                        <div className="p-6 border-b border-[#E0E5F2] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-[#2B3674]">
                                    {view === 'month' ? 'Visão Mensal' : view === 'week' ? 'Visão Semanal' : 'Visão Diária'}
                                </h2>
                                <span className="text-sm font-medium text-[#A3AED0] bg-[#F4F7FE] px-3 py-1 rounded-lg">
                                    {formatDateHeader(selectedDate)}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-[#F4F7FE] p-1 rounded-xl">
                                <Button variant="ghost" onClick={() => setView('day')} className={`rounded-lg text-xs font-bold h-8 ${view === 'day' ? 'bg-white text-[#2B3674] shadow-sm' : 'text-[#A3AED0]'}`}>Dia</Button>
                                <Button variant="ghost" onClick={() => setView('week')} className={`rounded-lg text-xs font-bold h-8 ${view === 'week' ? 'bg-white text-[#2B3674] shadow-sm' : 'text-[#A3AED0]'}`}>Semana</Button>
                                <Button variant="ghost" onClick={() => setView('month')} className={`rounded-lg text-xs font-bold h-8 ${view === 'month' ? 'bg-white text-[#2B3674] shadow-sm' : 'text-[#A3AED0]'}`}>Mês</Button>
                                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                <Button variant="ghost" onClick={goToToday} className="text-xs font-bold text-[#4318FF] hover:bg-white h-8">Hoje</Button>
                            </div>
                        </div>

                        <div ref={scrollContainerRef} className="flex-1 p-4 overflow-auto relative">
                            {view === 'day' && renderDayView()}
                            {view === 'week' && renderWeekView()}
                            {view === 'month' && renderMonthView()}
                        </div>
                    </div>

                </main>
            </div>

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