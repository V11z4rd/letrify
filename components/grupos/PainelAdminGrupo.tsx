"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";
import { 
  UserMinusIcon, 
  CheckIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  UserGroupIcon,
  InboxArrowDownIcon
} from "@heroicons/react/24/outline";

interface Solicitacao {
  id: number;
  usuarioId: number;
  usuarioNome: string;
  usuarioFoto: string | null;
  dataSolicitacao: string;
}

interface Membro {
  id: number;
  nome: string;
  fotoPerfil: string | null;
  role: string;
}

interface PainelAdminProps {
  grupoId: number;
  onMembroMudou?: () => void;
}

export default function PainelAdminGrupo({ grupoId, onMembroMudou }: PainelAdminProps) {
  const [subAba, setSubAba] = useState<"solicitacoes" | "membros">("solicitacoes");
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";
  const token = authService.getToken();

  const carregarDadosPainel = async () => {
    setCarregandoDados(true);
    try {
      const resSol = await fetch(`${BASE_URL}/grupos/${grupoId}/solicitacoes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resSol.ok) setSolicitacoes(await resSol.json());

      const resGrupo = await fetch(`${BASE_URL}/grupos/${grupoId}`);
      if (resGrupo.ok) {
        const dadosGrupo = await resGrupo.json();
        setMembros(dadosGrupo.membros || []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do painel:", err);
    } finally {
      setCarregandoDados(false);
    }
  };

  useEffect(() => {
    carregarDadosPainel();
  }, [grupoId]);

  const handleResponderSolicitacao = async (usuarioId: number, aceitar: boolean) => {
    setProcessandoId(usuarioId);
    try {
      const res = await fetch(`${BASE_URL}/grupos/${grupoId}/solicitacoes/${usuarioId}/responder`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ aceitar })
      });

      if (!res.ok) throw new Error("Erro ao responder solicitação.");
      
      setSolicitacoes(prev => prev.filter(s => s.usuarioId !== usuarioId));
      if (aceitar) {
        carregarDadosPainel();
        if (onMembroMudou) onMembroMudou();
      }
      alert(aceitar ? "Membro aceito! 🎉" : "Solicitação recusada.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessandoId(null);
    }
  };

  const handleExpulsarMembro = async (usuarioId: number, nomeMembro: string) => {
    if (!confirm(`Tem certeza que deseja remover ${nomeMembro} do clube?`)) return;

    setProcessandoId(usuarioId);
    try {
      const res = await fetch(`${BASE_URL}/grupos/${grupoId}/membros/${usuarioId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Erro ao remover o integrante.");

      setMembros(prev => prev.filter(m => m.id !== usuarioId));
      if (onMembroMudou) onMembroMudou();
      alert(`${nomeMembro} foi removido.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <span>👥</span> Membros & Moderação
        </h3>
        
        <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
          <button 
            onClick={() => setSubAba("solicitacoes")}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${subAba === "solicitacoes" ? "bg-blue-600 text-white" : "text-zinc-400 opacity-60 hover:opacity-100"}`}
          >
            <InboxArrowDownIcon className="w-3.5 h-3.5" />
            <span>Pedidos ({solicitacoes.length})</span>
          </button>
          <button 
            onClick={() => setSubAba("membros")}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${subAba === "membros" ? "bg-blue-600 text-white" : "text-zinc-400 opacity-60 hover:opacity-100"}`}
          >
            <UserGroupIcon className="w-3.5 h-3.5" />
            <span>Membros ({membros.length})</span>
          </button>
        </div>
      </div>

      {carregandoDados ? (
        <div className="text-center py-6 text-xs text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
          Sincronizando moderação...
        </div>
      ) : (
        <>
          {subAba === "solicitacoes" && (
            <div className="space-y-3">
              {solicitacoes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-zinc-900/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nenhum pedido pendente.</p>
                </div>
              ) : (
                solicitacoes.map((sol) => (
                  <div key={sol.id} className="flex items-center justify-between bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center font-bold text-xs">
                        {sol.usuarioFoto ? <img src={sol.usuarioFoto} alt={sol.usuarioNome} className="w-full h-full object-cover" /> : sol.usuarioNome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{sol.usuarioNome}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleResponderSolicitacao(sol.usuarioId, false)} disabled={processandoId !== null} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center"><XMarkIcon className="w-4 h-4 stroke-[2.5]" /></button>
                      <button onClick={() => handleResponderSolicitacao(sol.usuarioId, true)} disabled={processandoId !== null} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white flex items-center justify-center"><CheckIcon className="w-4 h-4 stroke-[2.5]" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {subAba === "membros" && (
            <div className="flex flex-col gap-2">
              {membros.map((membro) => {
                const souEu = authService.getUserId() === String(membro.id);
                const ehLiderOuAdmin = membro.role === "Lider" || membro.role === "Admin";
                return (
                  <div key={membro.id} className="flex items-center justify-between bg-zinc-950/40 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center font-bold text-xs text-zinc-300">
                        {membro.fotoPerfil ? <img src={membro.fotoPerfil} alt={membro.nome} className="w-full h-full object-cover" /> : membro.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">{membro.nome} {souEu && <span className="text-xs text-blue-400">(Você)</span>}</p>
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">{membro.role}</span>
                      </div>
                    </div>
                    {!souEu && !ehLiderOuAdmin && (
                      <button onClick={() => handleExpulsarMembro(membro.id, membro.nome)} disabled={processandoId !== null} className="px-2.5 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wider text-zinc-400 border border-white/5 hover:border-red-500/20 hover:text-red-400 transition-all flex items-center gap-1">
                        <UserMinusIcon className="w-3.5 h-3.5" /> Remover
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}