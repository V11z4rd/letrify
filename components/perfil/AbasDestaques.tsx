"use client";

import { useState } from "react";

interface AbasDestaqueProps {
  perfil: {
    favorito: { titulo: string; autor: string } | null;
    topAutores: { nome: string; valor: number }[];
    topTemas: { nome: string; valor: number }[];
  };
}

export default function AbasDestaque({ perfil }: AbasDestaqueProps) {
  const [abaAtiva, setAbaAtiva] = useState<"livro" | "autores" | "temas">("livro");

  return (
    <section className="bg-zinc-900/40 rounded-2xl border border-white/5 p-6">
      <div className="flex gap-6 mb-6 border-b border-white/5">
        {["livro", "autores", "temas"].map((tab) => (
          <button
            key={tab}
            onClick={() => setAbaAtiva(tab as any)}
            className={`pb-2 text-sm font-bold capitalize transition-all ${
              abaAtiva === tab ? "border-b-2 border-blue-500 text-blue-500" : "opacity-50 hover:opacity-100"
            }`}
          >
            {tab === "livro" ? "Favorito" : tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center min-h-[300px]">
        {abaAtiva === "livro" && (
          perfil.favorito ? (
            <div className="text-center animate-fade-in">
              <div className="w-32 h-48 bg-zinc-800 rounded-lg shadow-2xl mb-4 mx-auto flex items-center justify-center border border-white/10">
                <span className="text-[10px] uppercase tracking-widest opacity-30">Capa</span>
              </div>
              <h4 className="text-xl font-bold">{perfil.favorito.titulo}</h4>
              <p className="text-sm opacity-50">{perfil.favorito.autor}</p>
            </div>
          ) : <p className="opacity-40 italic">Nenhum livro favorito selecionado.</p>
        )}

        {abaAtiva === "autores" && (
          <div className="w-full space-y-3 animate-fade-in">
            {perfil.topAutores?.map((aut, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors">
                <span className="font-medium">{aut.nome}</span>
                <span className="text-blue-400 font-mono font-bold">{aut.valor}</span>
              </div>
            )) || <p className="opacity-40 text-center">Dados de autores indisponíveis.</p>}
          </div>
        )}

        {abaAtiva === "temas" && (
          <div className="w-full grid grid-cols-2 gap-3 animate-fade-in">
            {perfil.topTemas?.map((tema, idx) => (
              <div key={idx} className="p-4 bg-zinc-800/50 rounded-xl text-center border border-white/5">
                <p className="text-lg font-black text-blue-500">{tema.valor}%</p>
                <p className="text-[10px] uppercase font-bold opacity-50">{tema.nome}</p>
              </div>
            )) || <p className="opacity-40 text-center col-span-2">Nenhum tema mapeado.</p>}
          </div>
        )}
      </div>
    </section>
  );
}