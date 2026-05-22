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
  SparklesIcon as SparklesOutline // Importado para o Premium
} from '@heroicons/react/24/outline';

import { 
  HomeIcon as HomeSolid, 
  UserGroupIcon as GroupSolid, 
  HeartIcon as HeartSolid, 
  MagnifyingGlassIcon as SearchSolid, 
  BookOpenIcon as BookSolid, 
  UserIcon as UserSolid, 
  Cog6ToothIcon as CogSolid,
  SparklesIcon as SparklesSolid // Importado para o Premium
} from '@heroicons/react/24/solid';

export default function Sidebar() {
  const pathname = usePathname();

  // Função auxiliar para renderizar o ícone correto com base no estado ativo da rota
  const renderIcon = (route: string, SolidIcon: any, OutlineIcon: any, exact = true) => {
    const isActive = exact ? pathname === route : pathname.startsWith(route);
    
    // Se estiver ativo, aplica a cor de destaque do tema. Se não, herda a cor padrão da sidebar.
    return isActive ? (
      <SolidIcon className="h-7 w-7 transition-transform duration-200" style={{ color: 'var(--cor-destaque)' }} />
    ) : (
      <OutlineIcon className="h-7 w-7 transition-all duration-200 group-hover:opacity-80 group-hover:-translate-y-0.5" />
    );
  };

  return (
    <aside 
      className="w-24 border-r border-gray-300 dark:border-gray-800 sticky top-0 self-start flex flex-col items-center py-8 min-h-screen justify-between transition-colors duration-300" 
      style={{ 
        backgroundColor: 'var(--cor-fundo-sidebar)', 
        color: 'var(--cor-texto-sidebar)' 
      }}
    >
      
      {/* TOPO: Logo Letrify */}
      <Link 
        href="/feed" 
        className="font-bold text-lg text-center hover:scale-105 transition-transform tracking-tight select-none"
        style={{ color: 'var(--cor-texto-sidebar)' }}
      >
        Letrify
      </Link>
      
      {/* MEIO: Navegação Principal */}
      <nav className="flex flex-col gap-8 items-center">
        
        <Link href="/feed" title="Meu Feed" className="group">
          {renderIcon('/feed', HomeSolid, HomeOutline)}
        </Link>
        
        <Link href="/grupos" title="Comunidade" className="group">
          {renderIcon('/grupos', GroupSolid, GroupOutline, false)}
        </Link>
        
        <Link href="/match" title="Match" className="group">
          {renderIcon('/match', HeartSolid, HeartOutline)}
        </Link>
        
        <Link href="/busca" title="Buscar Livros" className="group">
          {renderIcon('/busca', SearchSolid, SearchOutline)}
        </Link>
        
        <Link href="/estante" title="Estante" className="group">
          {renderIcon('/estante', BookSolid, BookOutline)}
        </Link>
        
        {/* Ícone do Letrify Pro / Premium */}
        <Link href="/Premium" title="Seja Premium" className="group">
          {renderIcon('/premium', SparklesSolid, SparklesOutline)}
        </Link>
        
        {/* Componente customizado de Notificações */}
        <NotificacaoIcone />

        <Link href="/perfil" title="Meu Perfil" className="group">
          {renderIcon('/perfil', UserSolid, UserOutline)}
        </Link>
        
      </nav>

      {/* FINAL: Configurações */}
      <Link 
        href="/conta" 
        title="Configurações" 
        className="group transition-transform duration-300 hover:rotate-45"
      >
        {pathname === '/conta' ? (
          <CogSolid className="h-7 w-7" style={{ color: 'var(--cor-destaque)' }} />
        ) : (
          <CogOutline className="h-7 w-7 transition-opacity group-hover:opacity-80" />
        )}
      </Link>

    </aside>
  );
}