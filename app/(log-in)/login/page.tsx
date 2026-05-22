"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/app/lib/authService";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const validarEmail = (emailTeste: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailTeste);
  };

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }
    if (!validarEmail(email)) {
      setErro("Digite um formato de e-mail válido.");
      return;
    }

    setCarregando(true);
    try {
      await authService.login(email, senha);
      router.push("/perfil");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 animate-fade-in" style={{ backgroundColor: 'var(--cor-fundo-app)' }}>
      
      <div 
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-xl transition-all" 
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        {/* LOGO / IDENTIDADE */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
            <ShieldCheckIcon className="w-6 h-6 stroke-[2.5]" style={{ color: 'var(--cor-primaria)' }} />
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>
            Letrify
          </h1>
          <p className="text-xs font-medium opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>
            Entre para gerenciar sua estante literária universal.
          </p>
        </div>
        
        <form onSubmit={fazerLogin} className="flex flex-col gap-4">
          
          {/* MENSAGEM DE ERRO TRATADA */}
          {erro && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-scale-up">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{erro}</span>
            </div>
          )}

          {/* INPUT EMAIL */}
          <div className="relative flex items-center group">
            <EnvelopeIcon className="w-5 h-5 absolute left-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
            <input 
              type="email" 
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 pl-12 rounded-xl border bg-transparent text-sm outline-none transition-all duration-200"
              style={{ 
                borderColor: 'var(--cor-fundo-sidebar)', 
                color: 'var(--cor-texto-principal)',
                // Customização de foco simulando anel nativo do design system
                boxShadow: '0 0 0 2px transparent'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--cor-primaria)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--cor-fundo-sidebar)'}
            />
          </div>
          
          {/* INPUT SENHA */}
          <div className="relative flex items-center group">
            <LockClosedIcon className="w-5 h-5 absolute left-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
            <input 
              type="password" 
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3.5 pl-12 rounded-xl border bg-transparent text-sm outline-none transition-all duration-200"
              style={{ 
                borderColor: 'var(--cor-fundo-sidebar)', 
                color: 'var(--cor-texto-principal)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--cor-primaria)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--cor-fundo-sidebar)'}
            />
          </div>

          {/* BOTÃO SUBMIT COM LOADER */}
          <button 
            type="submit" 
            disabled={carregando}
            className="w-full h-12 mt-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 shadow-md hover:opacity-90"
            style={{ backgroundColor: 'var(--cor-botao-primario)', color: '#ffffff' }}
          >
            {carregando ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin stroke-[3]" />
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>

        {/* LINK DE CADASTRO */}
        <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-black underline transition-colors hover:opacity-80" style={{ color: 'var(--cor-primaria)' }}>
            Cadastre-se
          </Link>
        </p>
      </div>

    </div>
  );
}