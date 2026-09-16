'use client';

import React, { useState, useEffect } from 'react';
import {
    Moon,
    Menu,
    LayoutGrid,
    User,
    Settings,
    Building,
    ScreenShare,
    Box,
    LogOut,
    Pencil,
    Trash2,
    Plus,
    Minus,
    X,
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
        onClick={onClick}
        className="flex flex-col items-center gap-1 cursor-pointer group"
    >
        <div className="text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {icon}
        </div>
        <span className="text-sm font-medium text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {label}
        </span>
    </div>
);

export default function CompanyDashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [limiteHoras, setLimiteHoras] = useState(20);
    const horasUtilizadas = 8;

    const gestores = ['Maria Silva', 'José Santos'];
    const colaboradores = ['Ana Costa', 'Pedro Lima'];

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
    const toggleDarkMode = () => setDarkMode((prev) => !prev);

    const handleIncrement = () => setLimiteHoras((prev) => prev + 1);
    const handleDecrement = () =>
        setLimiteHoras((prev) => Math.max(prev - 1, 0));

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
            <div className="flex flex-1 transition-all duration-300">
                {/* Sidebar */}
                <aside
                    className={`bg-verde-t2m dark:bg-gray-800 ${sidebarCollapsed ? 'w-16' : 'w-64'} p-6 flex flex-col items-center relative transition-all duration-300`}
                >
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-4 right-4 hover:scale-110 transition"
                    >
                        <Menu size={28} />
                    </button>

                    <div className="flex items-center mb-8">
                        {!sidebarCollapsed && (
                            <img
                                src={
                                    darkMode
                                        ? '/img/logot2m(dark).png'
                                        : '/img/logot2m(2).png'
                                }
                                alt="T2M logo"
                                className="h-28"
                            />
                        )}
                    </div>

                    {!sidebarCollapsed && (
                        <>
                            <h2 className="text-xl font-bold mb-2">
                                Olá, administrador!
                            </h2>
                            <p className="mb-4">
                                Seja bem-vindo ao ambiente virtual da T2M!
                            </p>
                            <p className="text-center">
                                Saiba mais sobre as nossas ferramentas e confira
                                nossas novidades na página inicial.
                            </p>
                        </>
                    )}
                </aside>

                {/* Main */}
                <main className="flex-1 bg-gray-200 dark:bg-gray-900 p-8 transition-all">
                    {/* Navbar */}
                    <div className="flex justify-between items-center gap-5 mb-8">
                        <NavItem
                            icon={<LayoutGrid size={24} />}
                            label="Entrar"
                        />
                        <NavItem
                            icon={<User size={24} />}
                            label="Perfil"
                            onClick={() => setShowModal(true)}
                        />
                        <NavItem
                            icon={<Settings size={24} />}
                            label="Sistema"
                        />
                        <NavItem
                            icon={<Building size={24} />}
                            label="Auditórios"
                        />
                        <NavItem
                            icon={<ScreenShare size={24} />}
                            label="Salas de reunião"
                        />
                        <NavItem icon={<Box size={24} />} label="Coworking" />
                        <NavItem icon={<LogOut size={24} />} label="Sair" />
                    </div>

                    {/* Dashboard Empresa */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
                        <div className="flex items-center gap-4 mb-6">
                            <img
                                src="/img/logoT2M.png"
                                alt="Logo Empresa"
                                className="h-16 w-16 rounded-full bg-white p-1"
                            />
                            <h1 className="text-2xl font-bold">
                                Test To Market LTDA
                            </h1>
                        </div>
                        <p className="mb-2">
                            <span className="font-semibold">CNPJ:</span>{' '}
                            XX.XXX.XXX/XXXX-XX
                        </p>
                        <p className="mb-2">
                            <span className="font-semibold">Telefone:</span>{' '}
                            (XX) XXXXX-XXXX
                        </p>

                        <div className="flex items-center gap-4 mb-4">
                            <div>
                                <p className="font-semibold mb-1">
                                    Limite mensal de horas:
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDecrement}
                                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="text-lg">
                                        {limiteHoras} horas
                                    </span>
                                    <button
                                        onClick={handleIncrement}
                                        className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold mb-1">
                                    Horas utilizadas:
                                </p>
                                <span className="text-lg">
                                    {horasUtilizadas} horas
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                                <Pencil size={16} /> Editar empresa
                            </button>
                            <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
                                <Trash2 size={16} /> Excluir empresa
                            </button>
                        </div>

                        <hr className="my-6" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* Gestores */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">
                                    Gestores
                                </h2>
                                <ul className="space-y-2">
                                    {gestores.map((nome, idx) => (
                                        <li
                                            key={idx}
                                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center"
                                        >
                                            {nome}
                                            <div className="flex gap-2">
                                                <button className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Colaboradores */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">
                                    Colaboradores
                                </h2>
                                <ul className="space-y-2">
                                    {colaboradores.map((nome, idx) => (
                                        <li
                                            key={idx}
                                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center"
                                        >
                                            {nome}
                                            <div className="flex gap-2">
                                                <button className="p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                                                    <Pencil size={16} />
                                                </button>
                                                <button className="p-1 rounded-full bg-red-500 hover:bg-red-600 text-white">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal Perfil */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-black dark:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Informações Pessoais
                        </h2>

                        <div className="flex flex-col items-center mb-4">
                            <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-600" />
                        </div>

                        <div className="flex flex-col gap-3">
                            {[
                                'Nome: João Silva',
                                'Identidade: 123456789',
                                'CPF: 000.000.000-00',
                                'Endereço: Rua das Flores, 123 - SP',
                                'Email: joao.silva@empresa.com',
                            ].map((info) => (
                                <div key={info}>
                                    <label className="block font-semibold mb-1">
                                        {info.split(':')[0]}:
                                    </label>
                                    <input
                                        type="text"
                                        value={info.split(': ')[1]}
                                        readOnly
                                        className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-6">
                            <button className="flex items-center gap-2 bg-verde-t2m text-white py-2 px-4 rounded-lg hover:brightness-110">
                                <Pencil size={16} />
                                Editar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
