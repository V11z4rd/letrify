import React from 'react';
import Sidebar from "../../components/Sidebar"; 
import { NotificacoesProvider } from "../../context/NotificacoesContext"; 

export default function ComSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificacoesProvider>
      <div 
        className="flex flex-col md:flex-row h-screen w-screen overflow-hidden select-none" 
        style={{ backgroundColor: 'var(--cor-fundo-app, var(--cor-fundo))' }}
      >
        {/* Barra lateral - Adapta-se automaticamente entre base inferior mobile ou lateral desktop */}
        <Sidebar />

        {/* Área de conteúdo principal dinâmica e isolada para rolagem */}
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-8 pt-20 pb-24 md:py-8 transition-all duration-300"
          style={{ color: 'var(--cor-texto-principal)' }}
        >
          {/* Container de largura máxima para o conteúdo não esticar excessivamente em monitores UltraWide */}
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </NotificacoesProvider>
  );
}