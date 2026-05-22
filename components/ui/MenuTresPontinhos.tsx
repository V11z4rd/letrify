"use client";

import { useState, useRef, useEffect } from "react";
// Importações do Heroicons para ações de menu e feedback
import { 
  EllipsisHorizontalIcon, 
  FlagIcon, 
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface MenuProps {
  idPost: number;
  isDono: boolean;
}

export default function MenuTresPontinhos({ idPost, isDono }: MenuProps) {
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  useEffect(() => {
    function clicarFora(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    if (aberto) {
      document.addEventListener("mousedown", clicarFora);
    }
    return () => document.removeEventListener("mousedown", clicarFora);
  }, [aberto]);

  const handleExcluir = async () => {
    if (!confirm("Tem certeza que deseja apagar esta mensagem? Todas as respostas também serão removidas.")) return;

    setExcluindo(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;
      
      const resposta = await fetch(`${BASE_URL}/chat/deletar/${idPost}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!resposta.ok) {
        alert("Erro ao excluir a mensagem. Verifique suas permissões.");
        setExcluindo(false);
        return;
      }

      // 🟢 SUCESSO: Força o fechamento e avisa a page.tsx para atualizar na hora!
      setAberto(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("atualizar_feed_global"));
      }
      
    } catch (error) {
      console.error("Erro na requisição de deleção:", error);
      setExcluindo(false);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* BOTÃO DOS TRÊS PONTINHOS PREMIUM */}
      <button 
        onClick={() => setAberto(!aberto)}
        disabled={excluindo}
        className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] active:scale-90 disabled:opacity-20"
        style={{ color: aberto ? 'var(--cor-botao-primario)' : 'var(--cor-texto-secundario)' }}
        title="Opções do post"
      >
        <EllipsisHorizontalIcon className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* MENU DROPDOWN ADAPTADO COM GLOBALS */}
      {aberto && (
        <div 
          className="absolute right-0 mt-1 w-40 rounded-xl shadow-2xl z-50 border overflow-hidden animate-fade-in"
          style={{ 
            backgroundColor: 'var(--cor-fundo-card)',
            borderColor: 'var(--cor-fundo-sidebar)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* AÇÃO: DENUNCIAR */}
          <button 
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-bold transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03] border-b"
            style={{ 
              color: 'var(--cor-texto-principal)',
              borderColor: 'var(--cor-fundo-sidebar)'
            }}
            onClick={() => {
                alert("Denúncia registrada. Nossa equipe irá analisar.");
                setAberto(false);
            }}
          >
            <FlagIcon className="w-4 h-4 opacity-70 shrink-0" />
            <span>Denunciar</span>
          </button>

          {/* AÇÃO: EXCLUIR (APENAS PARA O DONO) */}
          {isDono && (
            <button 
              onClick={handleExcluir}
              disabled={excluindo}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {excluindo ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin shrink-0" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4 shrink-0" />
                  <span>Excluir</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}