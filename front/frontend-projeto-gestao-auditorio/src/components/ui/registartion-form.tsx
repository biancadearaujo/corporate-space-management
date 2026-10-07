'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Company {
    companyId: string;
    name: string;
}

interface RegistrationFormData {
    username: string;
    email: string;
    password: string;
    cpf: string;
    phoneNumber: string;
    rgNumber: string;
    companyId: string;
}

export function RegistrationForm({ className, ...props }: React.ComponentProps<'div'>) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [openCompany, setOpenCompany] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState<RegistrationFormData>({
        username: '',
        email: '',
        password: '',
        cpf: '',
        phoneNumber: '',
        rgNumber: '',
        companyId: '',
    });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('http://localhost:8080/companies');
                const data = response.data;
                if (data && Array.isArray(data.content)) {
                    setCompanies(data.content);
                }
            } catch (error) {
                console.error('Erro ao buscar empresas:', error);
            }
        };
        fetchCompanies();
    }, []);

    const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formatCPF = (value: string) => {
        let v = value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length <= 3) return v;
        if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
        if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
        return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
    };

    const formatRG = (value: string) => {
        let v = value.replace(/\D/g, '');
        if (v.length > 9) v = v.slice(0, 9);
        if (v.length <= 2) return v;
        if (v.length <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`;
        if (v.length <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
        return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}-${v.slice(8)}`;
    };

    const formatPhone = (value: string) => {
        let v = value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length === 0) return '';
        if (v.length <= 2) return `(${v}`;
        if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
        if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
        return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    };

    const unformatValue = (value: string) => value.replace(/\D/g, '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            cpf: unformatValue(formData.cpf),
            rgNumber: unformatValue(formData.rgNumber),
            phoneNumber: unformatValue(formData.phoneNumber),
            photoUrl: 'https://github.com/shadcn.png',
        };

        try {
            const response = await axios.post('http://localhost:8080/users', payload);
            console.log('Sucesso:', response.data);
            alert('Solicitação enviada com sucesso! Aguarde aprovação.');
            window.location.href = '/login';
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao realizar cadastro. Verifique os dados.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // AUMENTADO: p-8 sm:p-10 para dar mais respiro interno
        <div className={cn('bg-white p-8 sm:p-10 rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100', className)} {...props}>
            
            <div className="flex flex-col items-center justify-center lg:hidden mb-6">
                <div className="text-[#003399] mb-3">
                    <svg width="36" height="42" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/>
                    </svg>
                </div>
            </div>

            <div className="mb-6 border-b border-slate-100 pb-5 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Criar Nova Conta</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Preencha os dados abaixo para se registar.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* AUMENTADO: gap-6 para separar melhor as duas colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-xs font-bold text-[#003399] uppercase tracking-wider ml-1">Nome completo</Label>
                            {/* AUMENTADO: h-11 nas caixas de texto */}
                            <Input
                                id="username"
                                placeholder="Seu nome completo"
                                className="h-11 rounded-xl border border-slate-300 focus-visible:border-[#003399] focus-visible:ring-1 focus-visible:ring-[#003399]/20 text-sm"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold text-[#003399] uppercase tracking-wider ml-1">E-mail corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@email.com"
                                className="h-11 rounded-xl border border-slate-300 focus-visible:border-[#003399] focus-visible:ring-1 focus-visible:ring-[#003399]/20 text-sm"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold text-[#003399] uppercase tracking-wider ml-1">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl border border-slate-300 focus-visible:border-[#003399] focus-visible:ring-1 focus-visible:ring-[#003399]/20 pr-10 text-sm"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-[#003399]"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cpf" className="text-xs font-bold text-[#003399] uppercase tracking-wider ml-1">CPF</Label>
                            <Input
                                id="cpf"
                                placeholder="000.000.000-00"
                                className="h-11 rounded-xl border border-slate-300 focus-visible:border-[#003399] focus-visible:ring-1 focus-visible:ring-[#003399]/20 text-sm"
                                value={formData.cpf}
                                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                                maxLength={14}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rgNumber" className="text-xs font-bold text-[#003399] uppercase tracking-wider ml-1">RG</Label>
                                <Input
                                    id="rgNumber"
                                    placeholder="00.000.000-0"
                                    className="h-11 rounded-xl border border-slate-300 focus-visible:border-[#003399] focus-visible:ring-1 focus-visible:ring-[#003399]/20 text-sm"
                                    value={formData.rgNumber}
                                    onChange={(e) => handleInputChange('rgNumber', formatRG(e.target.value))}
                                    maxLength={12}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-xs font-bold text-[#003399] uppercase tracking-wider ml-1">Telefone</Label>
                                <Input
                                    id="phoneNumber"
                                    placeholder="(00) 00000-0000"
                                    className="h-11 rounded-xl border border-slate-300 focus-visible:border-[#003399] focus-visible:ring-1 focus-visible:ring-[#003399]/20 text-sm"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', formatPhone(e.target.value))}
                                    maxLength={15}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label className="text-xs font-bold text-[#003399] uppercase tracking-wider ml-1">Empresa</Label>
                            <Popover open={openCompany} onOpenChange={setOpenCompany}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCompany}
                                        className={cn(
                                            "w-full h-11 justify-between rounded-xl border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-normal text-sm",
                                            !formData.companyId && "text-slate-500"
                                        )}
                                    >
                                        {formData.companyId
                                            ? companies.find((company) => company.companyId === formData.companyId)?.name
                                            : "Selecione..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 rounded-xl" align="start">
                                    <Command>
                                        <CommandInput placeholder="Buscar..." className="h-11" />
                                        <CommandList>
                                            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                                            <CommandGroup>
                                                {companies.map((company) => (
                                                    <CommandItem
                                                        key={company.companyId}
                                                        value={company.name}
                                                        onSelect={() => {
                                                            handleInputChange('companyId', company.companyId);
                                                            setOpenCompany(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4 text-[#003399]",
                                                                formData.companyId === company.companyId ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {company.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-5">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-12 w-full rounded-xl bg-[#003399] hover:bg-[#002266] text-white font-bold text-base shadow-md transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                            </>
                        ) : (
                            'Solicitar Cadastro'
                        )}
                    </Button>

                    <div className="text-center text-sm text-slate-500">
                        Já possui credenciais?{' '}
                        <Link href="/login" className="text-[#003399] font-semibold hover:underline">
                            Acesse aqui
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}