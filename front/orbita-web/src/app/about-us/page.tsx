'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
    Github, 
    Linkedin, 
    ChevronLeft, 
    GraduationCap,
    Heart,
    Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutUsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            
            {/* --- CABEÇALHO SIMPLIFICADO --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.back()}>
                    <div className="flex flex-col items-center leading-none text-[#003399]">
                        <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/></svg>
                    </div>
                    <span className="text-xl font-semibold text-[#003399] tracking-tight mt-1">Órbita</span>
                </div>

                <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-[#003399] font-semibold">
                    <ChevronLeft size={18} className="mr-1" /> Voltar
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto pb-16">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
                    
                    {/* --- HERO BANNER --- */}
                    <div className="w-full relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#001738] via-[#003399] to-[#002266] p-10 md:p-16 shadow-lg border border-[#003399]/20 flex flex-col items-center text-center">
                        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

                        <div className="relative z-10 max-w-3xl flex flex-col items-center">
                            <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md text-blue-100 rounded-full text-xs font-bold mb-6 tracking-wider border border-white/20 uppercase shadow-sm">
                                <GraduationCap size={16} className="mr-2" /> FAETERJ-Petrópolis • Projeto TCC
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                                De uma ideia, à realidade.
                            </h1>
                            <p className="text-blue-100/90 text-lg md:text-xl leading-relaxed font-medium">
                                O Órbita nasceu com o propósito de modernizar a gestão de espaços corporativos, unindo arquitetura de software escalável, segurança e uma experiência de utilização premium.
                            </p>
                        </div>
                    </div>

                    {/* --- TÍTULO DA SECÇÃO DA DESENVOLVEDORA --- */}
                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <h2 className="text-3xl font-bold text-slate-800">Sobre a Autora</h2>
                        <p className="text-slate-500 mt-3 text-base">Conheça a mente responsável por dar vida a cada linha de código deste projeto.</p>
                    </div>

                    {/* --- CARTÃO DE DESTAQUE (ÚNICA DESENVOLVEDORA) --- */}
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-center md:items-start transition-all duration-300 hover:shadow-xl hover:border-[#003399]/30">
                            
                            {/* Avatar */}
                            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden bg-slate-100 shadow-md border border-slate-200 shrink-0 group">
                                <Image 
                                    src="/img/Bianca.jpeg" 
                                    alt="Foto de Bianca Araújo"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                            </div>

                            {/* Informações */}
                            <div className="flex-1 text-center md:text-left flex flex-col h-full">
                                <div className="mb-5">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#003399] rounded-lg text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                                        <Terminal size={14} /> Desenvolvedora Full Stack
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800">Bianca Araújo</h3>
                                    <p className="text-base font-bold text-slate-500 mt-1.5">
                                        Criadora & Arquiteta de Software do Órbita
                                    </p>
                                </div>

                                <div className="text-slate-600 leading-relaxed mb-8 space-y-4 text-sm md:text-base flex-1">
                                    <p>
                                        Idealizadora e desenvolvedora do projeto Órbita. Fui responsável pela arquitetura, desenho e implementação do sistema de ponta a ponta.
                                    </p>
                                    <p>
                                        A infraestrutura robusta do backend foi construída utilizando <strong>Java com Spring Boot e PostgreSQL</strong>, garantindo segurança avançada e gestão inteligente de permissões baseada em <em>Role-Based Access Control</em>.
                                    </p>
                                    <p>
                                        No frontend, a experiência visual e a interface fluida foram desenhadas e programadas com <strong>React, Next.js, Tailwind CSS e Shadcn UI</strong>, proporcionando aos utilizadores uma navegação ágil e intuitiva.
                                    </p>
                                </div>

                                {/* Redes Sociais */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6 border-t border-slate-100">
                                    <Link href="https://www.linkedin.com/in/bianca-de-araujo/" target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-colors h-12 text-sm font-bold shadow-sm">
                                            <Linkedin size={18} className="mr-2" /> Conectar no LinkedIn
                                        </Button>
                                    </Link>
                                    <Link href="https://github.com/biancadearaujo" target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-colors h-12 text-sm font-bold shadow-sm">
                                            <Github size={18} className="mr-2" /> Ver GitHub
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* --- RODAPÉ SIMPLES DA PÁGINA --- */}
                    <div className="mt-16 pt-8 border-t border-slate-200 text-center flex flex-col items-center justify-center">
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                            Desenvolvido com <Heart size={14} className="text-red-500 fill-red-500" /> por Bianca Araújo.
                        </p>
                        <p className="text-xs text-slate-400 mt-2">© {new Date().getFullYear()} FAETERJ-Petrópolis.</p>
                    </div>

                </div>
            </main>
        </div>
    );
}