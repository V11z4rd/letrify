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
  id: number; // Este ID representa o 'sid' (ID da Solicitação) exigido pela API
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
  const [processandoId, setProcessandoId] = useState<number | null>(null); // Controla loading pelo ID da solicitação

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

  // CORRIGIDO: Agora recebe o ID da solicitação (solicitacaoId) em vez do usuarioId
  const handleResponderSolicitacao = async (solicitacaoId: number, aceitar: boolean) => {
    setProcessandoId(solicitacaoId);
    try {
      // Ajustado para coincidir com: PUT /api/grupos/{id}/solicitacoes/{sid}
      const res = await fetch(`${BASE_URL}/grupos/${grupoId}/solicitacoes/${solicitacaoId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ aceitar }) // Envia a decisão no corpo da requisição PUT
      });

      if (!res.ok) throw new Error("Erro ao responder solicitação.");
      
      // Remove da lista local usando o ID da solicitação
      setSolicitacoes(prev => prev.filter(s => s.id !== solicitacaoId));
      
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
    <div 
      className="border rounded-3xl p-6 shadow-sm space-y-6 transition-all"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* CABEÇALHO DO PAINEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--cor-texto-principal)' }}>
          <span>🛡️</span> Gerenciamento e Moderação
        </h3>
        
        {/* Toggle das Sub-abas */}
        <div 
          className="flex p-1 rounded-xl border w-full sm:w-auto" 
          style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <button 
            onClick={() => setSubAba("solicitacoes")}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95"
            style={{ 
              backgroundColor: subAba === "solicitacoes" ? 'var(--cor-botao-primario)' : 'transparent', 
              color: subAba === "solicitacoes" ? 'var(--cor-botao-texto)' : 'var(--cor-texto-secundario)',
              opacity: subAba === "solicitacoes" ? 1 : 0.6
            }}
          >
            <InboxArrowDownIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Pedidos ({solicitacoes.length})</span>
          </button>
          <button 
            onClick={() => setSubAba("membros")}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95"
            style={{ 
              backgroundColor: subAba === "membros" ? 'var(--cor-botao-primario)' : 'transparent', 
              color: subAba === "membros" ? 'var(--cor-botao-texto)' : 'var(--cor-texto-secundario)',
              opacity: subAba === "membros" ? 1 : 0.6
            }}
          >
            <UserGroupIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Integrantes ({membros.length})</span>
          </button>
        </div>
      </div>

      {carregandoDados ? (
        <div 
          className="text-center py-12 text-xs font-black uppercase tracking-widest animate-pulse flex items-center justify-center gap-2"
          style={{ color: 'var(--cor-texto-secundario)' }}
        >
          <ArrowPathIcon className="w-4 h-4 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
          <span>Sincronizando registros do clube...</span>
        </div>
      ) : (
        <>
          {/* ABA: SOLICITAÇÕES PENDENTES */}
          {subAba === "solicitacoes" && (
            <div className="space-y-3">
              {solicitacoes.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-2xl" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                  <p className="text-xs font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--cor-texto-secundario)' }}>Nenhuma entrada pendente</p>
                </div>
              ) : (
                solicitacoes.map((sol) => (
                  <div 
                    key={sol.id} 
                    className="flex items-center justify-between p-4 rounded-2xl border"
                    style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm border overflow-hidden shrink-0"
                        style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)', borderColor: 'var(--cor-fundo-sidebar)' }}
                      >
                        {sol.usuarioFoto ? (
                          <img src={sol.usuarioFoto} alt={sol.usuarioNome} className="w-full h-full object-cover" />
                        ) : (
                          sol.usuarioNome.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold" style={{ color: 'var(--cor-texto-principal)' }}>{sol.usuarioNome}</p>
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-wide" style={{ color: 'var(--cor-texto-secundario)' }}>Aguardando liberação</p>
                      </div>
                    </div>
                    
                    {/* Botões de Decisão Corrigidos para usar sol.id (sid) */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResponderSolicitacao(sol.id, false)} 
                        disabled={processandoId !== null} 
                        className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm active:scale-95 disabled:opacity-40"
                      >
                        <XMarkIcon className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button 
                        onClick={() => handleResponderSolicitacao(sol.id, true)} 
                        disabled={processandoId !== null} 
                        className="w-9 h-9 rounded-xl bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white flex items-center justify-center transition-colors shadow-sm active:scale-95 disabled:opacity-40"
                      >
                        <CheckIcon className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA: INTEGRANTES CADASTRADOS */}
          {subAba === "membros" && (
            <div className="flex flex-col gap-2.5">
              {membros.map((membro) => {
                const souEu = authService.getUserId() === String(membro.id);
                const ehLiderOuAdmin = membro.role === "Lider" || membro.role === "Admin";
                return (
                  <div 
                    key={membro.id} 
                    className="flex items-center justify-between p-4 rounded-2xl border"
                    style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm border overflow-hidden shrink-0"
                        style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-sidebar)', borderColor: 'var(--cor-fundo-sidebar)' }}
                      >
                        {membro.fotoPerfil ? (
                          <img src={membro.fotoPerfil} alt={membro.nome} className="w-full h-full object-cover" />
                        ) : (
                          membro.nome.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold" style={{ color: 'var(--cor-texto-principal)' }}>
                          {membro.nome} {souEu && <span className="text-xs font-bold" style={{ color: 'var(--cor-destaque)' }}>(Você)</span>}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
                          {membro.role}
                        </span>
                      </div>
                    </div>
                    
                    {/* Botão de Expulsão */}
                    {!souEu && !ehLiderOuAdmin && (
                      <button 
                        onClick={() => handleExpulsarMembro(membro.id, membro.nome)} 
                        disabled={processandoId !== null} 
                        className="px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider border transition-all flex items-center gap-1.5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95 disabled:opacity-40"
                        style={{ 
                          backgroundColor: 'var(--cor-fundo-card)', 
                          borderColor: 'var(--cor-fundo-sidebar)',
                          color: 'var(--cor-texto-secundario)'
                        }}
                      >
                        <UserMinusIcon className="w-3.5 h-3.5 stroke-[2]" /> 
                        <span>Remover</span>
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