"use client";

import { useState } from "react";

interface EditarLivroFavoritoProps {
  perfilInicial: {
    favorito: { titulo: string; autor: string } | null;
  };
}

export default function EditarLivroFavorito({ perfilInicial }: EditarLivroFavoritoProps) {
  // Estado simulado para controlar se o livro está ativo ou não
  const [favorito, setFavorito] = useState<{ titulo: string; autor: string } | null>(
    perfilInicial.favorito
  );

  // Mock de um livro para quando o usuário clicar em "adicionar"
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
    <section className="bg-zinc-900/40 rounded-2xl border border-white/5 p-6 shadow-xl">
      {/* CABEÇALHO IMITANDO A ESTRUTURA DE ABAS */}
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-3">
        <div className="text-xs uppercase tracking-widest font-black text-blue-500 border-b-2 border-blue-500 pb-3 -mb-[14px]">
          🏆 Livro Favorito
        </div>
        
        {/* Botão de alternância estilizado como texto interativo */}
        <button
          onClick={alternarFavorito}
          className="text-[10px] uppercase tracking-widest font-black opacity-50 hover:opacity-100 hover:text-blue-400 transition-all cursor-pointer"
        >
          {favorito ? "[ remover livro ]" : "[ adicionar livro ]"}
        </button>
      </div>

      {/* ÁREA DO CONTEÚDO (Mantendo a mesma altura mínima do perfil) */}
      <div className="flex flex-col items-center justify-center min-h-[320px]">
        {favorito ? (
          <div className="text-center animate-fade-in group">
            {/* O Retângulo/Capa idêntico ao do perfil */}
            <div className="w-36 h-52 bg-zinc-800 rounded-2xl shadow-2xl mb-6 mx-auto flex items-center justify-center border-2 border-white/5 group-hover:border-blue-500/30 transition-all overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-20 rotate-90">LETRIFY</span>
            </div>
            <h4 className="text-2xl font-black tracking-tight text-zinc-100">{favorito.titulo}</h4>
            <p className="text-sm font-bold text-blue-500 opacity-80 mt-1">{favorito.autor}</p>
          </div>
        ) : (
          <div className="text-center animate-fade-in space-y-4">
            {/* Placeholder pontilhado para quando estiver vazio, combinando com o design */}
            <div className="w-36 h-52 rounded-2xl border-2 border-dashed border-white/10 mx-auto flex items-center justify-center opacity-40">
              <span className="text-[10px] uppercase font-black tracking-widest">Vazio</span>
            </div>
            <p className="opacity-40 italic text-sm">Nenhum livro favorito selecionado.</p>
          </div>
        )}
      </div>
    </section>
  );
}