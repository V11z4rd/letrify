"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

export interface UsuarioMatch {
  id: string;
  nome: string;
  cidade: string;
  fotoPerfil: string;
  autoresFavoritos: string[];
  temasFavoritos: string[];
  graficoAutores: any[];
  graficoTemas: any[];
}

export default function RadarAfinidade({ usuario }: { usuario: UsuarioMatch }) {
  const [abaAtiva, setAbaAtiva] = useState<"autores" | "temas" | null>(null);

  const dadosGrafico = abaAtiva === "autores" ? usuario.graficoAutores : usuario.graficoTemas;

  return (
    <div 
      className="rounded-2xl border flex flex-col transition-all hover:shadow-xl bg-card-limpo overflow-hidden h-full group relative z-10"
      style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* 1. INFO PRINCIPAL */}
      <div className="p-6 flex flex-col items-center text-center">
        <div 
          className="w-20 h-20 rounded-2xl border-2 shadow-md bg-cover bg-center overflow-hidden mb-4 transition-transform group-hover:scale-105"
          style={{ 
            borderColor: 'var(--cor-primaria)', 
            backgroundImage: usuario.fotoPerfil ? `url(${usuario.fotoPerfil})` : 'none',
            backgroundColor: 'var(--cor-fundo-sidebar)'
          }}
        >
          {!usuario.fotoPerfil && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl opacity-50">👤</span>
            </div>
          )}
        </div>

        <h3 className="font-black text-base line-clamp-1 w-full" style={{ color: 'var(--cor-texto-principal)' }}>
          {usuario.nome}
        </h3>
        
        <p className="text-[10px] mt-1 font-bold opacity-60 uppercase tracking-tighter" style={{ color: 'var(--cor-texto-secundario)' }}>
          📍 {usuario.cidade || "Localização oculta"}
        </p>
      </div>

      {/* 2. ÁREA EXPANSÍVEL (GRÁFICO) */}
      <div 
        className={`px-4 transition-all duration-500 ease-in-out ${abaAtiva ? 'max-h-[500px] pb-4 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        {/* Renderização condicional para evitar erro de width/height do Recharts */}
        {abaAtiva && (
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-[var(--cor-fundo-sidebar)]">
            <p className="text-[9px] font-black uppercase opacity-50 mb-2 tracking-widest text-center">
              {abaAtiva === "autores" ? "📚 Afinidade de Autores" : "🏷️ Afinidade de Temas"}
            </p>
            
            <div className="h-40 w-full" style={{ minWidth: '100px', minHeight: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dadosGrafico}>
                  <PolarGrid stroke="var(--cor-texto-secundario)" opacity={0.2} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'var(--cor-texto-principal)', fontSize: 9, fontWeight: 'bold' }} 
                  />
                  <Radar
                    dataKey="value"
                    stroke="var(--cor-primaria)"
                    fill="var(--cor-primaria)"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5">
              <ul className="space-y-1">
                {(abaAtiva === "autores" ? usuario.autoresFavoritos : usuario.temasFavoritos).slice(0, 3).map((item, i) => (
                  <li key={i} className="text-[10px] flex items-center gap-2 truncate" style={{ color: 'var(--cor-texto-principal)' }}>
                    <span className="w-1 h-1 rounded-full bg-[var(--cor-destaque)] shrink-0"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 3. AÇÕES (BOTÕES) */}
      <div className="mt-auto border-t relative z-20" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <Link 
          href={`/perfil?id=${usuario.id}`}
          className="w-full py-3 font-bold text-[11px] uppercase transition-colors flex items-center justify-center gap-2 hover:brightness-110"
          style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
        >
          📖 Ver Perfil Completo
        </Link>

        <div className="grid grid-cols-2 border-t" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setAbaAtiva(abaAtiva === "autores" ? null : "autores");
            }}
            className="py-3 text-[9px] font-black uppercase transition-all cursor-pointer relative z-30"
            style={{ 
              backgroundColor: abaAtiva === "autores" ? 'var(--cor-fundo-sidebar)' : 'transparent',
              color: abaAtiva === "autores" ? 'var(--cor-texto-sidebar)' : 'var(--cor-texto-principal)'
            }}
          >
            ✍️ Autores
          </button>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setAbaAtiva(abaAtiva === "temas" ? null : "temas");
            }}
            className="py-3 text-[9px] font-black uppercase border-l transition-all cursor-pointer relative z-30"
            style={{ 
              borderColor: 'var(--cor-fundo-sidebar)',
              backgroundColor: abaAtiva === "temas" ? 'var(--cor-fundo-sidebar)' : 'transparent',
              color: abaAtiva === "temas" ? 'var(--cor-texto-sidebar)' : 'var(--cor-texto-principal)'
            }}
          >
            🎭 Temas
          </button>
        </div>
      </div>
    </div>
  );
}