'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
    Menu,
    LayoutGrid,
    User,
    Settings,
    Box,
    LogOut,
    Pencil,
    X,
    Trash2,
    Check,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon
} from 'lucide-react';

interface Equipment {
    equipmentId: string;
    serialNumber: string;
    name: string;
    conservationStatus:
        | 'NEW'
        | 'SLIGHTLY_USED'
        | 'USED'
        | 'WORN'
        | 'VERY_WORN'
        | 'DAMAGED';
    available: boolean;
}

interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

interface EquipmentResponse {
    content: Equipment[];
    pageable: Pageable;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

const NavItem = ({
    label,
    onClick,
}: {
    label: string;
    onClick?: () => void;
}) => (
    <div
        onClick={onClick}
        className="flex flex-col items-center gap-1 cursor-pointer group"
    >
        <span className="text-sm font-medium text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {label}
        </span>
    </div>
);

export default function AdminDashboard() {
    const { user, token } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalServerPages, setTotalServerPages] = useState(1);
    const [totalServerElements, setTotalServerElements] = useState(0);
    const itemsPerPage = 5;

    const toggleDarkMode = () => setDarkMode((prev) => !prev);
    const [showProfileModal, setShowProfileModal] = useState(false);
    

    const [equipmentSelecionado, setEquipmentSelecionado] =
        useState<Equipment | null>(null);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [dadosEditaveis, setDadosEditaveis] = useState<Equipment | null>(
        null,
    );

    const router = useRouter();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const fetchEquipments = useCallback(
        async (page: number, size: number) => {
            try {
                setLoading(true);
                setError(null);

                const authToken = localStorage.getItem('token');

                if (!authToken) {
                    console.error(
                        'Token de autenticação não encontrado no localStorage.',
                    );
                    localStorage.removeItem('token');
                    router.push('/');
                    setError(
                        'Token de autenticação não encontrado. Por favor, faça login.',
                    );
                    setLoading(false);
                    return;
                }

                const response = await fetch(
                    `http://localhost:8080/admin/equipment?page=${page}&size=${size}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                    },
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        console.error(
                            'Erro 401: Não autorizado. Redirecionando para login.',
                        );
                        localStorage.removeItem('token');
                        router.push('/');
                        alert(
                            'Sessão expirada ou não autorizada. Faça login novamente.',
                        );
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: EquipmentResponse = await response.json();
                setEquipments(data.content);
                setCurrentPage(data.number);
                setTotalServerPages(data.totalPages);
                setTotalServerElements(data.totalElements);
            } catch (err: any) {
                setError(err.message);
                setEquipments([]);
                setTotalServerPages(1);
                setTotalServerElements(0);
            } finally {
                setLoading(false);
            }
        },
        [router],
    );

    useEffect(() => {
        fetchEquipments(currentPage, itemsPerPage);
    }, [fetchEquipments, currentPage, itemsPerPage]);

    const abrirModal = (equipment: Equipment) => {
        setEquipmentSelecionado({ ...equipment });
        setDadosEditaveis({ ...equipment });
        setModoEdicao(false);
    };

    const fecharModal = () => {
        setEquipmentSelecionado(null);
        setDadosEditaveis(null);
    };

    const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

    const atualizarCampo = (campo: keyof Equipment, valor: any) => {
        setDadosEditaveis((prev: Equipment | null) => {
            if (!prev) return null;
            return {
                ...prev,
                [campo]: valor,
            };
        });
    };

    const excluirEquipment = async (equipmentId: string) => {
        const authToken = localStorage.getItem('token');
        if (!authToken) {
            alert('Você não está autenticado.');
            router.push('/');
            return;
        }

        const confirmDelete = window.confirm(
            `Tem certeza que deseja excluir o equipamento?`,
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `http://localhost:8080/admin/equipment/${equipmentId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                },
            );

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/');
                    alert(
                        'Sessão expirada ou não autorizada. Faça login novamente.',
                    );
                }
                throw new Error(
                    `Erro ao excluir equipamento: HTTP error! status: ${response.status}`,
                );
            }

            alert('Equipamento excluído com sucesso!');
            fetchEquipments(currentPage, itemsPerPage);
            fecharModal();
        } catch (err: any) {
            console.error('Erro ao excluir equipamento:', err);
            setError(err.message);
        }
    };

    const salvarAlteracoes = async () => {
        if (!dadosEditaveis) return;

        const authToken = localStorage.getItem('token');
        if (!authToken) {
            alert('Você não está autenticado.');
            router.push('/');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/admin/equipment/${dadosEditaveis.equipmentId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(dadosEditaveis),
                },
            );

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/');
                    alert(
                        'Sessão expirada ou não autorizada. Faça login novamente.',
                    );
                }
                throw new Error(
                    `Erro ao salvar alterações: HTTP error! status: ${response.status}`,
                );
            }

            alert('Alterações salvas com sucesso!');
            fetchEquipments(currentPage, itemsPerPage);
            setModoEdicao(false);
            setEquipmentSelecionado(dadosEditaveis);
        } catch (err: any) {
            console.error('Erro ao salvar alterações:', err);
            setError(err.message);
        }
    };

    const paginate = (pageNumber: number) => {
        fetchEquipments(pageNumber, itemsPerPage);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
            {/* 2. NAVBAR */}
            <nav className="bg-white dark:bg-gray-800 p-1 shadow-sm flex justify-between items-center w-full z-10">
                
                {/* Lado Esquerdo */}
                <div className="flex items-center gap-4">
                    <Link href="/admin-dashboard">
                        <h1 className="text-xl font-bold text-black dark:text-white ml-7 cursor-pointer">
                            SPACE MASTER
                        </h1>
                    </Link>
                </div>

                {/* Lado Direito */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleDarkMode} 
                        className="text-black dark:text-white hover:text-verde-t2m transition-colors"
                        aria-label="Alternar modo claro/escuro"
                    >
                        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <button 
                        onClick={() => setShowProfileModal(true)} 
                        className="flex items-center gap-2 text-black dark:text-white hover:text-verde-t2m transition-colors"
                        aria-label="Abrir perfil"
                    >
                        <User size={24} /> 
                        <span className="text-sm font-medium">Olá, {user?.name}</span> {/* [!code focus] (Corrigido de user.name) */}
                    </button>
                    <button
                        onClick={toggleSidebar}
                        className="text-black dark:text-white hover:scale-110 transition p-2 rounded-md"
                    >
                        <Menu size={28} />
                    </button>
                </div>
            </nav>
            <div className="flex flex-1 transition-all duration-300">

                <main className="flex-1 bg-gray-200 dark:bg-gray-900 p-8 transition-all">

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
                        <h1 className="text-2xl font-bold mb-6 text-center">
                            Equipamentos Cadastrados
                        </h1>

                        {loading ? (
                            <div className="text-center py-10">
                                Carregando equipamentos...
                            </div>
                        ) : error ? (
                            <div className="text-center py-10 text-red-500">
                                Erro ao carregar equipamentos: {error}
                            </div>
                        ) : equipments.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                Nenhum equipamento encontrado.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {equipments.map((equipment) => (
                                    <div
                                        key={equipment.equipmentId}
                                        onClick={() => abrirModal(equipment)}
                                        className={`rounded-2xl p-6 shadow-md bg-purple-600 text-white cursor-pointer hover:scale-105 transition`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg">
                                                {equipment.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">
                                                    {equipment.name}
                                                </h2>
                                                <p className="text-sm">
                                                    Serial:{' '}
                                                    {equipment.serialNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p>
                                                <span className="font-semibold">
                                                    Status:
                                                </span>{' '}
                                                {(() => {
                                                    switch (
                                                        equipment.conservationStatus
                                                    ) {
                                                        case 'NEW':
                                                            return 'NOVO';
                                                        case 'SLIGHTLY_USED':
                                                            return 'POUCO USADO';
                                                        case 'USED':
                                                            return 'USADO';
                                                        case 'WORN':
                                                            return 'DESGASTADO';
                                                        case 'VERY_WORN':
                                                            return 'MUITO DESGASTADO';
                                                        case 'DAMAGED':
                                                            return 'DANIFICADO';
                                                        default:
                                                            return equipment.conservationStatus;
                                                    }
                                                })()}
                                            </p>
                                            <p>
                                                <span className="font-semibold">
                                                    Disponível:
                                                </span>{' '}
                                                {equipment.available
                                                    ? 'Sim'
                                                    : 'Não'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Controles de Paginação */}
                        {totalServerPages > 1 && (
                            <div className="flex justify-center mt-8 gap-4">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 0 || loading}
                                    className="p-2 rounded-full bg-verde-t2m text-white disabled:opacity-50"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                {Array.from(
                                    { length: totalServerPages },
                                    (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => paginate(i)}
                                            disabled={loading}
                                            className={`px-4 py-2 rounded-full ${
                                                currentPage === i
                                                    ? 'bg-verde-t2m text-white'
                                                    : 'bg-gray-300 text-black dark:bg-gray-700 dark:text-white'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ),
                                )}
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={
                                        currentPage === totalServerPages - 1 ||
                                        loading
                                    }
                                    className="p-2 rounded-full bg-verde-t2m text-white disabled:opacity-50"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </main>
                {/* 3.2 SIDEBAR */}
                {!sidebarCollapsed && (
                    <aside
                        className="bg-white dark:bg-gray-800 w-64 p-6 flex flex-col items-center shadow-sm relative transition-all duration-300 ease-in-out"
                    >
                        <div className="flex flex-col items-start gap-4 mt-8 w-full">
                            <NavItem
                                label="Início"
                                onClick={() => router.push('/admin-dashboard')}
                            />
                            <NavItem
                                label="Perfil"
                                onClick={() => setShowProfileModal(true)}
                            />
                            <NavItem
                                label="Nossos espaços"
                                onClick={() => router.push('/our-spaces')}
                            />
                            <NavItem
                                label="Configurações"
                            />
                            <NavItem
                                label="Sair"
                                onClick={() => router.push('/')}
                            />
                        </div>
                    </aside>
                    )}
            </div>

            {/* Modal do Equipamento */}
            {equipmentSelecionado && dadosEditaveis && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl relative overflow-y-auto max-h-[90vh]">
                        <button
                            className="absolute top-4 right-4"
                            onClick={fecharModal}
                        >
                            <X />
                        </button>

                        <div className="flex flex-col items-center mb-4">
                            <div className="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-5xl font-bold text-black dark:text-white">
                                {equipmentSelecionado.name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {equipmentSelecionado.name}
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <label className="block font-semibold mb-1 capitalize">
                                    Nome:
                                </label>
                                <input
                                    type="text"
                                    value={dadosEditaveis.name}
                                    onChange={(e) =>
                                        atualizarCampo('name', e.target.value)
                                    }
                                    readOnly={!modoEdicao}
                                    className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1 capitalize">
                                    Número de Série:
                                </label>
                                <input
                                    type="text"
                                    value={dadosEditaveis.serialNumber}
                                    readOnly
                                    className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1 capitalize">
                                    Status de Conservação:
                                </label>
                                {modoEdicao ? (
                                    <select
                                        value={
                                            dadosEditaveis.conservationStatus
                                        }
                                        onChange={(e) =>
                                            atualizarCampo(
                                                'conservationStatus',
                                                e.target
                                                    .value as Equipment['conservationStatus'],
                                            )
                                        }
                                        className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                                    >
                                        <option value="NEW">NOVO</option>
                                        <option value="SLIGHTLY_USED">
                                            POUCO USADO
                                        </option>
                                        <option value="USED">USADO</option>
                                        <option value="WORN">DESGASTADO</option>
                                        <option value="VERY_WORN">
                                            MUITO DESGASTADO
                                        </option>
                                        <option value="DAMAGED">
                                            DANIFICADO
                                        </option>
                                    </select>
                                ) : (
                                    <p className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                        {(() => {
                                            switch (
                                                dadosEditaveis.conservationStatus
                                            ) {
                                                case 'NEW':
                                                    return 'NOVO';
                                                case 'SLIGHTLY_USED':
                                                    return 'POUCO USADO';
                                                case 'USED':
                                                    return 'USADO';
                                                case 'WORN':
                                                    return 'DESGASTADO';
                                                case 'VERY_WORN':
                                                    return 'MUITO DESGASTADO';
                                                case 'DAMAGED':
                                                    return 'DANIFICADO';
                                                default:
                                                    return dadosEditaveis.conservationStatus;
                                            }
                                        })()}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1 capitalize">
                                    Disponível:
                                </label>
                                {modoEdicao ? (
                                    <input
                                        type="checkbox"
                                        checked={dadosEditaveis.available}
                                        onChange={(e) =>
                                            atualizarCampo(
                                                'available',
                                                e.target.checked,
                                            )
                                        }
                                        className="ml-2 w-5 h-5"
                                    />
                                ) : (
                                    <p className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                                        {dadosEditaveis.available
                                            ? 'Sim'
                                            : 'Não'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => {
                                    if (equipmentSelecionado) {
                                        excluirEquipment(
                                            equipmentSelecionado.equipmentId,
                                        );
                                    }
                                }}
                                className="bg-red-600 text-white py-2 px-4 rounded-lg hover:brightness-110"
                            >
                                Excluir Equipamento
                            </button>

                            {modoEdicao ? (
                                <button
                                    onClick={salvarAlteracoes}
                                    className="bg-verde-t2m text-white py-2 px-4 rounded-lg hover:brightness-110"
                                >
                                    Salvar Alterações
                                </button>
                            ) : (
                                <button
                                    onClick={() => setModoEdicao(true)}
                                    className="bg-verde-t2m text-white py-2 px-4 rounded-lg hover:brightness-110"
                                >
                                    <Pencil size={16} /> Editar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
