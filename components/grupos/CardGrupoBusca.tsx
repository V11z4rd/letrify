"use client";

import Link from "next/link";
import { GrupoResumo } from "@/app/lib/grupoService";

interface CardProps {
  grupo: GrupoResumo;
}

export default function CardGrupoBusca({ grupo }: CardProps) {
  const isAberto = grupo.status === "Aberto";

  const totalLeitores = grupo.totalMembros ?? 0;

  return (
    <Link 
      href={`/grupos/${grupo.id}`}
      className="group flex flex-col bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-900/10"
    >
      {/* CAPA DO GRUPO */}
      <div className="h-32 w-full bg-zinc-800 relative overflow-hidden">
        {grupo.fotoCapa ? (
          <img 
            src={grupo.fotoCapa} 
            alt={`Capa do clube ${grupo.nome}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-4xl opacity-20">📚</span>
          </div>
        )}
        
        {/* BADGE DE STATUS */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-md ${isAberto ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
            {isAberto ? '🔓 Aberto' : '🔒 Fechado'}
          </span>
        </div>
      </div>

      {/* INFO DO GRUPO */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-lg text-zinc-100 tracking-tight mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
            {grupo.nome}
          </h3>
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
            {grupo.descricao || "Nenhuma descrição fornecida para este clube."}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            👥 {totalLeitores} {totalLeitores === 1 ? 'leitor' : 'leitores'}
          </span>
          <span className="text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Acessar <span className="text-lg leading-none">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}