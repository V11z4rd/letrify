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
  ClockIcon,
  TrashIcon
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
  postPaiId?: number | null; // Mapeado da API para suporte a respostas inline
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
  
  // Estados para gerenciar respostas em thread
  const [respostaAtivaId, setRespostaAtivaId] = useState<number | null>(null);
  const [conteudoResposta, setConteudoResposta] = useState("");

  const meuId = authService.getUserId();

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

  const handlePublicar = async (e: React.FormEvent, postPaiId: number | null = null) => {
    e.preventDefault();
    const texto = postPaiId ? conteudoResposta : novoPost;
    if (!texto.trim() || enviando) return;

    setEnviando(true);
    try {
      const token = authService.getToken();
      const resposta = await fetch(`https://letrify.fly.dev/api/grupos/${grupoId}/posts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        // Alinhado com a API: aceita a propriedade opcional PostPaiId
        body: JSON.stringify({ 
          conteudo: texto.trim(),
          postPaiId: postPaiId 
        })
      });

      if (!resposta.ok) throw new Error("Erro ao publicar no feed.");
      
      if (postPaiId) {
        setConteudoResposta("");
        setRespostaAtivaId(null);
      } else {
        setNovoPost("");
      }
      carregarPosts(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleDeletarPost = async (postId: number) => {
    if (!confirm("Tem certeza que deseja apagar esta publicação e todas as suas respostas?")) return;

    try {
      const token = authService.getToken();
      // Alinhado com a API: DELETE /api/grupos/{id}/posts/{pid}
      const resposta = await fetch(`https://letrify.fly.dev/api/grupos/${grupoId}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!resposta.ok) throw new Error("Você não tem permissão ou o post já foi removido.");
      
      alert("Publicação excluída com sucesso.");
      carregarPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-5 animate-fade-in">
      
      {/* CAIXA DE CRIAÇÃO DE POST PRINCIPAL */}
      <div 
        className="border rounded-2xl p-5 shadow-sm transition-all"
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <form onSubmit={(e) => handlePublicar(e, null)}>
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
              className="px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
            >
              {enviando && !respostaAtivaId ? (
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>Publicar</span>
            </button>
          </div>
        </form>
      </div>

      {/* FEEDBACKS DE ESTADO: LOADING / ERRO / VAZIO */}
      {carregando && (
        <div className="flex flex-col items-center justify-center py-16 text-xs font-black uppercase tracking-widest gap-2" style={{ color: 'var(--cor-texto-secundario)' }}>
          <ArrowPathIcon className="w-5 h-5 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
          <span>Carregando linha do tempo...</span>
        </div>
      )}

      {erro && !carregando && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center justify-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>{erro}</span>
        </div>
      )}

      {!carregando && !erro && posts.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-2xl flex flex-col items-center p-6" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
          <SparklesIcon className="w-8 h-8 mb-3 opacity-40" style={{ color: 'var(--cor-destaque)' }} />
          <p className="font-black text-sm mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Nenhum debate ativo por enquanto.</p>
          <p className="text-xs font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>Seja o pioneiro a iniciar uma discussão neste clube!</p>
        </div>
      )}

      {/* LISTA DE DISCUSSÕES INTERATIVAS */}
      {!carregando && !erro && posts.length > 0 && (
        <div className="flex flex-col gap-3.5">
          {posts.map((post) => {
            // Filtra as respostas pertencentes a este post específico no client-side para montar a árvore
            const respostasDaThread = posts.filter(p => p.postPaiId === post.id);
            
            // Renderiza apenas posts raízes no nível principal do feed
            if (post.postPaiId) return null;

            const podeDeletar = meuId === String(post.usuario.id);

            return (
              <div 
                key={post.id} 
                className="border rounded-2xl p-5 shadow-sm transition-all"
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
                      <Link href={`/perfil?id=${post.usuario.id}`} className="font-extrabold text-sm transition-colors hover:underline" style={{ color: 'var(--cor-texto-principal)' }}>
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

                  {/* LIXEIRA DE EXCLUSÃO (Se for autor do post; Líder/Admin são validados via HTTP 403 pelo back) */}
                  {podeDeletar && (
                    <button 
                      onClick={() => handleDeletarPost(post.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
                      title="Excluir publicação"
                    >
                      <TrashIcon className="w-4 h-4 stroke-[2]" />
                    </button>
                  )}
                </div>

                {/* CORPO DO POST */}
                <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap pl-1 mb-4" style={{ color: 'var(--cor-texto-principal)' }}>
                  {post.conteudo}
                </p>

                {/* THREAD DE RESPOSTAS EXISTENTES */}
                {respostasDaThread.length > 0 && (
                  <div className="pl-4 sm:pl-6 mb-4 border-l-2 space-y-3" style={{ borderColor: 'var(--cor-fundo-app)' }}>
                    {respostasDaThread.map((resp) => (
                      <div key={resp.id} className="pt-2 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold" style={{ color: 'var(--cor-texto-principal)' }}>{resp.usuario.nome}</span>
                            <span className="text-[9px] opacity-40 font-semibold">
                              {new Date(resp.dataCriacao).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {String(resp.usuario.id) === meuId && (
                            <button onClick={() => handleDeletarPost(resp.id)} className="text-zinc-400 hover:text-red-500 p-0.5 transition-colors">
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="font-medium opacity-80" style={{ color: 'var(--cor-texto-principal)' }}>{resp.conteudo}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* RODAPÉ DO POST (Ações de Feedback) */}
                <div className="pt-3 border-t flex flex-col gap-3 pl-1" style={{ borderColor: 'var(--cor-fundo-app)' }}>
                  <button 
                    onClick={() => setRespostaAtivaId(respostaAtivaId === post.id ? null : post.id)}
                    className="text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100"
                    style={{ color: 'var(--cor-texto-principal)' }}
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 stroke-[2.5]" style={{ color: 'var(--cor-destaque)' }} />
                    <span>{respostaAtivaId === post.id ? "Fechar Campo" : `Responder Discussão (${respostasDaThread.length})`}</span>
                  </button>

                  {/* CAMPO INLINE PARA COMPOSIÇÃO DE RESPOSTAS (THREAD) */}
                  {respostaAtivaId === post.id && (
                    <form onSubmit={(e) => handlePublicar(e, post.id)} className="flex gap-2 items-end mt-1 animate-fade-in">
                      <input 
                        type="text"
                        value={conteudoResposta}
                        onChange={(e) => setConteudoResposta(e.target.value)}
                        placeholder="Escreva a sua opinião sobre este tópico..."
                        className="flex-1 px-3 py-2 text-xs font-medium rounded-xl border outline-none transition-all focus:ring-1 focus:ring-[var(--cor-destaque)]"
                        style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
                        maxLength={500}
                      />
                      <button
                        type="submit"
                        disabled={enviando || !conteudoResposta.trim()}
                        className="p-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-40"
                        style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
                      >
                        <PaperAirplaneIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}