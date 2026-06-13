"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";
// ✅ IMPORTADOS OS ÍCONES NATIVOS DO HEROICONS
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface BotaoCurtirProps {
  mensagemId: number;
  grupoId?: number; 
  curtidasIniciais?: number;
  jaCurtidoInicial?: boolean;
  tipoFeed: "global" | "grupo"; 
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

  useEffect(() => {
    setCurtido(jaCurtidoInicial);
    setTotalCurtidas(curtidasIniciais);
  }, [curtidasIniciais, jaCurtidoInicial]);

  const handleToggleCurtir = async () => {
    if (processando) return;

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

      const url = tipoFeed === "global"
        ? `https://letrify.fly.dev/api/chat/curtir/${mensagemId}`
        : `https://letrify.fly.dev/api/grupos/${grupoId}/posts/curtir/${mensagemId}`; 

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
      className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all select-none duration-200 active:scale-95 disabled:opacity-50"
      style={{
        // ✅ Mantém consistência usando as variáveis dinâmicas do globals.css
        backgroundColor: curtido ? 'rgba(239, 68, 68, 0.1)' : 'var(--cor-fundo-sidebar)',
        color: curtido ? '#ef4444' : 'var(--cor-texto-sidebar)',
        opacity: curtido ? 1 : 0.6
      }}
    >
      {/* ✅ RENDERIZAÇÃO ADAPTATIVA VIA HEROICONS */}
      {curtido ? (
        <HeartSolid className="w-4 h-4 text-red-500 animate-fade-in scale-110" />
      ) : (
        <HeartOutline className="w-4 h-4 stroke-[2.5]" />
      )}

      <span className="font-mono font-bold">{totalCurtidas}</span>
    </button>
  );
}