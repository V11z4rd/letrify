"use client";
import Link from "next/link";
import { 
  BookmarkIcon, 
  UserGroupIcon, 
  Square3Stack3DIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

interface ResumoLateralProps {
  estante: { lidos: number; lendo: number; queroLer: number } | null;
  totalGrupos: number;
  totalGuias: number;
  userIdParaLink?: string | null;
  isEditando?: boolean;
  isDonoDoPerfil?: boolean; // 👈 Adicionado para controlar o roteamento
}

export default function ResumoLateral({ 
  estante, 
  totalGrupos, 
  totalGuias, 
  userIdParaLink, 
  isEditando = false,
  isDonoDoPerfil = false // 👈 Valor padrão seguro
}: ResumoLateralProps) {
  
  const containerStyle = isEditando
    ? "p-5 rounded-2xl border opacity-50 pointer-events-none select-none transition-opacity" 
    : "p-5 rounded-2xl border transition-all duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]";

  const itemStyle = isEditando
    ? "flex justify-between items-center py-0.5 text-xs font-bold"
    : "flex justify-between items-center py-0.5 text-xs font-bold transition-all duration-200 opacity-80 hover:opacity-100 hover:translate-x-0.5";
  
  const montarLinkEstante = (filtro?: string) => {
    let baseUrl = "/estante";
    const params = new URLSearchParams();
    
    if (userIdParaLink) params.append("id", userIdParaLink);
    if (filtro) params.append("filtro", filtro);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  // 👇 LÓGICA DE ROTEAMENTO CONDICIONAL DOS GRUPOS 👇
  const linkDestinoGrupos = isDonoDoPerfil 
    ? "/grupos" // Se sou eu, vou para o hub central
    : (userIdParaLink ? `/membros-clubes?id=${userIdParaLink}` : "/grupos"); // Se é visitante, vai para a lista específica do usuário

  return (
    <div className="flex flex-col gap-3.5">
      
      {/* CAIXA 1: ESTANTE */}
      {estante && (
        <div 
          className={containerStyle}
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          {/* 👇 CABEÇALHO CLICÁVEL DA ESTANTE 👇 */}
          {isEditando ? (
            <div className="flex items-center justify-between mb-4 border-b pb-2" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
              <h3 className="font-bold text-[10px] uppercase tracking-wider" style={{ color: 'var(--cor-primaria)' }}>
                Estante
              </h3>
              <BookmarkIcon className="w-4 h-4 opacity-40" style={{ color: 'var(--cor-texto-principal)' }} />
            </div>
          ) : (
            <Link 
              href={montarLinkEstante()} 
              className="flex items-center justify-between mb-4 border-b pb-2 group transition-all"
              style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
            >
              <h3 className="font-bold text-[10px] uppercase tracking-wider transition-colors group-hover:text-[var(--cor-primaria)]" style={{ color: 'var(--cor-texto-principal)' }}>
                Estante
              </h3>
              <BookmarkIcon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
            </Link>
          )}

          <div className="flex flex-col gap-2.5">
            {[
              { label: "Lendo", valor: estante.lendo, filtro: "Lendo" },
              { label: "Lidos", valor: estante.lidos, filtro: "Lido" },
              { label: "Quero Ler", valor: estante.queroLer, filtro: "Quero Ler" }
            ].map((item, idx) => (
              isEditando ? (
                <div key={idx} className={itemStyle}>
                  <span style={{ color: 'var(--cor-texto-secundario)' }}>{item.label}</span>
                  <span style={{ color: 'var(--cor-texto-principal)' }}>{item.valor}</span>
                </div>
              ) : (
                <Link key={idx} href={montarLinkEstante(item.filtro)} className={itemStyle}>
                  <span style={{ color: 'var(--cor-texto-secundario)' }}>{item.label}</span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--cor-texto-principal)' }}>
                    {item.valor}
                    <ChevronRightIcon className="w-3 h-3 opacity-30 stroke-[2.5]" />
                  </span>
                </Link>
              )
            ))}
          </div>
        </div>
      )}

      {/* CAIXA 2: GRUPOS */}
      {isEditando ? (
        <div 
          className="p-5 rounded-2xl border flex items-center justify-between opacity-50 select-none"
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <div className="flex items-center gap-2.5">
            <UserGroupIcon className="w-4 h-4 opacity-50" style={{ color: 'var(--cor-texto-principal)' }} />
            <span className="font-bold text-xs" style={{ color: 'var(--cor-texto-principal)' }}>Grupos</span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-secundario)' }}>
            {totalGrupos}
          </span>
        </div>
      ) : (
        // 👇 LINK DINÂMICO PARA GRUPOS 👇
        <Link 
          href={linkDestinoGrupos}
          className="p-5 rounded-2xl border flex items-center justify-between transition-all duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] group"
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <div className="flex items-center gap-2.5">
            <UserGroupIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
            <span className="font-bold text-xs transition-colors" style={{ color: 'var(--cor-texto-principal)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cor-primaria)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cor-texto-principal)'}>
              Grupos
            </span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-secundario)' }}>
            {totalGrupos}
          </span>
        </Link>
      )}

      {/* CAIXA 3: GUIAS */}
      {isEditando ? (
        <div 
          className="p-5 rounded-2xl border flex items-center justify-between opacity-50 select-none"
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <div className="flex items-center gap-2.5">
            <Square3Stack3DIcon className="w-4 h-4 opacity-50" style={{ color: 'var(--cor-texto-principal)' }} />
            <span className="font-bold text-xs" style={{ color: 'var(--cor-texto-principal)' }}>Guias Salvos</span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-secundario)' }}>
            {totalGuias}
          </span>
        </div>
      ) : (
        <Link 
          href="/guias"
          className="p-5 rounded-2xl border flex items-center justify-between transition-all duration-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] group"
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <div className="flex items-center gap-2.5">
            <Square3Stack3DIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
            <span className="font-bold text-xs transition-colors" style={{ color: 'var(--cor-texto-principal)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cor-primaria)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cor-texto-principal)'}>
              Guias Salvos
            </span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-secundario)' }}>
            {totalGuias}
          </span>
        </Link>
      )}

    </div>
  );
}