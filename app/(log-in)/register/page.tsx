"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/app/lib/authService";
import { 
  UserIcon,
  EnvelopeIcon, 
  LockClosedIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function CadastroPage() {
  const router = useRouter();
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const validarEmail = (emailTeste: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailTeste);
  };

  const fazerCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (!nome || !email || !senha) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }
    if (!validarEmail(email)) {
      setErro("Digite um formato de e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);
    try {
      await authService.cadastrar(nome, email, senha);
      setSucesso(true);
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
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
            Criar Conta
          </h1>
          <p className="text-xs font-medium opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>
            Junte-se à comunidade universal do Letrify.
          </p>
        </div>
        
        <form onSubmit={fazerCadastro} className="flex flex-col gap-4">
          
          {/* BANNER DE ERRO */}
          {erro && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-scale-up">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{erro}</span>
            </div>
          )}

          {/* BANNER DE SUCESSO */}
          {sucesso && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-scale-up">
              <CheckCircleIcon className="w-4 h-4 shrink-0 stroke-[2.5] text-green-500" />
              <span>Conta criada! Redirecionando...</span>
            </div>
          )}

          {/* INPUT NOME */}
          <div className="relative flex items-center group">
            <UserIcon className="w-5 h-5 absolute left-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
            <input 
              type="text" 
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3.5 pl-12 rounded-xl border bg-transparent text-sm outline-none transition-all duration-200"
              style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--cor-primaria)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--cor-fundo-sidebar)'}
            />
          </div>

          {/* INPUT EMAIL */}
          <div className="relative flex items-center group">
            <EnvelopeIcon className="w-5 h-5 absolute left-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
            <input 
              type="email" 
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 pl-12 rounded-xl border bg-transparent text-sm outline-none transition-all duration-200"
              style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--cor-primaria)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--cor-fundo-sidebar)'}
            />
          </div>
          
          {/* INPUT SENHA */}
          <div className="relative flex items-center group">
            <LockClosedIcon className="w-5 h-5 absolute left-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
            <input 
              type="password" 
              placeholder="Crie uma senha forte"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3.5 pl-12 rounded-xl border bg-transparent text-sm outline-none transition-all duration-200"
              style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--cor-primaria)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--cor-fundo-sidebar)'}
            />
          </div>

          {/* BOTÃO SUBMIT COM LOADER */}
          <button 
            type="submit" 
            disabled={carregando || sucesso}
            className="w-full h-12 mt-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2 shadow-md hover:opacity-90"
            style={{ backgroundColor: 'var(--cor-botao-primario)', color: '#ffffff' }}
          >
            {carregando || sucesso ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin stroke-[3]" />
            ) : (
              <span>Cadastrar</span>
            )}
          </button>
        </form>

        {/* LINK PARA RETORNAR AO LOGIN */}
        <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
          Já tem uma conta?{" "}
          <Link href="/login" className="font-black underline transition-colors hover:opacity-80" style={{ color: 'var(--cor-primaria)' }}>
            Fazer Login
          </Link>
        </p>
      </div>

    </div>
  );
}