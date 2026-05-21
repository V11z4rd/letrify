import React from 'react';
import Sidebar from "../../components/Sidebar"; 
// 1. Importamos o Provider que criaremos no Contexto
import { NotificacoesProvider } from "../../context/NotificacoesContext"; 

export default function ComSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 2. Envolvemos a estrutura principal com o Provider das Notificações
    <NotificacoesProvider>
      <div className="flex min-h-screen" style={{ backgroundColor: 'var(--cor-fundo)' }}>
        {/* A nossa barra lateral fixa */}
        <Sidebar />

        {/* A página ativa (ex: Feed, Perfil, etc) */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </NotificacoesProvider>
  );
}