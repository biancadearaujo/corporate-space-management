'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Venue } from '@/interfaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Maximize2, Car, MonitorPlay, Building2, Presentation, Users2 } from 'lucide-react';

type AppointmentModalProps = {
    isOpen: boolean;
    onClose: () => void;
    venues: Venue[];
    fetchAvailableTimes: (
        venueId: string,
        subVenueId: string | null,
        date: Date,
    ) => Promise<void>;
    availableTimes: string[];
    loadingTimes: boolean;
    userRole: 'COLLABORATOR' | 'MANAGER' | 'ADMIN' | null;
    onAppointmentCreated: () => void;
};

// Helper para traduzir o tipo de sala e dar um ícone
const getVenueTypeInfo = (type?: string) => {
    switch (type) {
        case 'AUDITORIUM': return { label: 'Auditório', icon: Presentation };
        case 'MEETING_ROOM': return { label: 'Sala de Reunião', icon: Users2 };
        case 'COWORKING': return { label: 'Coworking', icon: Building2 };
        default: return { label: 'Espaço', icon: Building2 };
    }
};

export default function AppointmentModal({
    isOpen,
    onClose,
    venues,
    userRole,
    onAppointmentCreated,
    fetchAvailableTimes,
}: AppointmentModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedVenueId, setSelectedVenueId] = useState('');
    const [selectedSubVenueId, setSelectedSubVenueId] = useState<string>('ALL');
    const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState<
        'MORNING' | 'AFTERNOON' | 'FULL_TIME' | ''
    >('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: '',
        message: ''
    });

    useEffect(() => {
        if (selectedVenueId) {
            const venue = venues.find((v: Venue) => v.venueId === selectedVenueId);
            setCurrentVenue(venue || null);
            setSelectedSubVenueId('ALL');
        } else {
            setCurrentVenue(null);
            setSelectedSubVenueId('ALL');
        }
    }, [selectedVenueId, venues]);

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setDescription('');
            setSelectedVenueId('');
            setSelectedSubVenueId('ALL');
            setCurrentVenue(null);
            setDate('');
            setStartTime('');
            setEndTime('');
            setSelectedPeriod('');
            setErrorModal({ isOpen: false, title: '', message: '' });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!currentVenue || !name || !date) {
            toast.error('Por favor, preencha os campos obrigatórios.');
            setIsSubmitting(false);
            return;
        }
        
        const formatDateTime = (localDate: string, localTime: string): string => {
            const timeWithSeconds = localTime.length === 5 ? `${localTime}:00` : localTime;
            return `${localDate}T${timeWithSeconds}`;
        };

        let payload: any = {
            name,
            description: description || "Sem descrição",
            venueId: currentVenue.venueId
        };

        if (currentVenue.divisible && selectedSubVenueId !== 'ALL') {
            payload.subVenueId = selectedSubVenueId;
        }

        if (currentVenue.venueType === 'AUDITORIUM') {
            if (!selectedPeriod) {
                toast.error('Por favor, selecione um período para o auditório.');
                setIsSubmitting(false);
                return;
            }
            const periodHours: Record<string, { start: string, end: string }> = {
                MORNING: { start: '08:00', end: '12:00' },
                AFTERNOON: { start: '14:00', end: '18:00' },
                FULL_TIME: { start: '08:00', end: '18:00' },
            };

            payload.startAt = formatDateTime(date, periodHours[selectedPeriod].start);
            payload.endAt = formatDateTime(date, periodHours[selectedPeriod].end);
        } else {
            if (!startTime || !endTime) {
                toast.error('Por favor, selecione os horários de início e fim.');
                setIsSubmitting(false);
                return;
            }
            payload.startAt = formatDateTime(date, startTime);
            payload.endAt = formatDateTime(date, endTime);
        }

        try {
            let endpoint = '';
            
            if (userRole === 'ADMIN') endpoint = 'http://localhost:8080/admin/scheduling';
            else if (userRole === 'MANAGER') endpoint = 'http://localhost:8080/manager/scheduling';
            else if (userRole === 'COLLABORATOR') endpoint = 'http://localhost:8080/collaborator/scheduling';
            else {
                toast.error('Você não tem permissão para criar agendamentos.');
                setIsSubmitting(false);
                return;
            }

            await axios.post(endpoint, payload);
            toast.success('Agendamento salvo com sucesso!');
            onAppointmentCreated();
            onClose();
        } catch (error: any) {
            let backendMessage = '';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    backendMessage = error.response.data;
                } else if (error.response.data.message) {
                    backendMessage = error.response.data.message;
                } else {
                    backendMessage = JSON.stringify(error.response.data);
                }
            } else {
                backendMessage = error.message || 'Erro desconhecido ao comunicar com o servidor.';
            }

            const msgLower = backendMessage.toLowerCase();
            
            if (msgLower.includes('disabled') || msgLower.includes("company is disabled")) {
                setErrorModal({ isOpen: true, title: 'Empresa Inativa', message: 'A sua empresa está inativa no sistema. Novos agendamentos não são permitidos.' });
            } 
            else if (msgLower.includes('at least') || msgLower.includes('hours in the future')) {
                setErrorModal({ isOpen: true, title: 'Antecedência Mínima', message: 'O agendamento requer uma antecedência mínima. Escolha uma data mais à frente.' });
            } 
            else if (msgLower.includes('must be in the future') || msgLower.includes('end at date must be greater')) {
                setErrorModal({ isOpen: true, title: 'Horário Inválido', message: 'A data e hora do agendamento devem ser no futuro e o horário de fim deve ser após o de início.' });
            } 
            else if (msgLower.includes('deadline for reservations has passed')) {
                setErrorModal({ isOpen: true, title: 'Prazo Excedido', message: 'A data selecionada ultrapassa o limite máximo de meses permitidos para reserva deste espaço.' });
            } 
            else if (msgLower.includes('outside the allowed operating hours') || msgLower.includes('no operating hours defined')) {
                setErrorModal({ isOpen: true, title: 'Fora de Funcionamento', message: 'O horário selecionado está fora do período de funcionamento deste espaço.' });
            } 
            else if (msgLower.includes('limit exceeded') || msgLower.includes('quota not found')) {
                setErrorModal({ isOpen: true, title: 'Limite de Horas Atingido', message: 'A sua empresa não tem horas disponíveis suficientes para realizar este agendamento.' });
            } 
            else if (msgLower.includes('already') || msgLower.includes('overlap')) {
                setErrorModal({ isOpen: true, title: 'Horário Indisponível', message: 'O horário ou período selecionado já está ocupado por outra reserva.' });
            } 
            else if (msgLower.includes('equipment')) {
                setErrorModal({ isOpen: true, title: 'Equipamento Indisponível', message: 'O equipamento selecionado já está reservado, quebrado ou não pertence a este espaço.' });
            } 
            else {
                setErrorModal({ isOpen: true, title: 'Falha no Agendamento', message: backendMessage });
            }

        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[480px] max-h-[95vh] overflow-y-auto rounded-[20px] border-slate-100 p-0 shadow-2xl flex flex-col hide-scrollbar">
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 shrink-0">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-slate-800">Agendar Horário</DialogTitle>
                            <DialogDescription className="text-slate-500 mt-1 text-sm">
                                Escolha o espaço ideal e reserve o seu horário.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
                        
                        {/* --- SELETOR DE ESPAÇOS RICO --- */}
                        <div>
                            <Label htmlFor="venue" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                                Ambiente Desejado *
                            </Label>
                            <Select onValueChange={setSelectedVenueId} value={selectedVenueId}>
                                <SelectTrigger className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-xl px-4 h-14 outline-none text-sm transition-all text-slate-800">
                                    <SelectValue placeholder="Selecione a sala ou auditório..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 p-1">
                                    {venues.map((venue: any) => {
                                        const { label, icon: TypeIcon } = getVenueTypeInfo(venue.venueType);
                                        return (
                                            <SelectItem 
                                                key={venue.venueId} 
                                                value={venue.venueId} 
                                                className="cursor-pointer rounded-lg mb-1 focus:bg-indigo-50 focus:text-[#003399]"
                                            >
                                                <div className="flex items-center gap-3 py-1">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <TypeIcon size={16} />
                                                    </div>
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-bold text-[14px] leading-tight text-slate-800">{venue.name}</span>
                                                        <span className="text-[11px] font-medium text-slate-500">
                                                            {label} • Até {venue.capacity} pessoas
                                                        </span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>

                            {/* --- PREVIEW / FICHA TÉCNICA DO ESPAÇO --- */}
                            {currentVenue && (
                                <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 flex gap-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
                                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 relative">
                                        {currentVenue.image ? (
                                            <img src={currentVenue.image} alt={currentVenue.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">Sem Foto</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center flex-1 py-1 overflow-hidden">
                                        <h4 className="font-bold text-slate-800 text-[15px] truncate">{currentVenue.name}</h4>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            <span className="inline-flex items-center text-[10px] font-bold bg-[#F0F2F5] text-slate-600 px-2 py-1 rounded-md">
                                                <Users size={12} className="mr-1 text-[#003399]" /> {currentVenue.capacity}
                                            </span>
                                            {currentVenue.size && (
                                                <span className="inline-flex items-center text-[10px] font-bold bg-[#F0F2F5] text-slate-600 px-2 py-1 rounded-md">
                                                    <Maximize2 size={12} className="mr-1 text-slate-400" /> {currentVenue.size} m²
                                                </span>
                                            )}
                                            {currentVenue.parking && (
                                                <span className="inline-flex items-center text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                                                    <Car size={12} className="mr-1" /> Estacionamento
                                                </span>
                                            )}
                                        </div>
                                        {(currentVenue as any).equipments && (currentVenue as any).equipments.length > 0 && (
                                            <p className="text-[10px] font-semibold text-slate-500 mt-2 truncate flex items-center gap-1">
                                                <MonitorPlay size={12} className="text-indigo-400" /> 
                                                {(currentVenue as any).equipments.map((e:any) => e.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- SELECT PARA SUB-ESPAÇOS SE FOR DIVISÍVEL --- */}
                        {currentVenue && currentVenue.divisible && currentVenue.subVenues && currentVenue.subVenues.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-top-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <Label htmlFor="subVenue" className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                    Deseja reservar apenas uma parte? (Opcional)
                                </Label>
                                <Select onValueChange={setSelectedSubVenueId} value={selectedSubVenueId}>
                                    <SelectTrigger className="w-full bg-white border border-blue-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-11 outline-none text-sm transition-all text-slate-700 font-semibold shadow-sm">
                                        <SelectValue placeholder="Auditório Completo" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-slate-100">
                                        <SelectItem value="ALL" className="cursor-pointer font-bold text-[#003399]">
                                            Reservar {currentVenue.name} Completo
                                        </SelectItem>
                                        {currentVenue.subVenues.map((subVenue: any) => (
                                            <SelectItem 
                                                key={subVenue.id || subVenue.subVenueId} 
                                                value={subVenue.id || subVenue.subVenueId} 
                                                className="cursor-pointer font-medium"
                                            >
                                                Apenas {subVenue.name} (Até {subVenue.capacity} lugares)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="name" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Título da Reunião/Evento *</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Reunião de Planejamento" className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-11 outline-none text-sm transition-all font-medium" required />
                        </div>

                        <div>
                            <Label htmlFor="date" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Data do Agendamento *</Label>
                            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-11 outline-none text-sm transition-all text-slate-700 font-medium" required />
                        </div>

                        {currentVenue && currentVenue.venueType === 'AUDITORIUM' ? (
                            <div className="bg-[#F0F2F5] p-4 rounded-xl border border-transparent">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 block">Período Disponível *</Label>
                                <RadioGroup className="flex flex-col space-y-2.5" value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value as any)}>
                                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm transition-colors hover:border-[#003399]/30">
                                        <RadioGroupItem value="MORNING" id="morning" className="text-[#003399]" />
                                        <Label htmlFor="morning" className="font-bold text-slate-700 text-[13px] cursor-pointer w-full">Manhã <span className="font-normal text-slate-500">(08:00 - 12:00)</span></Label>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm transition-colors hover:border-[#003399]/30">
                                        <RadioGroupItem value="AFTERNOON" id="afternoon" className="text-[#003399]" />
                                        <Label htmlFor="afternoon" className="font-bold text-slate-700 text-[13px] cursor-pointer w-full">Tarde <span className="font-normal text-slate-500">(14:00 - 18:00)</span></Label>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm transition-colors hover:border-[#003399]/30">
                                        <RadioGroupItem value="FULL_TIME" id="full_time" className="text-[#003399]" />
                                        <Label htmlFor="full_time" className="font-bold text-slate-700 text-[13px] cursor-pointer w-full">Integral <span className="font-normal text-slate-500">(08:00 - 18:00)</span></Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startTime" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Início *</Label>
                                    <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-11 outline-none text-sm transition-all text-slate-700 font-medium font-mono" required />
                                </div>
                                <div>
                                    <Label htmlFor="endTime" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Fim *</Label>
                                    <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-11 outline-none text-sm transition-all text-slate-700 font-medium font-mono" required />
                                </div>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="description" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Descrição Adicional</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Pauta, necessidades ou informações extras..." className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 py-3 min-h-[80px] outline-none text-sm transition-all resize-none font-medium" />
                        </div>

                        <DialogFooter className="mt-2 pt-4 border-t border-slate-100 gap-2 sm:gap-0 shrink-0">
                            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 h-12 px-6">Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition-colors shadow-md disabled:opacity-70 h-12 px-8">
                                {isSubmitting ? 'Processando...' : 'Confirmar Reserva'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={errorModal.isOpen} onOpenChange={(open) => setErrorModal(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="sm:max-w-[400px] rounded-[24px] p-6 sm:p-8 border-slate-100 shadow-2xl flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-800 mb-2">
                        {errorModal.title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-sm mb-6 leading-relaxed">
                        {errorModal.message}
                    </DialogDescription>
                    <Button 
                        onClick={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
                        className="w-full bg-[#003399] hover:bg-[#002266] text-white font-bold rounded-xl h-12 transition-all shadow-md"
                    >
                        Voltar e corrigir
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}