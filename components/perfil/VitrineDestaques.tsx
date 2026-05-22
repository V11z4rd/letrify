"use client";

import { useMemo } from "react";
import useSWR from "swr";
// Importações estratégicas do Heroicons
import { 
  SparklesIcon, 
  BookOpenIcon, 
  ChevronRightIcon 
} from "@heroicons/react/24/outline";

interface VitrineDestaquesProps {
  userId: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VitrineDestaques({ userId }: VitrineDestaquesProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  // Buscamos os livros do usuário utilizando a BASE_URL dinâmica
  const { data, error, isLoading } = useSWR(
    userId ? `${BASE_URL}/usuario/${userId}/livros` : null,
    fetcher
  );

  const livrosParaExibir = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data.slice(0, 12);

    const todos = [
      ...(data.lendo || []),
      ...(data.lido || []),
      ...(data.queroLer || [])
    ];
    
    // Remove duplicatas por ID para evitar quebras de chave no React
    const idsUnicos = new Set();
    return todos.filter(livro => {
      if (!livro?.id || idsUnicos.has(livro.id)) return false;
      idsUnicos.add(livro.id);
      return true;
    }).slice(0, 12); 
  }, [data]);

  // 1. SKELETON DE CARREGAMENTO ADAPTADO AO GLÓBALS
  if (isLoading) {
    return (
      <div 
        className="mt-6 p-6 rounded-2xl border animate-pulse"
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <div className="h-6 w-40 rounded-lg mb-6 bg-black/[0.08] dark:bg-white/[0.08]"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-full aspect-[2/3] rounded-xl bg-black/[0.05] dark:bg-white/[0.05]" />
              <div className="h-3 w-3/4 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || livrosParaExibir.length === 0) return null;

  return (
    <div 
      className="mt-6 p-6 rounded-2xl border transition-all" 
      style={{ 
        backgroundColor: 'var(--cor-fundo-card)', 
        borderColor: 'var(--cor-fundo-sidebar)' 
      }}
    >
      {/* CABEÇALHO DA VITRINE */}
      <div className="flex items-center justify-between mb-6 border-b pb-3" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--cor-texto-principal)' }}>
          <SparklesIcon className="w-5 h-5 stroke-[2.5]" style={{ color: 'var(--cor-primaria)' }} /> 
          Vitrine de Leituras
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-40" style={{ color: 'var(--cor-texto-principal)' }}>
          Recentes
        </span>
      </div>

      {/* GRID DE LIVROS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 animate-fade-in">
        {livrosParaExibir.map((livro, i) => (
          <div key={livro.id || i} className="group relative flex flex-col items-center cursor-pointer">
            
            {/* CAPA DO LIVRO */}
            <div 
              className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-sm border transition-all duration-300 group-hover:scale-102 group-hover:shadow-xl"
              style={{ 
                backgroundColor: 'var(--cor-fundo-app)',
                borderColor: 'var(--cor-fundo-sidebar)'
              }}
            >
              {livro.capa ? (
                <img 
                  src={livro.capa} 
                  alt={livro.titulo}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                /* FALLBACK PREMIUM USANDO HEROICONS COMPATÍVEL COM TEMAS */
                <div className="w-full h-full flex flex-col items-center justify-center p-4 opacity-30 text-center gap-2">
                  <BookOpenIcon className="w-8 h-8 stroke-[1.5]" style={{ color: 'var(--cor-texto-principal)' }} />
                  <span className="text-[9px] font-bold uppercase tracking-wider leading-tight">Sem Capa</span>
                </div>
              )}
              
              {/* OVERLAY VISUAL INTERATIVO */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
                <span 
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md w-max text-white"
                  style={{ backgroundColor: 'var(--cor-destaque)' }}
                >
                  {livro.status || 'Leitura'}
                </span>
              </div>
            </div>

            {/* INFO DO LIVRO */}
            <div className="mt-2.5 w-full text-center px-1">
              <p 
                className="text-xs font-bold line-clamp-1 transition-colors duration-200" 
                style={{ color: 'var(--cor-texto-principal)' }}
                /* Efeito de hover dinâmico baseado na sua cor primária */
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cor-primaria)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cor-texto-principal)'}
              >
                {livro.titulo}
              </p>
              <p className="text-[10px] font-medium opacity-50 truncate mt-0.5" style={{ color: 'var(--cor-texto-secundario)' }}>
                {livro.autor}
              </p>
            </div>

          </div>
        ))}
      </div>

      {/* RODAPÉ DA VITRINE */}
      <div className="mt-6 pt-4 border-t flex justify-center" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <button 
          className="text-xs font-bold py-2 px-5 rounded-full flex items-center gap-1.5 transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.03] active:scale-95"
          style={{ color: 'var(--cor-primaria)' }}
        >
          <span>Ver Estante Completa</span>
          <ChevronRightIcon className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>

    </div>
  );
}