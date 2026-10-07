'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

interface FormData {
    email: string;
    password: string;
}

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<FormData>();
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    const onSubmit = async (data: FormData) => {
        setError(null);
        try {
            const response = await axios.post(
                'http://localhost:8080/authenticate',
                data,
                { headers: { 'Content-Type': 'application/json' } },
            );
            const token = response.data;
            login(token);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(typeof msg === 'string' ? msg : String(msg) || 'Credenciais inválidas.');
        }
    };

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            
            {/* Cabeçalho do Form (Simples e Direto) */}
            <div className="flex flex-col space-y-2 mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Login
                </h2>
                <p className="text-sm text-gray-500">
                    Entre com seu e-mail e senha para acessar.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-5">
                    
                    {/* Mensagem de Erro Discreta mas Visível */}
                    {error && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Input Email */}
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            placeholder="nome@email.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            required
                            // h-12 deixa o input mais alto e clicável (Melhor UX)
                            className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600" 
                            {...register('email')}
                        />
                    </div>

                    {/* Input Senha */}
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-gray-700 font-medium">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            className="h-12 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                            {...register('password')}
                        />
                    </div>

                    {/* Botão de Ação Principal - AZUL FORTE */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md transition-all mt-2"
                    >
                        {isSubmitting ? 'Autenticando...' : 'Entrar'}
                    </Button>
                </div>
            </form>

            {/* Links Auxiliares */}
            <div className="flex flex-col items-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex justify-between w-full">
                     <a href="/recovery" className="hover:text-blue-600 hover:underline">
                        Esqueci minha senha
                    </a>
                    <a href="/request-collaborator" className="hover:text-blue-600 hover:underline font-medium text-gray-700">
                        Criar nova conta
                    </a>
                </div>
            </div>
        </div>
    );
}