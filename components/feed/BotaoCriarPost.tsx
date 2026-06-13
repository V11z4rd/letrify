"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";
import { grupoService, GrupoResumo } from "@/app/lib/grupoService";
import { XMarkIcon, UserGroupIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface BotaoCriarPostProps {
  onPostCreated?: () => void;
  grupoIdContexto?: string | number; // 💡 NOVO: Guarda o ID se o usuário já estiver dentro de um grupo
}

export default function BotaoCriarPost({ onPostCreated, grupoIdContexto }: BotaoCriarPostProps) {
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Se já recebemos um grupo por contexto, o modo recrutamento/seleção não é necessário
  // --- LÓGICA DE RECRUTAMENTO ---
  const [isRecrutamento, setIsRecrutamento] = useState(false);
  const [gruposFiltrados, setGruposFiltrados] = useState<GrupoResumo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>("");
  const [carregandoGrupos, setCarregandoGrupos] = useState(false);

  // Determina se este editor está rodando isolado dentro da página de um clube
  const estaNoFeedDoClube = !!grupoIdContexto;

  useEffect(() => {
    // 💡 SÓ DISPARA A BUSCA SE ESTIVER NO FEED GLOBAL, ATIVAR O TOGGLE E A LISTA ESTIVER VAZIA
    if (!estaNoFeedDoClube && isRecrutamento && gruposFiltrados.length === 0) {
      setCarregandoGrupos(true);
      
      const meuId = authService.getUserId();
      const token = authService.getToken();

      if (!meuId) {
        setCarregandoGrupos(false);
        return;
      }

      // 1. Passo: Busca todos os grupos usando a rota real da sua documentação (/api/grupos)
      fetch("https://letrify.fly.dev/api/grupos", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(async (todosOsGrupos) => {
        if (!Array.isArray(todosOsGrupos)) return;

        // Lista temporária para guardar os grupos que o usuário participa
        const meusClubesDetectados: GrupoResumo[] = [];

        // 2. Passo: Fazemos uma varredura ultra rápida para checar onde o usuário está incluso
        for (const grupo of todosOsGrupos) {
          
          // Checagem A: Se o usuário logado é o Líder direto (objeto retornado no JSON)
          const ehLider = grupo.lider && Number(grupo.lider.id) === Number(meuId);
          
          if (ehLider) {
            meusClubesDetectados.push(grupo);
            continue; // Já adicionou, pode pular para o próximo grupo
          }

          // Checagem B: Se não é líder, verifica se ele é membro puxando o detalhe do grupo (/api/grupos/{id})
          try {
            const resDetalhe = await fetch(`https://letrify.fly.dev/api/grupos/${grupo.id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });

            if (resDetalhe.ok) {
              const grupoDetalhado = await resDetalhe.json();
              
              // A rota /api/grupos/{id} retorna a lista completa de membros conforme sua doc
              const listaMembros = grupoDetalhado.membros || grupoDetalhado.grupoMembros || [];
              
              const estaNaLista = listaMembros.some((membro: any) => 
                Number(membro.id || membro.usuarioId) === Number(meuId)
              );

              if (estaNaLista) {
                meusClubesDetectados.push(grupo);
              }
            }
          } catch (err) {
            console.error(`Erro ao verificar membros do grupo ${grupo.id}:`, err);
          }
        }

        // Atualiza o estado com os grupos que passaram no teste
        setGruposFiltrados(meusClubesDetectados);
      })
      .catch(console.error)
      .finally(() => setCarregandoGrupos(false));
    }
  }, [isRecrutamento, gruposFiltrados.length, estaNoFeedDoClube]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim() || enviando) return;

    // Validação de segurança para recrutamento no Feed Global
    if (!estaNoFeedDoClube && isRecrutamento && (!grupoSelecionado || Number(grupoSelecionado) <= 0)) {
      alert("Por favor, selecione um Clube de Leitura que você participa.");
      return;
    }

    setEnviando(true);
    try {
      const token = authService.getToken();
      
      let urlEnvio = "";
      let payload: any = {};

      // 🎯 DIVISÃO REAL DE ESCOPO CONFORME A DOCUMENTAÇÃO
      if (estaNoFeedDoClube) {
        // =================================================================
        // ROTA: POST /api/grupos/{id}/posts (Mural Interno Privado)
        // =================================================================
        urlEnvio = `${BASE_URL}/grupos/${grupoIdContexto}/posts`; //
        payload = {
          conteudo: conteudo.trim(),
          postPaiId: null // Se for um post novo, o pai é nulo
        };
      } else {
        // =================================================================
        // ROTA: POST /api/chat/enviar (Feed Global Público)
        // =================================================================
        urlEnvio = `${BASE_URL}/chat/enviar`; //
        payload = {
          conteudo: conteudo.trim(),
          grupoId: isRecrutamento && grupoSelecionado ? Number(grupoSelecionado) : null //
        };
      }

      // Disparando para a rota mapeada
      const resposta = await fetch(urlEnvio, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) throw new Error(`Erro na API (Status: ${resposta.status})`);

      // Limpeza de estados locais após o sucesso
      setConteudo("");
      setIsRecrutamento(false);
      setGrupoSelecionado("");
      
      if (onPostCreated) onPostCreated();
      
    } catch (err: any) {
      console.error("Falha ao enviar publicação:", err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div 
      className="rounded-3xl border p-5 sm:p-6 mb-8 shadow-md transition-all duration-300"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      <form onSubmit={handlePublicar} className="flex flex-col gap-4">
        
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder={estaNoFeedDoClube ? "O que quer debater com os leitores deste clube?" : "O que está a ler ou a pensar hoje?"}
          className="w-full bg-transparent text-base sm:text-lg resize-none outline-none min-h-[90px] font-medium placeholder:opacity-40"
          style={{ color: 'var(--cor-texto-principal)' }}
          maxLength={500}
        />

        {/* ÁREA DO RECRUTAMENTO - SÓ EXIBE SE NÃO ESTIVER DENTRO DE UM CLUBE */}
        {isRecrutamento && !estaNoFeedDoClube && (
          <div 
            className="border rounded-2xl p-4 animate-fade-in flex flex-col gap-3 transition-all"
            style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            <div className="text-[10px] uppercase tracking-widest font-black flex justify-between items-center" style={{ color: 'var(--cor-primaria)' }}>
              <span>Seus Clubes Autorizados</span>
              <button 
                type="button" 
                onClick={() => { setIsRecrutamento(false); setGrupoSelecionado(""); }} 
                className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--cor-texto-principal)' }}
              >
                <XMarkIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Fechar</span>
              </button>
            </div>
            
            {carregandoGrupos ? (
              <span className="text-xs font-medium opacity-50 italic" style={{ color: 'var(--cor-texto-principal)' }}>
                Cruzando dados de filiação...
              </span>
            ) : (
              <select 
                value={grupoSelecionado}
                onChange={(e) => setGrupoSelecionado(e.target.value)}
                className="w-full text-xs font-bold rounded-xl p-3 outline-none border cursor-pointer transition-all"
                style={{ 
                  backgroundColor: 'var(--cor-fundo-card)', 
                  borderColor: 'var(--cor-fundo-sidebar)',
                  color: 'var(--cor-texto-principal)'
                }}
              >
                <option value="">-- Selecione um clube que você participa --</option>
                {gruposFiltrados.map(g => (
                  <option key={g.id} value={g.id} style={{ backgroundColor: 'var(--cor-fundo-card)' }}>{g.nome}</option>
                ))}
              </select>
            )}

            {gruposFiltrados.length === 0 && !carregandoGrupos && (
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                ⚠️ Nenhum clube associado ao seu perfil foi encontrado para divulgação.
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          
          {/* 💡 BOTÃO CONDICIONAL: Só exibe o botão de anexar clube se estivermos no feed global público */}
          {!estaNoFeedDoClube ? (
            <button 
              type="button" 
              onClick={() => setIsRecrutamento(!isRecrutamento)}
              className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
              style={{ 
                backgroundColor: isRecrutamento ? 'rgba(var(--cor-primaria-rgb, 59, 130, 246), 0.15)' : 'var(--cor-fundo-app)', 
                color: isRecrutamento ? 'var(--cor-primaria)' : 'var(--cor-texto-principal)',
                opacity: isRecrutamento ? 1 : 0.7
              }}
            >
              <UserGroupIcon className="w-4 h-4 stroke-[2.5]" />
              <span>Divulgar Clube</span>
            </button>
          ) : (
            // Se estiver no clube, coloca um rótulo discreto indicando o feed interno
            <div className="text-[10px] uppercase tracking-widest font-black opacity-45 select-none" style={{ color: 'var(--cor-texto-principal)' }}>
              📌 Mural do Clube
            </div>
          )}

          <button
            type="submit"
            disabled={enviando || !conteudo.trim() || (isRecrutamento && !grupoSelecionado)}
            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: (!conteudo.trim() || enviando || (isRecrutamento && !grupoSelecionado)) ? 'var(--cor-fundo-sidebar)' : 'var(--cor-destaque)', 
              color: (!conteudo.trim() || enviando || (isRecrutamento && !grupoSelecionado)) ? 'var(--cor-texto-secundario)' : '#ffffff',
              opacity: (!conteudo.trim() || enviando || (isRecrutamento && !grupoSelecionado)) ? 0.5 : 1
            }}
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{enviando ? "Enviando" : "Publicar"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}