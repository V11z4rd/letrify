"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";

interface BotaoCurtirProps {
  mensagemId: number;
  grupoId?: number; // 💡 Opcional: Necessário se a rota do grupo exigir o ID dele
  curtidasIniciais?: number;
  jaCurtidoInicial?: boolean;
  tipoFeed: "global" | "grupo"; // 💡 Define para qual endpoint disparar
}

export default function BotaoCurtir({ 
  mensagemId, 
  grupoId,
  curtidasIniciais = 0, 
  jaCurtidoInicial = false,
  tipoFeed
}: BotaoCurtirProps) {
  const [curtido, setCurtido] = useState(jaCurtidoInicial);
  const [totalCurtidas, setTotalCurtidas] = useState(curtidasIniciais);
  const [processando, setProcessando] = useState(false);

  // Sincronização em tempo real (SignalR ou atualizações de estado do pai)
  useEffect(() => {
    setCurtido(jaCurtidoInicial);
    setTotalCurtidas(curtidasIniciais);
  }, [curtidasIniciais, jaCurtidoInicial]);

  const handleToggleCurtir = async () => {
    if (processando) return;

    // Interface Otimista
    const estadoAnterior = curtido;
    setCurtido(!estadoAnterior);
    setTotalCurtidas((prev) => (estadoAnterior ? Math.max(0, prev - 1) : prev + 1));
    setProcessando(true);

    try {
      const token = authService.getToken();
      if (!token) {
        alert("Você precisa estar logado para curtir!");
        throw new Error("Usuário não autenticado.");
      }

      // 💡 Define a URL dinamicamente baseado no tipo de feed
      const url = tipoFeed === "global"
        ? `https://letrify.fly.dev/api/chat/curtir/${mensagemId}`
        : `https://letrify.fly.dev/api/grupos/${grupoId}/posts/curtir/${mensagemId}`; 
        // ⚠️ Nota: Confirme com o backend se a rota de curtir post de grupo é exatamente essa!

      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!resposta.ok) {
        throw new Error("Erro ao alternar curtida na API.");
      }

    } catch (error) {
      console.error("Erro na curtida:", error);
      // Rollback otimista (Desfaz a alteração na tela em caso de falha)
      setCurtido(estadoAnterior);
      setTotalCurtidas((prev) => (estadoAnterior ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setProcessando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleCurtir}
      disabled={processando}
      className={`flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-bold transition-all select-none ${
        curtido
          ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-500/5"
          : "bg-zinc-800/40 text-zinc-400 border border-transparent hover:bg-zinc-800/80 hover:text-zinc-300"
      } ${processando ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={curtido ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.5"
        className={`w-3.5 h-3.5 transition-transform duration-200 active:scale-125 ${
          curtido ? "scale-110 text-red-500" : "scale-100"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>

      <span className="font-mono">{totalCurtidas}</span>
    </button>
  );
}