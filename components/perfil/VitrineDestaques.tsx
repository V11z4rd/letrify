"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { 
  SparklesIcon, 
  BookOpenIcon, 
  ChevronRightIcon,
  StarIcon
} from "@heroicons/react/24/outline";

interface VitrineDestaquesProps {
  userId: string;
  isPremium: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function VitrineDestaques({ userId, isPremium }: VitrineDestaquesProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  // 1. BUSCA OS LIVROS DAS PRATELEIRAS DO USUÁRIO
  const { data, error, isLoading } = useSWR(
    userId ? `${BASE_URL}/usuario/${userId}/livros` : null,
    fetcher
  );

  // 2. BUSCA OS DADOS DE PERFIL DO USUÁRIO
  const { data: dadosUsuario } = useSWR(
    userId ? `${BASE_URL}/usuario/${userId}` : null,
    fetcher
  );

  // Captura o objeto do livro favorito
  const livroFavorito = dadosUsuario?.favorito || null;

  const livrosParaExibir = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data.slice(0, 12);

    const todos = [
      ...(data.lendo || []),
      ...(data.lido || []),
      ...(data.queroLer || [])
    ];
    
    const chavesUnicas = new Set();
    return todos.filter(livro => {
      const chave = livro?.isbn || livro?.id;
      if (!chave || chavesUnicas.has(chave)) return false;
      chavesUnicas.add(chave);
      return true;
    }).slice(0, 12); 
  }, [data]);

  function CardAnalisePremium({ userId, isPremium }: { userId: string, isPremium: boolean }) {
    if (!isPremium) return null; // Só mostra se for premium

    const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/analise`, fetcher);

    // Se der erro na IA, apenas não mostra o card, não estraga o visual
    if (error || !data) return null;
    if (isLoading) return <div className="p-4 mt-6 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-2xl">IA analisando perfil...</div>;
    if (!data) return null;

    return (
      <div className="mt-6 p-6 rounded-2xl border border-dashed border-[var(--cor-primaria)] bg-[var(--cor-fundo-card)]">
        <h3 className="flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--cor-primaria)' }}>
          <AcademicCapIcon className="w-5 h-5" /> Análise Literária Premium
        </h3>
        <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--cor-texto-principal)' }}>
          {data.textoAnalise}
        </p>
      </div>
    );
  }

  // SKELETON DE CARREGAMENTO
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

  if (error || (livrosParaExibir.length === 0 && !livroFavorito)) return null;

  // 🌟 Descobre a capa do favorito via ISBN ou fallback de strings salvas
  const urlCapaFavorito = livroFavorito
    ? livroFavorito.isbn 
      ? `https://covers.openlibrary.org/b/isbn/${livroFavorito.isbn}-M.jpg`
      : livroFavorito.capaUrl || livroFavorito.capa || ""
    : "";

  return (
    <div className="space-y-6">
      
      {/* 🌟 SEÇÃO: LIVRO FAVORITO */}
      {livroFavorito && (
        <div 
          className="mt-6 p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 transition-all relative overflow-hidden"
          style={{ 
            backgroundColor: 'var(--cor-fundo-card)', 
            borderColor: 'var(--cor-fundo-sidebar)' 
          }}
        >

          <CardAnalisePremium userId={userId} isPremium={isPremium} />

          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--cor-primaria)] opacity-[0.03] rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Container de Capa igual ao da vitrine de baixo */}
          <div className="w-24 h-36 rounded-xl overflow-hidden shadow-md shrink-0 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 relative flex items-center justify-center">
            {urlCapaFavorito ? (
              <img 
                src={urlCapaFavorito}
                alt={livroFavorito.titulo}
                className="w-full h-full object-cover"
                onError={(e) => { 
                  (e.target as HTMLImageElement).style.display = 'none'; 
                }}
              />
            ) : null}
            
            {/* Fallback caso a imagem do favorito falhe ou não exista */}
            <div className="absolute inset-0 z-[-1] flex flex-col items-center justify-center p-4 opacity-30 text-center gap-1.5 bg-zinc-200 dark:bg-zinc-800">
              <BookOpenIcon className="w-6 h-6 stroke-[1.5]" style={{ color: 'var(--cor-texto-principal)' }} />
              <span className="text-[8px] font-bold uppercase tracking-wider">Sem Capa</span>
            </div>
          </div>

          <div className="flex flex-col text-center sm:text-left flex-1 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
              <StarIcon className="w-3.5 h-3.5 fill-current" /> Livro Favorito
            </span>
            <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>
              {livroFavorito.titulo}
            </h3>
            <p className="text-xs opacity-60 font-medium" style={{ color: 'var(--cor-texto-secundario)' }}>
              by {livroFavorito.autorPrincipal || livroFavorito.autor || "Autor não informado"}
            </p>
          </div>
        </div>
      )}

      {/* VITRINE PRINCIPAL DE LEITURAS */}
      <div 
        className="p-6 rounded-2xl border transition-all" 
        style={{ 
          backgroundColor: 'var(--cor-fundo-card)', 
          borderColor: 'var(--cor-fundo-sidebar)' 
        }}
      >
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
          {livrosParaExibir.map((livro, i) => {
            const urlCapaFinal = livro.isbn 
              ? `https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg` 
              : livro.capa || (livro as any).capaUrl || "";

            const autorFinal = (livro as any).autorPrincipal || livro.autor || "Autor não informado";

            return (
              <div key={livro.isbn || livro.id || i} className="group relative flex flex-col items-center cursor-pointer">
                
                <div 
                  className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-sm border transition-all duration-300 group-hover:scale-102 group-hover:shadow-xl bg-black/5 dark:bg-white/5"
                  style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
                >
                  {urlCapaFinal ? (
                    <img 
                      src={urlCapaFinal} 
                      alt={livro.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}

                  <div className="absolute inset-0 z-[-1] flex flex-col items-center justify-center p-4 opacity-30 text-center gap-1.5">
                    <BookOpenIcon className="w-7 h-7 stroke-[1.5]" style={{ color: 'var(--cor-texto-principal)' }} />
                    <span className="text-[8px] font-bold uppercase tracking-wider leading-tight">Sem Capa</span>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
                    <span 
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md w-max text-white"
                      style={{ backgroundColor: 'var(--cor-destaque)' }}
                    >
                      {livro.status || 'Leitura'}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 w-full text-center px-1">
                  <p 
                    className="text-xs font-bold line-clamp-1 transition-colors duration-200" 
                    style={{ color: 'var(--cor-texto-principal)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cor-primaria)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cor-texto-principal)'}
                  >
                    {livro.titulo}
                  </p>
                  <p className="text-[10px] font-medium opacity-50 truncate mt-0.5" style={{ color: 'var(--cor-texto-secundario)' }}>
                    {autorFinal}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t flex justify-center" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <Link 
            href={`/estante?id=${userId}`}
            className="text-xs font-bold py-2 px-5 rounded-full flex items-center gap-1.5 transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.03] active:scale-95"
            style={{ color: 'var(--cor-primaria)' }}
          >
            <span>Ver Estante Completa</span>
            <ChevronRightIcon className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>

      </div>
    </div>
  );
}