"use client";

import { useState } from "react";
import Link from "next/link";
import ComentarioFilho from "./ComentarioFilho";
import MenuTresPontinhos from "../ui/MenuTresPontinhos";
import BotaoCurtir from "@/components/ui/BotaoCurtir";
import { BadgePremium } from "@/components/perfil/Premium";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export default function PostResenha({ post, meuId }: { post: any; meuId: number | null }) {
  const [expandido, setExpandido] = useState(false);
  const [conteudoResposta, setConteudoResposta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const isDonoDoPost = meuId === post.usuario.id;
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const handleResponder = async () => {
    if (!conteudoResposta.trim() || enviando) return;
    setEnviando(true);
    try {
      const token = localStorage.getItem("letrify_token");
      await fetch(`${BASE_URL}/chat/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ conteudo: conteudoResposta.trim(), mensagemPaiId: post.id })
      });
      setConteudoResposta("");
      window.dispatchEvent(new Event("atualizar_feed_global"));
    } catch { setErro("Erro ao responder."); } finally { setEnviando(false); }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl border shadow-md transition-all duration-300" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
      
      {/* HEADER DO USUÁRIO */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/perfil?id=${post.usuario.id}`} className="w-11 h-11 rounded-xl overflow-hidden border">
            <img src={post.usuario.fotoPerfil || "/placeholder-avatar.png"} className="w-full h-full object-cover" />
          </Link>
          <div>
            <span className="font-black text-sm tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>{post.usuario.nome}</span>
            <p className="text-[9px] uppercase tracking-wider opacity-40 mt-0.5" style={{ color: 'var(--cor-texto-principal)' }}>
              {new Date(post.dataPostagem).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
        </div>
        <MenuTresPontinhos idPost={post.id} isDono={isDonoDoPost} />
      </div>

      {/* BLOCO DA RESENHA LITERÁRIA (CARD INTERNO DO LIVRO) */}
      {post.livro && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl mb-4 border" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
          
          {/* TRATAMENTO DE CAPA INTELIGENTE DA IA INTEGRADO */}
          <div className="w-full sm:w-24 h-36 rounded-xl overflow-hidden shrink-0 shadow border bg-neutral-900 flex items-center justify-center">
            <img
              src={post.livro.capaUrl}
              alt={post.livro.titulo}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.tentou) {
                  target.dataset.tentou = "true";
                  target.src = `https://covers.openlibrary.org/b/title/${encodeURIComponent(post.livro.titulo)}-M.jpg`;
                } else {
                  target.style.display = "none";
                  const placeholder = document.createElement("div");
                  placeholder.style.cssText = "width:100%;height:100%;background:#1a1a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px;";
                  placeholder.innerHTML = `<span style="font-size:24px">📖</span><span style="font-size:9px;color:#888;text-align:center;font-weight:bold;">${post.livro.titulo}</span>`;
                  target.parentElement?.appendChild(placeholder);
                }
              }}
            />
          </div>

          <div className="flex flex-col justify-between py-1">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-500">
                <BookOpenIcon className="w-3.5 h-3.5" />
                <span>Resenha Crítica</span>
              </div>
              <h4 className="font-black text-base tracking-tight mt-1" style={{ color: 'var(--cor-texto-principal)' }}>{post.livro.titulo}</h4>
              <p className="text-xs font-bold opacity-60" style={{ color: 'var(--cor-texto-principal)' }}>Por {post.livro.autor}</p>
            </div>

            {/* ESTRELAS DA NOTALIVRO */}
            <div className="flex gap-0.5 mt-3">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <span key={estrela} className="text-lg" style={{ color: estrela <= post.livro.nota ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA AVALIAÇÃO (ATÉ 750 CARACTERES) */}
      <p className="text-sm leading-relaxed font-medium mb-4 whitespace-pre-wrap pl-1" style={{ color: 'var(--cor-texto-principal)', opacity: 0.9 }}>
        {post.conteudo}
      </p>

      {/* AÇÕES (CURTIR E COMENTAR) */}
      <div className="flex items-center gap-3">
        <BotaoCurtir mensagemId={post.id} curtidasIniciais={post.totalCurtidas || 0} jaCurtidoInicial={post.euCurti || false} />
        <button onClick={() => setExpandido(!expandido)} className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 px-3 py-1.5 rounded-xl">
          <ChatBubbleLeftRightIcon className="w-4 h-4" />
          <span>{post.respostas?.length || 0} Respostas</span>
        </button>
      </div>

      {/* ÁREA EXPANDIDA IGUAL À DO SEU POST ORIGINAL */}
      {expandido && (
        <div className="mt-5 ml-5 pl-5 border-l-2 relative animate-fade-in" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          {/* INPUT DE RESPOSTA */}
          <div className="mb-5 flex flex-col gap-2 p-3 border rounded-2xl" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
            <textarea value={conteudoResposta} onChange={(e) => setConteudoResposta(e.target.value)} placeholder="Comentar esta resenha..." className="w-full bg-transparent text-xs sm:text-sm outline-none resize-none h-12" style={{ color: 'var(--cor-texto-principal)' }} maxLength={150} />
            <div className="flex justify-between items-center">
              <span className="text-[9px] opacity-30">{conteudoResposta.length}/150</span>
              <button onClick={handleResponder} disabled={!conteudoResposta.trim()} className="px-4 py-1.5 text-[10px] uppercase font-black rounded-lg" style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)' }}>Enviar</button>
            </div>
          </div>
          {/* RENDER DOS FILHOS */}
          <div className="flex flex-col gap-4">
            {post.respostas?.map((resp: any) => <ComentarioFilho key={resp.id} comentario={resp} meuId={meuId} nomePai={post.usuario.nome} />)}
          </div>
        </div>
      )}
    </div>
  );
}