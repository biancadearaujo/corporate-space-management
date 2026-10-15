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
    Settings,
    Car,
    Maximize2,
    Monitor,
    Accessibility,
    Calendar as CalendarIcon,
    Info,
    X,
    CheckCircle2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';

interface EquipmentDTO {
    id?: string;
    name: string;
    conservationStatus?: string;
    available?: boolean;
}

interface AccessibilityDTO {
    accessRamp?: boolean;
    elevator?: boolean;
    accessibleBathroom?: boolean;
    accessibleParking?: boolean;
    directionalTactileFlooring?: boolean;
    brailleSignage?: boolean;
    audioGuidanceSystem?: boolean;
}

interface VenueResponseDTO {
    venueId: string; // Corrigido para bater com o DTO do Java
    id?: string;
    name: string;
    description?: string;
    image?: string;
    capacity?: number | string;
    size?: number | string;
    parking?: boolean;
    divisible?: boolean;
    venueType?: string;
    equipments?: EquipmentDTO[];
    accessibility?: AccessibilityDTO;
}

const getVenueTypeLabel = (type?: string) => {
    switch (type) {
        case 'AUDITORIUM': return 'Auditório';
        case 'MEETING_ROOM': return 'Sala de Reunião';
        case 'COWORKING': return 'Coworking';
        default: return 'Espaço Corporativo';
    }
};

function OurSpacesPage() {
    const { user, token, logout, hasRole } = useAuth() as any;
    const router = useRouter();

    const [spaces, setSpaces] = useState<VenueResponseDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Estado para o Modal de "Raio-X / Detalhes do Espaço"
    const [selectedSpace, setSelectedSpace] = useState<VenueResponseDTO | null>(null);

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
                        return Number(a.capacity || 0) - Number(b.capacity || 0);
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

        if (token) fetchVenues();
    }, [token, currentPage]);

    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/login'); 
    };

    const getDashboardLink = () => {
        if (hasRole('ROLE_ADMIN')) return '/admin-dashboard';
        if (hasRole('ROLE_MANAGER')) return '/manager-dashboard';
        return '/collaborator-dashboard';
    };

    const filteredSpaces = spaces.filter(space => 
        (space.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (getVenueTypeLabel(space.venueType)).toLowerCase().includes(searchTerm.toLowerCase())
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
                            placeholder="Buscar por nome ou tipo (ex: Auditório, Vetor)..." 
                            className="bg-transparent border-none outline-none text-slate-700 w-full text-base placeholder-slate-500" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href={getDashboardLink()} className="hover:text-[#003399] transition-colors">Painel Geral</Link>
                        {hasRole('ROLE_ADMIN') && (
                            <Link href="/register-manager" className="hover:text-[#003399] transition-colors">Empresas</Link>
                        )}
                        {!hasRole('ROLE_ADMIN') && (
                            <Link href="/calendar" className="hover:text-[#003399] transition-colors">Reservas</Link>
                        )}
                        {hasRole('ROLE_MANAGER') && (
                            <Link href="/our-spaces" className="text-[#003399] font-semibold transition-colors">Espaços</Link>
                        )}
                        {hasRole('ROLE_COLLABORATOR') && (
                            <Link href="/our-spaces" className="text-[#003399] font-semibold transition-colors">Espaços</Link>
                        )}
                        {hasRole('ROLE_ADMIN') && (
                            <Link href="/register-manager" className="hover:text-[#003399] transition-colors">Gestores</Link>
                        )}
                        {hasRole('ROLE_ADMIN') && (
                            <Link href="/registered-spaces" className="text-[#003399] font-semibold transition-colors">Espaços</Link>
                        )}
                        {hasRole('ROLE_ADMIN') && (
                            <Link href="/our-spaces" className="hover:text-[#003399] transition-colors">Catálago</Link>
                        )}
                        {hasRole('ROLE_MANAGER') && (
                            <Link href="/my-team" className="hover:text-[#003399] transition-colors">Minha Equipe</Link>
                        )}
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                        <Link href="/about-us" className="hover:text-[#003399] font-semibold transition-colors">Sobre</Link>
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
                    
                    {/* Banner */}
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
                                Compare a capacidade, equipamentos e infraestrutura de cada sala antes de fazer o seu agendamento.
                            </p>
                            
                            {hasRole('ROLE_ADMIN') ? (
                                <Button className="bg-[#355C7D] hover:bg-[#2a4b66] text-white px-8 py-6 rounded-2xl font-semibold shadow-lg shadow-[#355C7D]/30 transition-all hover:-translate-y-0.5 text-base" asChild>
                                    <Link href="/registered-spaces">
                                        Gerenciar no Painel <Settings className="w-5 h-5 ml-2" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button className="bg-[#C06C84] hover:bg-[#a85a70] text-white px-8 py-6 rounded-2xl font-semibold shadow-lg shadow-[#C06C84]/30 transition-all hover:-translate-y-0.5 text-base" asChild>
                                    <Link href="/calendar">
                                        Ir para o Calendário Geral <ArrowRight className="w-5 h-5 ml-2" />
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

                    {/* Título da Seção de Grid */}
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Nossos Ambientes</h3>
                            <p className="text-slate-500 mt-1 text-sm">
                                Veja os detalhes de cada espaço ou clique em reservar para abrir a agenda específica da sala.
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
                            filteredSpaces.map((space, index) => {
                                const actualId = space.venueId || space.id;
                                return (
                                    <Card
                                        key={actualId || index} 
                                        className="group border border-slate-200 bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col p-3"
                                    >
                                        {/* IMAGEM E BADGE DE TIPO */}
                                        <div className="relative h-[220px] w-full overflow-hidden bg-slate-100 rounded-[16px] shrink-0">
                                            <Image
                                                src={space.image || '/placeholder.png'} 
                                                alt={space.name}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-full text-[#003399] shadow-sm flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                {getVenueTypeLabel(space.venueType)}
                                            </div>
                                        </div>
                                        
                                        {/* CONTEÚDO INFORMATIVO */}
                                        <CardContent className="px-2 pt-4 pb-0 flex-1 flex flex-col">
                                            <h3 className="text-[22px] font-bold text-[#001738] mb-2 group-hover:text-[#003399] transition-colors">
                                                {space.name}
                                            </h3>
                                            
                                            {/* Badges de Especificações Rápidas */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {space.capacity && (
                                                    <span className="inline-flex items-center text-[11px] font-bold bg-[#F0F4F8] text-[#001738] px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                        <Users size={13} className="mr-1.5 text-[#003399]" />
                                                        Até {space.capacity} pessoas
                                                    </span>
                                                )}
                                                {space.size && (
                                                    <span className="inline-flex items-center text-[11px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60">
                                                        <Maximize2 size={13} className="mr-1.5 text-slate-400" />
                                                        {space.size} m²
                                                    </span>
                                                )}
                                                {space.parking && (
                                                    <span className="inline-flex items-center text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                                                        <Car size={13} className="mr-1.5" />
                                                        Estacionamento
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                        
                                        {/* BOTÕES DE AÇÃO */}
                                        <div className="px-1 pb-1 pt-2 mt-auto flex gap-2">
                                            <Button 
                                                variant="outline"
                                                onClick={() => setSelectedSpace(space)}
                                                className="flex-1 rounded-[14px] border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-5 text-[13px]"
                                            >
                                                <Info size={16} className="mr-1.5 text-[#003399]" />
                                                Ficha Técnica
                                            </Button>

                                            {hasRole('ROLE_ADMIN') ? (
                                                <Button className="flex-1 rounded-[14px] bg-slate-800 hover:bg-slate-900 text-white font-semibold py-5 text-[13px]" asChild>
                                                    <Link href={`/registered-spaces`}>
                                                        Editar
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button className="flex-1 rounded-[14px] bg-[#003399] hover:bg-[#002266] text-white font-semibold py-5 shadow-md text-[13px]" asChild>
                                                    <Link href={`/calendar?venue=${actualId}`}>
                                                        <CalendarIcon size={15} className="mr-1.5" />
                                                        Reservar
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>

                    {/* Paginação */}
                    {!isLoading && totalPages > 1 && (
                        <div className="w-full flex justify-center items-center gap-4 mt-12 pb-8">
                            <Button 
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="bg-[#003399] hover:bg-[#002266] text-white font-medium rounded-[14px] px-6 h-12 transition-colors disabled:bg-slate-300"
                            >
                                Anterior
                            </Button>
                            <span className="text-[15px] font-medium text-[#001738] bg-[#F0F4F8] px-5 py-2.5 rounded-[14px] border border-slate-200">
                                Página {currentPage + 1} de {totalPages}
                            </span>
                            <Button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="bg-[#003399] hover:bg-[#002266] text-white font-medium rounded-[14px] px-6 h-12 transition-colors disabled:bg-slate-300"
                            >
                                Próxima
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* --- MODAL DE FICHA TÉCNICA DO ESPAÇO --- */}
            {selectedSpace && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="relative h-48 w-full bg-slate-100">
                            <Image
                                src={selectedSpace.image || '/placeholder.png'}
                                alt={selectedSpace.name}
                                fill
                                className="object-cover"
                            />
                            <button 
                                onClick={() => setSelectedSpace(null)}
                                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-md transition-colors"
                            >
                                <X size={18} />
                            </button>
                            <div className="absolute bottom-3 left-4 bg-[#003399] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                                {getVenueTypeLabel(selectedSpace.venueType)}
                            </div>
                        </div>

                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">{selectedSpace.name}</h3>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs font-semibold text-slate-600">
                                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md"><Users size={14} className="text-[#003399]"/> {selectedSpace.capacity} lugares</span>
                                    {selectedSpace.size && <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md"><Maximize2 size={14} className="text-[#003399]"/> {selectedSpace.size} m²</span>}
                                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md"><Car size={14} className="text-[#003399]"/> Estacionamento: {selectedSpace.parking ? 'Sim' : 'Não'}</span>
                                </div>
                            </div>

                            {/* Equipamentos Disponíveis */}
                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Monitor size={14} className="text-[#003399]" /> Equipamentos da Sala
                                </h4>
                                {selectedSpace.equipments && selectedSpace.equipments.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSpace.equipments.map((eq, i) => (
                                            <span key={i} className="text-xs font-semibold bg-indigo-50 text-[#003399] px-3 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> {eq.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400">Nenhum equipamento específico listado.</p>
                                )}
                            </div>

                            {/* Acessibilidade */}
                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Accessibility size={14} className="text-[#003399]" /> Recursos de Acessibilidade
                                </h4>
                                {selectedSpace.accessibility && Object.values(selectedSpace.accessibility).some(v => v === true) ? (
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                                        {selectedSpace.accessibility.accessRamp && <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-600"/> Rampa de Acesso</span>}
                                        {selectedSpace.accessibility.elevator && <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-600"/> Elevador</span>}
                                        {selectedSpace.accessibility.accessibleBathroom && <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-600"/> Banheiro Adaptado</span>}
                                        {selectedSpace.accessibility.brailleSignage && <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-600"/> Sinalização em Braile</span>}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400">Sem recursos adicionais cadastrados.</p>
                                )}
                            </div>

                            {!hasRole('ROLE_ADMIN') && (
                                <div className="pt-4 border-t border-slate-100 flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setSelectedSpace(null)}
                                        className="flex-1 rounded-xl py-5 font-semibold"
                                    >
                                        Fechar
                                    </Button>
                                    <Button 
                                        className="flex-1 rounded-xl bg-[#003399] hover:bg-[#002266] text-white py-5 font-bold"
                                        asChild
                                    >
                                        <Link href={`/calendar?venue=${selectedSpace.venueId || selectedSpace.id}&openModal=true`}>
                                            Agendar este Espaço
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuth(OurSpacesPage, ['ROLE_COLLABORATOR', 'ROLE_MANAGER', 'ROLE_ADMIN']);