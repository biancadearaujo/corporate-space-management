import './globals.css';
import React from 'react';
import AccessibilityWidget from '@/components/ui/acessibilityWidget';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

const svgIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='28' viewBox='0 0 24 28' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 2v20l8 4 8-4V6l-8-4-8 4z'/%3E%3Cpath d='M4 14h8v12'/%3E%3Cpath d='M12 2v12l8-4'/%3E%3C/svg%3E";

export const metadata = {
    title: 'ÓRBITA',
    description: 'Sistema Gestão de Espaços Corporativos',
    icons: {
        icon: svgIcon,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body>
                <AuthProvider>
                    <NotificationProvider>
                        <AccessibilityWidget />
                        {children}
                    </NotificationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}