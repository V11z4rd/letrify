"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authService } from "@/app/lib/authService";

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
  // Adicione outras propriedades que o seu backend envie (ex: totalComentarios)
}

interface FeedInternoProps {
  grupoId: number;
}

export default function FeedInterno({ grupoId }: FeedInternoProps) {
  const [posts, setPosts] = useState<PostGrupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Estado para o novo post
  const [novoPost, setNovoPost] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregarPosts = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const token = authService.getToken();
      // Ajuste o endpoint conforme a rota exata criada pelo Back-end para listar posts de um grupo
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
      // Ajuste o endpoint de criação de post do grupo
      const resposta = await fetch(`https://letrify.fly.dev/api/grupos/${grupoId}/posts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ conteudo: novoPost.trim() })
      });

      if (!resposta.ok) throw new Error("Erro ao publicar.");
      
      setNovoPost("");
      carregarPosts(); // Recarrega a lista para mostrar o novo post
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-fade-in">
      
      {/* CAIXA DE CRIAÇÃO DE POST */}
      <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 shadow-lg">
        <form onSubmit={handlePublicar}>
          <textarea
            value={novoPost}
            onChange={(e) => setNovoPost(e.target.value)}
            placeholder="Comece uma nova discussão sobre os capítulos..."
            className="w-full bg-zinc-800/50 text-white text-sm rounded-xl p-4 min-h-[100px] outline-none border border-transparent focus:border-blue-500 transition-colors resize-none mb-3"
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              {novoPost.length}/1000
            </span>
            <button
              type="submit"
              disabled={enviando || novoPost.trim().length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold rounded-lg transition-all shadow-md"
            >
              {enviando ? "A publicar..." : "Publicar"}
            </button>
          </div>
        </form>
      </div>

      {/* LISTA DE DISCUSSÕES */}
      {carregando && (
        <div className="text-center py-12 opacity-50">
          <span className="text-3xl animate-pulse inline-block mb-3">📝</span>
          <p className="text-xs font-bold uppercase tracking-widest">A procurar tópicos...</p>
        </div>
      )}

      {erro && !carregando && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-bold">
          {erro}
        </div>
      )}

      {!carregando && !erro && posts.length === 0 && (
        <div className="text-center py-16 bg-zinc-900/30 border border-dashed border-white/10 rounded-2xl">
          <span className="text-4xl block mb-3 opacity-40">🍃</span>
          <p className="text-zinc-300 font-bold mb-1">Nenhum tópico criado.</p>
          <p className="text-xs text-zinc-500">Seja o primeiro a iniciar um debate neste clube!</p>
        </div>
      )}

      {!carregando && !erro && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-zinc-900/80 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
              
              {/* CABEÇALHO DO POST */}
              <div className="flex items-center gap-3 mb-3">
                <Link href={`/perfil?id=${post.usuario.id}`} className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity border border-white/5">
                  {post.usuario.fotoPerfil ? (
                    <img src={post.usuario.fotoPerfil} alt={post.usuario.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-blue-600">
                      {post.usuario.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div>
                  <Link href={`/perfil?id=${post.usuario.id}`} className="font-bold text-sm text-zinc-200 hover:underline hover:text-blue-400 transition-colors">
                    {post.usuario.nome}
                  </Link>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest mt-0.5">
                    {new Date(post.dataCriacao).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              {/* CORPO DO POST */}
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {post.conteudo}
              </p>

              {/* RODAPÉ DO POST (Futuro botão de comentários) */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                <button className="text-xs font-bold text-zinc-500 hover:text-blue-400 transition-colors flex items-center gap-2">
                  <span>💬</span> Responder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}