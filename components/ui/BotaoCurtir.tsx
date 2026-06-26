"use client";

import { useState, useEffect } from "react";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { authService } from "@/app/lib/authService";

interface BotaoCurtirProps {
  mensagemId: number;          // É o ID do post (ou postId)
  curtidasIniciais: number;
  jaCurtidoInicial: boolean;
  grupoIdContexto?: number | null; // 💡 NOVO: Passamos o ID do grupo se o post for de um clube
}

export default function BotaoCurtir({ 
  mensagemId, 
  curtidasIniciais, 
  jaCurtidoInicial,
  grupoIdContexto = null 
}: BotaoCurtirProps) {
  
  const [curtido, setCurtido] = useState(jaCurtidoInicial);
  const [totalCurtidas, setTotalCurtidas] = useState(curtidasIniciais);
  const [carregando, setCarregando] = useState(false);

  // Sincroniza o estado caso o feed recarregue do backend
  useEffect(() => {
    setCurtido(jaCurtidoInicial);
    setTotalCurtidas(curtidasIniciais);
  }, [jaCurtidoInicial, curtidasIniciais]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const handleCurtir = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita expandir o post sem querer ao clicar no like
    if (carregando) return;

    setCarregando(true);
    
    // Otimismo na UI (muda o ícone antes da resposta da API para parecer instantâneo)
    const novoEstadoCurtido = !curtido;
    setCurtido(novoEstadoCurtido);
    setTotalCurtidas((prev) => novoEstadoCurtido ? prev + 1 : prev - 1);

    try {
      const token = authService.getToken(); 

      // 🎯 DEFINIÇÃO DINÂMICA DA ROTA
      const urlEnvio = grupoIdContexto
      ? `https://letrify.fly.dev/api/grupos/${grupoIdContexto}/posts/${mensagemId}/curtir`
      : `https://letrify.fly.dev/api/chat/curtir/${mensagemId}`;

      const resposta = await fetch(urlEnvio, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!resposta.ok) {
        // Se a API falhar, desfaz a alteração visual otimista
        setCurtido(curtido);
        setTotalCurtidas(totalCurtidas);
      }
    } catch (error) {
      console.error("Erro ao alternar curtida:", error);
      setCurtido(curtido);
      setTotalCurtidas(totalCurtidas);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <button
      onClick={handleCurtir}
      disabled={carregando}
      className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all active:scale-90 select-none"
      style={{
        backgroundColor: curtido ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
        color: curtido ? '#ef4444' : 'var(--cor-texto-secundario)'
      }}
    >
      {curtido ? (
        <HeartSolid className="w-4 h-4 text-red-500 animate-pop" />
      ) : (
        <HeartOutline className="w-4 h-4 stroke-[2.5]" />
      )}
      <span>{totalCurtidas} curtidas</span>
    </button>
  );
}