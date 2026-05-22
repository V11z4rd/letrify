"use client";

import { BellIcon, BellAlertIcon } from "@heroicons/react/24/outline";

export default function NotificacoesPage() {
  return (
    <div className="max-w-4xl mx-auto pt-6 px-4 pb-24 animate-fade-in">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div className="mb-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border" 
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <BellIcon className="w-6 h-6 stroke-[2.5]" style={{ color: 'var(--cor-primaria)' }} />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--cor-texto-principal)' }}>
          Notificações
        </h1>
        <p className="text-xs sm:text-sm font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
          Fique por dentro de novas interações, resenhas e atualizações da sua rede literária.
        </p>
      </div>

      {/* ESTADO VAZIO (NOTIFICAÇÕES SILENCIADAS) */}
      <div 
        className="text-center py-20 border-2 border-dashed rounded-3xl max-w-xl mx-auto p-6 flex flex-col items-center transition-all duration-300 hover:border-[var(--cor-fundo-sidebar)]" 
        style={{ borderColor: 'var(--cor-fundo-sidebar)', backgroundColor: 'var(--cor-fundo-card)' }}
      >
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border" 
          style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          {/* Opacidade aplicada cirurgicamente apenas no ícone */}
          <BellAlertIcon className="w-7 h-7 opacity-20" style={{ color: 'var(--cor-texto-principal)' }} />
        </div>
        
        <p className="font-black text-lg tracking-tight mb-1" style={{ color: 'var(--cor-texto-principal)' }}>
          Tudo silêncio por aqui
        </p>
        <p className="text-xs font-medium opacity-50 max-w-xs" style={{ color: 'var(--cor-texto-secundario)' }}>
          Você não tem novas notificações no momento. Avisaremos assim que algo acontecer.
        </p>
      </div>

    </div>
  );
}