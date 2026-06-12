"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";
import AbaSolicitacoes from "@/components/grupos/AbaSolicitacoes";
import { 
  UserMinusIcon, 
  CheckIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  UserGroupIcon,
  InboxArrowDownIcon,
  ShieldCheckIcon,
  StarIcon,
  UserIcon,
  ChevronDoubleUpIcon,
  ChevronDoubleDownIcon
} from "@heroicons/react/24/outline";

interface Solicitacao {
  id: number;
  dataSolicitacao: string;
  usuario: {
    id: number;
    nome: string;
    fotoPerfil: string | null;
  };
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

  const handleResponderSolicitacao = async (solicitacaoId: number, aceitar: boolean) => {
    setProcessandoId(solicitacaoId);
    try {
      const res = await fetch(`${BASE_URL}/grupos/${grupoId}/solicitacoes/${solicitacaoId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ aceitar })
      });

      if (!res.ok) throw new Error("Erro ao responder solicitação.");
      
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

  // 👇 NOVA FUNÇÃO: ALTERAR CARGOS 👇
  const handleAlterarCargo = async (usuarioId: number, nomeMembro: string, novoCargo: string) => {
    if (!confirm(`Confirma a alteração do cargo de ${nomeMembro} para ${novoCargo}?`)) return;

    setProcessandoId(usuarioId);
    try {
      const res = await fetch(`${BASE_URL}/grupos/${grupoId}/membros/${usuarioId}/role`, {
        method: "PUT", // Presumindo que o back usa PUT para alteração de role
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: novoCargo }) // Enviamos em JSON para o back saber qual é o novo cargo
      });

      if (!res.ok) {
        const erroMsg = await res.text();
        throw new Error(erroMsg || "Erro ao alterar as permissões do membro.");
      }

      // Atualiza visualmente na mesma hora
      setMembros(prev => prev.map(m => m.id === usuarioId ? { ...m, role: novoCargo } : m));
      if (onMembroMudou) onMembroMudou();
      alert(`O cargo de ${nomeMembro} foi atualizado com sucesso!`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessandoId(null);
    }
  };

  // Identifica o papel de quem está acessando o painel no momento
  const meuIdStr = authService.getUserId();
  const usuarioLogado = membros.find(m => String(m.id) === meuIdStr);
  const euSouLider = usuarioLogado?.role === "Lider";

  return (
    <div 
      className="border rounded-3xl p-6 shadow-sm space-y-6 transition-all animate-fade-in"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* CABEÇALHO DO PAINEL MODIFICADO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--cor-texto-principal)' }}>
          <ShieldCheckIcon className="w-4 h-4 stroke-[2.5]" style={{ color: 'var(--cor-destaque)' }} />
          <span>Gerenciamento e Moderação</span>
        </h3>
        
        {/* Toggle das Sub-abas */}
        <div 
          className="flex p-1 rounded-xl border w-full sm:w-auto" 
          style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <button 
            onClick={() => setSubAba("solicitacoes")}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
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
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
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
          className="text-center py-12 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
          style={{ color: 'var(--cor-texto-secundario)' }}
        >
          <ArrowPathIcon className="w-4 h-4 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
          <span>Sincronizando registros do clube...</span>
        </div>
      ) : (
        <>
          {/* ABA: SOLICITAÇÕES PENDENTES */}
          {subAba === "solicitacoes" && (
            <AbaSolicitacoes 
              solicitacoes={solicitacoes}
              processandoId={processandoId}
              onResponder={handleResponderSolicitacao}
            />
          )}

          {/* ABA: INTEGRANTES CADASTRADOS */}
          {subAba === "membros" && (
            <div className="flex flex-col gap-2.5">
              {membros.map((membro) => {
                const souEu = authService.getUserId() === String(membro.id);
                const ehLider = membro.role === "Lider";
                const ehAdmin = membro.role === "Admin";
                const ehLiderOuAdmin = ehLider || ehAdmin;
                const estaProcessandoEsteMembro = processandoId === membro.id;

                return (
                  <div 
                    key={membro.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border"
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-extrabold" style={{ color: 'var(--cor-texto-principal)' }}>
                            {membro.nome}
                          </p>
                          {souEu && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border" style={{ color: 'var(--cor-destaque)', borderColor: 'var(--cor-destaque)', backgroundColor: 'var(--cor-destaque)/5' }}>
                              Você
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 mt-0.5 opacity-80">
                          {ehLider ? (
                            <StarIcon className="w-3 h-3 text-amber-500 fill-amber-500" />
                          ) : ehAdmin ? (
                            <ShieldCheckIcon className="w-3 h-3 text-blue-500" />
                          ) : (
                            <UserIcon className="w-3 h-3 opacity-40" />
                          )}
                          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: ehLider ? 'var(--cor-destaque)' : 'var(--cor-texto-secundario)' }}>
                            {membro.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* BOTÕES DE AÇÕES (Líderes e Admins) */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      
                      {/* BOTÃO DO LÍDER: Promover ou Rebaixar Admins */}
                      {euSouLider && !souEu && !ehLider && (
                        <button 
                          onClick={() => handleAlterarCargo(membro.id, membro.nome, ehAdmin ? "Membro" : "Admin")} 
                          disabled={processandoId !== null} 
                          className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider border transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40 ${
                            ehAdmin 
                              ? 'hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/30' 
                              : 'hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30'
                          }`}
                          style={{ 
                            backgroundColor: 'var(--cor-fundo-card)', 
                            borderColor: 'var(--cor-fundo-sidebar)',
                            color: 'var(--cor-texto-secundario)'
                          }}
                        >
                          {estaProcessandoEsteMembro ? (
                            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                          ) : ehAdmin ? (
                            <ChevronDoubleDownIcon className="w-3.5 h-3.5 stroke-[2]" />
                          ) : (
                            <ChevronDoubleUpIcon className="w-3.5 h-3.5 stroke-[2]" />
                          )}
                          <span className="hidden sm:inline">{estaProcessandoEsteMembro ? "Processando..." : ehAdmin ? "Remover Admin" : "Tornar Admin"}</span>
                        </button>
                      )}

                      {/* BOTÃO GERAL: Expulsar do Clube */}
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
                          {estaProcessandoEsteMembro ? (
                            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserMinusIcon className="w-3.5 h-3.5 stroke-[2]" /> 
                          )}
                          <span className="hidden sm:inline">{estaProcessandoEsteMembro ? "..." : "Remover"}</span>
                        </button>
                      )}
                    </div>

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