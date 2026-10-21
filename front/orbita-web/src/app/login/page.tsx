'use client';

import { LoginForm } from '@/components/ui/login-form';

export default function LoginPage() {
  return (
    <div className="w-full h-screen grid lg:grid-cols-2 bg-[#FAFAFA] font-sans overflow-hidden">
      
      {/* LADO ESQUERDO: Branding e Identidade Visual */}
      <div className="hidden lg:flex relative flex-col items-center justify-center overflow-hidden bg-[#003399]">
        
        {/* Gradiente base da marca */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001738] via-[#003399] to-[#002266]"></div>
        
        {/* Círculos luminosos (Efeito Blur/Glow) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px]"></div>
        
        {/* Padrão decorativo pontilhado muito subtil */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}>
        </div>

        {/* Conteúdo Centralizado */}
        <div className="relative z-10 flex flex-col items-center gap-6 p-10 text-center animate-in fade-in zoom-in-95 duration-700">
            {/* Ícone/Logo do Órbita */}
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center text-white mb-2 shadow-2xl">
                <svg width="48" height="56" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/>
                    <path d="M4 14h8v12"/>
                    <path d="M12 2v12l8-4"/>
                </svg>
            </div>
           
            <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
                Órbita
            </h1>
            <p className="text-blue-100/80 text-lg font-medium tracking-wide max-w-sm">
                Plataforma integrada para gestão e reserva de espaços corporativos.
            </p>
        </div>
      </div>

      {/* LADO DIREITO: Área de Login */}
      {/* Adicionado overflow-y-auto para garantir que nunca corta conteúdo em telas pequenas */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative h-full overflow-y-auto">
        
        {/* Card do Formulário: Removidas as margens negativas e adicionado 'my-auto' */}
        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
            
            {/* Cabecalho Mobile */}
            <div className="flex flex-col items-center justify-center lg:hidden mb-6">
                <div className="text-[#003399] mb-3">
                    <svg width="40" height="46" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/>
                        <path d="M4 14h8v12"/>
                        <path d="M12 2v12l8-4"/>
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-[#003399] tracking-tight">Órbita</h1>
            </div>

            {/* NOTA: Títulos removidos daqui porque o seu <LoginForm /> já os tem embutidos! */}

            {/* O Componente do seu formulário */}
            <LoginForm />
            
        </div>
        
        {/* Elemento decorativo de fundo para o Lado Direito (fixado para não rolar com o form) */}
        <div className="hidden lg:block fixed top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full opacity-50 blur-3xl"></div>
        </div>
      </div>

    </div>
  );
}