"use client";

import { useState, useMemo } from "react";
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, ResponsiveContainer, Tooltip
} from "recharts";
import { 
  TrophyIcon, 
  UserGroupIcon, 
  TagIcon,
  BookOpenIcon,
  StarIcon 
} from "@heroicons/react/24/outline";

// INTERFACE ATUALIZADA - Reflete fielmente o JSON real da sua API
interface AbasDestaqueProps {
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

export default function AbasDestaque({ perfil }: AbasDestaqueProps) {
  const [abaAtiva, setAbaAtiva] = useState<"livro" | "autores" | "temas">("livro");

  // 1. TRATAMENTO DOS AUTORES (Lendo direto da raiz conforme o seu JSON)
  const dadosAutores = useMemo(() => {
    const listaRaw = perfil?.topAutores || [];
    return listaRaw.map((a) => ({
      nome: a.nome || "Ignorado",
      valor: Number(a.valor || 0)
    })).filter(item => item.nome !== "Ignorado");
  }, [perfil]);

  // 2. TRATAMENTO DOS TEMAS / GÊNEROS (Lendo direto da raiz conforme o seu JSON)
  const dadosTemas = useMemo(() => {
    const listaRaw = perfil?.topTemas || [];
    return listaRaw.map((t) => ({
      nome: t.nome || "Indefinido",
      valor: Number(t.valor || 0)
    })).filter(item => item.nome !== "Indefinido");
  }, [perfil]);

  // RENDERIZADOR INTELIGENTE (TEIA OU LISTA CONSOANTE A QUANTIDADE)
  const renderizarDadosAba = (dados: { nome: string; valor: number }[], tipo: string) => {
    if (!dados || dados.length === 0) {
      return (
        <div className="text-center opacity-40 flex flex-col items-center justify-center gap-2 py-8 animate-fade-in h-[260px] w-full">
          <BookOpenIcon className="w-6 h-6 stroke-[1.5]" style={{ color: 'var(--cor-texto-principal)' }} />
          <p className="text-xs italic">Nenhum dado de {tipo.toLowerCase()} registrado.</p>
        </div>
      );
    }

    // Se tiver 3 ou mais itens, monta a teia (Radar)
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
                        style={{ 
                          fill: 'var(--cor-texto-principal)',
                          fontFamily: 'inherit'
                        }}
                      >
                        {textoExibicao}
                      </text>
                    </g>
                  );
                }}
              />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--cor-fundo-card)',
                  borderColor: 'var(--cor-fundo-sidebar)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'var(--cor-texto-principal)'
                }}
              />

              <Radar
                name="Livros"
                dataKey="valor"
                stroke="var(--cor-primaria)"
                fill="var(--cor-primaria)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Se tiver menos de 3 itens (1 ou 2), exibe em cartões elegantes
    return (
      <div className="w-full space-y-2.5 animate-fade-in px-4 py-4 max-w-md mx-auto">
        {dados.map((item, idx) => (
          <div 
            key={idx} 
            className="flex justify-between items-center p-4 rounded-2xl border transition-all"
            style={{ 
              backgroundColor: 'var(--cor-fundo-sidebar)', 
              borderColor: 'var(--cor-fundo-sidebar)',
              opacity: 0.9 - (idx * 0.1)
            }}
          >
            <span className="font-bold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>
              {item.nome}
            </span>
            <span className="text-xs font-black px-3 py-1 rounded-lg" style={{ backgroundColor: 'var(--cor-fundo-card)', color: 'var(--cor-primaria)' }}>
              {item.valor} {item.valor === 1 ? 'livro' : 'livros'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const configuracaoAbas = [
    { id: "livro", label: "Destaque", icone: TrophyIcon },
    { id: "autores", label: "Autores", icone: UserGroupIcon },
    { id: "temas", label: "Gêneros", icone: TagIcon }
  ] as const;

  const urlCapaFavorito = perfil.favorito
    ? perfil.favorito.isbn 
      ? `https://covers.openlibrary.org/b/isbn/${perfil.favorito.isbn}-M.jpg`
      : perfil.favorito.capaUrl || perfil.favorito.capa || ""
    : "";

  const autorFavorito = perfil.favorito 
    ? perfil.favorito.autorPrincipal || perfil.favorito.autor || "Autor não informado"
    : "";

  return (
    <section 
      className="rounded-3xl border p-6 shadow-xl transition-all duration-300 w-full"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* SELETOR DE ABAS */}
      <div className="flex gap-1 mb-6 border-b pb-0 overflow-x-auto scrollbar-none" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        {configuracaoAbas.map((tab) => {
          const IconeComponente = tab.icone;
          const isActive = abaAtiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id)}
              className="pb-3 px-4 text-[10px] uppercase tracking-widest font-black flex items-center gap-2 border-b-2 -mb-[2px] transition-all duration-200 relative whitespace-nowrap"
              style={{ 
                color: isActive ? 'var(--cor-primaria)' : 'var(--cor-texto-secundario)',
                borderColor: isActive ? 'var(--cor-primaria)' : 'transparent',
                opacity: isActive ? 1 : 0.5
              }}
            >
              <IconeComponente className="w-4 h-4 stroke-[2]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RECIPIENTE DO PAINEL */}
      <div className="flex flex-col items-center justify-center min-h-[320px] w-full">
        
        {/* ABA LIVRO FAVORITO */}
        {abaAtiva === "livro" && (
          perfil.favorito ? (
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
                  <img 
                    src={urlCapaFavorito}
                    alt={perfil.favorito.titulo}
                    className="w-full h-full object-cover relative z-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}

                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-15 select-none z-0 bg-zinc-300 dark:bg-zinc-700">
                  <StarIcon className="w-8 h-8 stroke-[1.5] fill-zinc-100 dark:fill-zinc-900" style={{ color: 'var(--cor-texto-principal)' }} />
                  <span className="text-[10px] uppercase font-black tracking-widest mt-1.5 opacity-60" style={{ color: 'var(--cor-texto-principal)' }}>LETRIFY</span>
                </div>
              </div>

              <h4 className="text-xl font-black tracking-tight max-w-[240px] mx-auto line-clamp-2" style={{ color: 'var(--cor-texto-principal)' }}>
                {perfil.favorito.titulo}
              </h4>
              <p className="text-xs font-bold mt-1.5 opacity-80" style={{ color: 'var(--cor-primaria)' }}>
                {autorFavorito}
              </p>
            </div>
          ) : (
            <div className="text-center opacity-30 flex flex-col items-center gap-2">
              <BookOpenIcon className="w-6 h-6 stroke-[1.5]" style={{ color: 'var(--cor-texto-principal)' }} />
              <p className="text-xs italic">Nenhum livro favoritado.</p>
            </div>
          )
        )}

        {/* ABA AUTORES */}
        {abaAtiva === "autores" && renderizarDadosAba(dadosAutores, "Autores")}

        {/* ABA TEMAS */}
        {abaAtiva === "temas" && renderizarDadosAba(dadosTemas, "Temas")}
      </div>
    </section>
  );
}
