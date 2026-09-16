'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ChevronLeft, UserPlus, CalendarClock, Check, X, Loader2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext'; // 1. Importe o hook de notificações

// --- Interfaces de Tipagem para os Dados da API ---

// Interface para o usuário pendente
interface PendingUser {
    id: string; 
    username: string;
    status: string; 
    companyName: string;
}

// Interface para a resposta paginada da API de usuários
interface PaginatedUsersResponse {
    content: PendingUser[];
}

// Interface para o agendamento pendente
interface PendingBooking {
    schedulingId: string;
    name: string;
    description: string;
    startAt: string;
    endAt: string;
    status: string; 
}

// Interface para a resposta paginada da API de agendamentos
interface PaginatedBookingsResponse {
    content: PendingBooking[];
}


// --- Componentes da UI ---

const RequestItem = ({ children, onApprove, onDecline }: { children: React.ReactNode; onApprove: () => void; onDecline: () => void; }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-shadow hover:shadow-md">
        <div className="flex-1 min-w-0">{children}</div>
        <div className="flex gap-2 ml-4">
            <button
                onClick={onApprove}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                aria-label="Aprovar"
            >
                <Check size={20} />
            </button>
            <button
                onClick={onDecline}
                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                aria-label="Recusar"
            >
                <X size={20} />
            </button>
        </div>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
        <Loader2 className="animate-spin text-verde-t2m" size={24} />
        <span className="ml-2">Carregando...</span>
    </div>
);

// --- Página Principal ---

export default function PendingRequestsPage() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
    const [loading, setLoading] = useState({ users: true, bookings: true });
    const [error, setError] = useState<string | null>(null);
    
    const { fetchPendingRequests } = useNotifications();

    const formatDate = (isoString: string) => {
        if (!isoString) return 'Data inválida';
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const fetchData = useCallback(async () => {
        setError(null);
        
        const authToken = localStorage.getItem('token');
        if (!authToken) {
            setError("Usuário não autenticado. Por favor, faça login.");
            setLoading({ users: false, bookings: false });
            return;
        }

        const headers = { Authorization: `Bearer ${authToken}` };

        try {
            const [usersResponse, bookingsResponse] = await Promise.all([
                axios.get<PaginatedUsersResponse>('http://localhost:8080/manager/users/request', { headers }),
                axios.get<PaginatedBookingsResponse>('http://localhost:8080/manager/scheduling/request', { headers })
            ]);
            
            const pendingOnlyUsers = usersResponse.data.content.filter(user => user.status === 'PENDING');
            setPendingUsers(pendingOnlyUsers);

            const pendingOnlyBookings = bookingsResponse.data.content.filter(booking => booking.status === 'PENDING');
            setPendingBookings(pendingOnlyBookings);

        } catch (err: any) {
            console.error("Erro ao buscar solicitações:", err);
            if (err.response?.status === 403) {
                 setError("Você não tem permissão para acessar estes dados.");
            } else {
                 setError("Não foi possível carregar as solicitações. Tente novamente mais tarde.");
            }
        } finally {
            setLoading({ users: false, bookings: false });
        }
    }, []);

    useEffect(() => {
        setLoading({ users: true, bookings: true }); 
        fetchData();
    }, [fetchData]);

    const handleRequest = async (url: string, method: 'post' | 'delete' = 'post', payload?: object) => {
        const authToken = localStorage.getItem('token');
        if (!authToken) {
            alert("Sessão expirada. Faça o login novamente.");
            return false;
        }
        const headers = { Authorization: `Bearer ${authToken}` };
        
        try {
            await axios({ method, url, headers, data: payload });
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Ocorreu um erro.';
            alert(`Erro: ${errorMessage}`);
            return false;
        }
    };

    const handleApprove = async (type: 'user' | 'scheduling', id: string) => {
        const url = `http://localhost:8080/manager/${type}/approve/${id}`;
        const success = await handleRequest(url, 'post');
        
        if (success) {
            alert(`Solicitação aprovada com sucesso!`);
            fetchData();
            fetchPendingRequests();
        }
    };

    const handleDecline = async (type: 'user' | 'scheduling', id: string) => {
        const reason = prompt("Por favor, informe o motivo da rejeição (opcional):");
        if (reason === null) return;

        const url = `http://localhost:8080/manager/${type}/reject/${id}`;
        const payload = { rejectionReason: reason };
        const success = await handleRequest(url, 'post', payload);

        if (success) {
            alert(`Solicitação rejeitada com sucesso!`);
            fetchData();
            fetchPendingRequests();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/manager-dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-verde-t2m transition">
                        <ChevronLeft size={20} />
                        Voltar para o Dashboard
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-center mb-10">Solicitações Pendentes</h1>
                
                {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}

                {/* Seção de Novos Colaboradores */}
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                        <UserPlus className="text-verde-t2m" />
                        Novos Colaboradores
                    </h2>
                    <div className="space-y-4">
                        {loading.users ? <LoadingSpinner /> : pendingUsers.length > 0 ? (
                            pendingUsers.map(user => (
                                <RequestItem
                                    key={user.id} 
                                    onApprove={() => handleApprove('user', user.id)}
                                    onDecline={() => handleDecline('user', user.id)}
                                >
                                    <div>
                                        <p className="font-semibold truncate">{user.username}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Empresa: <span className="font-medium">{user.companyName}</span>
                                        </p>
                                    </div>
                                </RequestItem>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-lg">Nenhuma solicitação de colaborador pendente.</p>
                        )}
                    </div>
                </section>

                {/* Seção de Novos Agendamentos */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                        <CalendarClock className="text-verde-t2m" />
                        Novos Agendamentos
                    </h2>
                    <div className="space-y-4">
                        {loading.bookings ? <LoadingSpinner /> : pendingBookings.length > 0 ? (
                            pendingBookings.map(booking => (
                                <RequestItem
                                    key={booking.schedulingId}
                                    onApprove={() => handleApprove('scheduling', booking.schedulingId)}
                                    onDecline={() => handleDecline('scheduling', booking.schedulingId)}
                                >
                                    <div>
                                        <p className="font-semibold truncate">{booking.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{booking.description}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            De: {formatDate(booking.startAt)} Até: {formatDate(booking.endAt)}
                                        </p>
                                    </div>
                                </RequestItem>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-lg">Nenhuma solicitação de agendamento pendente.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}