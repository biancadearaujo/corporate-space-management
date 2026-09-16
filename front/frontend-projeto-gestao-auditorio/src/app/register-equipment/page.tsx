'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { Menu, LayoutGrid, User, Box, Settings, LogOut, X } from 'lucide-react';

// --- INTERFACES E TIPOS ---
interface Feedback {
    type: 'success' | 'error';
    message: string;
}

// Representa as opções do enum do backend
type ConservationStatus =
    | 'NEW'
    | 'SLIGHTLY_USED'
    | 'USED'
    | 'WORN'
    | 'VERY_WORN'
    | 'DAMAGED';

// Estrutura para o array de opções do select
interface SelectOption {
    value: ConservationStatus;
    label: string;
}

// --- DADOS PARA O FORMULÁRIO ---
const conservationStatusOptions: SelectOption[] = [
    { value: 'NEW', label: 'Novo' },
    { value: 'SLIGHTLY_USED', label: 'Seminovo' },
    { value: 'USED', label: 'Usado' },
    { value: 'WORN', label: 'Desgastado' },
    { value: 'VERY_WORN', label: 'Muito Desgastado' },
    { value: 'DAMAGED', label: 'Danificado' },
];

// --- COMPONENTES AUXILIARES ---
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

const FeedbackMessage = ({ feedback }: { feedback: Feedback | null }) => {
    if (!feedback) return null;
    const isSuccess = feedback.type === 'success';
    const bgColor = isSuccess
        ? 'bg-green-100 dark:bg-green-900'
        : 'bg-red-100 dark:bg-red-900';
    const textColor = isSuccess
        ? 'text-green-800 dark:text-green-200'
        : 'text-red-800 dark:text-red-200';

    return (
        <div
            className={`${bgColor} ${textColor} p-4 rounded-lg mb-6 text-center`}
        >
            {feedback.message}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function RegisterEquipmentPage() {
    const router = useRouter();

    // --- ESTADOS DA UI ---
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    // --- ESTADO DO FORMULÁRIO ---
    const [formData, setFormData] = useState({
        serialNumber: '',
        name: '',
        conservationStatus: 'NEW' as ConservationStatus,
        available: 'true',
    });

    // --- FUNÇÕES DE MANIPULAÇÃO DO FORMULÁRIO ---
    const handleFormChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback(null);
        const token = localStorage.getItem('token');

        if (!token) {
            setFeedback({
                type: 'error',
                message: 'Token de autenticação não encontrado. Faça o login.',
            });
            setIsLoading(false);
            return;
        }

        const payload = {
            ...formData,
            available: formData.available === 'true',
        };

        try {
            await axios.post('http://localhost:8080/admin/equipment', payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFeedback({
                type: 'success',
                message: 'Equipamento cadastrado com sucesso!',
            });
            setFormData({
                serialNumber: '',
                name: '',
                conservationStatus: 'NEW',
                available: 'true',
            });
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
                axiosError.response?.data?.message ||
                'Ocorreu um erro desconhecido.';
            setFeedback({
                type: 'error',
                message: `Falha ao cadastrar equipamento: ${errorMessage}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
            <div className="flex flex-1 transition-all duration-300">
                {/* --- Sidebar --- */}
                <aside
                    className={`bg-verde-t2m dark:bg-gray-800 ${sidebarCollapsed ? 'w-16' : 'w-64'} p-6 flex flex-col items-center relative transition-all duration-300 ease-in-out`}
                >
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="absolute top-4 right-4 hover:scale-110 transition"
                    >
                        <Menu size={28} />
                    </button>
                    {!sidebarCollapsed && (
                        <div className="text-center">
                            <img
                                src={'/img/logot2m(2).png'}
                                alt="T2M logo"
                                className="h-28 mx-auto"
                            />
                            <h2 className="text-xl font-bold mt-8 mb-2">
                                Olá, administrador!
                            </h2>
                            <p>Cadastro de Equipamentos.</p>
                        </div>
                    )}
                </aside>

                {/* --- Conteúdo Principal --- */}
                <main className="flex-1 bg-gray-200 dark:bg-gray-900 p-8 transition-all duration-300 overflow-y-auto">
                    {/* Navbar */}
                    <div className="flex justify-between items-center gap-5 mb-8">
                        <NavItem
                            icon={<LayoutGrid size={24} />}
                            label="Início"
                            onClick={() => router.push('/admin-dashboard')}
                        />
                        <NavItem icon={<User size={24} />} label="Perfil" />
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

                    {/* --- Formulário de Cadastro de Equipamento --- */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6 text-center">
                            Cadastro de Equipamento
                        </h1>

                        <FeedbackMessage feedback={feedback} />

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >
                            <label className="font-medium">
                                Nome do Equipamento:
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    placeholder="Ex: Notebook Dell Vostro"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                                    required
                                />
                            </label>
                            <label className="font-medium">
                                Número de Série:
                                <input
                                    type="text"
                                    name="serialNumber"
                                    value={formData.serialNumber}
                                    onChange={handleFormChange}
                                    placeholder="Digite o número de série"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                                    required
                                />
                            </label>

                            <label className="font-medium">
                                Estado de Conservação:
                                <select
                                    name="conservationStatus"
                                    value={formData.conservationStatus}
                                    onChange={handleFormChange}
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                                    required
                                >
                                    {/* Mapeando o array de opções para criar cada <option> */}
                                    {conservationStatusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="font-medium">
                                Disponibilidade:
                                <select
                                    name="available"
                                    value={formData.available}
                                    onChange={handleFormChange}
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900"
                                    required
                                >
                                    <option value="true">Disponível</option>
                                    <option value="false">Indisponível</option>
                                </select>
                            </label>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-6 bg-verde-t2m text-white py-2 px-4 rounded-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading
                                    ? 'Cadastrando...'
                                    : 'Cadastrar Equipamento'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
