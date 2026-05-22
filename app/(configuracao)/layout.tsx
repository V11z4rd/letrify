"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  UserIcon, 
  ShieldCheckIcon, 
  PaintBrushIcon, 
  BellIcon, 
  QuestionMarkCircleIcon,
  ArrowLeftIcon 
} from "@heroicons/react/24/outline";

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Função auxiliar para marcar o link visualmente ativo no painel
  const verificarAtivo = (href: string) => pathname.endsWith(href);

  const linksNavegacao = [
    { href: "/conta", rotulo: "Conta", icone: UserIcon },
    { href: "/privacidade", rotulo: "Privacidade", icone: ShieldCheckIcon },
    { href: "/personalizacao", rotulo: "Personalização", icone: PaintBrushIcon },
    { href: "/notificacoes", rotulo: "Notificações", icone: BellIcon },
    { href: "/ajuda", rotulo: "Ajuda", icone: QuestionMarkCircleIcon },
  ];

  return (
    // Removido o h-screen rígido no mobile para evitar quebras de scroll corporal
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden" style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)' }}>
      
      {/* BARRA LATERAL (Sidebar no Desktop / Topbar no Mobile) */}
      <aside 
        className="w-full md:w-64 border-b md:border-b-0 md:border-r p-4 md:p-6 flex flex-col shrink-0"
        style={{ borderColor: 'var(--cor-fundo-sidebar)', backgroundColor: 'var(--cor-fundo-card)' }}
      >
        <h2 className="text-xl md:text-2xl font-black tracking-tight mb-4 md:mb-6 hidden md:block" style={{ color: 'var(--cor-primaria)' }}>
          Configurações
        </h2>

        {/* Menu de navegação horizontal no mobile e vertical no desktop com scroll invisível se faltar espaço */}
        <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 hide-scrollbar flex-1">
          {linksNavegacao.map((link) => {
            const Icone = link.icone;
            const ativo = pathname === link.href;

            return (
              <Link 
                key={link.href}
                href={link.href}// Garanta o prefixo correto da sua pasta de rotas
                className={`flex items-center gap-2.5 p-3 px-4 md:px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 ${
                  ativo 
                    // Ativo: Fundo primário com opacidade (0.1) e texto/ícone primário cheio
                    ? 'bg-[var(--cor-primaria)]/[0.1] text-[var(--cor-primaria)] shadow-inner scale-[1.01]' 
                    // Não Ativo: Opacidade reduzida no texto/ícone principal
                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03] opacity-60 hover:opacity-100'
                }`}
              >
                <Icone className="w-4 h-4 stroke-[2.5]"/>
                <span>{link.rotulo}</span>
              </Link>
            );
          })}
        </nav>

        {/* BOTÃO DE VOLTAR - Fica no rodapé no desktop e some no mobile (ou se mantém discreto) */}
        <div className="hidden md:block mt-auto pt-4 border-t border-dashed" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <Link 
            href="/perfil" 
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-transparent hover:border-[var(--cor-fundo-sidebar)] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-black uppercase tracking-wider opacity-60 hover:opacity-100"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 stroke-[3]" />
            <span>Voltar ao Perfil</span>
          </Link>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO DINÂMICO (Faz scroll independente apenas no desktop) */}
      <main className="flex-1 overflow-y-auto h-full px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}