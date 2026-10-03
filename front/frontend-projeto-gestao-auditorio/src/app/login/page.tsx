'use client';

import { LoginForm } from '@/components/ui/login-form';

export default function LoginPage() {
  return (
    // h-screen e overflow-hidden: O segredo para NÃO ter barra de rolagem
    <div className="w-full h-screen grid lg:grid-cols-2 overflow-hidden">
      
      {/* LADO ESQUERDO: Azul e Decorativo */}
      <div className="hidden lg:flex relative flex-col items-center justify-center bg-blue-700 text-white">
        
        {/* Camadas de Fundo para simular o efeito "Tech" da imagem */}
        <div className="absolute inset-0 bg-blue-900"></div>
        {/* Um gradiente para dar profundidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-800 to-blue-950 opacity-90"></div>
        
        {/* Padrão decorativo sutil (linhas) */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Conteúdo Centralizado */}
        <div className="relative z-10 flex flex-col items-center gap-4 p-10 text-center">
           {/* Círculo decorativo atrás do texto se quiser */}
           <div className="absolute -z-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-40"></div>
           
           <h1 className="text-5xl font-bold tracking-wide text-white drop-shadow-lg">
             ÓRBITA
           </h1>
           <p className="text-blue-100 text-lg font-light tracking-wider opacity-80">
             GESTÃO DE AUDITÓRIOS
           </p>
        </div>
      </div>

      {/* LADO DIREITO: Formulário Limpo */}
      <div className="flex items-center justify-center bg-white p-8">
        {/* max-w-sm limita a largura para o form não ficar "esticado" demais */}
        <div className="w-full max-w-[380px] space-y-6">
          <LoginForm />
        </div>
      </div>

    </div>
  );
}