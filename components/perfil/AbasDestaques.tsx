"use client";

import { useState } from "react";
// Importações de gráficos e o ecossistema Heroicons para as abas
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, ResponsiveContainer 
} from "recharts";
import { 
  TrophyIcon, 
  UserGroupIcon, 
  TagIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";

interface AbasDestaqueProps {
  perfil: {
    favorito: { titulo: string; autor: string } | null;
    topAutores: { nome: string; valor: number }[];
    topTemas: { nome: string; valor: number }[];
  };
}

export default function AbasDestaque({ perfil }: AbasDestaqueProps) {
  const [abaAtiva, setAbaAtiva] = useState<"livro" | "autores" | "temas">("livro");

  // Renderizador dinâmico de dados com injeção segura de variáveis CSS
  const renderizarDados = (dados: { nome: string; valor: number }[], tipo: string) => {
    if (!dados || dados.length === 0) {
      return (
        <p className="text-xs italic opacity-40" style={{ color: 'var(--cor-texto-principal)' }}>
          Nenhum dado de {tipo.toLowerCase()} para exibir.
        </p>
      );
    }

    // Se tiver 3 ou mais registros, desenha o Radar Gráfico (A Teia)
    if (dados.length >= 3) {
      return (
        <div className="w-full h-[300px] animate-fade-in min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dados}>
              {/* Malha sutil adaptável ao fundo */}
              <PolarGrid stroke="var(--cor-fundo-sidebar)" />
              <PolarAngleAxis 
                dataKey="nome" 
                tick={{ 
                  fill: "var(--cor-texto-secundario)", 
                  fontSize: 10, 
                  fontWeight: "bold",
                  opacity: 0.8 
                }} 
              />
              <Radar
                name={tipo}
                dataKey="valor"
                stroke="var(--cor-primaria)"
                fill="var(--cor-primaria)"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Se tiver menos de 3, monta a lista clássica de alta fidelidade
    return (
      <div className="w-full space-y-2.5 animate-fade-in">
        {dados.map((item, idx) => (
          <div 
            key={idx} 
            className="flex justify-between items-center p-4 rounded-2xl border transition-all"
            style={{ 
              backgroundColor: 'var(--cor-fundo-app)', 
              borderColor: 'var(--cor-fundo-sidebar)' 
            }}
          >
            <span className="font-bold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>
              {item.nome}
            </span>
            <span className="text-xs font-black px-3 py-1 rounded-lg" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-primaria)' }}>
              {item.valor} {item.valor === 1 ? 'livro' : 'livros'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Definição das configurações de Abas estruturadas
  const configuracaoAbas = [
    { id: "livro", label: "Destaque", icone: TrophyIcon },
    { id: "autores", label: "Autores", icone: UserGroupIcon },
    { id: "temas", label: "Gêneros", icone: TagIcon }
  ] as const;

  return (
    <section 
      className="rounded-3xl border p-6 shadow-xl transition-all duration-300"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* SELETOR DE ABAS EVOLUÍDO */}
      <div className="flex gap-1 mb-8 border-b pb-0 overflow-x-auto scrollbar-none" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
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

      {/* PAINEL DE EXIBIÇÃO FLUIDO */}
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        
        {/* ABA LIVRO FAVORITO */}
        {abaAtiva === "livro" && (
          perfil.favorito ? (
            <div className="text-center animate-fade-in group">
              
              {/* Capa de Livro 3D Letrify */}
              <div 
                className="w-36 h-52 rounded-2xl shadow-xl mb-5 mx-auto flex items-center justify-center border transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 group-hover:shadow-2xl"
                style={{ 
                  backgroundColor: 'var(--cor-fundo-app)', 
                  borderColor: 'var(--cor-fundo-sidebar)' 
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--cor-primaria)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--cor-fundo-sidebar)'}
              >
                <div className="absolute top-0 left-0 bottom-0 w-2 bg-black/[0.12] dark:bg-black/[0.3] z-10 border-r border-black/[0.05]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/[0.2] dark:from-black/[0.5] to-transparent z-0" />
                <span className="text-[9px] uppercase font-black tracking-[0.35em] opacity-15 rotate-90 select-none" style={{ color: 'var(--cor-texto-principal)' }}>
                  LETRIFY
                </span>
              </div>

              <h4 className="text-xl font-black tracking-tight max-w-[240px] mx-auto line-clamp-2" style={{ color: 'var(--cor-texto-principal)' }}>
                {perfil.favorito.titulo}
              </h4>
              <p className="text-xs font-bold mt-1.5 opacity-80" style={{ color: 'var(--cor-primaria)' }}>
                {perfil.favorito.autor}
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
        {abaAtiva === "autores" && renderizarDados(perfil.topAutores, "Autores")}

        {/* ABA TEMAS */}
        {abaAtiva === "temas" && renderizarDados(perfil.topTemas, "Temas")}
      </div>
    </section>
  );
}