'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    Building2,
    ChevronRight,
    Trash2,
    Monitor,
    Plus,
    X,
    Menu,
    Bell,
    Check,
    Pencil,
    SplitSquareHorizontal // Ícone para espaços divisíveis
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// --- TIPAGEM ATUALIZADA CONFORME SEU DTO JAVA ---

interface NewEquipment {
    id?: string;
    name: string;              
    serialNumber: string;      
    conservationStatus: string;
    available: boolean;        
}

interface NewSubVenue {
    subVenueId?: string; // Para edição
    name: string;
    capacity: string;
    maximumMonths: number;
}

interface Venue {
    venueId: string;
    name: string;
    capacity: string | number;
    size: string | number;
    image: string;
    parking: boolean;
    divisible: boolean; // Adicionado para carregar na edição
    minimumHoursToCancel: number;
    venueType?: string;
    equipments?: NewEquipment[]; 
    accessibility?: AccessibilityPayload;
    subVenues?: NewSubVenue[]; // Adicionado para carregar na edição
}

interface VenueResponse {
    content: Venue[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

interface AccessibilityPayload {
    accessibilityId?: string;
    accessRamp: boolean;
    elevator: boolean;
    accessibleBathroom: boolean;
    accessibleParking: boolean;
    directionalTactileFlooring: boolean;
    brailleSignage: boolean;
    audioGuidanceSystem: boolean;
}

// --- COMPONENTES VISUAIS ---
const StatusBadge = ({ status }: { status: boolean }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
        {status ? 'Sim' : 'Não'}
    </span>
);

export default function SpaceRegistrationAndList() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dbUserName, setDbUserName] = useState<string>('');
    const [saving, setSaving] = useState(false);
    
    // --- ESTADO PARA CONTROLAR EDIÇÃO ---
    const [editingVenueId, setEditingVenueId] = useState<string | null>(null);

    // Estados de Acessibilidade
    const [hasAccessibility, setHasAccessibility] = useState(false);
    const [accessData, setAccessData] = useState<AccessibilityPayload>({
        accessRamp: false, elevator: false, accessibleBathroom: false, accessibleParking: false,
        directionalTactileFlooring: false, brailleSignage: false, audioGuidanceSystem: false,
    });

    // --- ESTADOS DE EQUIPAMENTO ---
    const [hasEquipment, setHasEquipment] = useState(false);
    const [equipmentList, setEquipmentList] = useState<NewEquipment[]>([]);
    const [tempEquipment, setTempEquipment] = useState<NewEquipment>({
        name: '',
        serialNumber: '',
        conservationStatus: 'NEW',
        available: true
    });

    // --- ESTADOS PARA ESPAÇOS DIVISÍVEIS (SUB-VENUES) ---
    const [isDivisible, setIsDivisible] = useState(false);
    const [subVenuesList, setSubVenuesList] = useState<NewSubVenue[]>([]);
    const [tempSubVenue, setTempSubVenue] = useState<NewSubVenue>({
        name: '',
        capacity: '',
        maximumMonths: 6
    });

    // Estado do Espaço
    const defaultSpaceData = {
        name: '', capacity: 0, size: 0, image: '', minimumHoursToCancel: '96',
        parking: false, venueType: 'AUDITORIUM',
        maximumMonths: 6, openingTime: '07:00:00', closingTime: '23:00:00',
        openingHours: [],
    };
    
    const [spaceData, setSpaceData] = useState(defaultSpaceData);

    // Estados da Lista
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchUserProfile = async () => {
            const authToken = token || localStorage.getItem('token');
            if (!authToken) return;
            try {
                const response = await fetch('http://localhost:8080/admin/user/me', { headers: { 'Authorization': `Bearer ${authToken}` } });
                if (response.ok) { const data = await response.json(); if (data.name || data.username) setDbUserName(data.name || data.username); }
            } catch (error) { console.error("Erro ao buscar perfil:", error); }
        };
        fetchUserProfile();
    }, [token]);

    const fetchVenues = useCallback(async (page: number, size: number) => {
        try {
            setLoadingList(true);
            const authToken = token || localStorage.getItem('token');
            if (!authToken) return;

            const response = await axios.get<VenueResponse>(
                `http://localhost:8080/admin/venue?page=${page}&size=${size}`,
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            setVenues(response.data.content);
            setCurrentPage(response.data.number);
        } catch (err) {
            console.error('Erro ao buscar espaços:', err);
        } finally {
            setLoadingList(false);
        }
    }, [token]);

    useEffect(() => {
        fetchVenues(currentPage, itemsPerPage);
    }, [fetchVenues, currentPage]);

    // Quando o tipo de espaço muda, verifica se pode ser divisível
    useEffect(() => {
        if (spaceData.venueType !== 'AUDITORIUM') {
            setIsDivisible(false);
            setSubVenuesList([]); // Limpa se não for auditório
        }
    }, [spaceData.venueType]);

    // --- HANDLERS NAVBAR ---
    const handleLogout = () => {
        if (logout) logout();
        else localStorage.removeItem('token');
        router.replace('/'); 
    };

    const handleDashboardClick = () => {
        const roles = user?.roles || []; 
        if (roles.includes('ROLE_ADMIN')) router.push('/admin-dashboard');
        else if (roles.includes('ROLE_MANAGER')) router.push('/manager-dashboard');
        else if (roles.includes('ROLE_COLLABORATOR')) router.push('/collaborator-dashboard');
        else router.push('/');
    };

    // --- HANDLERS GERAIS ---
    const handleSpaceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setSpaceData((prev) => ({ ...prev, [name]: target.checked }));
        } else {
            setSpaceData((prev) => ({ ...prev, [name]: target.value }));
        }
    };

    const handleAccessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setAccessData((prev) => ({ ...prev, [name]: checked }));
    };

    // --- HANDLERS DE EQUIPAMENTO ---
    const handleTempEquipmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'available') {
            setTempEquipment(prev => ({ ...prev, available: value === 'true' }));
        } else {
            setTempEquipment(prev => ({ ...prev, [name]: value }));
        }
    };

    const addEquipmentToList = (e: React.MouseEvent) => {
        e.preventDefault(); 
        if (!tempEquipment.name.trim() || !tempEquipment.serialNumber.trim()) {
            alert("Preencha o Nome e o Número de Série do equipamento.");
            return;
        }
        setEquipmentList(prev => [...prev, tempEquipment]);
        setTempEquipment({ name: '', serialNumber: '', conservationStatus: 'NEW', available: true });
    };

    const removeEquipmentFromList = (index: number) => {
        setEquipmentList(prev => prev.filter((_, i) => i !== index));
    };

    // --- HANDLERS DE SUB-ESPAÇOS ---
    const addSubVenueToList = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!tempSubVenue.name.trim() || !tempSubVenue.capacity) {
            alert("Preencha o Nome e a Capacidade do sub-espaço.");
            return;
        }
        setSubVenuesList(prev => [...prev, tempSubVenue]);
        setTempSubVenue({ name: '', capacity: '', maximumMonths: 6 });
    };

    const removeSubVenueFromList = (index: number) => {
        setSubVenuesList(prev => prev.filter((_, i) => i !== index));
    };

    // --- HANDLER EDIÇÃO ---
    const handleEditClick = async (venueId: string) => {
        try {
            const authToken = token || localStorage.getItem('token');
            const response = await axios.get<Venue>(`http://localhost:8080/admin/venue/${venueId}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const venue = response.data;
            
            setEditingVenueId(venue.venueId);
            setSpaceData({
                ...defaultSpaceData,
                name: venue.name,
                capacity: Number(venue.capacity),
                size: Number(venue.size),
                venueType: venue.venueType || 'AUDITORIUM',
                parking: venue.parking,
                minimumHoursToCancel: venue.minimumHoursToCancel.toString(),
            });

            // Lógica para Equipamentos
            if (venue.equipments && venue.equipments.length > 0) {
                setHasEquipment(true);
                setEquipmentList(venue.equipments);
            } else {
                setHasEquipment(false);
                setEquipmentList([]);
            }

            // Lógica para Sub-espaços
            if (venue.divisible && venue.subVenues && venue.subVenues.length > 0) {
                setIsDivisible(true);
                setSubVenuesList(venue.subVenues);
            } else {
                setIsDivisible(false);
                setSubVenuesList([]);
            }

            // Lógica para Acessibilidade
            if (venue.accessibility) {
                setHasAccessibility(true);
                setAccessData(venue.accessibility);
            } else {
                setHasAccessibility(false);
                setAccessData({
                    accessRamp: false, elevator: false, accessibleBathroom: false, accessibleParking: false,
                    directionalTactileFlooring: false, brailleSignage: false, audioGuidanceSystem: false,
                });
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("Erro ao buscar detalhes do espaço:", error);
            alert("Não foi possível carregar os dados do espaço para edição.");
        }
    };

    // Botão para cancelar edição
    const cancelEditing = () => {
        setEditingVenueId(null);
        setSpaceData(defaultSpaceData);
        setHasEquipment(false);
        setEquipmentList([]);
        setIsDivisible(false);
        setSubVenuesList([]);
        setHasAccessibility(false);
        setAccessData({
            accessRamp: false, elevator: false, accessibleBathroom: false, accessibleParking: false,
            directionalTactileFlooring: false, brailleSignage: false, audioGuidanceSystem: false,
        });
    };

    // --- SUBMIT (Criação e Edição) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação da regra de negócio para espaços divisíveis
        if (isDivisible && spaceData.venueType === 'AUDITORIUM' && subVenuesList.length === 0) {
            alert('Um espaço divisível deve ter pelo menos um sub-espaço cadastrado.');
            return;
        }

        setSaving(true);
        try {
            const authToken = token || localStorage.getItem('token');
            if (!authToken) {
                alert('Token não encontrado.');
                router.push('/login');
                return;
            }

            // 1. CRIA A ACESSIBILIDADE SEMPRE (Para não enviar nulo para o Java)
            const accessPayload = hasAccessibility ? accessData : {
                accessRamp: false, elevator: false, accessibleBathroom: false, accessibleParking: false,
                directionalTactileFlooring: false, brailleSignage: false, audioGuidanceSystem: false,
            };
            
            // Faz o POST da acessibilidade garantindo que gera um ID
            const accessResponse = await axios.post('http://localhost:8080/admin/accessibility', accessPayload, { 
                headers: { Authorization: `Bearer ${authToken}` } 
            });
            const generatedAccessibilityId = accessResponse.data.accessibilityId;
            
            // 2. MONTA O PAYLOAD DO ESPAÇO
            const venuePayload = {
                ...spaceData,
                capacity: Number(spaceData.capacity),
                size: Number(spaceData.size),
                image: spaceData.image || 'default-image.jpg', 
                accessibilityId: generatedAccessibilityId, // Agora NUNCA vai vazio!
                equipments: hasEquipment ? equipmentList : [],
                divisible: spaceData.venueType === 'AUDITORIUM' ? isDivisible : false,
                subVenues: (isDivisible && spaceData.venueType === 'AUDITORIUM') ? subVenuesList : []
            };

            // 3. ENVIA PARA O BACKEND
            if (editingVenueId) {
                await axios.put(`http://localhost:8080/admin/venue/${editingVenueId}`, venuePayload, { 
                    headers: { Authorization: `Bearer ${authToken}` } 
                });
                alert('Espaço atualizado com sucesso! ✅');
            } else {
                await axios.post('http://localhost:8080/admin/venue', venuePayload, { 
                    headers: { Authorization: `Bearer ${authToken}` } 
                });
                alert('Espaço cadastrado com sucesso! ✅');
            }

            cancelEditing();
            fetchVenues(currentPage, itemsPerPage);

        } catch (err: any) {
            console.error(err);
            // Mostra o erro exato que vem do Spring Boot para ajudar a debugar
            const errorMessage = err.response?.data?.message || err.response?.data || "Verifique os dados informados.";
            alert(`Erro do Servidor: \n${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Tem a certeza que deseja excluir este espaço? Esta ação é irreversível.")) return;
        try {
            const authToken = token || localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/admin/venue/${id}`, { headers: { Authorization: `Bearer ${authToken}` } });
            if (editingVenueId === id) {
                cancelEditing();
            }
            fetchVenues(currentPage, itemsPerPage);
        } catch (err) {
            alert("Erro ao excluir.");
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans text-slate-800">
            
            {/* --- TOP NAVBAR DA BRISA --- */}
            <header className="bg-white h-[72px] border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50 shrink-0">
                <div className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-[#003399] transition-colors xl:hidden">
                        <Menu size={28} strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={handleDashboardClick}>
                        <div className="flex flex-col items-center leading-none text-[#003399]">
                            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/></svg>
                        </div>
                        <span className="text-xl font-semibold text-[#003399] tracking-tight hidden sm:block mt-1">Órbita</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <nav className="hidden xl:flex items-center gap-5 text-[15px] font-medium text-slate-600">
                        <Link href="/admin-dashboard" className="hover:text-[#003399] transition-colors">Painel Geral</Link>
                        <Link href="/registered-companies" className="hover:text-[#003399] transition-colors">Empresas</Link>
                        <Link href="/register-manager" className="hover:text-[#003399] transition-colors">Gestores</Link>
                        <Link href="/registered-spaces" className="text-[#003399] font-semibold transition-colors">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399] transition-colors">Perfil</Link>
                    </nav>
                    <div className="h-6 w-px bg-slate-300 hidden lg:block"></div>
                    <div className="flex items-center gap-5">
                        <button className="relative p-2 text-slate-400 hover:text-[#003399] transition-colors bg-white rounded-full border border-slate-200 shadow-sm outline-none">
                            <Bell size={18} />
                        </button>
                        <span className="text-[15px] font-medium text-slate-600 hidden md:block">
                            {dbUserName ? dbUserName.split(' ')[0] : (user?.name?.split(' ')[0] || 'Admin')}
                        </span>
                        <button onClick={handleLogout} className="bg-[#003399] hover:bg-[#002266] text-white text-[15px] font-medium px-5 py-2 rounded-md transition-colors">Sair</button>
                    </div>
                </div>
            </header>

            {/* --- MENU MOBILE --- */}
            {isMobileMenuOpen && (
                <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg absolute w-full z-40 top-[72px]">
                    <nav className="flex flex-col gap-4 text-base font-medium text-slate-600">
                        <Link href="/admin-dashboard" className="hover:text-[#003399]">Painel Geral</Link>
                        <Link href="/registered-companies" className="hover:text-[#003399]">Empresas</Link>
                        <Link href="/register-manager" className="hover:text-[#003399]">Gestores</Link>
                        <Link href="/registered-spaces" className="text-[#003399] font-semibold">Espaços</Link>
                        <Link href="/profile" className="hover:text-[#003399]">Perfil</Link>
                    </nav>
                </div>
            )}

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gerenciar Espaços</h1>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <span>Dashboard</span>
                            <ChevronRight size={14} />
                            <span className="text-[#003399] font-medium">Cadastro Completo</span>
                        </div>
                    </div>
                </header>

                {/* --- FORMULÁRIO --- */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mb-10">
                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Building2 size={18} className="text-[#003399]"/> 
                            {editingVenueId ? 'Editar Espaço' : 'Novo Espaço'}
                        </h2>
                        {editingVenueId && (
                            <button onClick={cancelEditing} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                                Cancelar Edição
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nome do Espaço</label>
                                <input name="name" value={spaceData.name} onChange={handleSpaceChange} required className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm bg-slate-50 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Capacidade</label>
                                <input type="number" name="capacity" value={spaceData.capacity} onChange={handleSpaceChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm bg-slate-50 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tamanho (m²)</label>
                                <input type="number" step="0.1" name="size" value={spaceData.size} onChange={handleSpaceChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm bg-slate-50 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tipo</label>
                                <select name="venueType" value={spaceData.venueType} onChange={handleSpaceChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] text-sm transition-all">
                                    <option value="AUDITORIUM">Auditório</option>
                                    <option value="COWORKING">Coworking</option>
                                    <option value="MEETING_ROOM">Sala de Reunião</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-6 h-full pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name="parking" checked={spaceData.parking} onChange={handleSpaceChange} className="w-5 h-5 text-[#003399] rounded border-slate-300 focus:ring-[#003399]" />
                                    <span className="text-slate-700 font-medium text-sm">Estacionamento</span>
                                </label>
                                
                                {/* CHECKBOX DIVISÍVEL (Habilitado apenas para Auditórios) */}
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isDivisible} 
                                        onChange={(e) => setIsDivisible(e.target.checked)} 
                                        disabled={spaceData.venueType !== 'AUDITORIUM'}
                                        className="w-5 h-5 text-[#003399] rounded border-slate-300 focus:ring-[#003399] disabled:opacity-50" 
                                    />
                                    <span className={`font-medium text-sm transition-colors ${spaceData.venueType === 'AUDITORIUM' ? 'text-slate-700' : 'text-slate-400'}`}>
                                        É Divisível?
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* --- SECÇÃO DE SUB-ESPAÇOS (DIVISÍVEIS) --- */}
                        {isDivisible && spaceData.venueType === 'AUDITORIUM' && (
                            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                                <label className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
                                    <SplitSquareHorizontal size={18} className="text-[#003399]" /> Gerenciar Sub-Espaços (Ex: Sala A, Sala B)
                                </label>
                                
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-4">
                                        <div className="col-span-12 md:col-span-5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nome do Sub-Espaço</label>
                                            <input type="text" value={tempSubVenue.name} onChange={(e) => setTempSubVenue({...tempSubVenue, name: e.target.value})} placeholder="Ex: Auditório Ala Norte" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] transition-all" />
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Capacidade</label>
                                            <input type="number" value={tempSubVenue.capacity} onChange={(e) => setTempSubVenue({...tempSubVenue, capacity: e.target.value})} placeholder="Ex: 50" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] transition-all" />
                                        </div>
                                        <div className="col-span-12 md:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Meses Máx.</label>
                                            <input type="number" value={tempSubVenue.maximumMonths} onChange={(e) => setTempSubVenue({...tempSubVenue, maximumMonths: Number(e.target.value)})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003399]/20 focus:border-[#003399] transition-all" />
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex justify-end">
                                            <button onClick={addSubVenueToList} className="bg-[#003399] hover:bg-[#002266] text-white px-3 py-2 rounded-xl h-[38px] w-full flex items-center justify-center transition-colors shadow-sm">
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {subVenuesList.length > 0 ? (
                                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#F0F2F5]/50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                                    <tr>
                                                        <th className="px-4 py-3">Sub-Espaço</th>
                                                        <th className="px-4 py-3">Capacidade</th>
                                                        <th className="px-4 py-3">Limite Meses</th>
                                                        <th className="px-4 py-3 text-right">Ação</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {subVenuesList.map((item, index) => (
                                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-3 font-semibold text-slate-700">{item.name}</td>
                                                            <td className="px-4 py-3 text-slate-600">{item.capacity}</td>
                                                            <td className="px-4 py-3 text-slate-600">{item.maximumMonths}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button onClick={(e) => { e.preventDefault(); removeSubVenueFromList(index); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                                                                    <X size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-300">
                                            Nenhum sub-espaço adicionado.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Acessibilidade */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer mb-4">
                                <input type="checkbox" checked={hasAccessibility} onChange={() => setHasAccessibility(!hasAccessibility)} className="w-4 h-4 text-[#003399] rounded border-slate-300 focus:ring-[#003399]" />
                                <span className="text-slate-800 font-semibold text-sm">Recursos de Acessibilidade</span>
                            </label>
                            {hasAccessibility && (
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="accessRamp" checked={accessData.accessRamp} onChange={handleAccessChange} className="text-[#003399] rounded border-slate-300 focus:ring-[#003399]"/> Rampa</label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="elevator" checked={accessData.elevator} onChange={handleAccessChange} className="text-[#003399] rounded border-slate-300 focus:ring-[#003399]"/> Elevador</label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="accessibleBathroom" checked={accessData.accessibleBathroom} onChange={handleAccessChange} className="text-[#003399] rounded border-slate-300 focus:ring-[#003399]"/> Banheiro</label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="brailleSignage" checked={accessData.brailleSignage} onChange={handleAccessChange} className="text-[#003399] rounded border-slate-300 focus:ring-[#003399]"/> Braile</label>
                                </div>
                            )}
                        </div>

                        {/* --- SEÇÃO DE EQUIPAMENTOS --- */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer mb-4">
                                <input type="checkbox" checked={hasEquipment} onChange={() => setHasEquipment(!hasEquipment)} className="w-4 h-4 text-[#003399] rounded border-slate-300 focus:ring-[#003399]" />
                                <span className="text-slate-800 font-semibold flex items-center gap-2 text-sm">
                                    <Monitor size={18} /> Cadastrar Equipamentos da Sala
                                </span>
                            </label>

                            {hasEquipment && (
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-4">
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nome</label>
                                            <input type="text" name="name" value={tempEquipment.name} onChange={handleTempEquipmentChange} placeholder="Ex: Notebook Dell" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 transition-all" />
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nº Série</label>
                                            <input type="text" name="serialNumber" value={tempEquipment.serialNumber} onChange={handleTempEquipmentChange} placeholder="XYZ-123" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 transition-all" />
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Estado</label>
                                            <select name="conservationStatus" value={tempEquipment.conservationStatus} onChange={handleTempEquipmentChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 transition-all">
                                                <option value="NEW">Novo</option>
                                                <option value="USED">Usado</option>
                                                <option value="DAMAGED">Danificado</option>
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-2 flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Disponível?</label>
                                                <select name="available" value={tempEquipment.available.toString()} onChange={handleTempEquipmentChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 transition-all">
                                                    <option value="true">Sim</option>
                                                    <option value="false">Não</option>
                                                </select>
                                            </div>
                                            <button onClick={addEquipmentToList} className="bg-[#003399] hover:bg-[#002266] text-white px-3 py-2 rounded-xl h-[38px] self-end flex items-center justify-center transition-colors shadow-sm" title="Adicionar à lista">
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {equipmentList.length > 0 ? (
                                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[#F0F2F5]/50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                                    <tr>
                                                        <th className="px-4 py-3">Item</th>
                                                        <th className="px-4 py-3">Série</th>
                                                        <th className="px-4 py-3">Estado</th>
                                                        <th className="px-4 py-3">Disp.</th>
                                                        <th className="px-4 py-3 text-right">Ação</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {equipmentList.map((item, index) => (
                                                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-3 font-semibold text-slate-700">{item.name}</td>
                                                            <td className="px-4 py-3 text-slate-500">{item.serialNumber}</td>
                                                            <td className="px-4 py-3"><span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded-md text-xs font-medium">{item.conservationStatus}</span></td>
                                                            <td className="px-4 py-3">
                                                                <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded-md border ${item.available ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                                                                    {item.available ? 'SIM' : 'NÃO'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button onClick={(e) => { e.preventDefault(); removeEquipmentFromList(index); }} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                                                                    <X size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-300">
                                            Adicione equipamentos acima.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button type="submit" disabled={saving} className="bg-[#003399] hover:bg-[#002266] text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 text-sm">
                                {saving ? 'Salvando...' : <><Check size={18} /> {editingVenueId ? 'Salvar Alterações' : 'Salvar Tudo'}</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabela de Espaços (Lista) */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden mb-10">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white">
                        <h2 className="text-xl font-bold text-slate-800">Espaços Cadastrados</h2>
                        <button onClick={() => fetchVenues(0, itemsPerPage)} className="text-[#003399] text-sm font-semibold hover:underline">Atualizar Tabela</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-slate-600">
                            <thead className="bg-[#F0F2F5]/50 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Nome</th>
                                    <th className="px-6 py-4">Capacidade</th>
                                    <th className="px-6 py-4">Estacionamento</th>
                                    <th className="px-6 py-4">Divisível</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingList ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-medium">Carregando...</td></tr>
                                ) : venues.map((venue) => (
                                    <tr key={venue.venueId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{venue.name}</td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">{venue.capacity}</td>
                                        <td className="px-6 py-4"><StatusBadge status={venue.parking} /></td>
                                        <td className="px-6 py-4"><StatusBadge status={venue.divisible} /></td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(venue.venueId)} className="p-2 text-slate-400 hover:text-[#003399] hover:bg-blue-50 rounded-lg transition-colors" title="Editar Espaço">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(venue.venueId)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}