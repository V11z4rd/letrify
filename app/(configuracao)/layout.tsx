"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  UserIcon, 
  FireIcon,
  ShieldCheckIcon, 
  PaintBrushIcon, 
  BellIcon, 
  QuestionMarkCircleIcon,
  ArrowLeftIcon 
} from "@heroicons/react/24/outline";

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const linksNavegacao = [
    { href: "/conta", rotulo: "Conta", icone: UserIcon },
    { href: "/metas", rotulo: "Metas", icone: FireIcon },
    { href: "/privacidade", rotulo: "Privacidade", icone: ShieldCheckIcon },
    { href: "/personalizacao", rotulo: "Personalização", icone: PaintBrushIcon },
    { href: "/notificacoes", rotulo: "Notificações", icone: BellIcon },
    { href: "/ajuda", rotulo: "Ajuda", icone: QuestionMarkCircleIcon },
  ];

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden" style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)' }}>
      
      {/* BARRA LATERAL (Sidebar no Desktop / Topbar no Mobile) */}
      <aside 
        className="w-full md:w-64 border-b md:border-b-0 md:border-r p-3 md:p-6 flex flex-col shrink-0 sticky top-0 z-10"
        style={{ borderColor: 'var(--cor-fundo-sidebar)', backgroundColor: 'var(--cor-fundo-card)' }}
      >
        {/* HEADER: Botão de voltar fixo para o perfil e Título */}
        <div className="flex items-center gap-3 mb-3 md:mb-6">
          <Link 
            href="/perfil"
            className="p-2 md:hidden rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
            style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
            aria-label="Voltar ao Perfil"
          >
            <ArrowLeftIcon className="w-5 h-5 stroke-[2.5]" />
          </Link>
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight" style={{ color: 'var(--cor-primaria)' }}>
            Configurações
          </h2>
        </div>

        {/* MENU DE NAVEGAÇÃO: Sistema de Pílulas */}
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 hide-scrollbar flex-1 items-center md:items-stretch">
          {linksNavegacao.map((link) => {
            const Icone = link.icone;
            const ativo = pathname === link.href;

            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`flex items-center justify-center md:justify-start gap-2.5 p-3 md:px-3 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 ${
                  ativo 
                    ? 'bg-[var(--cor-primaria)]/[0.1] text-[var(--cor-primaria)] shadow-inner px-5 md:scale-[1.02]' 
                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03] opacity-60 hover:opacity-100'
                }`}
              >
                <Icone className="w-5 h-5 md:w-4 md:h-4 stroke-[2.5] shrink-0"/>
                <span className={`${ativo ? 'block' : 'hidden'} md:block whitespace-nowrap`}>
                  {link.rotulo}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* BOTÃO DE VOLTAR - Rodapé (Apenas Desktop) */}
        <div className="hidden md:block mt-auto pt-4 border-t border-dashed" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <Link 
            href="/perfil"
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-transparent hover:border-[var(--cor-fundo-sidebar)] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-black uppercase tracking-wider opacity-60 hover:opacity-100 active:scale-95"
            style={{ color: 'var(--cor-texto-principal)' }}
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 stroke-[3]" />
            <span>Voltar ao Perfil</span>
          </Link>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO DINÂMICO */}
      <main className="flex-1 overflow-y-auto h-full px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}