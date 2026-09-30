'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
    roles: string[];
    cnpj: string;
    companyId: string;
    iat: number;
    exp: number;
    name: string;
}

interface User {
    email: string;
    roles: string[];
    cnpj: string;
    companyId: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    hasRole: (role: string) => boolean;
    isAuthenticated: boolean;
    isLoading: boolean; // 1. ADICIONE O ESTADO DE CARREGANDO
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // 2. ADICIONE O STATE
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        try {
            if (storedToken) {
                const decodedToken = jwtDecode<DecodedToken>(storedToken);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUser({
                        email: decodedToken.sub,
                        roles: decodedToken.roles,
                        cnpj: decodedToken.cnpj,
                        companyId: decodedToken.companyId,
                        name: decodedToken.name,
                    });
                } else {
                    localStorage.removeItem('token');
                }
            }
        } catch (error) {
            console.error('Failed to decode token:', error);
            localStorage.removeItem('token');
        } finally {
            setIsLoading(false); // 3. INDIQUE QUE O CARREGAMENTO ACABOU (COM SUCESSO OU FALHA)
        }
    }, []);

    const login = (newToken: string) => {
        try {
            const decodedToken = jwtDecode<DecodedToken>(newToken);
            const roles = decodedToken.roles || [];

            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser({
                email: decodedToken.sub,
                roles: roles,
                cnpj: decodedToken.cnpj,
                companyId: decodedToken.companyId,
                name: decodedToken.name,
            });

            if (roles.includes('ROLE_ADMIN')) {
                router.push('/admin-dashboard');
            } else if (roles.includes('ROLE_MANAGER')) {
                 router.push('/manager-dashboard');
            } else if (roles.includes('ROLE_COLLABORATOR')) {
                 router.push('/collaborator-dashboard');
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Failed to process token on login:', error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    const hasRole = (role: string): boolean => {
        return user?.roles.includes(role) ?? false;
    };

    const isAuthenticated = !!user;

    const value = {
        user,
        token,
        login,
        logout,
        hasRole,
        isAuthenticated,
        isLoading, // 4. FORNEÇA O ESTADO DE CARREGANDO
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};