"use client";
import Link from "next/link";

interface ResumoLateralProps {
  estante: { lidos: number; lendo: number; queroLer: number } | null;
  totalGrupos: number;
  totalGuias: number;
  userIdParaLink?: string | null;
  isEditando?: boolean;
}

export default function ResumoLateral({ estante, totalGrupos, totalGuias, userIdParaLink, isEditando = false }: ResumoLateralProps) {
  // Uma função auxiliar para montar o link com ou sem o ID do usuário
  
  // 1. Estilo do container (remove hover e cursor se estiver editando)
  const containerStyle = isEditando
    ? "p-5 rounded-2xl border opacity-60" // opacidade para dar feedback visual de desativado
    : "p-5 rounded-2xl border transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer";

  // 2. Estilo dos itens internos
  const itemStyle = isEditando
    ? "flex justify-between items-center"
    : "flex justify-between items-center hover:translate-x-1 transition-transform";
  
  const montarLinkEstante = (filtro?: string) => {
    let baseUrl = "/estante";
    const params = new URLSearchParams();
    
    // Se estou vendo o perfil do João, adiciono id=2 na URL
    if (userIdParaLink) params.append("id", userIdParaLink);
    // Se cliquei no "Lendo", adiciono filtro=Lendo
    if (filtro) params.append("filtro", filtro);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* CAIXA 1: ESTANTE (Só aparece se o Firewall não enviou null) */}
      {estante && (
        <div 
          className={containerStyle}
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          {isEditando ? (
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--cor-primaria)' }}>Estante</h3>
              <span className="text-lg opacity-50">📚</span>
            </div>
          ) : (
            <Link href={montarLinkEstante()} className="flex items-center justify-between mb-3 hover:opacity-70 transition-opacity">
              <h3 className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--cor-primaria)' }}>Estante</h3>
              <span className="text-lg opacity-50">📚</span>
            </Link>
          )}

          <div className="flex flex-col gap-2 text-sm font-semibold">
            {/* Lógica de "Tampar" os links internos */}
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
                  <span style={{ color: 'var(--cor-texto-principal)' }}>{item.valor}</span>
                </Link>
              )
            ))}
          </div>
        </div>
      )}

      {/* CAIXA 2: GRUPOS */}
      <div 
        className="p-5 rounded-2xl border flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <Link href="/grupos" className="font-bold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>
          Grupos
        </Link>
        <span className="text-xs font-extrabold px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-secundario)' }}>
          {totalGrupos}
        </span>
      </div>

      {/* CAIXA 3: GUIAS */}
      <div 
        className="p-5 rounded-2xl border flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <span className="font-bold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>Guias Salvos</span>
        <span className="text-xs font-extrabold px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-secundario)' }}>
          {totalGuias}
        </span>
      </div>

    </div>
  );
}