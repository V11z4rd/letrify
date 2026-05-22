"use client";

import Link from "next/navigation"; 
import LinkNext from "next/link"; // Correção padrão para navegação Next.js
import MenuTresPontinhos from "../ui/MenuTresPontinhos";
import { ArrowTurnDownRightIcon } from "@heroicons/react/24/outline";

interface UsuarioChat {
  id: number;
  nome: string;
  fotoPerfil: string;
}

interface MensagemChat {
  id: number;
  conteudo: string;
  dataPostagem: string;
  usuario: UsuarioChat;
}

interface ComentarioFilhoProps {
  comentario: MensagemChat;
  meuId: number | null;
  nomePai: string;
}

export default function ComentarioFilho({ comentario, meuId, nomePai }: ComentarioFilhoProps) {
  const isDonoDoComentario = meuId === comentario.usuario.id;
  const inicial = comentario.usuario?.nome ? comentario.usuario.nome.charAt(0).toUpperCase() : "U";

  return (
    <div 
      className="border rounded-2xl p-4 relative transition-all duration-200"
      style={{ 
        backgroundColor: 'rgba(var(--cor-fundo-sidebar-rgb, 24, 24, 27), 0.3)', 
        borderColor: 'var(--cor-fundo-sidebar)' 
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--cor-fundo-sidebar-rgb, 24, 24, 27), 0.6)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--cor-fundo-sidebar-rgb, 24, 24, 27), 0.3)'}
    >
      
      {/* CORPO FLEX PRINCIPAL UNIFICADO */}
      <div className="flex gap-3 items-start">
        
        {/* FOTO CLICÁVEL DO AUTOR DO COMENTÁRIO FILHO */}
        <LinkNext 
          href={`/perfil?id=${comentario.usuario.id}`} 
          className="w-8 h-8 rounded-xl border overflow-hidden flex-shrink-0 hover:opacity-80 transition-all shadow-sm"
          style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          {comentario.usuario?.fotoPerfil ? (
            <img src={comentario.usuario.fotoPerfil} alt={comentario.usuario.nome} className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center font-black text-xs transition-colors"
              style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)' }}
            >
              {inicial}
            </div>
          )}
        </LinkNext>
        
        {/* CONTEÚDO DA RESPOSTA (ALINHAMENTO NATURAL SEM MARGENS CEGAS) */}
        <div className="flex-1 min-w-0">
          
          {/* TOP BAR DO COMENTÁRIO */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                {/* Nome do Autor */}
                <LinkNext 
                  href={`/perfil?id=${comentario.usuario.id}`} 
                  className="font-black text-xs hover:underline transition-colors block truncate"
                  style={{ color: 'var(--cor-texto-principal)' }}
                >
                  {comentario.usuario?.nome}
                </LinkNext>
                
                {/* Contexto Semântico do Letrify: @NomePai */}
                <span className="text-[10px] font-bold opacity-40 flex items-center gap-0.5" style={{ color: 'var(--cor-texto-principal)' }}>
                  <span>em resposta a</span> 
                  <span className="font-extrabold hover:underline cursor-pointer" style={{ color: 'var(--cor-primaria)' }}>@{nomePai}</span>
                </span>
              </div>
              
              {/* Data de Envio do Comentário */}
              <p className="text-[9px] uppercase tracking-wider font-bold opacity-40 mt-0.5" style={{ color: 'var(--cor-texto-principal)' }}>
                {new Date(comentario.dataPostagem).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>

            {/* Menu de Ações Isolado da Caixa de Texto */}
            <div className="flex-shrink-0 -mt-1">
              <MenuTresPontinhos idPost={comentario.id} isDono={isDonoDoComentario} />
            </div>
          </div>

          {/* TEXTO DA RESPOSTA (Herda naturalmente o espaçamento da coluna) */}
          <p 
            className="text-xs leading-relaxed font-medium whitespace-pre-wrap break-words" 
            style={{ color: 'var(--cor-texto-principal)', opacity: 0.85 }}
          >
            {comentario.conteudo}
          </p>
          
        </div>
      </div>
      
    </div>
  );
}