"use client";

import { useState } from "react";
import Link from "next/link"; // Adicionamos o Link aqui
// Vamos criar estes dois nos próximos passos
import ComentarioFilho from "./ComentarioFilho";
import MenuTresPontinhos from "../ui/MenuTresPontinhos";

// Replicando a tipagem para o componente saber o que está recebendo
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
  mensagemPaiId?: number | null;
  respostas: MensagemChat[];
}

interface PostThreadProps {
  post: MensagemChat;
  meuId: number | null; // Usado para saber se mostramos a lixeira nos 3 pontinhos
}

export default function PostThread({ post, meuId }: PostThreadProps) {
  const [expandido, setExpandido] = useState(false);
  
  // Estados para a caixa de resposta
  const [conteudoResposta, setConteudoResposta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const isDonoDoPost = meuId === post.usuario.id;

  const handleResponder = async () => {
    const textoLimpo = conteudoResposta.trim();
    if (textoLimpo.length === 0) return;
    if (textoLimpo.length > 150) {
      setErro("A resposta não pode ter mais de 150 caracteres.");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;
      
      const respostaApi = await fetch("https://letrify.fly.dev/api/chat/enviar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // O segredo está aqui: apontamos para o ID deste post
        body: JSON.stringify({ conteudo: textoLimpo, mensagemPaiId: post.id }) 
      });

      if (respostaApi.status === 429) {
        setErro("Aguarde um pouco antes de mandar outra resposta.");
        return;
      }

      if (!respostaApi.ok) {
        setErro("Falha ao enviar a resposta.");
        return;
      }

      // Sucesso! Limpa a caixa de texto. O SignalR faz o resto!
      setConteudoResposta("");

    } catch (err) {
      setErro("Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/60 border border-white/5 shadow-sm transition-all">
      
      {/* CABEÇALHO DO POST PAI */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">

          {/* FOTO CLICÁVEL */}
          <Link href={`/perfil?id=${post.usuario.id}`} className="w-11 h-11 rounded-full bg-zinc-800 border-2 border-zinc-700/50 overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity">
            {post.usuario?.fotoPerfil ? (
              <img src={post.usuario.fotoPerfil} alt={post.usuario.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-blue-600">
                {post.usuario?.nome?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          
          <div>
            {/* NOME CLICÁVEL */}
            <Link href={`/perfil?id=${post.usuario.id}`} className="font-bold text-sm tracking-tight text-zinc-100 hover:underline">
              {post.usuario?.nome}
            </Link>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
              {new Date(post.dataPostagem).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        {/* 3 Pontinhos */}
        <MenuTresPontinhos idPost={post.id} isDono={isDonoDoPost} />
      </div>
      
      {/* CORPO DO POST PAI */}
      <p className="text-sm leading-relaxed text-zinc-300 mb-4 whitespace-pre-wrap">
        {post.conteudo}
      </p>
      
      {/* INDICADOR DE RESPOSTAS (Botão Expansor) */}
      <button 
        onClick={() => setExpandido(!expandido)}
        className="text-xs font-bold text-blue-400 opacity-80 hover:opacity-100 transition-opacity flex items-center gap-2"
      >
        <span className="text-lg leading-none">{expandido ? "−" : "+"}</span>
        {post.respostas?.length || 0} respostas
      </button>

      {/* ÁREA EXPANDIDA (Fios, Input e Filhos) */}
      {expandido && (
        <div className="mt-5 ml-5 pl-5 border-l-2 border-zinc-800/80 relative">
          
          {/* CAIXA DE TEXTO PARA RESPONDER */}
          <div className="mb-6 relative">
            <div className="absolute -left-5 top-4 w-5 border-t-2 border-zinc-800/80"></div>
            
            <div className="bg-zinc-800/30 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
              <textarea
                value={conteudoResposta}
                onChange={(e) => {
                  setConteudoResposta(e.target.value);
                  if (erro) setErro(null);
                }}
                placeholder={`Responder a ${post.usuario.nome}...`}
                className="w-full bg-transparent text-sm text-zinc-200 resize-none outline-none placeholder-zinc-600 h-14"
                maxLength={150}
                disabled={enviando}
              />
              
              {erro && <p className="text-red-400 text-[10px] font-bold px-1">{erro}</p>}
              
              <div className="flex justify-between items-center px-1">
                <span className={`text-[10px] font-mono font-bold ${conteudoResposta.length >= 150 ? "text-red-500" : "text-zinc-600"}`}>
                  {conteudoResposta.length}/150
                </span>
                
                <button
                  onClick={handleResponder}
                  disabled={conteudoResposta.trim().length === 0 || enviando}
                  className="px-4 py-1.5 bg-zinc-200 hover:bg-white text-zinc-900 disabled:bg-zinc-800 disabled:text-zinc-600 text-xs font-bold rounded-full transition-colors"
                >
                  {enviando ? "..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE COMENTÁRIOS FILHOS */}
          <div className="flex flex-col gap-4">
            {post.respostas && post.respostas.length > 0 ? (
              post.respostas.map((resposta) => (
                <div key={resposta.id} className="relative">
                  {/* Fio conector do filho */}
                  <div className="absolute -left-5 top-5 w-5 border-t-2 border-zinc-800/80"></div>
                  
                  <ComentarioFilho 
                    comentario={resposta} 
                    meuId={meuId} 
                    nomePai={post.usuario.nome} 
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-600 italic">Seja o primeiro a responder...</p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}