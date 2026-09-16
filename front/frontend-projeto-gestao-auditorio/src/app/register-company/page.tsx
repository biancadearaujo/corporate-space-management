'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
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
    Upload,
    Pencil,
    Check,
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

export default function AdminDashboard() {
    const [darkMode, setDarkMode] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState({
        nome: 'João Silva',
        identidade: '123456789',
        cpf: '000.000.000-00',
        endereco: 'Rua das Flores, 123 - São Paulo - SP',
        email: 'joao.silva@empresa.com',
        foto: '',
    });

    const [companyData, setCompanyData] = useState({
        name: '',
        email: '',
        cnpj: '',
        monthlyLimitHours: 20,
    });

    const router = useRouter();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode((prev) => !prev);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileData((prev) => ({ ...prev, foto: imageUrl }));
        }
    };

    // Função para lidar com a mudança nos inputs do formulário da empresa
    const handleCompanyInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { name, value } = e.target;
        setCompanyData((prev) => ({ ...prev, [name]: value }));
    };

    // Função para lidar com o envio do formulário da empresa
    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Você precisa estar logado para cadastrar uma empresa.');
            return;
        }

        // Monta o payload com os dados do estado
        const payload = {
            name: companyData.name,
            email: companyData.email,
            cnpj: companyData.cnpj.replace(/[^\d]/g, ''),
            monthlyLimitHours: Number(companyData.monthlyLimitHours),
            consumedHours: 0,
            additionalHoursApproved: 0,
        };

        try {
            const response = await axios.post(
                'http://localhost:8080/admin/company',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            console.log(payload);
            console.log('Empresa cadastrada com sucesso:', response.data);
            alert('Empresa cadastrada com sucesso!');
            setCompanyData({
                name: '',
                email: '',
                cnpj: '',
                monthlyLimitHours: 20,
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                alert(
                    'Sua sessão expirou ou o token é inválido. Por favor, faça o login novamente.',
                );
            } else {
                console.error('Erro ao cadastrar empresa:', error);
                alert(
                    'Erro ao cadastrar empresa. Verifique o console para mais detalhes.',
                );
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
            <div className="flex flex-1 transition-all duration-300">
                <main className="flex-1 bg-gray-200 dark:bg-gray-900 p-8 transition-all duration-300">
                    {/* Navbar */}
                    <div className="flex justify-between items-center gap-5 mb-8">
                        <NavItem
                            icon={<LayoutGrid size={24} strokeWidth={1.5} />}
                            label="início"
                            onClick={() => router.push('/admin-dashboard')}
                        />
                        <NavItem
                            icon={<User size={24} strokeWidth={1.5} />}
                            label="Perfil"
                            onClick={() => setShowProfileModal(true)}
                        />
                        <NavItem
                            icon={<Box size={24} strokeWidth={1.5} />}
                            label="Nossos espaços"
                            onClick={() => router.push('/our-spaces')}
                        />
                        <NavItem
                            icon={<Settings size={24} strokeWidth={1.5} />}
                            label="Configurações"
                        />
                        <NavItem
                            icon={<LogOut size={24} strokeWidth={1.5} />}
                            label="Sair"
                            onClick={() => router.push('/')}
                        />
                    </div>

                    {/* Formulário de cadastro de empresa */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6 text-center">
                            Cadastro de Empresa
                        </h1>

                        {/* Adicionado o form e o onSubmit */}
                        <form
                            onSubmit={handleCompanySubmit}
                            className="flex flex-col gap-4"
                        >
                            <label className="font-medium">
                                Nome da empresa:
                                <input
                                    type="text"
                                    name="name"
                                    value={companyData.name}
                                    onChange={handleCompanyInputChange}
                                    placeholder="Digite o nome da empresa"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                    required
                                />
                            </label>

                            <label className="font-medium">
                                CNPJ:
                                <input
                                    type="text"
                                    name="cnpj"
                                    value={companyData.cnpj}
                                    onChange={handleCompanyInputChange}
                                    placeholder="Ex: 00.000.000/0001-00"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                    required
                                />
                            </label>

                            <label className="font-medium">
                                E-mail corporativo:
                                <input
                                    type="email"
                                    name="email"
                                    value={companyData.email}
                                    onChange={handleCompanyInputChange}
                                    placeholder="Ex: contato@empresa.com"
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                    required
                                />
                            </label>

                            <label className="font-medium">
                                Limite Mensal de Horas:
                                <input
                                    type="number"
                                    name="monthlyLimitHours"
                                    value={companyData.monthlyLimitHours}
                                    onChange={handleCompanyInputChange}
                                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white"
                                    required
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

                            <button
                                type="submit"
                                className="mt-6 bg-verde-t2m text-white py-2 px-4 rounded-lg hover:brightness-110 transition-all duration-300"
                            >
                                Cadastrar empresa
                            </button>
                        </form>
                    </div>
                </main>
            </div>

            {showProfileModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto relative">
                        {/* Botão fechar */}
                        <button
                            onClick={() => {
                                setShowProfileModal(false);
                                setIsEditing(false);
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Informações Pessoais
                        </h2>

                        {/* Foto */}
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300">
                                {profileData.foto ? (
                                    <img
                                        src={profileData.foto}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Sem foto
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <label className="mt-2 cursor-pointer text-sm text-verde-t2m hover:underline flex items-center gap-1">
                                    <Upload size={16} />
                                    <span>Selecionar foto</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Campos */}
                        <div className="space-y-3">
                            {[
                                'nome',
                                'identidade',
                                'cpf',
                                'email',
                                'endereco',
                            ].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium capitalize">
                                        {field === 'nome'
                                            ? 'Nome completo:'
                                            : field === 'endereco'
                                              ? 'Residência:'
                                              : field.charAt(0).toUpperCase() +
                                                field.slice(1) +
                                                ':'}
                                    </label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={(profileData as any)[field]}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                        className={`mt-1 w-full rounded-md border px-3 py-2 text-sm ${
                                            isEditing
                                                ? 'bg-white dark:bg-gray-700 border-gray-300'
                                                : 'bg-gray-100 dark:bg-gray-700 border-transparent'
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end gap-3 mt-6">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-verde-t2m text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                                >
                                    <Pencil size={16} /> Editar
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 bg-verde-t2m text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                                >
                                    <Check size={16} /> Confirmar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
