"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificacaoIcone from './ui/NotificacaoIcone'; 

import { 
  HomeIcon as HomeOutline, 
  UserGroupIcon as GroupOutline, 
  HeartIcon as HeartOutline, 
  MagnifyingGlassIcon as SearchOutline, 
  BookOpenIcon as BookOutline, 
  UserIcon as UserOutline, 
  Cog6ToothIcon as CogOutline,
  SparklesIcon as SparklesOutline
} from '@heroicons/react/24/outline';

import { 
  HomeIcon as HomeSolid, 
  UserGroupIcon as GroupSolid, 
  HeartIcon as HeartSolid, 
  MagnifyingGlassIcon as SearchSolid, 
  BookOpenIcon as BookSolid, 
  UserIcon as UserSolid, 
  Cog6ToothIcon as CogSolid,
  SparklesIcon as SparklesSolid 
} from '@heroicons/react/24/solid';

export default function Sidebar() {
  const pathname = usePathname();

  // Ajustado para redimensionar os ícones de acordo com a tela
  const renderIcon = (route: string, SolidIcon: any, OutlineIcon: any, exact = true) => {
    const isActive = exact ? pathname === route : pathname.startsWith(route);
    
    return isActive ? (
      <SolidIcon className="h-6 w-6 md:h-7 md:w-7 transition-transform duration-200" style={{ color: 'var(--cor-destaque)' }} />
    ) : (
      <OutlineIcon className="h-6 w-6 md:h-7 md:w-7 transition-all duration-200 md:group-hover:opacity-80 md:group-hover:-translate-y-0.5" />
    );
  };

  return (
    <>
      {/* ========================================== */}
      {/* SIDEBAR DESKTOP (Invisível no Mobile)      */}
      {/* ========================================== */}
      <aside 
        className="hidden md:flex w-24 border-r border-gray-300 dark:border-gray-800 sticky top-0 self-start flex-col items-center py-8 min-h-screen justify-between transition-colors duration-300 z-50" 
        style={{ 
          backgroundColor: 'var(--cor-fundo-sidebar)', 
          color: 'var(--cor-texto-sidebar)' 
        }}
      >
        <Link href="/feed" className="font-bold text-lg text-center hover:scale-105 transition-transform tracking-tight select-none">
          Letrify
        </Link>
        
        <nav className="flex flex-col gap-8 items-center">
          <Link href="/feed" title="Meu Feed" className="group">{renderIcon('/feed', HomeSolid, HomeOutline)}</Link>
          <Link href="/grupos" title="Comunidade" className="group">{renderIcon('/grupos', GroupSolid, GroupOutline, false)}</Link>
          <Link href="/match" title="Match" className="group">{renderIcon('/match', HeartSolid, HeartOutline)}</Link>
          <Link href="/busca" title="Buscar Livros" className="group">{renderIcon('/busca', SearchSolid, SearchOutline)}</Link>
          <Link href="/estante" title="Estante" className="group">{renderIcon('/estante', BookSolid, BookOutline)}</Link>
          <Link href="/Premium" title="Seja Premium" className="group">{renderIcon('/Premium', SparklesSolid, SparklesOutline)}</Link>
          <NotificacaoIcone />
          <Link href="/perfil" title="Meu Perfil" className="group">{renderIcon('/perfil', UserSolid, UserOutline)}</Link>
        </nav>

        <Link href="/conta" title="Configurações" className="group transition-transform duration-300 hover:rotate-45">
          {pathname === '/conta' ? (
            <CogSolid className="h-7 w-7" style={{ color: 'var(--cor-destaque)' }} />
          ) : (
            <CogOutline className="h-7 w-7 transition-opacity group-hover:opacity-80" />
          )}
        </Link>
      </aside>

      {/* ========================================== */}
      {/* NAVBAR SUPERIOR MOBILE (Invisível no Desktop) */}
      {/* ========================================== */}
      <header 
        className="md:hidden fixed top-0 left-0 right-0 h-14 border-b flex items-center justify-between px-4 z-50 shadow-sm transition-colors"
        style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-sidebar)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <Link href="/feed" className="font-black text-lg tracking-tight select-none">
          Letrify
        </Link>

        <div className="flex items-center gap-4">
          <NotificacaoIcone />
          <Link href="/conta" title="Configurações" className="p-1 active:scale-95 transition-transform">
            {renderIcon('/conta', CogSolid, CogOutline)}
          </Link>
        </div>
      </header>

      {/* ========================================== */}
      {/* NAVBAR INFERIOR MOBILE (Invisível no Desktop) */}
      {/* ========================================== */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transition-colors"
        style={{ backgroundColor: 'var(--cor-fundo-sidebar)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <Link href="/feed" className="p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          {renderIcon('/feed', HomeSolid, HomeOutline)}
        </Link>
        <Link href="/grupos" className="p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          {renderIcon('/grupos', GroupSolid, GroupOutline, false)}
        </Link>
        <Link href="/busca" className="p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          {renderIcon('/busca', SearchSolid, SearchOutline)}
        </Link>
        <Link href="/match" className="p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          {renderIcon('/match', HeartSolid, HeartOutline)}
        </Link>
        <Link href="/perfil" className="p-2 flex flex-col items-center gap-1 active:scale-95 transition-transform">
          {renderIcon('/perfil', UserSolid, UserOutline)}
        </Link>
      </nav>
    </>
  );
}