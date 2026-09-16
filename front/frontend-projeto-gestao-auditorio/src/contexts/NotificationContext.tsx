'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// --- Interfaces ---
interface PendingUser {
    id: string;
    username: string;
    status: string;
    companyName: string;
}
interface PendingBooking {
    schedulingId: string;
    name: string;
    description: string;
    startAt: string;
    endAt: string;
    status: string;
}
interface PaginatedResponse<T> {
    content: T[];
}

// --- Tipagem do Contexto ---
interface NotificationContextType {
    pendingUsers: PendingUser[];
    pendingBookings: PendingBooking[];
    pendingRequestsCount: number;
    isLoading: boolean;
    fetchPendingRequests: () => void;
    handleApprove: (type: 'user' | 'scheduling', id: string) => Promise<boolean>;
    handleDecline: (type: 'user' | 'scheduling', id: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    }
    return context;
};

// --- Provider ---
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPendingRequests = useCallback(async () => {
        // 1. Verificação básica de autenticação
        if (!isAuthenticated || !user) {
            setPendingUsers([]);
            setPendingBookings([]);
            setIsLoading(false);
            return;
        }

        // 2. CORREÇÃO AQUI: Verificar estritamente se é MANAGER
        // Se for ADMIN, ele NÃO deve tentar buscar essas notificações, 
        // pois os endpoints /manager/... darão erro 403.
        const isManager = user.roles.includes('ROLE_MANAGER');

        if (!isManager) {
            // Se não for gerente (ex: é Admin ou usuário comum), limpa e para.
            setPendingUsers([]);
            setPendingBookings([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const authToken = localStorage.getItem('token');
        
        if (!authToken) {
            setIsLoading(false);
            return;
        }
        
        const headers = { Authorization: `Bearer ${authToken}` };

        try {
            const [usersResponse, bookingsResponse] = await Promise.all([
                axios.get<PaginatedResponse<PendingUser>>('http://localhost:8080/manager/users/request', { headers }),
                axios.get<PaginatedResponse<PendingBooking>>('http://localhost:8080/manager/scheduling/request', { headers })
            ]);

            setPendingUsers(usersResponse.data.content.filter(u => u.status === 'PENDING'));
            setPendingBookings(bookingsResponse.data.content.filter(b => b.status === 'PENDING'));
        } catch (error) {
            console.error("Falha ao buscar notificações:", error);
            // Em caso de erro, zera as listas para evitar travamentos na UI
            setPendingUsers([]);
            setPendingBookings([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        fetchPendingRequests();
    }, [fetchPendingRequests]);
    
    const handleRequest = async (url: string, payload?: object): Promise<boolean> => {
        const authToken = localStorage.getItem('token');
        try {
            await axios.post(url, payload, { headers: { Authorization: `Bearer ${authToken}` } });
            return true;
        } catch (err: any) {
            alert(`Erro: ${err.response?.data?.message || err.message}`);
            return false;
        }
    };
    
    const handleApprove = async (type: 'user' | 'scheduling', id: string) => {
        const url = `http://localhost:8080/manager/${type}/approve/${id}`;
        const success = await handleRequest(url);
        if (success) {
            fetchPendingRequests();
        }
        return success;
    };

    const handleDecline = async (type: 'user' | 'scheduling', id: string) => {
        const reason = prompt("Por favor, informe o motivo da rejeição (opcional):");
        if (reason === null) return false;

        const url = `http://localhost:8080/manager/${type}/reject/${id}`;
        const payload = { rejectionReason: reason };
        const success = await handleRequest(url, payload);
        if (success) {
            fetchPendingRequests();
        }
        return success;
    };

    const value = useMemo(() => ({
        pendingUsers,
        pendingBookings,
        pendingRequestsCount: pendingUsers.length + pendingBookings.length,
        isLoading,
        fetchPendingRequests,
        handleApprove,
        handleDecline,
    }), [pendingUsers, pendingBookings, isLoading, fetchPendingRequests]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};