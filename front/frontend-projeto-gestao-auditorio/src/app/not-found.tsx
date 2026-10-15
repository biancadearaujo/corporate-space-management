'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Rocket, 
    ArrowLeft, 
    Home, 
    Sparkles, 
    MapPinOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function NotFoundPage() {
    const router = useRouter();
    
    const auth = useAuth() as any;
    const hasRole = auth?.hasRole;

    const getDashboardLink = () => {
        if (!hasRole) return '/login';
        if (hasRole('ROLE_ADMIN')) return '/admin-dashboard';
        if (hasRole('ROLE_MANAGER')) return '/manager-dashboard';
        if (hasRole('ROLE_COLLABORATOR')) return '/collaborator-dashboard';
        return '/login';
    };

    return (
        <div className="w-full h-screen relative flex items-center justify-center overflow-hidden bg-[#001738] font-sans">
            
            {/* --- BACKGROUND ESPACIAL (ÓRBITA) --- */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#001738] via-[#003399] to-[#00122e]"></div>
            
            {/* Luzes difusas flutuantes */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
            
            {/* Padrão de Estrelas (Grid de pontos) */}
            <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">
                
                {/* Ícone 404 Estilizado */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>
                    <div className="w-28 h-28 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative z-10 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                        <Rocket size={48} strokeWidth={1.5} className="text-blue-100" />
                    </div>
                    {/* Badge flutuante */}
                    <div className="absolute -top-4 -right-6 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-red-400 rotate-[-12deg] z-20 flex items-center gap-1">
                        <MapPinOff size={12} /> Erro 404
                    </div>
                </div>

                {/* Textos */}
                <div className="inline-flex items-center px-4 py-1.5 bg-white/5 backdrop-blur-md text-blue-100 rounded-full text-xs font-bold mb-6 tracking-widest border border-white/10 uppercase shadow-sm">
                    <Sparkles size={14} className="mr-2 text-blue-300" /> Perdidos no Espaço
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-md">
                    Você saiu da <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">
                        nossa órbita.
                    </span>
                </h1>
                
                <p className="text-blue-100/80 text-lg md:text-xl leading-relaxed font-medium max-w-xl mx-auto mb-10">
                    A página que está tentando acessar não existe, foi movida ou encontra-se numa galáxia muito distante.
                </p>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Button 
                        onClick={() => router.back()} 
                        variant="outline"
                        className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white border-white/20 hover:border-white/40 font-bold text-base transition-all backdrop-blur-sm"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Voltar no Tempo
                    </Button>
                    
                    <Button 
                        asChild
                        className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white hover:bg-blue-50 text-[#001738] border border-white font-extrabold text-base transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)]"
                    >
                        {/* AQUI ESTÁ A MÁGICA DO ROTEAMENTO DINÂMICO */}
                        <Link href={getDashboardLink()}>
                            <Home size={18} className="mr-2" /> Central de Comando (Início)
                        </Link>
                    </Button>
                </div>

                {/* Rodapé da página 404 */}
                <div className="mt-16 text-blue-200/40 text-sm font-medium">
                    Código de Erro: 404 Not Found • Sistema Órbita
                </div>
            </div>
        </div>
    );
}