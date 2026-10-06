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

export default function AppointmentModal({
    isOpen,
    onClose,
    venues,
    userRole,
    onAppointmentCreated,
    fetchAvailableTimes, // Recebendo a função, embora na abordagem deste modal o backend pareça lidar com o choque de horários na submissão
}: AppointmentModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedVenueId, setSelectedVenueId] = useState('');
    
    // --- NOVO: Estado para a Sub-Sala ---
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

    // Efeito para atualizar o Venue Atual quando muda a seleção
    useEffect(() => {
        if (selectedVenueId) {
            const venue = venues.find((v: Venue) => v.venueId === selectedVenueId);
            setCurrentVenue(venue || null);
            // Sempre que muda a sala principal, reseta a sub-sala para "Auditório Completo"
            setSelectedSubVenueId('ALL');
        } else {
            setCurrentVenue(null);
            setSelectedSubVenueId('ALL');
        }
    }, [selectedVenueId, venues]);

    // Reseta o formulário ao fechar o modal
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setDescription('');
            setSelectedVenueId('');
            setSelectedSubVenueId('ALL'); // Reseta a sub-sala
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

        // --- NOVO: Anexar a SubVenue se foi selecionada ---
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
                <DialogContent className="sm:max-w-[450px] max-h-[95vh] overflow-y-auto rounded-[20px] border-slate-100 p-0 shadow-2xl flex flex-col">
                    <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 shrink-0">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-slate-800">Agendar Horário</DialogTitle>
                            <DialogDescription className="text-slate-500 mt-1 text-sm">
                                Preencha os detalhes para reservar um ambiente.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
                        <div>
                            <Label htmlFor="name" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Título da Reunião/Evento *</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Reunião de Planejamento" className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all" required />
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Descrição</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Pauta ou informações..." className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 py-2 min-h-[80px] outline-none text-sm transition-all resize-none" />
                        </div>

                        <div>
                            <Label htmlFor="venue" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Ambiente *</Label>
                            <Select onValueChange={setSelectedVenueId} value={selectedVenueId}>
                                <SelectTrigger className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700">
                                    <SelectValue placeholder="Selecione um espaço" />
                                </SelectTrigger>
                                <SelectContent className="rounded-lg border-slate-100">
                                    {venues.map((venue: Venue) => (
                                        <SelectItem key={venue.venueId} value={venue.venueId} className="cursor-pointer">
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* --- NOVO: SELECT PARA SUB-ESPAÇOS SE FOR DIVISÍVEL --- */}
                        {currentVenue && currentVenue.divisible && currentVenue.subVenues && currentVenue.subVenues.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <Label htmlFor="subVenue" className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                                    Deseja reservar apenas uma parte? (Opcional)
                                </Label>
                                <Select onValueChange={setSelectedSubVenueId} value={selectedSubVenueId}>
                                    <SelectTrigger className="w-full bg-blue-50 border-blue-100 focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700">
                                        <SelectValue placeholder="Auditório Completo" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-lg border-slate-100">
                                        <SelectItem value="ALL" className="cursor-pointer font-semibold">
                                            Reservar Auditório Completo
                                        </SelectItem>
                                        {currentVenue.subVenues.map((subVenue: any) => (
                                            <SelectItem 
                                                key={subVenue.id || subVenue.subVenueId} 
                                                value={subVenue.id || subVenue.subVenueId} 
                                                className="cursor-pointer"
                                            >
                                                Apenas {subVenue.name} (Capacidade: {subVenue.capacity})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="date" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Data do Agendamento *</Label>
                            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700" required />
                        </div>

                        {currentVenue && currentVenue.venueType === 'AUDITORIUM' ? (
                            <div className="bg-[#F0F2F5] p-4 rounded-lg border border-transparent">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Período Disponível *</Label>
                                <RadioGroup className="flex flex-col space-y-2" value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value as any)}>
                                    <div className="flex items-center space-x-2 bg-white p-2.5 rounded-md border border-slate-200">
                                        <RadioGroupItem value="MORNING" id="morning" className="text-[#003399]" />
                                        <Label htmlFor="morning" className="font-medium text-slate-700 text-sm cursor-pointer">Manhã (08:00 - 12:00)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-white p-2.5 rounded-md border border-slate-200">
                                        <RadioGroupItem value="AFTERNOON" id="afternoon" className="text-[#003399]" />
                                        <Label htmlFor="afternoon" className="font-medium text-slate-700 text-sm cursor-pointer">Tarde (14:00 - 18:00)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-white p-2.5 rounded-md border border-slate-200">
                                        <RadioGroupItem value="FULL_TIME" id="full_time" className="text-[#003399]" />
                                        <Label htmlFor="full_time" className="font-medium text-slate-700 text-sm cursor-pointer">Integral (08:00 - 18:00)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="startTime" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Início *</Label>
                                    <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700" required />
                                </div>
                                <div>
                                    <Label htmlFor="endTime" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Fim *</Label>
                                    <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-[#F0F2F5] border-transparent focus:bg-white focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/20 rounded-lg px-3 h-10 outline-none text-sm transition-all text-slate-700" required />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4 gap-2 sm:gap-0 shrink-0">
                            <Button type="button" variant="outline" onClick={onClose} className="rounded-lg border-slate-200 text-slate-600 font-medium hover:bg-slate-50 h-10 px-5">Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#003399] text-white font-medium hover:bg-[#002266] transition-colors shadow-sm disabled:opacity-70 h-10 px-5">
                                {isSubmitting ? 'Processando...' : 'Confirmar'}
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