'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react'; // Adicionado useRef aqui
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
    Menu,
    LayoutGrid,
    User,
    Settings,
    LogOut,
    FileText,
    Calendar,
    Clock,
    MapPin,
    CheckCircle,
    XCircle,
    Loader2,
    Bell, // Importado o ícone Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface BookingData {
    schedulingId: string;
    name: string;
    description: string;
    startAt: string;
    endAt: string;
    createdAt: string;
    createdBy: string;
    companyId: string;
    venueId: string;
    status: string;
    decidedBy: string | null;
    decidedAt: string | null;
    rejectionReason: string | null;
    BookingPeriod: string | null;
    updateAt: string | null;
}

const NavItem = ({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}) => (
    <div
        className="flex flex-col items-center gap-1 cursor-pointer group"
        onClick={onClick}
    >
        <div className="text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {icon}
        </div>
        <span className="text-sm font-medium text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {label}
        </span>
    </div>
);

const BookingCard = ({
    booking,
    onAccept,
    onDecline,
    isProcessing,
    isRejecting,
    onConfirmDecline,
    onCancelDecline,
    rejectionReason,
    setRejectionReason,
}: {
    booking: BookingData;
    onAccept: (booking: BookingData) => void;
    onDecline: (booking: BookingData) => void;
    isProcessing: boolean;
    isRejecting: boolean;
    onConfirmDecline: (booking: BookingData) => void;
    onCancelDecline: () => void;
    rejectionReason: string;
    setRejectionReason: (reason: string) => void;
}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDuration = () => {
        const start = new Date(booking.startAt);
        const end = new Date(booking.endAt);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(
            (diffMs % (1000 * 60 * 60)) / (1000 * 60),
        );

        if (diffHours > 0) {
            return `${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`;
        }
        return `${diffMinutes}min`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg p-6 transition-all duration-300 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                            {booking.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {booking.description}
                        </p>
                    </div>
                    <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
                        {booking.status}
                    </div>
                </div>
                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar size={16} />
                        <span>{formatDate(booking.startAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock size={16} />
                        <span>
                            {formatTime(booking.startAt)} -{' '}
                            {formatTime(booking.endAt)}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {getDuration()}
                        </span>
                    </div>
                    {booking.BookingPeriod && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <FileText size={16} />
                            <span>
                                {booking.BookingPeriod.replace('_', ' ')}
                            </span>
                        </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Criado em: {formatDate(booking.createdAt)} às{' '}
                        {formatTime(booking.createdAt)}
                    </div>
                </div>
            </div>

            {isRejecting ? (
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <textarea
                        placeholder="Informe o motivo da recusa..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2 focus:ring-2 focus:ring-red-500"
                        rows={2}
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={onCancelDecline}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => onConfirmDecline(booking)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Confirmar Recusa
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => onDecline(booking)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <XCircle size={16} />
                        )}
                        Recusar
                    </button>
                    <button
                        onClick={() => onAccept(booking)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 bg-verde-t2m hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <CheckCircle size={16} />
                        )}
                        Aceitar
                    </button>
                </div>
            )}
        </div>
    );
};

export default function PendingBookings() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingBookings, setProcessingBookings] = useState<Set<string>>(
        new Set(),
    );
    const router = useRouter();
    const { user, token } = useAuth();
    // Desestruturado pendingBookingsCount
    const { pendingBookingsCount, fetchPendingBookingsCount } = useNotifications(); 

    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Estado para o sino de notificação
    const [showNotifications, setShowNotifications] = useState(false); 
    // Ref para o container de notificações
    const notificationsRef = useRef<HTMLDivElement>(null); 

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
        if (user) {
            fetchBookings();
            // Busca o contador de notificações ao carregar
            fetchPendingBookingsCount(); 
        }
    }, [user]);

    // Fechar o menu de notificações ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notificationsRef]);


    const fetchBookings = async () => {
        setLoading(true);
        setError(null);

        if (!token) {
            setError('Você precisa estar logado para ver esta página.');
            setLoading(false);
            router.push('/login');
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        try {
            const response = await axios.get(
                'http://localhost:8080/manager/scheduling/status/PENDING',
                { headers },
            );

            const userCompanyId = user?.companyId;
            if (userCompanyId) {
                const filteredData = response.data.filter(
                    (booking: BookingData) =>
                        booking.companyId === userCompanyId,
                );
                setBookings(filteredData);
            } else {
                setBookings(response.data);
            }
        } catch (err: any) {
            console.error('Falha ao carregar agendamentos:', err);
            if (
                axios.isAxiosError(err) &&
                (err.response?.status === 401 || err.response?.status === 403)
            ) {
                setError('Sessão inválida ou não autorizada.');
                router.push('/login');
            } else {
                setError(
                    'Não foi possível carregar os agendamentos. Verifique o backend ou a conexão.',
                );
            }
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (booking: BookingData) => {
        if (!token) {
            alert('Sessão inválida. Por favor, faça o login novamente.');
            return router.push('/login');
        }

        setProcessingBookings((prev) =>
            new Set(prev).add(booking.schedulingId),
        );

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const endpoint = `http://localhost:8080/manager/scheduling/approve/${booking.schedulingId}`;
            await axios.post(endpoint, {}, { headers });

            setBookings((prev) =>
                prev.filter((b) => b.schedulingId !== booking.schedulingId),
            );
            
            // Atualizar o contador de notificações
            fetchPendingBookingsCount();
        } catch (err) {
            console.error('Falha ao aceitar o agendamento:', err);
            alert('Não foi possível aprovar o agendamento. Tente novamente.');
        } finally {
            setProcessingBookings((prev) => {
                const newSet = new Set(prev);
                newSet.delete(booking.schedulingId);
                return newSet;
            });
        }
    };

    const handleDeclineClick = (booking: BookingData) => {
        setRejectingId(booking.schedulingId);
    };

    const handleCancelDecline = () => {
        setRejectingId(null);
        setRejectionReason('');
    };

    const handleConfirmDecline = async (booking: BookingData) => {
        if (rejectionReason.trim() === '') {
            return alert('Por favor, informe um motivo para a recusa.');
        }
        if (!token) {
            alert('Sessão inválida. Por favor, faça o login novamente.');
            return router.push('/login');
        }

        setProcessingBookings((prev) =>
            new Set(prev).add(booking.schedulingId),
        );

        try {
            const headers = { Authorization: `Bearer ${token}` };
            const endpoint = `http://localhost:8080/manager/scheduling/reject/${booking.schedulingId}`;
            const payload = { rejectionReason: rejectionReason };

            await axios.post(endpoint, payload, { headers });

            setBookings((prev) =>
                prev.filter((b) => b.schedulingId !== booking.schedulingId),
            );
            setRejectingId(null);
            setRejectionReason('');
            
            // Atualizar o contador de notificações
            fetchPendingBookingsCount();
        } catch (err) {
            console.error('Falha ao recusar o agendamento:', err);
            alert('Não foi possível recusar o agendamento. Tente novamente.');
        } finally {
            setProcessingBookings((prev) => {
                const newSet = new Set(prev);
                newSet.delete(booking.schedulingId);
                return newSet;
            });
        }
    };

    const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
    // Função para alternar a visibilidade das notificações
    const toggleNotifications = () => setShowNotifications((prev) => !prev);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
            <div className="flex flex-1 transition-all duration-300">
                {/* Sidebar */}
                <aside
                    className={`bg-verde-t2m dark:bg-gray-800 ${
                        sidebarCollapsed ? 'w-16' : 'w-64'
                    } p-6 flex flex-col items-center relative transition-all duration-300 ease-in-out`}
                >
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-4 right-4 hover:scale-110 transition"
                    >
                        <Menu size={28} />
                    </button>
                    <div className="flex items-center mb-8">
                        {!sidebarCollapsed && (
                            <img
                                src={
                                    darkMode
                                        ? '/img/logot2m(dark).png'
                                        : '/img/logot2m(2).png'
                                }
                                alt="T2M logo"
                                className="h-28 mr-2"
                            />
                        )}
                    </div>
                    {!sidebarCollapsed && (
                        <>
                            <h2 className="text-xl font-bold mb-2">
                                Agendamentos Pendentes
                            </h2>
                            <p className="mb-4 text-center">
                                Gerencie as solicitações de agendamento
                            </p>
                            <p className="text-center text-sm">
                                Revise e aprove ou recuse os agendamentos
                                pendentes.
                            </p>
                        </>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 bg-gray-200 dark:bg-gray-900 p-8">
                    {/* Navbar */}
                    <div className="flex justify-between items-center gap-5 mb-8">
                        <NavItem
                            icon={<LayoutGrid size={24} />}
                            label="Início"
                            onClick={() => router.push('/admin-dashboard')}
                        />
                        <NavItem icon={<User size={24} />} label="Perfil" />
                        <NavItem
                            icon={<Calendar size={24} />}
                            label="Agendamentos"
                        />
                        <NavItem
                            icon={<Settings size={24} />}
                            label="Configurações"
                        />
                        {/* Sino de Notificação */}
                        <div className="relative" ref={notificationsRef}>
                            <NavItem
                                icon={
                                    <div className="relative">
                                        <Bell size={24} />
                                        {/* Condição para exibir o contador */}
                                        {pendingBookingsCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                                {pendingBookingsCount}
                                            </span>
                                        )}
                                    </div>
                                }
                                label="Notificações"
                                onClick={toggleNotifications}
                            />
                            {/* Pop-up de Notificações Condicional */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 p-4">
                                    <h4 className="font-bold text-lg mb-2 text-black dark:text-white">Notificações</h4>
                                    {pendingBookingsCount > 0 ? (
                                        <p className="text-gray-700 dark:text-gray-300">Você tem {pendingBookingsCount} agendamento(s) pendente(s).</p>
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300">Nenhuma notificação nova.</p>
                                    )}
                                    {/* Aqui você pode listar as notificações reais, se quiser. */}
                                    <button
                                        onClick={() => {
                                            router.push('/admin-dashboard/pending-bookings'); // Redireciona para esta própria página, ou outra de notificações
                                            setShowNotifications(false); // Fecha o pop-up
                                        }}
                                        className="mt-4 w-full bg-verde-t2m hover:bg-green-700 text-white py-2 rounded-lg text-sm"
                                    >
                                        Ver todos os agendamentos pendentes
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Fim Sino de Notificação */}
                        <NavItem
                            icon={<LogOut size={24} />}
                            label="Sair"
                            onClick={() => router.push('/')}
                        />
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            Agendamentos Pendentes
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {loading
                                ? 'Carregando...'
                                : `${bookings.length} agendamento(s) aguardando aprovação`}
                        </p>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2
                                size={48}
                                className="animate-spin text-verde-t2m"
                            />
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
                            <p className="font-medium">Erro:</p>
                            <p>{error}</p>
                            <button
                                onClick={fetchBookings}
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar
                                size={64}
                                className="mx-auto text-gray-400 mb-4"
                            />
                            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                                Nenhum agendamento pendente
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Não há solicitações para a sua empresa ou todas
                                já foram processadas.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <BookingCard
                                    key={booking.schedulingId}
                                    booking={booking}
                                    onAccept={handleAccept}
                                    onDecline={handleDeclineClick}
                                    isProcessing={processingBookings.has(
                                        booking.schedulingId,
                                    )}
                                    isRejecting={
                                        rejectingId === booking.schedulingId
                                    }
                                    onConfirmDecline={handleConfirmDecline}
                                    onCancelDecline={handleCancelDecline}
                                    rejectionReason={rejectionReason}
                                    setRejectionReason={setRejectionReason}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}