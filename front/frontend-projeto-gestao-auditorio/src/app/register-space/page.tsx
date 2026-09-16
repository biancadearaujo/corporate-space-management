'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    Menu,
    Check,
    X,
    LayoutGrid,
    User,
    Box,
    Settings,
    LogOut,
} from 'lucide-react';

const NavItem = ({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}) => (
    <div
        className="flex flex-col items-center gap-1 cursor-pointer group"
        onClick={onClick}
    >
        <div className="text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {icon}
        </div>
        <span className="text-sm font-medium text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {label}
        </span>
    </div>
);

// --- TIPAGEM ---
interface AccessibilityPayload {
    accessRamp: boolean;
    elevator: boolean;
    accessibleBathroom: boolean;
    accessibleParking: boolean;
    directionalTactileFlooring: boolean;
    brailleSignage: boolean;
    audioGuidanceSystem: boolean;
}

type VenueType = 'AUDITORIUM' | 'COWORKING' | 'MEETING_ROOM';

interface SpacePayload {
    name: string;
    capacity: number;
    size: number;
    image: string;
    minimumHoursToCancel: string;
    parking: boolean;
    accessibilityId?: string;
    venueType: VenueType;
    divisible: boolean;
    maximumMonths: number;
    openingTime: string;
    closingTime: string;
    subVenues: Array<{
        name: string;
        capacity: number;
        maximumMonths: number;
        openingTime: string;
        closingTime: string;
    }>;
    openingHours: Array<{
        dayOfWeek: string;
        openingTime: string;
        closingTime: string;
    }>;
}

const venueTypeOptions: { value: VenueType; label: string }[] = [
    { value: 'AUDITORIUM', label: 'Auditório' },
    { value: 'COWORKING', label: 'Coworking' },
    { value: 'MEETING_ROOM', label: 'Sala de Reunião' },
];

export default function SpaceRegistration() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [hasAccessibility, setHasAccessibility] = useState(false);
    const [accessData, setAccessData] = useState<AccessibilityPayload>({
        accessRamp: false,
        elevator: false,
        accessibleBathroom: false,
        accessibleParking: false,
        directionalTactileFlooring: false,
        brailleSignage: false,
        audioGuidanceSystem: false,
    });
    const [spaceData, setSpaceData] = useState<
        Omit<SpacePayload, 'accessibilityId'>
    >({
        name: '',
        capacity: 0,
        size: 0,
        image: '',
        minimumHoursToCancel: '96',
        parking: false,
        venueType: 'AUDITORIUM',
        divisible: false,
        maximumMonths: 6,
        openingTime: '07:00:00',
        closingTime: '23:00:00',
        subVenues: [],
        openingHours: [],
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const handleSpaceChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const target = e.target;
        const name = target.name;

        if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setSpaceData((prev) => ({ ...prev, [name]: target.checked }));
        } else {
            const value = target.value;
            const type = 'type' in target ? target.type : '';
            const finalValue =
                type === 'number' && value !== '' ? Number(value) : value;

            setSpaceData((prev) => ({ ...prev, [name]: finalValue }));
        }
    };

    const handleAccessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setAccessData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert(
                    'Token de autenticação não encontrado. Faça login novamente.',
                );
                router.push('/login');
                return;
            }

            const accessibilityPayload = hasAccessibility
                ? accessData
                : {
                      accessRamp: false,
                      elevator: false,
                      accessibleBathroom: false,
                      accessibleParking: false,
                      directionalTactileFlooring: false,
                      brailleSignage: false,
                      audioGuidanceSystem: false,
                  };

            const accessibilityResponse = await axios.post(
                'http://localhost:8080/admin/accessibility',
                accessibilityPayload,
                { headers: { Authorization: `Bearer ${token}` } },
            );

            const newAccessibilityId =
                accessibilityResponse.data.accessibilityId;

            const venuePayload: SpacePayload = {
                ...spaceData,
                capacity: Number(spaceData.capacity),
                size: Number(spaceData.size),
                accessibilityId: newAccessibilityId,
            };

            await axios.post(
                'http://localhost:8080/admin/venue',
                venuePayload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            alert('Espaço cadastrado com sucesso! ✅');
            router.push('/admin-dashboard');
        } catch (err) {
            console.error('Falha ao enviar formulário:', err);
            let errorMessage =
                'Erro ao cadastrar espaço. Verifique o console para mais detalhes.';
            if (axios.isAxiosError(err) && err.response) {
                console.error('Dados da Resposta de Erro:', err.response.data);
                const serverError = err.response.data;
                if (typeof serverError === 'object' && serverError !== null) {
                    const messages = Object.values(serverError).join(' ');
                    if (messages) errorMessage = messages;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            alert(`⚠️ ${errorMessage}`);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
            <div className="flex flex-1 transition-all duration-300">
                <aside
                    className={`bg-verde-t2m dark:bg-gray-800 ${sidebarCollapsed ? 'w-16' : 'w-64'} p-6 flex flex-col items-center relative transition-all duration-300 ease-in-out`}
                >
                    <button
                        onClick={() => setSidebarCollapsed((prev) => !prev)}
                        className="absolute top-4 right-4 hover:scale-110 transition"
                    >
                        <Menu size={28} />
                    </button>
                    <div className="flex items-center mb-8 transition-opacity duration-300">
                        {!sidebarCollapsed && (
                            <img
                                src={
                                    darkMode
                                        ? '/img/logot2m(dark).png'
                                        : '/img/logot2m(2).png'
                                }
                                alt="T2M logo"
                                className="h-28 mr-2"
                            />
                        )}
                    </div>
                    {!sidebarCollapsed && (
                        <>
                            <h2 className="text-xl font-bold mb-2 text-white">Olá, administrador!</h2>
                            <p className="mb-4 text-white">Seja bem-vindo ao ambiente virtual da T2M!</p>
                            <p className='mb-4 text-white'>Saiba mais sobre nossas ferramentas e confira as novidades da página inicial.</p>
                        </>
                    )}
                </aside>

                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-8 gap-5">
                        <NavItem
                            icon={<LayoutGrid size={24} />}
                            label="Início"
                            onClick={() => router.push('/admin-dashboard')}
                        />
                        <NavItem
                            icon={<User size={24} />}
                            label="Perfil"
                            onClick={() => {}}
                        />
                        <NavItem
                            icon={<Box size={24} />}
                            label="Nossos espaços"
                            onClick={() => router.push('/our-spaces')}
                        />
                        <NavItem
                            icon={<Settings size={24} />}
                            label="Configurações"
                        />
                        <NavItem
                            icon={<LogOut size={24} />}
                            label="Sair"
                            onClick={() => router.push('/')}
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md max-w-4xl mx-auto transition-colors duration-300">
                        <h1 className="text-2xl font-bold mb-6 text-center">
                            Cadastro de Espaço
                        </h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block font-medium">
                                    Nome do espaço
                                </label>
                                <input
                                    name="name"
                                    value={spaceData.name}
                                    onChange={handleSpaceChange}
                                    required
                                    className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium">
                                        Capacidade
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={spaceData.capacity}
                                        onChange={handleSpaceChange}
                                        className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium">
                                        Tamanho (m²)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="size"
                                        value={spaceData.size}
                                        onChange={handleSpaceChange}
                                        className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium">
                                        Tipo de local
                                    </label>
                                    <select
                                        name="venueType"
                                        value={spaceData.venueType}
                                        onChange={handleSpaceChange}
                                        className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                                    >
                                        {venueTypeOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="parking"
                                        name="parking"
                                        checked={spaceData.parking}
                                        onChange={handleSpaceChange}
                                        className="h-5 w-5 rounded-md"
                                    />
                                    <label
                                        htmlFor="parking"
                                        className="font-medium"
                                    >
                                        Possui Estacionamento
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hasAccessibility"
                                    checked={hasAccessibility}
                                    onChange={() =>
                                        setHasAccessibility((prev) => !prev)
                                    }
                                    className="h-5 w-5 rounded-md"
                                />
                                <label
                                    htmlFor="hasAccessibility"
                                    className="font-medium"
                                >
                                    Possui acessibilidade?
                                </label>
                            </div>

                            {hasAccessibility && (
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg space-y-3">
                                    <h2 className="font-semibold">
                                        Detalhes de Acessibilidade
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="accessRamp"
                                                checked={accessData.accessRamp}
                                                onChange={handleAccessChange}
                                                className="h-5 w-5"
                                            />{' '}
                                            Rampa de acesso
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="elevator"
                                                checked={accessData.elevator}
                                                onChange={handleAccessChange}
                                                className="h-5 w-5"
                                            />{' '}
                                            Elevador
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="accessibleBathroom"
                                                checked={
                                                    accessData.accessibleBathroom
                                                }
                                                onChange={handleAccessChange}
                                                className="h-5 w-5"
                                            />{' '}
                                            Banheiro acessível
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="accessibleParking"
                                                checked={
                                                    accessData.accessibleParking
                                                }
                                                onChange={handleAccessChange}
                                                className="h-5 w-5"
                                            />{' '}
                                            Vaga acessível
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="directionalTactileFlooring"
                                                checked={
                                                    accessData.directionalTactileFlooring
                                                }
                                                onChange={handleAccessChange}
                                                className="h-5 w-5"
                                            />{' '}
                                            Piso tátil direcional
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="brailleSignage"
                                                checked={
                                                    accessData.brailleSignage
                                                }
                                                onChange={handleAccessChange}
                                                className="h-5 w-5"
                                            />{' '}
                                            Placas em braile
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                name="audioGuidanceSystem"
                                                checked={
                                                    accessData.audioGuidanceSystem
                                                }
                                                onChange={handleAccessChange}
                                                className="h-5 w-5"
                                            />{' '}
                                            Sistema de áudio guia
                                        </label>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 bg-verde-t2m text-white rounded-2xl shadow-md hover:brightness-110 transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                <Check size={18} /> Cadastrar Espaço
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
