"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authService } from "@/app/lib/authService";
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface UsuarioAutor {
  id: number;
  nome: string;
  fotoPerfil: string | null;
}

interface PostGrupo {
  id: number;
  conteudo: string;
  dataCriacao: string;
  usuario: UsuarioAutor;
}

interface FeedInternoProps {
  grupoId: number;
}

export default function FeedInterno({ grupoId }: FeedInternoProps) {
  const [posts, setPosts] = useState<PostGrupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  const [novoPost, setNovoPost] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregarPosts = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const token = authService.getToken();
      const resposta = await fetch(`https://letrify.fly.dev/api/grupos/${grupoId}/posts`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!resposta.ok) throw new Error("Falha ao carregar as discussões do clube.");
      const dados = await resposta.json();
      setPosts(dados);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPosts();
  }, [grupoId]);

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoPost.trim() || enviando) return;

    setEnviando(true);
    try {
      const token = authService.getToken();
      const resposta = await fetch(`https://letrify.fly.dev/api/grupos/${grupoId}/posts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ conteudo: novoPost.trim() })
      });

      if (!resposta.ok) throw new Error("Erro ao publicar o tópico.");
      
      setNovoPost("");
      carregarPosts(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 animate-fade-in">
      
      {/* CAIXA DE CRIAÇÃO DE POST ADAPTADA */}
      <div 
        className="border rounded-2xl p-5 shadow-sm transition-all"
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <form onSubmit={handlePublicar}>
          <textarea
            value={novoPost}
            onChange={(e) => setNovoPost(e.target.value)}
            placeholder="Comece uma nova discussão sobre os capítulos ou teorias..."
            className="w-full text-xs sm:text-sm rounded-xl p-4 min-h-[100px] outline-none border font-medium transition-all focus:ring-1 focus:ring-[var(--cor-destaque)] resize-none mb-3"
            style={{ 
              backgroundColor: 'var(--cor-fundo-app)', 
              color: 'var(--cor-texto-principal)', 
              borderColor: 'var(--cor-fundo-sidebar)' 
            }}
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>
              {novoPost.length} / 1000
            </span>
            <button
              type="submit"
              disabled={enviando || novoPost.trim().length === 0}
              className="px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
            >
              {enviando ? (
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>{enviando ? "Publicando..." : "Publicar"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* FEEDBACKS DE ESTADO: LOADING */}
      {carregando && (
        <div 
          className="flex flex-col items-center justify-center py-16 text-xs font-black uppercase tracking-widest gap-2"
          style={{ color: 'var(--cor-texto-secundario)' }}
        >
          <ArrowPathIcon className="w-5 h-5 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
          <span>Carregando linha do tempo...</span>
        </div>
      )}

      {/* FEEDBACKS DE ESTADO: ERRO */}
      {erro && !carregando && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center justify-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>{erro}</span>
        </div>
      )}

      {/* FEEDBACKS DE ESTADO: VAZIO */}
      {!carregando && !erro && posts.length === 0 && (
        <div 
          className="text-center py-16 border border-dashed rounded-2xl flex flex-col items-center p-6"
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <SparklesIcon className="w-8 h-8 mb-3 opacity-40" style={{ color: 'var(--cor-destaque)' }} />
          <p className="font-black text-sm mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Nenhum debate ativo por enquanto.</p>
          <p className="text-xs font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>Seja o pioneiro a iniciar uma discussão neste clube!</p>
        </div>
      )}

      {/* LISTA DE DISCUSSÕES INTERATIVAS */}
      {!carregando && !erro && posts.length > 0 && (
        <div className="flex flex-col gap-3.5">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="border rounded-2xl p-5 shadow-sm transition-all hover:scale-[1.005]"
              style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
            >
              
              {/* CABEÇALHO DO POST */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/perfil?id=${post.usuario.id}`} 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm border overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-sidebar)', borderColor: 'var(--cor-fundo-sidebar)' }}
                  >
                    {post.usuario.fotoPerfil ? (
                      <img src={post.usuario.fotoPerfil} alt={post.usuario.nome} className="w-full h-full object-cover" />
                    ) : (
                      post.usuario.nome.charAt(0).toUpperCase()
                    )}
                  </Link>
                  <div>
                    <Link 
                      href={`/perfil?id=${post.usuario.id}`} 
                      className="font-extrabold text-sm transition-colors hover:underline"
                      style={{ color: 'var(--cor-texto-principal)' }}
                    >
                      {post.usuario.nome}
                    </Link>
                    
                    <div className="flex items-center gap-1 opacity-50 mt-0.5" style={{ color: 'var(--cor-texto-secundario)' }}>
                      <ClockIcon className="w-3 h-3 stroke-[2]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {new Date(post.dataCriacao).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CORPO DO POST */}
              <p 
                className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap pl-1"
                style={{ color: 'var(--cor-texto-principal)' }}
              >
                {post.conteudo}
              </p>

              {/* RODAPÉ DO POST (Sistema de Respostas) */}
              <div className="mt-4 pt-3.5 border-t flex items-center gap-4 pl-1" style={{ borderColor: 'var(--cor-fundo-app)' }}>
                <button 
                  className="text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100"
                  style={{ color: 'var(--cor-texto-principal)' }}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 stroke-[2.5]" style={{ color: 'var(--cor-destaque)' }} />
                  <span>Responder Discussão</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}