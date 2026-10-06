'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RecoveryPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/auth/forgot-password', { email });
    } catch (err) {
      console.error(err);
    } finally {
      // Mostramos a mensagem de sucesso mesmo com erro por questões de segurança
      setSubmitted(true);
      setLoading(false);
    }
  };

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

      {/* LADO DIREITO: Área de Recuperação (Formulário) */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative h-full overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[24px] shadow-xl shadow-slate-200/40 border border-slate-100 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
            
            {/* Logo Mobile */}
            <div className="flex flex-col items-center justify-center lg:hidden mb-6">
                <div className="text-[#003399] mb-3">
                    <svg width="40" height="46" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 2v20l8 4 8-4V6l-8-4-8 4z"/><path d="M4 14h8v12"/><path d="M12 2v12l8-4"/>
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-[#003399] tracking-tight">Órbita</h1>
            </div>

            {/* CONTEÚDO DO FORMULÁRIO (Integrado aqui diretamente) */}
            {!submitted ? (
              <div className="animate-in fade-in duration-300">
                <div className="text-center lg:text-left mb-8">
                  <h2 className="text-2xl font-bold text-slate-800">Redefinir senha</h2>
                  <p className="text-sm text-slate-500 mt-2 font-medium">
                    Digite seu e-mail corporativo para receber as instruções de recuperação.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-[#003399] uppercase tracking-wider mb-2">E-mail Corporativo</label>
                    <div className="flex items-center px-4 py-3.5 rounded-xl border border-slate-300 bg-white focus-within:border-[#003399] focus-within:ring-2 focus-within:ring-[#003399]/10 transition-all shadow-sm">
                      <Mail size={18} className="text-slate-400 mr-3" />
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="bianca@email.com" 
                        className="bg-transparent outline-none w-full text-sm text-slate-800 font-medium placeholder:text-slate-400" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3.5 rounded-xl bg-[#003399] text-white font-bold hover:bg-[#002266] transition-all shadow-md disabled:opacity-50 text-sm flex items-center justify-center"
                  >
                    {loading ? 'A enviar...' : 'Enviar link de recuperação'}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#003399] transition-colors">
                    <ArrowLeft size={16} /> Voltar para o Login
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">E-mail enviado!</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Se o e-mail informado estiver registado no sistema, você receberá as instruções para redefinir a sua senha em breve.
                </p>
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#003399] hover:underline transition-colors">
                    <ArrowLeft size={16} /> Voltar para o Login
                  </Link>
                </div>
              </div>
            )}
            
        </div>
        <div className="hidden lg:block fixed top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full opacity-50 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}