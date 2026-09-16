'use client';

import { RegistrationForm } from '@/components/ui/registartion-form'; // Corrigi o typo no nome do arquivo se necessário

export default function RegisterPage() {
    return (
        // min-h-screen e flex centralizam tudo verticalmente e horizontalmente
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            
            {/* Título do Sistema (Identidade Visual) */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-blue-900 tracking-tight">
                    Space Master
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Gestão de Auditórios
                </p>
            </div>

            {/* Container do Formulário - Largura ajustada para acomodar 2 colunas */}
            <div className="w-full max-w-[800px]">
                <RegistrationForm />
            </div>

             {/* Rodapé discreto */}
             <p className="mt-8 text-center text-xs text-slate-400">
                &copy; 2025 Space Master. Todos os direitos reservados.
            </p>
        </div>
    );
}