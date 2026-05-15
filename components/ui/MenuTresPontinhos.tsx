"use client";

import { useState, useRef, useEffect } from "react";

interface MenuProps {
  idPost: number;
  isDono: boolean;
}

export default function MenuTresPontinhos({ idPost, isDono }: MenuProps) {
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu se o usuário clicar fora dele
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
      
      const resposta = await fetch(`https://letrify.fly.dev/api/chat/deletar/${idPost}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!resposta.ok) {
        alert("Erro ao excluir a mensagem. Verifique suas permissões.");
        setExcluindo(false);
      }
      
      // NOTA: Não precisamos dar setAberto(false) ou atualizar o estado local aqui.
      // O SignalR vai receber o evento "MensagemDeletada" do Back-end e 
      // remover o componente da tela automaticamente no FeedPage.

    } catch (error) {
      console.error("Erro na requisição de deleção:", error);
      setExcluindo(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* BOTÃO DOS TRÊS PONTINHOS */}
      <button 
        onClick={() => setAberto(!aberto)}
        disabled={excluindo}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors opacity-40 hover:opacity-100 disabled:opacity-20"
      >
        <span className="mb-2">...</span>
      </button>

      {/* MENU DROPDOWN */}
      {aberto && (
        <div className="absolute right-0 mt-1 w-32 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-zoom-in">
          
          <button 
            className="w-full px-4 py-2 text-left text-[10px] font-bold text-zinc-400 hover:bg-white/5 transition-colors border-b border-white/5"
            onClick={() => {
                alert("Denúncia registrada. Nossa equipe irá analisar.");
                setAberto(false);
            }}
          >
            🚩 DENUNCIAR
          </button>

          {isDono && (
            <button 
              onClick={handleExcluir}
              disabled={excluindo}
              className="w-full px-4 py-2 text-left text-[10px] font-bold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {excluindo ? "⚠️ EXCLUINDO..." : "🗑️ EXCLUIR"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}