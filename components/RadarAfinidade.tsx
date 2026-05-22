"use client";

import Link from "next/link";
import { UserIcon, MapPinIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export interface UsuarioMatch {
  id: string | number;
  nome: string;
  cidade: string;
  fotoPerfil: string | null;
}

interface RadarAfinidadeProps {
  usuario: UsuarioMatch;
}

export default function RadarAfinidade({ usuario }: RadarAfinidadeProps) {
  return (
    <div 
      className="p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-card-limpo group border-gray-300/30 dark:border-gray-800/50"
    >
      {/* FOTO DE PERFIL */}
      <div 
        className="w-24 h-24 rounded-full border-4 shadow-inner bg-cover bg-center overflow-hidden mb-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{ 
          borderColor: 'var(--cor-botao-primario)', 
          backgroundImage: usuario.fotoPerfil ? `url(${usuario.fotoPerfil})` : 'none',
          backgroundColor: 'var(--cor-fundo-sidebar)'
        }}
      >
        {!usuario.fotoPerfil && (
          <UserIcon className="w-10 h-10 opacity-40" style={{ color: 'var(--cor-texto-sidebar)' }} />
        )}
      </div>

      {/* DADOS DO USUÁRIO */}
      <h3 className="font-black text-lg line-clamp-1 w-full" style={{ color: 'var(--cor-texto-principal)' }} title={usuario.nome}>
        {usuario.nome}
      </h3>
      
      <p className="text-sm mt-1 font-medium mb-6 flex items-center justify-center gap-1" style={{ color: 'var(--cor-texto-secundario)' }}>
        <MapPinIcon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--cor-botao-primario)' }} />
        <span className="line-clamp-1">{usuario.cidade || "Localização oculta"}</span>
      </p>

      {/* BOTÃO DE AÇÃO */}
      <Link 
        href={`/perfil?id=${usuario.id}`}
        className="w-full py-2.5 rounded-lg font-bold text-sm transition-all duration-200 shadow flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98]"
        style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
      >
        <BookOpenIcon className="w-4 h-4" />
        Ver Perfil
      </Link>
    </div>
  );
}