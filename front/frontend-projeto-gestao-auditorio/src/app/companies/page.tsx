'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    X,
    Plus,
    Minus,
    Trash2,
    Check,
} from 'lucide-react';

interface Empresa {
    id: number;
    nome: string;
    cnpj: string;
    telefone: string;
    logo: string;
    horasUtilizadas: number;
    limiteHoras: number;
    cor: string;
    gestores: string[];
    colaboradores: string[];
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

const NavItem = ({ icon, label, onClick }: NavItemProps) => (
    <div onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer group">
        <div className="text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {icon}
        </div>
        <span className="text-sm font-medium text-black dark:text-white group-hover:text-verde-t2m transition-colors">
            {label}
        </span>
    </div>
);

const empresasIniciais: Empresa[] = [
    {
        id: 1,
        nome: 'Test To Market LTDA',
        cnpj: '00.000.000/0001-00',
        telefone: '(21) 90000-0000',
        logo: '/img/logoT2M.png',
        horasUtilizadas: 8,
        limiteHoras: 12,
        cor: 'bg-green-500',
        gestores: ['Ana Silva', 'Carlos Souza'],
        colaboradores: ['Bruno Lima', 'Fernanda Costa'],
    },
    {
        id: 2,
        nome: 'Serratec',
        cnpj: '11.111.111/0001-11',
        telefone: '(21) 91111-1111',
        logo: '/img/logoserratec.png',
        horasUtilizadas: 4,
        limiteHoras: 10,
        cor: 'bg-blue-500',
        gestores: ['Lucas Pereira'],
        colaboradores: ['Mariana Gomes'],
    },
    {
        id: 3,
        nome: 'Órbita',
        cnpj: '22.222.222/0001-22',
        telefone: '(21) 92222-2222',
        logo: '/img/logob.png',
        horasUtilizadas: 11,
        limiteHoras: 15,
        cor: 'bg-blue-800',
        gestores: ['Rafael Dias'],
        colaboradores: ['Gabriela Rocha'],
    },
    {
        id: 4,
        nome: 'Orange Business',
        cnpj: '33.333.333/0001-33',
        telefone: '(21) 93333-3333',
        logo: '/img/logoorange.png',
        horasUtilizadas: 6,
        limiteHoras: 14,
        cor: 'bg-orange-500',
        gestores: ['Juliana Fernandes'],
        colaboradores: ['André Silva'],
    },
];

export default function AdminDashboard() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [empresas, setEmpresas] = useState<Empresa[]>(empresasIniciais);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [empresaSelecionada, setEmpresaSelecionada] = useState<Empresa | null>(null);
    const [view, setView] = useState<'cadastradas' | 'cadastro'>('cadastradas');

    const router = useRouter();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
        document.body.style.overflow = empresaSelecionada ? 'hidden' : 'auto';
    }, [empresaSelecionada]);

    const abrirModal = (empresa: Empresa) => {
        setEmpresaSelecionada({ ...empresa });
    };

    const fecharModal = () => {
        setEmpresaSelecionada(null);
    };

    const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

    const alterarLimiteHoras = (delta: number) => {
        if (!empresaSelecionada) return;
        const novaEmpresa = { ...empresaSelecionada, limiteHoras: empresaSelecionada.limiteHoras + delta };
        setEmpresaSelecionada(novaEmpresa);
        setEmpresas(empresas.map(e => e.id === novaEmpresa.id ? novaEmpresa : e));
    };

    const excluirEmpresa = (id: number) => {
        setEmpresas(empresas.filter(e => e.id !== id));
        fecharModal();
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
            <div className="flex flex-1">
                <aside className={`bg-verde-t2m dark:bg-gray-800 ${sidebarCollapsed ? 'w-16' : 'w-64'} p-6 flex flex-col items-center relative`}>
                    <button onClick={toggleSidebar} className="absolute top-4 right-4 hover:scale-110 transition text-white">
                        <Menu size={28} />
                    </button>
                    {!sidebarCollapsed && (
                        <>
                            <img src={darkMode ? '/img/logot2m(dark).png' : '/img/logot2m(2).png'} alt="Logo" className="h-28 mb-6" />
                            <h2 className="text-xl font-bold mb-2 text-white">Olá, administrador!</h2>
                            <p className="mb-4 text-white">Seja bem-vindo ao ambiente virtual da T2M!</p>
                            <p className='mb-4 text-white'>Saiba mais sobre nossas ferramentas na página inicial.</p>
                        </>
                    )}
                </aside>

                <main className="flex-1 p-8">
                    <div className="flex justify-between items-center gap-5 mb-8">
                        <NavItem icon={<LayoutGrid />} label="Início" onClick={() => router.push('/admin-dashboard')} />
                        <NavItem icon={<User />} label="Perfil"onClick={() => setShowProfileModal(true)} />
                        <NavItem icon={<Box />} label="Nossos espaços" onClick={() => router.push('/our-spaces')} />
                        <NavItem icon={<Settings />} label="Sistema" />
                        <NavItem icon={<LogOut />} label="Sair" onClick={() => router.push('/')} />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md">
                        <h1 className="text-2xl font-bold mb-6 text-center">Empresas</h1>
                        <div className="flex justify-center gap-4 mb-6">
                            <button onClick={() => setView('cadastradas')} className={`py-2 px-4 rounded-lg ${view === 'cadastradas' ? 'bg-verde-t2m text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                Empresas Cadastradas
                            </button>
                            <button onClick={() => setView('cadastro')} className={`py-2 px-4 rounded-lg ${view === 'cadastro' ? 'bg-verde-t2m text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                Cadastrar Empresa
                            </button>
                        </div>

                        {view === 'cadastro' ? (
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6 text-center">Cadastro de Empresa</h1>

                        <div className="flex flex-col gap-4">
                            <label className="font-medium">
                                Nome da empresa:
                                <input
                                    type="text"
                                    placeholder="Digite o nome da empresa"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                />
                            </label>

                            <label className="font-medium">
                                CNPJ:
                                <input
                                    type="text"
                                    placeholder="Ex: 00.000.000/0001-00"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                />
                            </label>

                            <label className="font-medium">
                                E-mail corporativo:
                                <input
                                    type="email"
                                    placeholder="Ex: contato@empresa.com"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                />
                            </label>

                            <label className="font-medium">
                                Telefone:
                                <input
                                    type="tel"
                                    placeholder="Ex: (11) 99999-9999"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                />
                            </label>

                            <label className="font-medium">
                                Endereço:
                                <input
                                    type="text"
                                    placeholder="Ex: Rua Exemplo, 123 - Bairro - Cidade - UF"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                />
                            </label>

                            <label className="font-medium">
                                Divisões de espaço:
                                <input
                                    type="text"
                                    placeholder="Ex: 3 salas, 2 escritórios, 1 copa"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                />
                            </label>

                            <label className="font-medium">
                                Logo da empresa:
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-verde-t2m file:text-white hover:file:brightness-110"
                                />
                            </label>

                            <button className="mt-6 bg-verde-t2m text-white py-2 px-4 rounded-lg hover:brightness-110 transition-all duration-300">
                                Cadastrar empresa
                            </button>
                        </div>
                    </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {empresas.map((empresa) => (
                                    <div
                                        key={empresa.id}
                                        onClick={() => abrirModal(empresa)}
                                        className={`rounded-2xl p-6 shadow-md ${empresa.cor} text-white cursor-pointer hover:scale-105 transition`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <img src={empresa.logo} alt="Logo" className="h-16 w-16 rounded-full bg-white p-1" />
                                            <div>
                                                <h2 className="text-xl font-bold">{empresa.nome}</h2>
                                                <p className="text-sm">{empresa.cnpj}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p><span className="font-semibold">Telefone:</span> {empresa.telefone}</p>
                                            <p><span className="font-semibold">Limite mensal:</span> {empresa.limiteHoras} horas</p>
                                            <p><span className="font-semibold">Horas utilizadas:</span> {empresa.horasUtilizadas} horas</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {empresaSelecionada && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-md max-w-2xl w-full relative max-h-[90vh] overflow-y-auto transition-all duration-300 transform scale-100">
                        <button onClick={fecharModal} className="absolute top-4 right-4 text-black hover:text-red-600 shadow-md">
                            <X size={24} />
                        </button>
                        <div className="flex flex-col items-center mb-6">
                            <img src={empresaSelecionada.logo} alt="Logo" className="h-24 w-24 rounded-full mb-4" />
                            <h2 className="text-2xl font-bold">{empresaSelecionada.nome}</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <strong>Nome:</strong>
                                <div className="bg-gray-100 p-2 rounded-lg">{empresaSelecionada.nome}</div>
                            </div>
                            <div>
                                <strong>Cnpj:</strong>
                                <div className="bg-gray-100 p-2 rounded-lg">{empresaSelecionada.cnpj}</div>
                            </div>
                            <div>
                                <strong>Telefone:</strong>
                                <div className="bg-gray-100 p-2 rounded-lg">{empresaSelecionada.telefone}</div>
                            </div>
                            <div>
                                <strong>Limite mensal de horas:</strong>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => alterarLimiteHoras(-1)} className="bg-red-500 text-white p-2 rounded-full"><Minus /></button>
                                    <span>{empresaSelecionada.limiteHoras} horas</span>
                                    <button onClick={() => alterarLimiteHoras(1)} className="bg-green-500 text-white p-2 rounded-full"><Plus /></button>
                                </div>
                            </div>
                            <div>
                                <strong>Horas utilizadas:</strong> {empresaSelecionada.horasUtilizadas} horas
                            </div>
                            <div>
                                <strong>Gestores</strong>
                                {empresaSelecionada.gestores.map((nome, index) => (
                                    <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-lg mt-2">
                                        {nome}
                                        <div className="flex gap-2">
                                            <button className="text-red-600"><Trash2 size={18} /></button>
                                            <button className="text-teal-600"><Pencil size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <strong>Colaboradores</strong>
                                {empresaSelecionada.colaboradores.map((nome, index) => (
                                    <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-lg mt-2">
                                        {nome}
                                        <div className="flex gap-2">
                                            <button className="text-red-600"><Trash2 size={18} /></button>
                                            <button className="text-teal-600"><Pencil size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => excluirEmpresa(empresaSelecionada.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg">Excluir Empresa</button>
                                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Pencil size={18} /> Editar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}