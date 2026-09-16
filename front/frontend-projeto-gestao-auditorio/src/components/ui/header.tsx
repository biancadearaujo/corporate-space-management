'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Bell,
    User,
    Settings,
    ChevronRight,
    LogOut,
    UserCircle,
    ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

function UserAuthButton() {
    const { isAuthenticated, user, logout } = useAuth();

    if (!isAuthenticated || !user) {
        return (
            <Link
                href="/login"
                className="flex items-center gap-2 rounded-md bg-teal-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
            >
                <User size={16} />
                Entrar
            </Link>
        );
    }

    const userRole = user.roles[0] || 'Usuário';
    const isAdmin = user.roles.includes('ROLE_ADMIN');
    const isManager = user.roles.includes('ROLE_MANAGER');

    const managementDashboardLink = isAdmin ? '/admin-dashboard' : '/manager-dashboard';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    className="flex items-center gap-2 rounded-md bg-teal-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
                >
                    <UserCircle size={16} />
                    {userRole.replace('ROLE_', '').charAt(0).toUpperCase() +
                     userRole.replace('ROLE_', '').slice(1).toLowerCase()}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            Conectado como {userRole.replace('ROLE_', '').toLowerCase()}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                    </Link>
                </DropdownMenuItem>

                {(isAdmin || isManager) && (
                    <DropdownMenuItem>
                        <Link href={managementDashboardLink} className="flex items-center w-full">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>Área Gestão</span>
                        </Link>
                    </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function Header() {
    const { hasRole } = useAuth();
    const { pendingRequestsCount } = useNotifications();
    const notificationLink = hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER') 
        ? "/manager-dashboard/requests" 
        : "/pending-bookings";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/assets/logo.svg"
                            alt="Logo"
                            width={120}
                            height={40}
                            className="h-10 w-auto"
                        />
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link
                            href="/client-service"
                            className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                        >
                            Atendimento ao Cliente
                        </Link>
                        
                        {(hasRole('ROLE_ADMIN') || hasRole('ROLE_MANAGER')) && (
                            <Link
                                href="/register"
                                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                            >
                                Cadastrar Colaborador
                            </Link>
                        )}

                        <Link
                            href="/contact"
                            className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                        >
                            Contato
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            href={notificationLink}
                            className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                            <Bell size={20} />
                            {pendingRequestsCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                    {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                                </span>
                            )}
                        </Link>
                        <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                            <Settings size={20} />
                        </button>

                        <UserAuthButton />
                    </div>
                    <button className="flex md:hidden items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}