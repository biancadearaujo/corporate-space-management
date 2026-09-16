'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { cn } from '@/lib/utils'; // Utilitário de classes do shadcn
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

// --- Tipagens ---
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
    // --- Estados ---
    const [companies, setCompanies] = useState<Company[]>([]);
    const [openCompany, setOpenCompany] = useState(false); // Controla se o combobox de empresa está aberto
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

    // --- Busca de Empresas ao Carregar ---
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

    // --- Helpers de Formatação ---
    const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    };

    const formatRG = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1})$/, '$1-$2');
    };

    const unformatValue = (value: string) => value.replace(/\D/g, '');

    // --- Envio do Formulário ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = {
            ...formData,
            cpf: unformatValue(formData.cpf),
            rgNumber: unformatValue(formData.rgNumber),
            phoneNumber: unformatValue(formData.phoneNumber),
            photoUrl: 'https://github.com/shadcn.png', // Placeholder ou lógica de upload
        };

        try {
            const response = await axios.post('http://localhost:8080/users', payload);
            console.log('Sucesso:', response.data);
            alert('Solicitação enviada com sucesso! Aguarde aprovação.');
            window.location.href = '/login'; // Redireciona após sucesso
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao realizar cadastro. Verifique os dados.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Wrapper estilo Card (Branco com Sombra)
        <div className={cn('bg-white p-8 rounded-xl shadow-xl border border-slate-100', className)} {...props}>
            
            {/* Cabeçalho */}
            <div className="flex flex-col space-y-2 mb-8 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Criar nova conta
                </h2>
                <p className="text-sm text-slate-500">
                    Preencha seus dados para solicitar acesso ao sistema
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* --- COLUNA 1: Dados de Acesso --- */}
                    <div className="space-y-4">
                        
                        {/* Nome */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-700">Nome completo</Label>
                            <Input
                                id="username"
                                placeholder="Seu nome completo"
                                className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700">E-mail corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="voce@empresa.com"
                                className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />
                        </div>

                        {/* Senha */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-700">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600 pr-10"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-blue-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* --- COLUNA 2: Dados Pessoais --- */}
                    <div className="space-y-4">
                        
                        {/* CPF */}
                        <div className="space-y-2">
                            <Label htmlFor="cpf" className="text-slate-700">CPF</Label>
                            <Input
                                id="cpf"
                                placeholder="000.000.000-00"
                                className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                                value={formData.cpf}
                                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                                maxLength={14}
                                required
                            />
                        </div>

                        {/* Grid interna para RG e Telefone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rgNumber" className="text-slate-700">RG</Label>
                                <Input
                                    id="rgNumber"
                                    placeholder="00.000.000-0"
                                    className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                                    value={formData.rgNumber}
                                    onChange={(e) => handleInputChange('rgNumber', formatRG(e.target.value))}
                                    maxLength={12}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="text-slate-700">Telefone</Label>
                                <Input
                                    id="phoneNumber"
                                    placeholder="(00) 00000-0000"
                                    className="h-11 border-slate-300 focus:border-blue-600 focus:ring-blue-600"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', formatPhone(e.target.value))}
                                    maxLength={15}
                                    required
                                />
                            </div>
                        </div>

                        {/* COMBOBOX DE EMPRESA (Busca Inteligente) */}
                        <div className="space-y-2 flex flex-col">
                            <Label className="text-slate-700">Empresa</Label>
                            <Popover open={openCompany} onOpenChange={setOpenCompany}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCompany}
                                        className={cn(
                                            "w-full h-11 justify-between border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-normal",
                                            !formData.companyId && "text-muted-foreground"
                                        )}
                                    >
                                        {formData.companyId
                                            ? companies.find((company) => company.companyId === formData.companyId)?.name
                                            : "Selecione sua empresa..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Buscar empresa..." />
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
                                                                "mr-2 h-4 w-4",
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

                {/* Footer com Botão e Link */}
                <div className="mt-8 space-y-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md transition-all rounded-lg"
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
                        <a href="/login" className="text-blue-600 font-semibold hover:underline">
                            Acesse aqui
                        </a>
                    </div>
                </div>
            </form>
        </div>
    );
}