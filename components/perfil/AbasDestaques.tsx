"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, ResponsiveContainer, Tooltip
} from "recharts";
import { 
  TrophyIcon, 
  UserGroupIcon, 
  TagIcon,
  BookOpenIcon,
  StarIcon,
  SparklesIcon,
  FireIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { FireIcon as FireSolid } from "@heroicons/react/24/solid";
import { metasService, MetaLeitura, StreakGlobal } from "@/app/lib/metasService";

interface AbasDestaqueProps {
  isDonoDoPerfil?: boolean;
  isPremium?: boolean;
  perfil: {
    nome?: string;
    fotoPerfil?: string;
    bannerUrl?: string;
    cidade?: string;
    descricao?: string;
    isPremium?: boolean;
    isPrivado?: boolean;
    totalDeLivros?: number;
    grupos?: number;
    guias?: number;
    estatisticas?: {
      seguidores: number;
      seguindo: number;
    };
    estanteResumo?: {
      lidos: number;
      lendo: number;
      queroLer: number;
    };
    favorito: { 
      titulo: string; 
      autorPrincipal?: string; 
      autor?: string; 
      isbn?: string; 
      capaUrl?: string; 
      capa?: string; 
    } | null;
    topAutores?: { nome: string; valor: number }[];
    topTemas?: { nome: string; valor: number }[];
  };
}

export default function AbasDestaque({ perfil, isDonoDoPerfil = false, isPremium = false }: AbasDestaqueProps) {
  // 1. ESTADO DAS ABAS (Metas em 1º lugar se for o dono)
  const [abaAtiva, setAbaAtiva] = useState<"metas" | "livro" | "autores" | "temas">(
    isDonoDoPerfil ? "metas" : "livro"
  );

  // 2. ESTADOS DA GAMIFICAÇÃO (Metas e Streak)
  const [metas, setMetas] = useState<MetaLeitura[]>([]);
  const [streak, setStreak] = useState<StreakGlobal | null>(null);
  const [carregandoMetas, setCarregandoMetas] = useState(isDonoDoPerfil);
  const [valorCheckIn, setValorCheckIn] = useState<{ [key: number]: number | "" }>({});
  const [processandoCheckIn, setProcessandoCheckIn] = useState<number | null>(null);

  // 3. BUSCA DOS DADOS DE GAMIFICAÇÃO (Apenas se for o dono)
  useEffect(() => {
    if (isDonoDoPerfil) {
      const carregarGamificacao = async () => {
        try {
          const [metasData, streakData] = await Promise.all([
            metasService.listarMetasAtivas(),
            metasService.consultarStreak()
          ]);
          setMetas(metasData);
          setStreak(streakData);
        } catch (error) {
          console.error("Erro ao carregar metas/streak:", error);
        } finally {
          setCarregandoMetas(false);
        }
      };
      carregarGamificacao();
    }
  }, [isDonoDoPerfil]);

  // 4. FUNÇÃO DE CHECK-IN
  const handleCheckIn = async (metaId: number) => {
    const valor = valorCheckIn[metaId];
    if (!valor || valor <= 0) return;

    setProcessandoCheckIn(metaId);
    try {
      const resposta = await metasService.fazerCheckIn(metaId, Number(valor));
      
      // Atualiza a meta para refletir que já fez check-in hoje
      setMetas(prev => prev.map(m => m.id === metaId ? { ...m, checkInHoje: true } : m));
      
      // Atualiza o Streak com os dados frescos que a API devolveu
      setStreak(prev => prev ? { 
        ...prev, 
        streakAtual: resposta.streakAtual, 
        maiorStreak: resposta.maiorStreak 
      } : null);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessandoCheckIn(null);
    }
  };

  // TRATAMENTO DOS AUTORES E TEMAS (Inalterado)
  const dadosAutores = useMemo(() => {
    const listaRaw = perfil?.topAutores || [];
    return listaRaw.map((a) => ({
      nome: a.nome || "Ignorado",
      valor: Number(a.valor || 0)
    })).filter(item => item.nome !== "Ignorado");
  }, [perfil]);

  const dadosTemas = useMemo(() => {
    const listaRaw = perfil?.topTemas || [];
    return listaRaw.map((t) => ({
      nome: t.nome || "Indefinido",
      valor: Number(t.valor || 0)
    })).filter(item => item.nome !== "Indefinido");
  }, [perfil]);

  const renderizarDadosAba = (dados: { nome: string; valor: number }[], tipo: string) => {
    if (!dados || dados.length === 0) {
      return (
        <div className="text-center opacity-40 flex flex-col items-center justify-center gap-2 py-8 animate-fade-in h-[260px] w-full">
          <BookOpenIcon className="w-6 h-6 stroke-[1.5]" style={{ color: 'var(--cor-texto-principal)' }} />
          <p className="text-xs italic">Nenhum dado de {tipo.toLowerCase()} registrado.</p>
        </div>
      );
    }

    if (dados.length >= 3) {
      return (
        <div className="w-full h-[320px] animate-fade-in flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={dados}>
              <PolarGrid stroke="var(--cor-fundo-sidebar)" strokeWidth={1.5} />
              <PolarAngleAxis 
                dataKey="nome" 
                tick={(props: any) => {
                  const { payload, x, y, textAnchor } = props;
                  if (!payload) return null;
                  const valorCorrespondente = dados.find(d => d.nome === payload.value)?.valor || 0;
                  const textoExibicao = `${payload.value} (${valorCorrespondente} ${valorCorrespondente === 1 ? 'livro' : 'livros'})`;
                  const posX = x ?? 0;
                  const posY = y ?? 0;
                  const dx = posX > 150 ? 8 : -8;
                  const dy = posY > 150 ? 8 : -8;

                  return (
                    <g className="recharts-layer recharts-polar-angle-axis-tick">
                      <text
                        x={posX}
                        y={posY}
                        dx={dx}
                        dy={dy}
                        textAnchor={textAnchor || "middle"}
                        className="text-[10px] font-bold"
                        style={{ fill: 'var(--cor-texto-principal)', fontFamily: 'inherit' }}
                      >
                        {textoExibicao}
                      </text>
                    </g>
                  );
                }}
              />
              <Tooltip contentStyle={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', color: 'var(--cor-texto-principal)' }} />
              <Radar name="Livros" dataKey="valor" stroke="var(--cor-primaria)" fill="var(--cor-primaria)" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return (
      <div className="w-full space-y-2.5 animate-fade-in px-4 py-4 max-w-md mx-auto">
        {dados.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-4 rounded-2xl border transition-all" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', borderColor: 'var(--cor-fundo-sidebar)', opacity: 0.9 - (idx * 0.1) }}>
            <span className="font-bold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>{item.nome}</span>
            <span className="text-xs font-black px-3 py-1 rounded-lg" style={{ backgroundColor: 'var(--cor-fundo-card)', color: 'var(--cor-primaria)' }}>{item.valor} {item.valor === 1 ? 'livro' : 'livros'}</span>
          </div>
        ))}
      </div>
    );
  };

  // 5. CONFIGURAÇÃO DINÂMICA DAS ABAS
  const configuracaoAbasBase = [
    { id: "livro", label: "Destaque", icone: TrophyIcon },
    { id: "autores", label: "Autores", icone: UserGroupIcon },
    { id: "temas", label: "Gêneros", icone: TagIcon }
  ] as const;

  const configuracaoAbas = isDonoDoPerfil 
    ? [{ id: "metas", label: "Metas", icone: FireIcon } as const, ...configuracaoAbasBase]
    : configuracaoAbasBase;

  const urlCapaFavorito = perfil.favorito
    ? perfil.favorito.isbn ? `https://covers.openlibrary.org/b/isbn/${perfil.favorito.isbn}-M.jpg` : perfil.favorito.capaUrl || perfil.favorito.capa || ""
    : "";

  const autorFavorito = perfil.favorito ? perfil.favorito.autorPrincipal || perfil.favorito.autor || "Autor não informado" : "";

  return (
    <section 
      className="rounded-3xl border p-6 shadow-xl transition-all duration-300 w-full"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* SELETOR DE ABAS */}
      <div className="flex justify-between items-end mb-6 border-b pb-0 overflow-x-auto hide-scrollbar" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <div className="flex gap-1 shrink-0">
          {configuracaoAbas.map((tab) => {
            const IconeComponente = tab.icone;
            const isActive = abaAtiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id as any)}
                className="pb-3 px-3 sm:px-4 text-[10px] uppercase tracking-widest font-black flex items-center gap-2 border-b-2 -mb-[1px] transition-all duration-300 relative whitespace-nowrap"
                style={{ 
                  color: isActive ? (tab.id === 'metas' ? 'var(--cor-destaque)' : 'var(--cor-primaria)') : 'var(--cor-texto-secundario)',
                  borderColor: isActive ? (tab.id === 'metas' ? 'var(--cor-destaque)' : 'var(--cor-primaria)') : 'transparent',
                  opacity: isActive ? 1 : 0.6
                }}
              >
                <IconeComponente className={`w-4 h-4 stroke-[2.5] transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`${isActive ? 'block' : 'hidden'} sm:block transition-all`}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {isDonoDoPerfil && (
          <div className="flex shrink-0">
            <Link href="/Premium" className="pb-3 px-3 sm:px-4 text-[10px] uppercase tracking-widest font-black flex items-center gap-2 border-b-2 border-transparent -mb-[1px] transition-all duration-300 group hover:opacity-80" style={{ color: isPremium ? 'var(--cor-primaria)' : 'var(--cor-destaque)' }}>
              <SparklesIcon className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:block whitespace-nowrap">{isPremium ? "Relatório Premium" : "Torne-se Premium"}</span>
            </Link>
          </div>
        )}
      </div>

      {/* RECIPIENTE DO PAINEL */}
      <div className="flex flex-col items-center justify-center min-h-[320px] w-full">
        
        {/* 👇 NOVA ABA: DASHBOARD DE METAS (SÓ PARA O DONO) 👇 */}
        {abaAtiva === "metas" && isDonoDoPerfil && (
          <div className="w-full h-full flex flex-col animate-fade-in">
            {carregandoMetas ? (
              <div className="flex-1 flex flex-col justify-center items-center opacity-50">
                <ArrowPathIcon className="w-8 h-8 animate-spin" style={{ color: 'var(--cor-destaque)' }} />
              </div>
            ) : metas.length === 0 ? (
              /* ESTADO VAZIO: CTA PARA CRIAR META */
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                  <FireIcon className="w-8 h-8 text-orange-500 stroke-[2]" />
                </div>
                <h3 className="text-lg font-black mb-2" style={{ color: 'var(--cor-texto-principal)' }}>Sua ofensiva está zerada!</h3>
                <p className="text-xs font-medium opacity-60 max-w-sm mb-6 leading-relaxed" style={{ color: 'var(--cor-texto-secundario)' }}>
                  Acompanhe a sua rotina de leitura e construa uma sequência implacável de dias lidos.
                </p>
                <Link 
                  href="/conta/metas"
                  className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'var(--cor-destaque)', color: 'white' }}
                >
                  Definir Meta de Leitura
                </Link>
              </div>
            ) : (
              /* DASHBOARD DE METAS ATIVAS */
              <div className="w-full max-w-xl mx-auto flex flex-col gap-5 pt-2">
                
                {/* WIDGET DE OFENSIVA (STREAK) */}
                <div className="p-5 rounded-3xl border flex items-center justify-between shadow-sm" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                  <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-orange-500 opacity-20 blur-md rounded-full"></div>
                      <FireSolid className="w-10 h-10 relative z-10 text-orange-500 drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>Ofensiva Atual</h4>
                      <p className="text-2xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>
                        {streak?.streakAtual || 0} <span className="text-sm font-bold opacity-60 tracking-normal">dias seguidos</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--cor-texto-secundario)' }}>Maior Ofensiva</h4>
                    <p className="text-lg font-black opacity-80" style={{ color: 'var(--cor-texto-principal)' }}>{streak?.maiorStreak || 0}</p>
                  </div>
                </div>

                {/* CARTÕES DE METAS */}
                {metas.map(meta => {
                  // Textos dinâmicos baseados no tipo e periodicidade!
                  const textoPeriodo = meta.periodicidade === "Diaria" ? "por dia" : meta.periodicidade === "Semanal" ? "por semana" : "por mês";
                  const textoTipo = meta.tipo === "Paginas" ? "páginas" : meta.tipo === "Minutos" ? "minutos" : "livros";
                  const placeholderCheckIn = meta.tipo === "Paginas" ? "Ex: 20 páginas" : meta.tipo === "Minutos" ? "Ex: 30 min" : "Ex: 1 livro";

                  return (
                    <div key={meta.id} className="p-5 rounded-3xl border flex flex-col gap-4 shadow-sm transition-all" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
                            Alvo {meta.periodicidade}
                          </h4>
                          <p className="text-lg font-black tracking-tight flex items-baseline gap-1" style={{ color: 'var(--cor-texto-principal)' }}>
                            Ler {meta.valorAlvo} <span className="text-sm font-bold opacity-70">{textoTipo}</span> <span className="text-xs font-medium opacity-50 ml-1">{textoPeriodo}</span>
                          </p>
                        </div>
                        {meta.checkInHoje ? (
                          <div className="px-3 py-1.5 rounded-lg border bg-green-500/10 border-green-500/20 flex items-center gap-1.5 text-green-600">
                            <CheckCircleIcon className="w-4 h-4 stroke-[2.5]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Cumprida</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-lg border opacity-50 text-[10px] font-black uppercase tracking-widest" style={{ borderColor: 'var(--cor-fundo-card)', color: 'var(--cor-texto-principal)' }}>
                            Pendente
                          </div>
                        )}
                      </div>

                      {/* AÇÃO DE CHECK-IN (Só mostra se não fez hoje) */}
                      {!meta.checkInHoje && (
                        <div className="flex items-center gap-2 mt-1">
                          <input 
                            type="number"
                            min="1"
                            placeholder={placeholderCheckIn}
                            value={valorCheckIn[meta.id] || ""}
                            onChange={(e) => setValorCheckIn({ ...valorCheckIn, [meta.id]: e.target.value === "" ? "" : Number(e.target.value) })}
                            className="flex-1 bg-[var(--cor-fundo-card)] border rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-1 transition-shadow"
                            style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)', '--tw-ring-color': 'var(--cor-destaque)' } as any}
                          />
                          <button
                            onClick={() => handleCheckIn(meta.id)}
                            disabled={processandoCheckIn === meta.id || !valorCheckIn[meta.id]}
                            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2 shadow-sm"
                            style={{ backgroundColor: 'var(--cor-destaque)', color: 'white' }}
                          >
                            {processandoCheckIn === meta.id ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4 stroke-[2.5]" />}
                            Registrar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* OUTRAS ABAS INALTERADAS */}
        {abaAtiva === "livro" && (
          perfil.favorito ? (
            // ... Bloco Livro Favorito (Código inalterado)
            <div className="text-center animate-fade-in group relative w-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-10 w-40 h-40 bg-[var(--cor-primaria)] opacity-5 rounded-full blur-3xl pointer-events-none"></div>

              <div 
                className="w-36 h-52 rounded-2xl shadow-xl mb-5 mx-auto flex items-center justify-center border transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 group-hover:shadow-2xl bg-zinc-200 dark:bg-zinc-800"
                style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--cor-primaria)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--cor-fundo-sidebar)'}
              >
                <div className="absolute top-0 left-0 bottom-0 w-2 bg-black/[0.12] dark:bg-black/[0.3] z-20 border-r border-black/[0.05]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/[0.2] dark:from-black/[0.5] to-transparent z-10 pointer-events-none" />

                {urlCapaFavorito ? (
                  <img src={urlCapaFavorito} alt={perfil.favorito.titulo} className="w-full h-full object-cover relative z-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : null}

                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-15 select-none z-0 bg-zinc-300 dark:bg-zinc-700">
                  <StarIcon className="w-8 h-8 stroke-[1.5] fill-zinc-100 dark:fill-zinc-900" style={{ color: 'var(--cor-texto-principal)' }} />
                  <span className="text-[10px] uppercase font-black tracking-widest mt-1.5 opacity-60" style={{ color: 'var(--cor-texto-principal)' }}>LETRIFY</span>
                </div>
              </div>

              <h4 className="text-xl font-black tracking-tight max-w-[240px] mx-auto line-clamp-2" style={{ color: 'var(--cor-texto-principal)' }}>{perfil.favorito.titulo}</h4>
              <p className="text-xs font-bold mt-1.5 opacity-80" style={{ color: 'var(--cor-primaria)' }}>{autorFavorito}</p>
            </div>
          ) : (
            <div className="text-center opacity-30 flex flex-col items-center gap-2">
              <BookOpenIcon className="w-6 h-6 stroke-[1.5]" style={{ color: 'var(--cor-texto-principal)' }} />
              <p className="text-xs italic">Nenhum livro favoritado.</p>
            </div>
          )
        )}
        {abaAtiva === "autores" && renderizarDadosAba(dadosAutores, "Autores")}
        {abaAtiva === "temas" && renderizarDadosAba(dadosTemas, "Temas")}
      </div>
    </section>
  );
}