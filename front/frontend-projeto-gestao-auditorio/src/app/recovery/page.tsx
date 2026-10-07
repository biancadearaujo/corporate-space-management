'use client';

import { RecoveryForm } from '@/components/ui/recovery-form';

export default function RecoveryPage() {
    return (
        <div className="w-full h-screen grid lg:grid-cols-2 bg-[#FAFAFA] font-sans overflow-hidden">
            
            {/* LADO ESQUERDO: Identidade Visual Órbita */}
            <div className="hidden lg:flex relative flex-col items-center justify-center overflow-hidden bg-[#003399]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#001738] via-[#003399] to-[#002266]"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>

                <div className="relative z-10 flex flex-col items-center gap-6 p-10 text-center animate-in fade-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center text-white mb-2 shadow-2xl">
                        <svg width="48" height="56" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/>
                        </svg>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md">Órbita</h1>
                    <p className="text-blue-100/80 text-lg font-medium tracking-wide max-w-sm">
                        Recuperação de acesso à plataforma de gestão de espaços corporativos.
                    </p>
                </div>
            </div>

            {/* LADO DIREITO: Área do Formulário */}
            <div className="flex items-center justify-center p-6 sm:p-12 relative h-full overflow-y-auto">
                
                {/* Aqui inserimos o formulário com a largura e animações corretas */}
                <RecoveryForm className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto" />

                {/* Fundo decorativo direito */}
                <div className="hidden lg:block fixed top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full opacity-50 blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}