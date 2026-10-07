'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RecoveryFormProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function RecoveryForm({ className, ...props }: RecoveryFormProps) {
    return (
        <div className={cn('flex flex-col gap-6 w-full', className)} {...props}>
            <Card className="w-full rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100 p-2 sm:p-4 bg-white">
                <CardHeader className="text-center sm:text-left pb-4">
                    
                    {/* Logo Mobile aparece apenas em ecrãs pequenos */}
                    <div className="flex flex-col items-center justify-center lg:hidden mb-6">
                        <div className="text-[#003399] mb-3">
                            <svg width="40" height="46" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/>
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#003399] tracking-tight">Órbita</h1>
                    </div>

                    <CardTitle className="text-2xl font-bold text-slate-800">
                        Redefinir senha
                    </CardTitle>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Digite seu e-mail corporativo para receber as instruções.
                    </p>
                </CardHeader>
                
                <CardContent className="w-full">
                    <form className="w-full">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[11px] font-bold text-[#003399] uppercase tracking-wider ml-1">
                                    E-mail
                                </Label>
                                <div className="flex items-center px-4 py-3 rounded-xl border border-slate-300 bg-white focus-within:border-[#003399] focus-within:ring-2 focus-within:ring-[#003399]/10 transition-all shadow-sm">
                                    <Mail size={18} className="text-slate-400 mr-3 shrink-0" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="bianca@email.com"
                                        required
                                        className="w-full border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm text-slate-800 font-medium placeholder:text-slate-400 shadow-none"
                                    />
                                </div>
                            </div>
                            
                            <Button
                                type="submit"
                                className="w-full py-6 rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition-all shadow-md text-sm"
                            >
                                Enviar link de recuperação
                            </Button>

                            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#003399] transition-colors">
                                    <ArrowLeft size={16} /> Voltar para o Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}