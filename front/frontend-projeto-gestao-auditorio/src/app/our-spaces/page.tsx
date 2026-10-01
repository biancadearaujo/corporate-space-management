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
    Menu, // Novo ícone de menu hambúrguer adicionado
    Heart,
    Wifi,
    Users,
    Coffee,
    ArrowRight
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
    imageUrl?: string;
    capacity?: number;
    features?: string[];
}

function OurSpacesPage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();

    const [spaces, setSpaces] = useState<VenueResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await fetch('http://localhost:8080/venue', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }); 
                
                if (response.ok) {
                    const data = await response.json();
                    setSpaces(data.content || []);
                }
            } catch (error) {
                console.error("Erro na requisição de espaços:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVenues();
    }, [token]);

    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/'); 
    };

    const filteredSpaces = spaces.filter(space => 
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-800 flex flex-col">
            
            {/* --- TOP NAVBAR (ESTILO ARCHDAILY) --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
                
                {/* Esquerda: Menu e Logo */}
                <div className="flex items-center gap-4 md:gap-6">
                    <button 
                        className="text-slate-600 hover:text-[#003399] transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                    <div 
                        className="flex items-center gap-2 cursor-pointer" 
                        onClick={() => router.push('/collaborator-dashboard')}
                    >
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            {/* Ícone geométrico simulando a logo da imagem */}
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/>
                                <path d="M4 14h8v12"/>
                                <path d="M12 2v12l8-4"/>
                            </svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">
                            brisa
                        </span>
                    </div>
                </div>

                {/* Centro: Barra de Busca */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                    <div className="w-full bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003399]/20 focus-within:border-[#003399]">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input 
                            type="text" 
                            placeholder="Buscar no Brisa" 
                            className="bg-transparent border-none outline-none text-slate-700 w-full text-base placeholder-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Direita: Links e Botões de Ação */}
                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href="/collaborator-dashboard" className="hover:text-[#003399] transition-colors">Dashboard</Link>
                        <Link href="/calendar" className="hover:text-[#003399] transition-colors">Reservas</Link>
                        <Link href="#" className="text-[#003399] transition-colors">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    
                    {/* Divisor Vertical */}
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-[15px] font-medium text-slate-600 hidden md:block">
                            {user?.name?.split(' ')[0] || 'Usuário'}
                        </span>
                        {/* Botão com o azul escuro característico */}
                        <button 
                            onClick={handleLogout} 
                            className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* --- MENU MOBILE EXPANSÍVEL (Opcional, ativado pelo menu hambúrguer) --- */}
            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <div className="md:hidden bg-[#F0F2F5] rounded-md flex items-center px-4 py-2.5">
                        <Search size={20} className="text-slate-500 mr-3" />
                        <input 
                            type="text" 
                            placeholder="Buscar no Brisa..." 
                            className="bg-transparent border-none outline-none text-slate-700 w-full text-base"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href="/collaborator-dashboard" className="hover:text-[#003399]">Dashboard</Link>
                        <Link href="/calendar" className="hover:text-[#003399]">Minhas Reservas</Link>
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
                                ✨ Trabalhe com mais leveza
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-[#355C7D] mb-5 leading-tight">
                                Mais produtividade, <br/>
                                <span className="text-[#C06C84]">menos improviso.</span>
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-xl">
                                Ambientes humanizados e colaborativos pensados para aprimorar seu bem-estar no dia a dia. Estrutura pronta para você atender desde o primeiro momento.
                            </p>
                            <Button className="bg-[#C06C84] hover:bg-[#a85a70] text-white px-8 py-6 rounded-2xl font-semibold shadow-lg shadow-[#C06C84]/30 transition-all hover:-translate-y-0.5 text-base" asChild>
                                <Link href="/calendar">
                                    Quero reservar agora <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
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
                            <p className="text-slate-500 mt-1 text-sm">Salas mobiliadas, climatizadas e prontas para uso.</p>
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
                                    key={space.id|| index} 
                                    className="group overflow-hidden border border-slate-100 bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                                >
                                    <div className="aspect-w-4 aspect-h-3 relative h-56 w-full overflow-hidden bg-slate-100">
                                        <Image
                                            src={space.imageUrl || '/placeholder.svg?height=400&width=600'} 
                                            alt={space.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-slate-700 shadow-sm">
                                            Pronto para uso
                                        </div>
                                    </div>
                                    
                                    <CardHeader className="px-6 pt-6 pb-2">
                                        <CardTitle className="text-xl font-bold text-slate-800">
                                            {space.name}
                                        </CardTitle>
                                    </CardHeader>
                                    
                                    <CardContent className="px-6 flex-1">
                                        <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-3">
                                            {space.description || "Espaço ideal para reuniões, atendimentos ou foco total. Infraestrutura completa inclusa."}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {space.capacity && (
                                                <span className="inline-flex items-center text-xs font-medium bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                                                    <Users size={12} className="mr-1.5 text-slate-400" />
                                                    Até {space.capacity} pessoas
                                                </span>
                                            )}
                                            {space.features?.slice(0, 2).map((feature, j) => (
                                                <span key={j} className="inline-flex items-center text-xs font-medium bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </CardContent>
                                    
                                    <CardFooter className="px-6 pb-6 pt-4">
                                        <Button className="w-full rounded-xl bg-slate-50 hover:bg-[#003399] text-[#003399] hover:text-white border border-slate-200 transition-colors font-semibold py-6 shadow-none" asChild>
                                            <Link href={`/calendar?venue=${space.id}`}>
                                                Ver disponibilidade
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuth(OurSpacesPage, ['ROLE_COLLABORATOR', 'ROLE_MANAGER', 'ROLE_ADMIN']);