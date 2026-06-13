"use client";

import { useState, useEffect } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

interface BotaoPostTopProps {
  temNovosPosts?: boolean;
  onLimparAlerta?: () => void;
}

export default function BotaoPostTop({ temNovosPosts = false, onLimparAlerta }: BotaoPostTopProps) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const checarScroll = (evento: Event) => {
      // Pega o scroll tanto da janela quanto de qualquer elemento que possa estar rolando na tela
      const alvo = evento.target as HTMLElement;
      const scrollAtual = window.scrollY || document.documentElement.scrollTop || (alvo?.scrollTop ?? 0);

      if (scrollAtual > 300) {
        setVisivel(true);
      } else {
        setVisivel(false);
        if (scrollAtual <= 50 && onLimparAlerta) {
          onLimparAlerta();
        }
      }
    };

    // O terceiro argumento 'true' ativa a captura global, ouvindo scrolls mesmo dentro de sub-divs/sidebars
    window.addEventListener("scroll", checarScroll, true);
    return () => window.removeEventListener("scroll", checarScroll, true);
  }, [onLimparAlerta]);

  const escrolarParaOTopo = () => {
    // Tenta rolar a janela principal
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Tenta encontrar e rolar qualquer elemento com overflow que possa estar fingindo ser a página
    const paineisRolaveis = document.querySelectorAll("main, .overflow-y-auto, #layout-wrapper");
    paineisRolaveis.forEach((painel) => {
      painel.scrollTo({ top: 0, behavior: "smooth" });
    });

    if (onLimparAlerta) onLimparAlerta();
  };

  // Se houver novos posts vindos do SignalR, ignoramos o limite de scroll para que o usuário saiba na hora!
  if (!visivel && !temNovosPosts) return null;

  return (
    <button
      onClick={escrolarParaOTopo}
      className="p-3.5 rounded-full border shadow-xl transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center group"
      style={{ 
        backgroundColor: "var(--cor-fundo-card)", 
        borderColor: temNovosPosts ? "var(--cor-destaque)" : "var(--cor-fundo-sidebar)",
        zIndex: 9999, // Força o botão a ficar em cima de qualquer layout ou card
        boxShadow: temNovosPosts ? "0 0 15px var(--cor-destaque)" : ""
      }}
    >
      {temNovosPosts && (
        <span 
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 animate-pulse"
          style={{ backgroundColor: "var(--cor-destaque)", borderColor: "var(--cor-fundo-card)" }}
        />
      )}

      <ArrowUpIcon 
        className="w-5 h-5 stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" 
        style={{ color: temNovosPosts ? "var(--cor-destaque)" : "var(--cor-primaria)" }}
      />
    </button>
  );
}