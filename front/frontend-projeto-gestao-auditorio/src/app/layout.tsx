import './globals.css';
import React from 'react';
import AccessibilityWidget from '@/components/ui/acessibilityWidget';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

export const metadata = {
    title: 'GECC',
    description: 'Sistema Gestão de Espaços Corporativos',
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
