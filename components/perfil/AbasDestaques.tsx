"use client";

import { useState } from "react";
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, ResponsiveContainer 
} from "recharts";

interface AbasDestaqueProps {
  perfil: {
    favorito: { titulo: string; autor: string } | null;
    topAutores: { nome: string; valor: number }[];
    topTemas: { nome: string; valor: number }[];
  };
}

export default function AbasDestaque({ perfil }: AbasDestaqueProps) {
  const [abaAtiva, setAbaAtiva] = useState<"livro" | "autores" | "temas">("livro");

  // Função para renderizar a visualização de dados (Gráfico ou Lista)
  const renderizarDados = (dados: { nome: string; valor: number }[], tipo: string) => {
    if (!dados || dados.length === 0) {
      return <p className="opacity-40 italic">Nenhum dado de {tipo} para exibir.</p>;
    }

    // Se tiver 3 ou mais, mostra o Radar Chart (A Teia)
    if (dados.length >= 3) {
      return (
        <div className="w-full h-[300px] animate-fade-in">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dados}>
              <PolarGrid stroke="#3f3f46" /> {/* Cor zinc-700 */}
              <PolarAngleAxis 
                dataKey="nome" 
                tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: "bold" }} 
              />
              <Radar
                name={tipo}
                dataKey="valor"
                stroke="#3b82f6"      // Azul Letrify
                fill="#3b82f6"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Se tiver menos de 3, mostra a lista clássica
    return (
      <div className="w-full space-y-3 animate-fade-in">
        {dados.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
            <span className="font-bold text-sm text-zinc-300">{item.nome}</span>
            <span className="text-blue-500 font-black">{item.valor}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="bg-zinc-900/40 rounded-2xl border border-white/5 p-6 shadow-xl">
      {/* SELETOR DE ABAS */}
      <div className="flex gap-6 mb-8 border-b border-white/5">
        {["livro", "autores", "temas"].map((tab) => (
          <button
            key={tab}
            onClick={() => setAbaAtiva(tab as any)}
            className={`pb-3 text-xs uppercase tracking-widest font-black transition-all ${
              abaAtiva === tab ? "border-b-2 border-blue-500 text-blue-500" : "opacity-40 hover:opacity-100"
            }`}
          >
            {tab === "livro" ? "🏆 Favorito" : tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center min-h-[320px]">
        {/* ABA LIVRO FAVORITO */}
        {abaAtiva === "livro" && (
          perfil.favorito ? (
            <div className="text-center animate-fade-in group">
              <div className="w-36 h-52 bg-zinc-800 rounded-2xl shadow-2xl mb-6 mx-auto flex items-center justify-center border-2 border-white/5 group-hover:border-blue-500/30 transition-all overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-20 rotate-90">LETRIFY</span>
              </div>
              <h4 className="text-2xl font-black tracking-tight text-zinc-100">{perfil.favorito.titulo}</h4>
              <p className="text-sm font-bold text-blue-500 opacity-80 mt-1">{perfil.favorito.autor}</p>
            </div>
          ) : <p className="opacity-40 italic">Nenhum livro favorito selecionado.</p>
        )}

        {/* ABA AUTORES */}
        {abaAtiva === "autores" && renderizarDados(perfil.topAutores, "Autores")}

        {/* ABA TEMAS */}
        {abaAtiva === "temas" && renderizarDados(perfil.topTemas, "Temas")}
      </div>
    </section>
  );
}