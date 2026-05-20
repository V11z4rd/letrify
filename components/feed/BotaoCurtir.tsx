"use client";

import { useState, useEffect } from "react";

interface BotaoCurtirProps {
  mensagemId: number;
  curtidasIniciais?: number;
  jaCurtidoInicial?: boolean;
}

export default function BotaoCurtir({ 
  mensagemId, 
  curtidasIniciais = 0, 
  jaCurtidoInicial = false 
}: BotaoCurtirProps) {
  const [curtido, setCurtido] = useState(jaCurtidoInicial);
  const [totalCurtidas, setTotalCurtidas] = useState(curtidasIniciais);
  const [processando, setProcessando] = useState(false);

  // Mantém o botão sincronizado caso o SignalR envie o evento "AtualizarCurtidas" em background
  useEffect(() => {
    setCurtido(jaCurtidoInicial);
    setTotalCurtidas(curtidasIniciais);
  }, [curtidasIniciais, jaCurtidoInicial]);

  const handleToggleCurtir = async () => {
    if (processando) return;

    // Interface Otimista: Muda o visual instantaneamente na tela do usuário
    const estadoAnterior = curtido;
    setCurtido(!estadoAnterior);
    setTotalCurtidas((prev) => (estadoAnterior ? Math.max(0, prev - 1) : prev + 1));
    setProcessando(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;
      
      // Chamada para a rota exata: /api/chat/curtir/{mensagemId}
      const resposta = await fetch(`https://letrify.fly.dev/api/chat/curtir/${mensagemId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!resposta.ok) {
        throw new Error("Erro ao alternar curtida.");
      }

    } catch (error) {
      console.error("Erro na curtida:", error);
      // Rollback: Se o servidor falhar ou o usuário estiver deslogado, desfaz a animação
      setCurtido(estadoAnterior);
      setTotalCurtidas((prev) => (estadoAnterior ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setProcessando(false);
    }
  };

  return (
    <button
      onClick={handleToggleCurtir}
      // Gerenciamento dinâmico de estilos baseado no estado de curtida
      className={`flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-bold transition-all ${
        curtido
          ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-500/5"
          : "bg-zinc-800/40 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-zinc-300"
      }`}
    >
        {/* Ícone de Coração em SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={curtido ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.5"
        className={`w-3.5 h-3.5 transition-transform duration-200 ${
          curtido ? "scale-110" : "scale-100"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>

      {/* Contador de curtidas formatado em fonte monoespaçada para evitar que o layout "trema" ao mudar de número */}
      <span className="font-mono">{totalCurtidas}</span>
    </button>
  );
}