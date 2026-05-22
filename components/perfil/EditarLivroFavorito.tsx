"use client";

import { useState } from "react";
// Ícones sofisticados do Heroicons para enriquecer o apelo visual literário
import { 
  TrophyIcon, 
  BookOpenIcon, 
  PlusIcon, 
  TrashIcon 
} from "@heroicons/react/24/outline";

interface EditarLivroFavoritoProps {
  perfilInicial: {
    favorito: { titulo: string; autor: string } | null;
  };
}

export default function EditarLivroFavorito({ perfilInicial }: EditarLivroFavoritoProps) {
  const [favorito, setFavorito] = useState<{ titulo: string; autor: string } | null>(
    perfilInicial.favorito
  );

  // Mock simulando a injeção do livro selecionado
  const livroMock = {
    titulo: "O Nome da Rosa",
    autor: "Umberto Eco",
  };

  const alternarFavorito = () => {
    if (favorito) {
      setFavorito(null);
    } else {
      setFavorito(livroMock);
    }
  };

  return (
    <section 
      className="rounded-3xl border p-6 shadow-xl transition-all duration-300"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* CABEÇALHO COM ABAS INTEGRADO AO GLOBALS */}
      <div className="flex justify-between items-center mb-8 border-b pb-3" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <div 
          className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 border-b-2 pb-3.5 -mb-[15px] transition-colors"
          style={{ color: 'var(--cor-primaria)', borderColor: 'var(--cor-primaria)' }}
        >
          <TrophyIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Livro Favorito</span>
        </div>
        
        {/* Botão de Alternância com Micro-interações */}
        <button
          onClick={alternarFavorito}
          className="text-[9px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border transition-all duration-200 active:scale-95"
          style={{ 
            backgroundColor: favorito ? 'rgba(239, 68, 68, 0.05)' : 'var(--cor-fundo-sidebar)', 
            borderColor: favorito ? 'rgba(239, 68, 68, 0.2)' : 'var(--cor-fundo-sidebar)',
            color: favorito ? '#ef4444' : 'var(--cor-texto-secundario)'
          }}
        >
          {favorito ? (
            <>
              <TrashIcon className="w-3 h-3 stroke-[2.5]" />
              <span>Remover</span>
            </>
          ) : (
            <>
              <PlusIcon className="w-3 h-3 stroke-[2.5]" />
              <span>Adicionar</span>
            </>
          )}
        </button>
      </div>

      {/* ÁREA DO CONTEÚDO (Mantendo proporção vertical estável) */}
      <div className="flex flex-col items-center justify-center min-h-[320px]">
        {favorito ? (
          <div className="text-center animate-fade-in group">
            
            {/* Capa Estilizada de Alta Fidelidade */}
            <div 
              className="w-36 h-52 rounded-2xl shadow-xl mb-5 mx-auto flex items-center justify-center border transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1 group-hover:shadow-2xl"
              style={{ 
                backgroundColor: 'var(--cor-fundo-app)', 
                borderColor: 'var(--cor-fundo-sidebar)' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--cor-primaria)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--cor-fundo-sidebar)'}
            >
              {/* Sombra interna simulando relevo da lombada do livro à esquerda */}
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-black/[0.15] dark:bg-black/[0.3] z-10 border-r border-black/[0.05]" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/[0.2] dark:from-black/[0.6] to-transparent z-0" />
              <span 
                className="text-[9px] uppercase font-black tracking-[0.35em] opacity-15 rotate-90 select-none z-0"
                style={{ color: 'var(--cor-texto-principal)' }}
              >
                LETRIFY
              </span>
            </div>

            {/* Metadados Dinâmicos baseados no Design Core */}
            <h4 className="text-xl font-black tracking-tight max-w-[200px] mx-auto line-clamp-2" style={{ color: 'var(--cor-texto-principal)' }}>
              {favorito.titulo}
            </h4>
            <p className="text-xs font-bold mt-1.5 opacity-80" style={{ color: 'var(--cor-primaria)' }}>
              {favorito.autor}
            </p>
          </div>
        ) : (
          <div className="text-center animate-fade-in flex flex-col items-center gap-4">
            
            {/* Placeholder Pontilhado Inteligente */}
            <div 
              className="w-36 h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center opacity-25 transition-all duration-300 group-hover:opacity-40"
              style={{ borderColor: 'var(--cor-texto-secundario)' }}
            >
              <BookOpenIcon className="w-7 h-7 stroke-[1.2] mb-1" style={{ color: 'var(--cor-texto-principal)' }} />
              <span className="text-[9px] uppercase font-black tracking-widest" style={{ color: 'var(--cor-texto-principal)' }}>Vazio</span>
            </div>
            
            <p className="text-xs font-medium opacity-40 italic" style={{ color: 'var(--cor-texto-principal)' }}>
              Nenhum favorito destacado.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}