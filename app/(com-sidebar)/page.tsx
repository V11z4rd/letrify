"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowPathIcon, BookOpenIcon } from "@heroicons/react/24/outline";

// Sincronizado exatamente com a chave que o seu authService e as outras páginas usam!
const TOKEN_KEY = "letrify_token";

function hasValidSession() {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(TOKEN_KEY);
  
  // Validação simplificada e resiliente: se o token existir, consideramos a sessão inicial ativa
  // O backend se encarregará de retornar 401 caso ele esteja expirado por tempo
  return Boolean(token && token.trim().length > 0);
}

export default function Home() {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (!hasValidSession()) {
      router.replace("/login");
    } else {
      setAutorizado(true);
      // 🔥 MELHORIA DE UX: Em vez de prender o usuário aqui, manda ele direto para o Feed Global!
      router.replace("/feed");
    }
  }, [router]);

  // Enquanto valida ou faz o micro-redirecionamento para o feed, exibe um splash screen elegante
  if (!autorizado) {
    return (
      <div 
        className="flex flex-col items-center justify-center w-full h-full min-h-[70vh] gap-4 transition-colors duration-300"
        style={{ color: 'var(--cor-texto-principal)' }}
      >
        <div className="relative flex items-center justify-center">
          {/* Animação de pulso sutil ao fundo */}
          <div 
            className="absolute w-12 h-12 rounded-xl animate-ping opacity-20"
            style={{ backgroundColor: 'var(--cor-primaria)' }}
          />
          <BookOpenIcon className="w-10 h-10 stroke-[2] animate-bounce" style={{ color: 'var(--cor-primaria)' }} />
        </div>
        
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest font-black opacity-40">Letrify</p>
          <p className="text-[11px] font-bold opacity-30 mt-1 flex items-center justify-center gap-1.5">
            <ArrowPathIcon className="w-3 h-3 animate-spin stroke-[2.5]" />
            <span>Validando credenciais...</span>
          </p>
        </div>
      </div>
    );
  }

  // Retorno nulo de segurança já que o router.replace('/feed') assume o controle imediato
  return null; 
}