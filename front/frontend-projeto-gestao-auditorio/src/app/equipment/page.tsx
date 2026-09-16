'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Menu,
    LayoutGrid,
    User,
    Settings,
    Box,
    LogOut,
} from 'lucide-react';

const NavItem = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
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

export default function Equipamentos() {
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
    const [view, setView] = useState<'cadastro' | 'listagem'>('cadastro');
    const [detalhes, setDetalhes] = useState({
        marca: '',
        modelo: '',
        numeroSerie: '',
        descricao: '',
        especifico: '',
    });

    const equipamentos = [
        'TV',
        'Monitor de Alta Resolução',
        'Webcam',
        'Microfone',
        'Caixas de Som',
        'Mini PC ou Notebook Integrado',
        'Sistema de Espelhamento de Tela',
        'Projetor',
        'Lousa de Vidro ou Quadro Branco',
        'Marcadores para Lousa',
        'Flip Chart',
        'Extensões de Tomada e Filtros de Linha',
        'Adaptadores de Conexão',
        'Iluminação Direcional Suave',
        'Cadeiras Ergonômicas',
        'Máquina de Café',
        'Novo equipamento',
    ];

    const [equipamentosCadastrados, setEquipamentosCadastrados] = useState(
        equipamentos.slice(0, -1).map((nome) => ({
            nome,
            marca: '',
            modelo: '',
            numeroSerie: '',
            descricao: '',
        }))
    );

    const [equipamentoEmEdicao, setEquipamentoEmEdicao] = useState<any>(null);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDetalhes(prev => ({ ...prev, [name]: value }));
    };

    const renderCampoEspecifico = () => {
        if (equipamentoSelecionado === 'TV') {
            return (
                <label className="font-medium">
                    Número de polegadas e se é Smart:
                    <input
                        type="text"
                        name="especifico"
                        placeholder="Ex.: 55 polegadas, Smart"
                        value={detalhes.especifico}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white"
                    />
                </label>
            );
        }
        if (equipamentoSelecionado === 'Monitor de Alta Resolução') {
            return (
                <label className="font-medium">
                    Tamanho do monitor (polegadas):
                    <input
                        type="text"
                        name="especifico"
                        placeholder="Ex.: 27 polegadas"
                        value={detalhes.especifico}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white"
                    />
                </label>
            );
        }
        if (equipamentoSelecionado === 'Microfone') {
            return (
                <label className="font-medium">
                    Tipo:
                    <input
                        type="text"
                        name="especifico"
                        placeholder="Ex.: Mesa ou Ambiente"
                        value={detalhes.especifico}
                        onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white"
                    />
                </label>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
            <div className="flex flex-1 transition-all duration-300">
                <aside className={`bg-verde-t2m dark:bg-gray-800 ${sidebarCollapsed ? 'w-16' : 'w-64'} p-6 flex flex-col items-center relative transition-all duration-300 ease-in-out`}>
                    <button
                        onClick={toggleSidebar}
                        className="absolute top-4 right-4 hover:scale-110 transition"
                    >
                        <Menu size={28} />
                    </button>

                    {!sidebarCollapsed && (
                        <>
                            <img src={darkMode ? '/img/logot2m(dark).png' : '/img/logot2m(2).png'} alt="T2M logo" className="h-28 mb-4" />
                            <h2 className="text-xl font-bold mb-2">Olá, administrador!</h2>
                            <p className="mb-4">Seja bem-vindo ao ambiente virtual da T2M!</p>
                            <p>Saiba mais sobre nossas ferramentas e confira as novidades da página inicial.</p>
                        </>
                    )}
                </aside>

                <main className="flex-1 bg-gray-200 dark:bg-gray-900 p-8 transition-all duration-300">
                    <div className="flex justify-between items-center gap-5 mb-8">
                        <NavItem icon={<LayoutGrid size={24} />} label="Início" onClick={() => router.push('/admin-dashboard')} />
                        <NavItem icon={<User size={24} />} label="Perfil" />
                        <NavItem icon={<Box size={24} />} label="Nossos espaços" onClick={() => router.push('/our-spaces')} />
                        <NavItem icon={<Settings size={24} />} label="Configurações" />
                        <NavItem icon={<LogOut size={24} />} label="Sair" onClick={() => router.push('/')} />
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-6 text-center">Equipamentos</h1>

                        <div className="flex justify-center gap-4 mb-6">
                            <button onClick={() => setView('cadastro')} className={`px-4 py-2 rounded-lg font-medium ${view === 'cadastro' ? 'bg-verde-t2m text-white' : 'bg-gray-300 dark:bg-gray-700 dark:text-white'}`}>Cadastrar Equipamentos</button>
                            <button onClick={() => setView('listagem')} className={`px-4 py-2 rounded-lg font-medium ${view === 'listagem' ? 'bg-verde-t2m text-white' : 'bg-gray-300 dark:bg-gray-700 dark:text-white'}`}>Equipamentos Cadastrados</button>
                        </div>

                        {view === 'cadastro' ? (
                            <div className="flex flex-col gap-4">
                                <label className="font-medium">
                                    Selecione o equipamento:
                                    <select name="equipamento" value={equipamentoSelecionado} onChange={e => setEquipamentoSelecionado(e.target.value)} className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white">
                                        <option value="">Selecione</option>
                                        {equipamentos.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </label>

                                {renderCampoEspecifico()}

                                <label className="font-medium">Marca:
                                    <input type="text" name="marca" placeholder="Digite a marca" value={detalhes.marca} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white" />
                                </label>

                                <label className="font-medium">Modelo:
                                    <input type="text" name="modelo" placeholder="Digite o modelo" value={detalhes.modelo} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white" />
                                </label>

                                <label className="font-medium">Número de Série:
                                    <input type="text" name="numeroSerie" placeholder="Digite o número de série" value={detalhes.numeroSerie} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white" />
                                </label>

                                <label className="font-medium">Descrição (opcional):
                                    <input type="text" name="descricao" placeholder="Observações adicionais" value={detalhes.descricao} onChange={handleChange} className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white" />
                                </label>

                                <button className="mt-6 bg-verde-t2m text-white py-2 px-4 rounded-lg hover:brightness-110 transition-all duration-300" onClick={() => alert('Equipamento cadastrado com sucesso!')}>
                                    Cadastrar {equipamentoSelecionado ? equipamentoSelecionado.toLowerCase() : 'equipamento'}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {equipamentosCadastrados.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-4 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 cursor-pointer hover:shadow-md transition" onClick={() => setEquipamentoEmEdicao({ ...item, index })}>
                                        <h2 className="font-semibold text-lg">{item.nome}</h2>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {equipamentoEmEdicao && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md relative">
                        <button onClick={() => setEquipamentoEmEdicao(null)} className="absolute top-3 right-4 text-black dark:text-white">✕</button>
                        <h2 className="text-xl font-bold mb-4">{equipamentoEmEdicao.nome}</h2>

                        <div className="flex flex-col gap-4">
                            <label className="font-medium">Marca:
                                <input type="text" className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white" value={equipamentoEmEdicao.marca} onChange={(e) => setEquipamentoEmEdicao((prev: any) => ({ ...prev, marca: e.target.value }))} />
                            </label>
                            <label className="font-medium">Modelo:
                                <input type="text" className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white" value={equipamentoEmEdicao.modelo} onChange={(e) => setEquipamentoEmEdicao((prev: any) => ({ ...prev, modelo: e.target.value }))} />
                            </label>
                            <label className="font-medium">Número de Série:
                                <input type="text" className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white" value={equipamentoEmEdicao.numeroSerie} onChange={(e) => setEquipamentoEmEdicao((prev: any) => ({ ...prev, numeroSerie: e.target.value }))} />
                            </label>
                            <label className="font-medium">Descrição:
                                <input type="text" className="mt-1 w-full p-2 border rounded-lg dark:bg-gray-900 dark:text-white" value={equipamentoEmEdicao.descricao} onChange={(e) => setEquipamentoEmEdicao((prev: any) => ({ ...prev, descricao: e.target.value }))} />
                            </label>

                            <button className="mt-4 bg-verde-t2m text-white py-2 px-4 rounded-lg hover:brightness-110" onClick={() => {
                                setEquipamentosCadastrados((prev) => {
                                    const novos = [...prev];
                                    novos[equipamentoEmEdicao.index] = { ...equipamentoEmEdicao };
                                    return novos;
                                });
                                setEquipamentoEmEdicao(null);
                            }}>
                                Salvar alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}