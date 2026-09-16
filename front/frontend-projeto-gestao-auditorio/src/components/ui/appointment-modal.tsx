'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Venue } from '@/interfaces';
import { useAuth } from '@/contexts/AuthContext';
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
    userRole: 'COLLABORATOR' | 'MANAGER' | null;
    onAppointmentCreated: () => void;
};

export default function AppointmentModal({
    isOpen,
    onClose,
    venues,
    userRole,
    onAppointmentCreated,
}: AppointmentModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedVenueId, setSelectedVenueId] = useState('');
    const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState<
        'MORNING' | 'AFTERNOON' | 'FULL_TIME' | ''
    >('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedVenueId) {
            const venue = venues.find(
                (v: Venue) => v.venueId === selectedVenueId,
            );
            setCurrentVenue(venue || null);
        } else {
            setCurrentVenue(null);
        }
    }, [selectedVenueId, venues]);

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setDescription('');
            setSelectedVenueId('');
            setCurrentVenue(null);
            setDate('');
            setStartTime('');
            setEndTime('');
            setSelectedPeriod('');
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
        
        const createUtcDateTime = (localDate: string, localTime: string): string => {
            const localDateTime = new Date(`${localDate}T${localTime}`);
            return localDateTime.toISOString();
        };

        let payload;

        if (currentVenue.venueType === 'AUDITORIUM') {
            if (!selectedPeriod) {
                toast.error(
                    'Por favor, selecione um período para o auditório.',
                );
                setIsSubmitting(false);
                return;
            }
            const periodHours = {
                MORNING: { start: '08:00', end: '12:00' },
                AFTERNOON: { start: '14:00', end: '18:00' },
                FULL_TIME: { start: '08:00', end: '18:00' },
            };

            payload = {
                name,
                description,
                venueId: currentVenue.venueId,
                startAt: createUtcDateTime(date, `${periodHours[selectedPeriod].start}:00`),
                endAt: createUtcDateTime(date, `${periodHours[selectedPeriod].end}:00`),
                bookingPeriod: selectedPeriod,
            };
        } else {
            if (!startTime || !endTime) {
                toast.error(
                    'Por favor, selecione os horários de início e fim.',
                );
                setIsSubmitting(false);
                return;
            }
            payload = {
                name,
                description,
                venueId: currentVenue.venueId,
                startAt: createUtcDateTime(date, `${startTime}:00`),
                endAt: createUtcDateTime(date, `${endTime}:00`),
            };
        }

        try {
            let endpoint = '';
            if (userRole === 'MANAGER')
                endpoint = 'http://localhost:8080/manager/scheduling';
            else if (userRole === 'COLLABORATOR')
                endpoint = 'http://localhost:8080/collaborator/scheduling';
            else {
                toast.error('Você não tem permissão para criar agendamentos.');
                setIsSubmitting(false);
                return;
            }

            await axios.post(endpoint, payload);
            toast.success('Solicitação de agendamento enviada com sucesso!');
            onAppointmentCreated();
            onClose();
        } catch (error: any) {
            console.error(
                'Erro ao criar agendamento:',
                error.response?.data || error.message,
            );
            toast.error(
                `Erro: ${error.response?.data?.message || 'Verifique os dados e tente novamente.'}`,
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes para solicitar um novo agendamento.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Título*
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Descrição
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="venue" className="text-right">
                                Espaço*
                            </Label>
                            <Select
                                onValueChange={setSelectedVenueId}
                                value={selectedVenueId}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione um espaço" />
                                </SelectTrigger>
                                <SelectContent>
                                    {venues.map((venue: Venue) => (
                                        <SelectItem
                                            key={venue.venueId}
                                            value={venue.venueId}
                                        >
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Data*
                            </Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {currentVenue &&
                        currentVenue.venueType === 'AUDITORIUM' ? (
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right pt-2">
                                    Período*
                                </Label>
                                <RadioGroup
                                    className="col-span-3 flex flex-col space-y-1"
                                    value={selectedPeriod}
                                    onValueChange={(value: any) =>
                                        setSelectedPeriod(value as any)
                                    }
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="MORNING"
                                            id="morning"
                                        />
                                        <Label htmlFor="morning">
                                            Manhã (08:00 - 12:00)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="AFTERNOON"
                                            id="afternoon"
                                        />
                                        <Label htmlFor="afternoon">
                                            Tarde (14:00 - 18:00)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="FULL_TIME"
                                            id="full_time"
                                        />
                                        <Label htmlFor="full_time">
                                            Período Integral (08:00 - 18:00)
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="startTime"
                                        className="text-right"
                                    >
                                        Início*
                                    </Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) =>
                                            setStartTime(e.target.value)
                                        }
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                        htmlFor="endTime"
                                        className="text-right"
                                    >
                                        Fim*
                                    </Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) =>
                                            setEndTime(e.target.value)
                                        }
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? 'Salvando...'
                                : 'Solicitar Agendamento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
