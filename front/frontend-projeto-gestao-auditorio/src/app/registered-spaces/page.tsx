'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    LayoutGrid,
    User,
    Box,
    Settings,
    LogOut,
    Menu,
    Check,
    Building2,
    ChevronRight,
    Search,
    Filter,
    Trash2,
    Monitor,
    Plus,
    X
} from 'lucide-react';

// --- TIPAGEM ATUALIZADA CONFORME SEU DTO JAVA ---

interface NewEquipment {
    name: string;              // @NotNull(message = "Name cannot be null.")
    serialNumber: string;      // @NotNull(message = "Serial number cannot be null.")
    conservationStatus: string;// @NotNull(message = "Conservation Status cannot be null.")
    available: boolean;        // @NotNull(message = "Available status cannot be null.")
}

interface Venue {
    venueId: string;
    name: string;
    capacity: string | number;
    size: string | number;
    image: string;
    parking: boolean;
    minimumHoursToCancel: number;
    venueType?: string;
    equipments?: NewEquipment[]; 
}

interface VenueResponse {
    content: Venue[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

interface AccessibilityPayload {
    accessRamp: boolean;
    elevator: boolean;
    accessibleBathroom: boolean;
    accessibleParking: boolean;
    directionalTactileFlooring: boolean;
    brailleSignage: boolean;
    audioGuidanceSystem: boolean;
}

// --- COMPONENTES VISUAIS ---
const SidebarItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; }) => (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <div>{icon}</div>
        <span className="font-medium text-sm">{label}</span>
    </div>
);

const StatusBadge = ({ status }: { status: boolean }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
        {status ? 'Sim' : 'Não'}
    </span>
);

export default function SpaceRegistrationAndList() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Estados de Acessibilidade
    const [hasAccessibility, setHasAccessibility] = useState(false);
    const [accessData, setAccessData] = useState<AccessibilityPayload>({
        accessRamp: false, elevator: false, accessibleBathroom: false, accessibleParking: false,
        directionalTactileFlooring: false, brailleSignage: false, audioGuidanceSystem: false,
    });

    // --- ESTADOS DE EQUIPAMENTO (ATUALIZADO) ---
    const [hasEquipment, setHasEquipment] = useState(false);
    const [equipmentList, setEquipmentList] = useState<NewEquipment[]>([]);
    
    // Estado temporário para o input (Campos: name, serialNumber, status, available)
    const [tempEquipment, setTempEquipment] = useState<NewEquipment>({
        name: '',
        serialNumber: '',
        conservationStatus: 'NEW',
        available: true
    });

    // Estado do Espaço
    const [spaceData, setSpaceData] = useState({
        name: '', capacity: 0, size: 0, image: '', minimumHoursToCancel: '96',
        parking: false, venueType: 'AUDITORIUM', divisible: false,
        maximumMonths: 6, openingTime: '07:00:00', closingTime: '23:00:00',
        subVenues: [], openingHours: [],
    });

    // Estados da Lista
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;

    const fetchVenues = useCallback(async (page: number, size: number) => {
        try {
            setLoadingList(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get<VenueResponse>(
                `http://localhost:8080/admin/venue?page=${page}&size=${size}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setVenues(response.data.content);
            setCurrentPage(response.data.number);
        } catch (err) {
            console.error('Erro ao buscar espaços:', err);
        } finally {
            setLoadingList(false);
        }
    }, []);

    useEffect(() => {
        fetchVenues(currentPage, itemsPerPage);
    }, [fetchVenues, currentPage]);

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

    // --- HANDLERS DE EQUIPAMENTO (ATUALIZADOS) ---
    const handleTempEquipmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Tratamento especial para booleano no Select
        if (name === 'available') {
            setTempEquipment(prev => ({ ...prev, available: value === 'true' }));
        } else {
            setTempEquipment(prev => ({ ...prev, [name]: value }));
        }
    };

    const addEquipmentToList = (e: React.MouseEvent) => {
        e.preventDefault(); 
        // Validação simples antes de adicionar
        if (!tempEquipment.name.trim() || !tempEquipment.serialNumber.trim()) {
            alert("Preencha o Nome e o Número de Série do equipamento.");
            return;
        }
        
        setEquipmentList(prev => [...prev, tempEquipment]);
        
        // Limpa o input mantendo valores padrão
        setTempEquipment({ name: '', serialNumber: '', conservationStatus: 'NEW', available: true });
    };

    const removeEquipmentFromList = (index: number) => {
        setEquipmentList(prev => prev.filter((_, i) => i !== index));
    };

    // --- SUBMIT ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Token não encontrado.');
                router.push('/login');
                return;
            }

            const accessPayload = hasAccessibility ? accessData : {
                accessRamp: false, elevator: false, accessibleBathroom: false, accessibleParking: false,
                directionalTactileFlooring: false, brailleSignage: false, audioGuidanceSystem: false,
            };
            const accessResponse = await axios.post('http://localhost:8080/admin/accessibility', accessPayload, { headers: { Authorization: `Bearer ${token}` } });
            
            const venuePayload = {
                ...spaceData,
                capacity: Number(spaceData.capacity),
                size: Number(spaceData.size),
                accessibilityId: accessResponse.data.accessibilityId,
                // Envia a lista corrigida com SerialNumber e Available
                equipments: hasEquipment ? equipmentList : [] 
            };

            await axios.post('http://localhost:8080/admin/venue', venuePayload, { headers: { Authorization: `Bearer ${token}` } });

            alert('Espaço cadastrado com sucesso! ✅');
            setSpaceData({ ...spaceData, name: '', capacity: 0, size: 0 });
            setEquipmentList([]);
            setHasEquipment(false);
            setHasAccessibility(false);
            fetchVenues(0, itemsPerPage);

        } catch (err) {
            console.error(err);
            alert('Erro ao cadastrar espaço.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Excluir este espaço?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/admin/venue/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchVenues(currentPage, itemsPerPage);
        } catch (err) {
            alert("Erro ao excluir.");
        }
    }

    return (
        <div className="flex min-h-screen bg-[#f4f6f8] font-sans text-slate-800">
            {/* --- SIDEBAR --- */}
            <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-[#1a237e] text-white transition-all duration-300 fixed h-full z-20 flex flex-col shadow-xl`}>
                <div className="p-6 flex items-center justify-between">
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-2 font-bold text-xl tracking-wide">
                            <div className="bg-white text-[#1a237e] p-1 rounded">M</div>
                            <span>Manager</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="text-slate-300 hover:text-white">
                        <Menu size={20} />
                    </button>
                </div>
                <div className="flex-1 px-4 py-4 space-y-2">
                    <SidebarItem icon={<LayoutGrid size={20} />} label="Dashboard" onClick={() => router.push('/admin-dashboard')} />
                    <SidebarItem icon={<Building2 size={20} />} label="Espaços" active />
                    <SidebarItem icon={<Box size={20} />} label="Equipamentos" onClick={() => router.push('/register-equipment')} />
                    <SidebarItem icon={<User size={20} />} label="Gestores" />
                    <div className="my-4 border-t border-slate-700"></div>
                    <SidebarItem icon={<LogOut size={20} />} label="Sair" onClick={() => router.push('/')} />
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className={`flex-1 p-8 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gerenciar Espaços</h1>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <span>Dashboard</span>
                            <ChevronRight size={14} />
                            <span className="text-blue-600 font-medium">Cadastro Completo</span>
                        </div>
                    </div>
                </div>

                {/* --- FORMULÁRIO --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-10">
                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-200">
                        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                            <Building2 size={18} className="text-blue-600"/> Dados do Espaço
                        </h2>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* ... Inputs Básicos do Espaço (Nome, Capacidade etc.) mantidos iguais ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Espaço</label>
                                <input name="name" value={spaceData.name} onChange={handleSpaceChange} required className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Capacidade</label>
                                <input type="number" name="capacity" value={spaceData.capacity} onChange={handleSpaceChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho (m²)</label>
                                <input type="number" step="0.1" name="size" value={spaceData.size} onChange={handleSpaceChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                <select name="venueType" value={spaceData.venueType} onChange={handleSpaceChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none bg-white">
                                    <option value="AUDITORIUM">Auditório</option>
                                    <option value="COWORKING">Coworking</option>
                                    <option value="MEETING_ROOM">Sala de Reunião</option>
                                </select>
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" name="parking" checked={spaceData.parking} onChange={handleSpaceChange} className="w-5 h-5 text-blue-600 rounded" />
                                    <span className="text-slate-700 font-medium">Possui Estacionamento</span>
                                </label>
                            </div>
                        </div>

                        {/* Acessibilidade */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer mb-4">
                                <input type="checkbox" checked={hasAccessibility} onChange={() => setHasAccessibility(!hasAccessibility)} className="w-4 h-4 text-blue-600 rounded" />
                                <span className="text-slate-800 font-semibold">Recursos de Acessibilidade</span>
                            </label>
                            {hasAccessibility && (
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <label className="flex items-center gap-2"><input type="checkbox" name="accessRamp" checked={accessData.accessRamp} onChange={handleAccessChange} /> Rampa</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" name="elevator" checked={accessData.elevator} onChange={handleAccessChange} /> Elevador</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" name="accessibleBathroom" checked={accessData.accessibleBathroom} onChange={handleAccessChange} /> Banheiro</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" name="brailleSignage" checked={accessData.brailleSignage} onChange={handleAccessChange} /> Braile</label>
                                </div>
                            )}
                        </div>

                        {/* --- SEÇÃO DE EQUIPAMENTOS (CORRIGIDA PARA O DTO) --- */}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer mb-4">
                                <input type="checkbox" checked={hasEquipment} onChange={() => setHasEquipment(!hasEquipment)} className="w-4 h-4 text-blue-600 rounded" />
                                <span className="text-slate-800 font-semibold flex items-center gap-2">
                                    <Monitor size={18} /> Cadastrar Equipamentos da Sala
                                </span>
                            </label>

                            {hasEquipment && (
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                    
                                    {/* INPUTS DE EQUIPAMENTO: Name, Serial, Status, Available */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-4">
                                        
                                        {/* Nome */}
                                        <div className="col-span-12 md:col-span-4">
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nome</label>
                                            <input 
                                                type="text" name="name"
                                                value={tempEquipment.name} onChange={handleTempEquipmentChange}
                                                placeholder="Ex: Notebook Dell" 
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Serial Number */}
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nº Série</label>
                                            <input 
                                                type="text" name="serialNumber"
                                                value={tempEquipment.serialNumber} onChange={handleTempEquipmentChange}
                                                placeholder="XYZ-123"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Status de Conservação */}
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Estado</label>
                                            <select 
                                                name="conservationStatus"
                                                value={tempEquipment.conservationStatus} onChange={handleTempEquipmentChange}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                                            >
                                                <option value="NEW">Novo</option>
                                                <option value="USED">Usado</option>
                                                <option value="DAMAGED">Danificado</option>
                                            </select>
                                        </div>

                                        {/* Disponível (Sim/Não) */}
                                        <div className="col-span-12 md:col-span-2 flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Disponível?</label>
                                                <select 
                                                    name="available"
                                                    value={tempEquipment.available.toString()} onChange={handleTempEquipmentChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
                                                >
                                                    <option value="true">Sim</option>
                                                    <option value="false">Não</option>
                                                </select>
                                            </div>
                                            {/* Botão Adicionar */}
                                            <button 
                                                onClick={addEquipmentToList}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg h-[38px] self-end flex items-center justify-center"
                                                title="Adicionar à lista"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* TABELA DE ITENS ADICIONADOS */}
                                    {equipmentList.length > 0 ? (
                                        <div className="border rounded-lg overflow-hidden bg-white">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-100 text-slate-500 font-medium">
                                                    <tr>
                                                        <th className="px-4 py-2">Item</th>
                                                        <th className="px-4 py-2">Série</th>
                                                        <th className="px-4 py-2">Estado</th>
                                                        <th className="px-4 py-2">Disp.</th>
                                                        <th className="px-4 py-2 text-right">Ação</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {equipmentList.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-2 font-medium">{item.name}</td>
                                                            <td className="px-4 py-2 text-slate-500">{item.serialNumber}</td>
                                                            <td className="px-4 py-2 text-xs"><span className="bg-slate-100 px-2 py-1 rounded">{item.conservationStatus}</span></td>
                                                            <td className="px-4 py-2">
                                                                <span className={`text-xs font-bold ${item.available ? 'text-green-600' : 'text-red-500'}`}>
                                                                    {item.available ? 'SIM' : 'NÃO'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-right">
                                                                <button onClick={() => removeEquipmentFromList(index)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                                    <X size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-slate-400 text-sm bg-slate-100/50 rounded border border-dashed border-slate-300">
                                            Adicione equipamentos acima.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={saving} className="bg-[#00c853] hover:bg-[#00e676] text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70">
                                {saving ? 'Salvando...' : <><Check size={18} /> Salvar Tudo</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabela de Espaços (Lista) */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-semibold text-lg text-slate-800">Espaços Cadastrados</h2>
                        <button onClick={() => fetchVenues(0, itemsPerPage)} className="text-blue-600 text-sm hover:underline">Atualizar</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Nome</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Capacidade</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Estacionamento</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingList ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-slate-500">Carregando...</td></tr>
                                ) : venues.map((venue) => (
                                    <tr key={venue.venueId} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-700">{venue.name}</td>
                                        <td className="p-4 text-slate-600 text-sm">{venue.capacity}</td>
                                        <td className="p-4"><StatusBadge status={venue.parking} /></td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button onClick={() => handleDelete(venue.venueId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
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