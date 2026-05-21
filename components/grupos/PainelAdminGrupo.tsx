"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";

interface Solicitacao {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  usuarioFoto: string | null;
  dataSolicitacao: string;
}

interface PainelAdminProps {
  grupoId: number;
}

export default function PainelAdminGrupo({ grupoId }: PainelAdminProps) {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  // A nossa URL à prova de falhas
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const carregarSolicitacoes = async () => {
    setCarregando(true);
    try {
      const token = authService.getToken();
      const res = await fetch(`${BASE_URL}/grupos/${grupoId}/solicitacoes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const dados = await res.json();
        setSolicitacoes(dados);
      }
    } catch (err) {
      console.error("Erro ao carregar solicitações:", err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarSolicitacoes();
  }, [grupoId]);

  const handleResponder = async (usuarioId: number, aceitar: boolean) => {
    setProcessandoId(usuarioId);
    try {
      const token = authService.getToken();
      const res = await fetch(`${BASE_URL}/grupos/${grupoId}/solicitacoes/${usuarioId}/responder`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ aceitar })
      });

      if (!res.ok) throw new Error("Erro ao responder solicitação.");
      
      // Remove da lista localmente para dar feedback instantâneo (Optimistic UI)
      setSolicitacoes(prev => prev.filter(s => s.usuarioId !== usuarioId));
      alert(aceitar ? "Membro aceite!" : "Solicitação recusada.");
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 animate-fade-in">
      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
        <span>🛡️</span> Painel de Administração
      </h3>

      <div className="bg-zinc-800/30 rounded-xl p-5 border border-white/5">
        <h4 className="font-bold text-zinc-200 mb-4">Solicitações Pendentes ({solicitacoes.length})</h4>
        
        {carregando ? (
          <p className="text-sm text-zinc-500 italic animate-pulse">A procurar solicitações...</p>
        ) : solicitacoes.length === 0 ? (
          <div className="text-center py-8 opacity-50">
            <span className="text-3xl mb-2 block">✨</span>
            <p className="text-xs uppercase tracking-widest font-bold">Nenhuma solicitação pendente.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {solicitacoes.map((sol) => (
              <div key={sol.id} className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                    {sol.usuarioFoto ? (
                      <img src={sol.usuarioFoto} alt={sol.usuarioNome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-blue-600 text-white">
                        {sol.usuarioNome.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">{sol.usuarioNome}</p>
                    <p className="text-[10px] text-zinc-500">
                      Pediu para entrar em {new Date(sol.dataSolicitacao).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResponder(sol.usuarioId, false)}
                    disabled={processandoId === sol.usuarioId}
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all flex items-center justify-center font-bold"
                    title="Recusar"
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => handleResponder(sol.usuarioId, true)}
                    disabled={processandoId === sol.usuarioId}
                    className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20 transition-all flex items-center justify-center font-bold"
                    title="Aceitar"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}