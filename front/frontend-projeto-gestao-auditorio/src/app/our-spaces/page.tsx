'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { withAuth } from '@/components/withAuth';
import Image from 'next/image';
import Link from 'next/link';

// Ícones
import {
    Search,
    Menu, 
    Heart,
    Wifi,
    Users,
    Coffee,
    ArrowRight,
    Settings // Adicionado para o botão do Admin
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface VenueResponseDTO {
    id: string; 
    name: string;
    description: string;
    image?: string;
    capacity?: number;
    features?: string[];
}

function OurSpacesPage() {
    // Adicionado o hasRole com 'as any' para evitar erros de tipagem
    const { user, token, logout, hasRole } = useAuth() as any;
    const router = useRouter();

    const [spaces, setSpaces] = useState<VenueResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchVenues = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/venue?page=${currentPage}&size=6`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }); 
                
                if (response.ok) {
                    const data = await response.json();
                    
                    const sortedSpaces = (data.content || []).sort((a: any, b: any) => {
                        return (a.capacity || 0) - (b.capacity || 0);
                    });
                    
                    setSpaces(sortedSpaces);
                    setTotalPages(data.totalPages || 1); 
                }
            } catch (error) {
                console.error("Erro na requisição de espaços:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVenues();
    }, [token, currentPage]);

    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/'); 
    };

    // Função para direcionar corretamente o Dashboard
    const getDashboardLink = () => {
        if (hasRole('ROLE_ADMIN')) return '/admin-dashboard';
        if (hasRole('ROLE_MANAGER')) return '/manager-dashboard';
        return '/collaborator-dashboard';
    };

    const filteredSpaces = spaces.filter(space => 
        (space.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (space.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            
            {/* --- TOP NAVBAR --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4 md:gap-6">
                    <button className="text-slate-600 hover:text-[#003399] transition-colors xl:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(getDashboardLink())}>
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/></svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">Órbita</span>
                    </div>
                </div>

                <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                    <div className="w-full bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003399]/20 focus-within:border-[#003399]">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input 
                            type="text" 
                            placeholder="Buscar no Órbita..." 
                            className="bg-transparent border-none outline-none text-slate-700 w-full text-base placeholder-slate-500" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href={getDashboardLink()} className="hover:text-[#003399] transition-colors">Painel Geral</Link>
                        {/* Se for Administrador, pode ocultar o botão "Reservas" ou direcioná-lo para onde fizer sentido */}
                        {!hasRole('ROLE_ADMIN') && (
                            <Link href="/calendar" className="hover:text-[#003399] transition-colors">Reservas</Link>
                        )}
                        <Link href="/our-spaces" className="text-[#003399] font-semibold transition-colors">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    
                    <div className="flex items-center gap-5">
                        <span className="text-[15px] font-medium text-slate-600 hidden md:block">{user?.name?.split(' ')[0] || 'Usuário'}</span>
                        <button onClick={handleLogout} className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors">Sair</button>
                    </div>
                </div>
            </header>

            {/* --- MENU MOBILE EXPANSÍVEL --- */}
            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <div className="md:hidden bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input 
                            type="text" 
                            placeholder="Buscar no Órbita..." 
                            className="bg-transparent border-none outline-none text-slate-700 w-full text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href={getDashboardLink()} className="hover:text-[#003399]">Dashboard</Link>
                        {!hasRole('ROLE_ADMIN') && (
                            <Link href="/calendar" className="hover:text-[#003399]">Minhas Reservas</Link>
                        )}
                        <Link href="#" className="text-[#003399]">Nossos Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Meu Perfil</Link>
                    </nav>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-6 md:p-8">
                    
                    {/* Banner Estilo Landing Page (Lilás/Pastel) */}
                    <div className="w-full relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#EAE6F5] to-[#FDFBF7] p-10 md:p-14 shadow-sm border border-white mb-10 flex items-center justify-between">
                        <div className="max-w-2xl relative z-10">
                            <div className="inline-flex items-center px-4 py-1.5 bg-white/60 backdrop-blur-sm text-[#6C5B7B] rounded-full text-xs font-bold mb-6 tracking-wide shadow-sm">
                                {hasRole('ROLE_ADMIN') ? '⚙️ Visão de Auditoria' : '✨ Trabalhe com mais leveza'}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-[#355C7D] mb-5 leading-tight">
                                Mais produtividade, <br/>
                                <span className="text-[#C06C84]">menos improviso.</span>
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-xl">
                                Ambientes humanizados e colaborativos pensados para aprimorar seu bem-estar no dia a dia. Estrutura pronta para você atender desde o primeiro momento.
                            </p>
                            
                            {/* Renderização Condicional no Banner */}
                            {hasRole('ROLE_ADMIN') ? (
                                <Button className="bg-[#355C7D] hover:bg-[#2a4b66] text-white px-8 py-6 rounded-2xl font-semibold shadow-lg shadow-[#355C7D]/30 transition-all hover:-translate-y-0.5 text-base" asChild>
                                    <Link href="/registered-spaces">
                                        Gerenciar no Painel <Settings className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button className="bg-[#C06C84] hover:bg-[#a85a70] text-white px-8 py-6 rounded-2xl font-semibold shadow-lg shadow-[#C06C84]/30 transition-all hover:-translate-y-0.5 text-base" asChild>
                                    <Link href="/calendar">
                                        Quero reservar agora <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-white/40 to-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    </div>

                    {/* Diferenciais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {[
                            { icon: Heart, title: 'Ambiente Humanizado', desc: 'Acolhedor e bem iluminado' },
                            { icon: Wifi, title: 'Estrutura Completa', desc: 'Internet de alta velocidade' },
                            { icon: Users, title: 'Networking Real', desc: 'Conexões que geram valor' },
                            { icon: Coffee, title: 'Copa Equipada', desc: 'Área de convivência e café' },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-[#003399] mb-3">
                                    <item.icon size={24} />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Titulo da Seção de Grid */}
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Nossos Ambientes</h3>
                            <p className="text-slate-500 mt-1 text-sm">
                                {hasRole('ROLE_ADMIN') ? 'Catálogo visível para os utilizadores finais.' : 'Salas mobiliadas, climatizadas e prontas para uso.'}
                            </p>
                        </div>
                    </div>

                    {/* Grid de Espaços */}
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 pb-8">
                        {isLoading ? (
                            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
                                <div className="w-10 h-10 border-4 border-slate-200 border-t-[#003399] rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400 font-medium">Preparando os espaços...</p>
                            </div>
                        ) : filteredSpaces.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                                <p className="text-slate-400 font-medium">Nenhum ambiente encontrado com esse nome.</p>
                            </div>
                        ) : (
                            filteredSpaces.map((space, index) => (
                                <Card
                                    key={space.id || index} 
                                    className="group border border-slate-200 bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col p-3"
                                >
                                    {/* 1. IMAGEM COM ESPAÇAMENTO UNIFORME */}
                                    <div className="relative h-[220px] w-full overflow-hidden bg-slate-100 rounded-[16px] shrink-0">
                                        <Image
                                            src={space.image || '/placeholder.png'} 
                                            alt={space.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        
                                        {/* Gradiente escuro subtil na base da imagem */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        
                                        {/* Etiqueta "Disponível Imediatamente" com efeito Glass */}
                                        <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-md text-[11px] font-semibold tracking-wide px-3 py-1.5 rounded-full text-slate-800 shadow-sm flex items-center gap-2 border border-white/50">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                            Disponível Imediatamente
                                        </div>
                                    </div>
                                    
                                    {/* 2. CONTEÚDO ALINHADO COM A IMAGEM */}
                                    <CardContent className="px-1 pt-4 pb-0 flex-1 flex flex-col">
                                        <h3 className="text-[22px] font-bold text-[#001738] mb-1.5 group-hover:text-[#003399] transition-colors">
                                            {space.name}
                                        </h3>
                                        <p className="text-[13px] text-slate-600 leading-relaxed mb-4 line-clamp-2">
                                            {space.description || "Espaço ideal para eventos corporativos, palestras e conferências com infraestrutura de ponta inclusa."}
                                        </p>
                                        
                                        {/* Etiqueta de Capacidade Máxima */}
                                        <div className="flex flex-wrap gap-2 mt-auto mb-4">
                                            {space.capacity && (
                                                <span className="inline-flex items-center text-[12px] font-semibold bg-[#F0F4F8] text-[#001738] px-3 py-1.5 rounded-full border border-slate-100">
                                                    <Users size={14} className="mr-1.5 text-[#003399]" />
                                                    Capacidade Máxima: {space.capacity} Pessoas
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                    
                                    {/* 3. BOTÃO SÓLIDO (Condicional) */}
                                    <div className="px-1 pb-1 pt-0 mt-auto">
                                        {hasRole('ROLE_ADMIN') ? (
                                            <Button className="w-full rounded-[14px] bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors font-bold py-6 shadow-sm text-[14px]" asChild>
                                                <Link href={`/registered-spaces`}>
                                                    Editar Espaço no Painel
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button className="w-full rounded-[14px] bg-[#003399] hover:bg-[#002266] text-white transition-colors font-medium py-6 shadow-md text-[15px]" asChild>
                                                <Link href={`/calendar?venue=${space.id}`}>
                                                    Saber Mais
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                    {/* Controlos de Paginação */}
                    {!isLoading && totalPages > 1 && (
                        <div className="w-full flex justify-center items-center gap-4 mt-12 pb-8">
                            <Button 
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="bg-[#003399] hover:bg-[#002266] text-white font-medium rounded-[14px] px-6 h-12 transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md"
                            >
                                Anterior
                            </Button>
                            
                            <span className="text-[15px] font text-[#001738] bg-[#F0F4F8] px-5 py-2.5 rounded-[14px] border border-slate-200 shadow-sm">
                                Página {currentPage + 1} de {totalPages}
                            </span>
                            
                            <Button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="bg-[#003399] hover:bg-[#002266] text-white font-medium rounded-[14px] px-6 h-12 transition-colors disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed shadow-md"
                            >
                                Próxima
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default withAuth(OurSpacesPage, ['ROLE_COLLABORATOR', 'ROLE_MANAGER', 'ROLE_ADMIN']);