"use client";

import Link from "next/link";
import { UserCircleIcon, MapPinIcon } from "@heroicons/react/24/outline";

export interface PerfilDados {
  id: string;
  nome: string;
  cidade?: string;
  idade?: string | number;
  fotoPerfil?: string;
  descricao?: string;
}

interface CardPerfilProps {
  perfil: PerfilDados;
}

export default function CardPerfil({ perfil }: CardPerfilProps) {
  return (
    <Link
      href={`/perfil?id=${perfil.id}`} 
      className="min-w-[170px] max-w-[200px] snap-start shrink-0 p-4 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-lg group"
      style={{ 
        backgroundColor: 'var(--cor-fundo-card)', 
        borderColor: 'var(--cor-fundo-sidebar)' 
      }}
    >
      {/* Container do Avatar */}
      <div 
        className="w-14 h-14 rounded-full mb-3 flex items-center justify-center border-2 overflow-hidden shadow-sm transition-transform group-hover:scale-105" 
        style={{ 
          backgroundColor: 'var(--cor-fundo-app)', 
          borderColor: 'var(--cor-fundo-sidebar)' 
        }}
      >
        {perfil.fotoPerfil ? (
          <img 
            src={perfil.fotoPerfil} 
            alt={perfil.nome} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <UserCircleIcon className="w-8 h-8 opacity-30" style={{ color: 'var(--cor-texto-principal)' }} />
        )}
      </div>

      {/* Informações Resumidas */}
      <span 
        className="font-black text-xs mb-1 line-clamp-1 transition-colors group-hover:text-[var(--cor-destaque)]" 
        style={{ color: 'var(--cor-texto-principal)' }}
      >
        {perfil.nome}
      </span>

      {perfil.cidade ? (
        <div className="flex items-center justify-center gap-0.5 opacity-50 max-w-full">
          <MapPinIcon className="w-3 h-3 shrink-0" style={{ color: 'var(--cor-texto-secundario)' }} />
          <span className="text-[10px] font-bold truncate" style={{ color: 'var(--cor-texto-secundario)' }}>
            {perfil.cidade}
          </span>
        </div>
      ) : (
        <span className="text-[10px] font-bold opacity-30" style={{ color: 'var(--cor-texto-secundario)' }}>
          Leitor Letrify
        </span>
      )}

      {/* Mini Descrição Autoral */}
      {perfil.descricao && (
        <p className="text-[10px] font-medium opacity-40 line-clamp-1 mt-2 px-1" style={{ color: 'var(--cor-texto-secundario)' }}>
          {perfil.descricao}
        </p>
      )}
    </Link>
  );
}