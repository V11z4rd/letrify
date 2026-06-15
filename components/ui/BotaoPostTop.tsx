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

    window.addEventListener("scroll", checarScroll, true);
    return () => window.removeEventListener("scroll", checarScroll, true);
  }, [onLimparAlerta]);

  const escrolarParaOTopo = () => {
    const paineisRolaveis = document.querySelectorAll("main, .overflow-y-auto, #layout-wrapper");
    paineisRolaveis.forEach((painel) => {
      painel.scrollTo({ top: 0, behavior: "smooth" });
    });

    if (onLimparAlerta) onLimparAlerta();
  };

  if (!visivel && !temNovosPosts) return null;

  return (
    <button
      onClick={escrolarParaOTopo}
      className="fixed bottom-20 md:bottom-24 left-4 md:left-auto md:right-6 p-3.5 rounded-full border shadow-xl transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center group z-40 pointer-events-auto"
      style={{ 
        backgroundColor: "var(--cor-fundo-card)", 
        borderColor: temNovosPosts ? "var(--cor-destaque)" : "var(--cor-fundo-sidebar)",
        boxShadow: temNovosPosts ? "0 0 15px var(--cor-destaque)" : ""
      }}
    >
      {temNovosPosts && (
        <span 
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 animate-pulse"
          style={{
            backgroundColor: "var(--cor-destaque)",
            borderColor: "var(--cor-fundo-card)"
          }}
        />
      )}
      <ArrowUpIcon 
        className="w-5 h-5 stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" 
        style={{ color: temNovosPosts ? "var(--cor-destaque)" : "var(--cor-texto-principal)" }}
      />
    </button>
  );
}