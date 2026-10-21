'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType, useState } from 'react';
import { notFound } from 'next/navigation';

export function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    allowedRoles: string[],
) {
    const WithAuthComponent = (props: P) => {
        // 1. PEGUE O 'isLoading' DO CONTEXTO
        const { isAuthenticated, user, hasRole, isLoading } = useAuth();
        const router = useRouter();
        
        // O 'isChecking' se refere ao carregamento DESTA PÁGINA
        // O 'isLoading' se refere ao carregamento DO CONTEXTO (localStorage)
        const [isChecking, setIsChecking] = useState(true);
        const [isAuthorized, setIsAuthorized] = useState(false);

        useEffect(() => {
            
            // 2. NÃO FAÇA NADA ATÉ QUE O AuthContext TERMINE DE CARREGAR
            if (isLoading) {
                return; // Esperando o AuthProvider terminar
            }

            // (Opcional, mas boa prática) A verificação 'user === undefined' não é necessária
            // 'isAuthenticated' já cobre isso (pois 'user' começa como 'null')
            // if (user === undefined) { 
            //     return;
            // }

            // 3. SE, DEPOIS DE CARREGAR, o usuário NÃO ESTIVER AUTENTICADO, redirecione
            if (!isAuthenticated) {
                router.replace('/login');
                return; // Parar a execução aqui
            }

            // 4. Se chegou aqui, o usuário ESTÁ autenticado. Agora verifique as permissões.
            const authorized = allowedRoles.some((role) => hasRole(role));

            setIsAuthorized(authorized);
            setIsChecking(false);

        // 5. ADICIONE 'isLoading' À LISTA DE DEPENDÊNCIAS
        }, [isAuthenticated, router, hasRole, isLoading]); 

        // 6. MOSTRE "CARREGANDO" ENQUANTO O CONTEXTO OU A PÁGINA ESTIVEREM VERIFICANDO
        if (isChecking || isLoading) {
            return <div>Verificando acesso...</div>;
        }

        if (!isAuthorized) {
            notFound(); // Ótimo uso! Isso mostrará a página 404.
            return null;
        }

        return <WrappedComponent {...props} />;
    };

    WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithAuthComponent;
}