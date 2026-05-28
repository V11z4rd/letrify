"use client";

import { useState, useEffect } from "react";
import LinkNext from "next/link"; 
import MenuTresPontinhos from "../ui/MenuTresPontinhos";
import { BadgePremium } from "@/components/perfil/Premium";

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
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const [usuarioIsPremium, setUsuarioIsPremium] = useState<boolean>(false);

  useEffect(() => {
    if (comentario.usuario?.id) {
      const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;

      fetch(`${BASE_URL}/usuario/${comentario.usuario.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((dadosApi) => {
        const temNomePremium = dadosApi?.nome && String(dadosApi.nome).toLowerCase().includes("premium");
        const premium = temNomePremium ||
                        dadosApi?.premium === true || 
                        dadosApi?.isPremium === true || 
                        dadosApi?.perfil?.premium === "1" || 
                        dadosApi?.perfil?.isPremium === true;
        
        setUsuarioIsPremium(!!premium);
      })
      .catch(() => {
        setUsuarioIsPremium(false);
      });
    }
  }, [comentario.usuario.id, BASE_URL]);

  return (
    <div 
      className="border rounded-2xl p-4 relative transition-all duration-300 hover:shadow-sm"
      style={{ 
        // 💡 Mudança chave: Usa o fundo do app para clareza e contraste perfeito com o texto
        backgroundColor: 'var(--cor-fundo-app)', 
        borderColor: 'rgba(0, 0, 0, 0.05)' 
      }}
    >
      
      {/* CORPO FLEX PRINCIPAL UNIFICADO */}
      <div className="flex gap-3 items-start">
        
        {/* FOTO CLICÁVEL DO AUTOR DO COMENTÁRIO FILHO */}
        <LinkNext 
          href={`/perfil?id=${comentario.usuario.id}`} 
          className="w-8 h-8 rounded-xl border overflow-hidden flex-shrink-0 hover:opacity-80 transition-all shadow-xs"
          style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}
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
        
        {/* CONTEÚDO DA RESPOSTA */}
        <div className="flex-1 min-w-0">
          
          {/* TOP BAR DO COMENTÁRIO */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                
                {/* Nome do Autor */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <LinkNext 
                    href={`/perfil?id=${comentario.usuario.id}`} 
                    className="font-black text-xs hover:underline transition-colors block truncate"
                    style={{ color: 'var(--cor-texto-principal)' }}
                  >
                    {comentario.usuario?.nome}
                  </LinkNext>
                  {usuarioIsPremium && <BadgePremium />}
                </div>
                
                {/* Contexto Semântico do Letrify: em resposta a @NomePai */}
                <span className="text-[10px] font-bold opacity-50 flex items-center gap-1" style={{ color: 'var(--cor-texto-secundario)' }}>
                  <span>em resposta a</span> 
                  {/* 💡 Usa a cor de destaque do tema para a menção brilhar no fundo limpo */}
                  <span className="font-extrabold hover:underline cursor-pointer transition-opacity hover:opacity-80" style={{ color: 'var(--cor-botao-primario)' }}>
                    @{nomePai}
                  </span>
                </span>
              </div>
              
              {/* Data de Envio do Comentário */}
              <p className="text-[9px] uppercase tracking-wider font-bold opacity-40 mt-0.5" style={{ color: 'var(--cor-texto-principal)' }}>
                {new Date(comentario.dataPostagem).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>

            {/* Menu de Ações */}
            <div className="flex-shrink-0 -mt-1">
              <MenuTresPontinhos idPost={comentario.id} isDono={isDonoDoComentario} />
            </div>
          </div>

          {/* TEXTO DA RESPOSTA */}
          <p 
            className="text-xs leading-relaxed font-semibold whitespace-pre-wrap break-words" 
            style={{ color: 'var(--cor-texto-principal)', opacity: 0.9 }}
          >
            {comentario.conteudo}
          </p>
          
        </div>
      </div>
      
    </div>
  );
}