'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
    const [showPassword, setShowPassword] = useState(false);
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
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Email ou senha incorretos. Tente novamente.');
            } else {
                // Tenta pegar a mensagem do Spring Boot, senão cai na mensagem padrão.
                const msg = err.response?.data?.message || err.response?.data?.error;
                setError(msg ? String(msg) : 'Ocorreu um erro ao tentar fazer login.');
            }
        }
    };

    return (
        <div className={cn('animate-in fade-in duration-300 w-full', className)} {...props}>
            
            {/* Cabeçalho do Form */}
            <div className="text-center lg:text-left mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                    Insira as suas credenciais para aceder ao painel.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Alerta de Erro Premium */}
                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 animate-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Input Email */}
                <div>
                    <Label htmlFor="email" className="block text-[11px] font-bold text-[#003399] uppercase tracking-wider mb-2 ml-1">Email Corporativo</Label>
                    <div className="flex items-center px-4 py-3 rounded-xl border border-slate-300 bg-white focus-within:border-[#003399] focus-within:ring-2 focus-within:ring-[#003399]/10 transition-all shadow-sm">
                        <Mail size={18} className="text-slate-400 mr-3 shrink-0" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="nome@email.com"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            {...register('email')}
                            required
                            className="bg-transparent border-0 p-0 h-auto outline-none w-full text-sm text-slate-800 font-medium placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                </div>

                {/* Input Senha */}
                <div>
                    <div className="flex items-center justify-between mb-2 ml-1">
                        <Label htmlFor="password" className="text-[11px] font-bold text-[#003399] uppercase tracking-wider">Senha</Label>
                        <Link href="/recovery" className="text-xs font-semibold text-slate-500 hover:text-[#003399] transition-colors">
                            Esqueceu a senha?
                        </Link>
                    </div>
                    <div className="flex items-center px-4 py-3 rounded-xl border border-slate-300 bg-white focus-within:border-[#003399] focus-within:ring-2 focus-within:ring-[#003399]/10 transition-all shadow-sm relative">
                        <Lock size={18} className="text-slate-400 mr-3 shrink-0" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('password')}
                            required
                            className="bg-transparent border-0 p-0 h-auto outline-none w-full text-sm text-slate-800 font-medium placeholder:text-slate-400 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pr-10"
                        />
                        {/* Botão de Ver/Ocultar Senha */}
                        <button
                            type="button"
                            className="absolute right-4 text-slate-400 hover:text-[#003399] transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Botão de Ação Principal */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl bg-[#003399] hover:bg-[#002266] text-white font-bold text-sm shadow-md transition-all mt-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Autenticando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </Button>
            </form>

            {/* Links Auxiliares no Rodapé */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                    Ainda não tem conta?{' '}
                    {/* Pode alterar o href="/register" de volta para "/request-collaborator" se a sua rota se chamar assim */}
                    <Link href="/request-collaborator" className="font-semibold text-[#003399] hover:underline">
                        Criar nova conta
                    </Link>
                </p>
            </div>
        </div>
    );
}