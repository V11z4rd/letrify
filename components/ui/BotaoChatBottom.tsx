"use client";

import { useState, useEffect } from "react";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

interface BotaoChatBottomProps {
  temNovasMensagens?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClick: () => void;
}

export default function BotaoChatBottom({ temNovasMensagens = false, containerRef, onClick }: BotaoChatBottomProps) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checarScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Se a distância até o final da rolagem interna for maior que 150px, exibe o botão
      const restanteParaOFundo = scrollHeight - scrollTop - clientHeight;
      if (restanteParaOFundo > 150) {
        setVisivel(true);
      } else {
        setVisivel(false);
      }
    };

    container.addEventListener("scroll", checarScroll);
    checarScroll();
    
    return () => container.removeEventListener("scroll", checarScroll);
  }, [containerRef, temNovasMensagens]);

  if (!visivel && !temNovasMensagens) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      // bottom-[96px] garante que ele fique flutuando perfeitamente logo acima da área de input
      className="absolute bottom-24 right-6 p-2.5 rounded-full border shadow-md transition-all duration-300 hover:scale-110 active:scale-90 z-30 flex items-center justify-center group animate-fade-in"
      style={{ 
        backgroundColor: "var(--cor-fundo-card)", 
        borderColor: temNovasMensagens ? "var(--cor-destaque)" : "var(--cor-fundo-sidebar)",
      }}
    >
      {temNovasMensagens && (
        <span 
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white animate-pulse"
          style={{ backgroundColor: "var(--cor-destaque)" }}
        />
      )}

      <ArrowDownIcon 
        className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-y-0.5" 
        style={{ color: temNovasMensagens ? "var(--cor-destaque)" : "var(--cor-texto-principal)" }}
      />
    </button>
  );
}