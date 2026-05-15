"use client";

import { useState, useEffect } from "react";
import { signalRService } from "@/app/lib/signalrService";
import { authService } from "@/app/lib/authService"; // Ajuste para o caminho correto do seu authService
import BotaoCriarPost from "@/components/feed/BotaoCriarPost";
import PostThread from "@/components/feed/PostThread";

// 1. Interfaces baseadas no retorno do seu Back-end
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

export default function FeedPage() {
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [meuId, setMeuId] = useState<number | null>(null);

  useEffect(() => {
    const idString = authService.getUserId();
    if (idString) setMeuId(parseInt(idString, 10));
    // 2. Busca o token (ajuste para o método que você usa no authService)
    const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;
    if (!token) return;

    // 3. Função para buscar o histórico inicial (REST)
    const carregarHistorico = async () => {
      try {
        const resposta = await fetch("https://letrify.fly.dev/api/chat/listar?pagina=1&tamanhoPagina=50", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (resposta.ok) {
          const dados = await resposta.json();
          setMensagens(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar o feed inicial:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarHistorico();

    // 4. Conecta no SignalR e registra os ouvintes
    signalRService.iniciarConexao(token);

    // OUVINTE A: Nova Mensagem Recebida
    signalRService.onReceberNovaMensagem((novaMensagem: MensagemChat) => {
      setMensagens((estadoAnterior) => {
        // Se NÃO tem pai, é um Post Principal novo -> Vai pro topo do Feed
        if (!novaMensagem.mensagemPaiId) {
          // Garantimos que respostas seja um array vazio para não quebrar a tela
          const mensagemFormatada = { ...novaMensagem, respostas: [] };
          return [mensagemFormatada, ...estadoAnterior];
        }

        // Se TEM pai, é um Comentário -> Procuramos o pai e injetamos dentro dele
        return estadoAnterior.map((postPai) => {
          if (postPai.id === novaMensagem.mensagemPaiId) {
            return {
              ...postPai,
              respostas: [...(postPai.respostas || []), novaMensagem]
            };
          }
          return postPai;
        });
      });
    });

    // OUVINTE B: Mensagem Deletada
    signalRService.onMensagemDeletada((idDeletado: number) => {
      setMensagens((estadoAnterior) => {
        // Passo 1: Remove se for um Post Principal
        const feedSemOPai = estadoAnterior.filter((post) => post.id !== idDeletado);

        // Passo 2: Remove se for uma Resposta dentro de algum Post Principal
        return feedSemOPai.map((post) => ({
          ...post,
          respostas: post.respostas ? post.respostas.filter((resp) => resp.id !== idDeletado) : []
        }));
      });
    });

    // 5. Cleanup: Desconecta ao sair da página para não vazar memória
    return () => {
      signalRService.pararConexao();
    };
  }, []);

  if (carregando) {
    return <div className="p-8 text-center opacity-50 flex items-center justify-center min-h-screen">📡 Sintonizando o feed...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto w-full pt-8 pb-24 relative min-h-screen">
      <h1 className="text-2xl font-black tracking-tight mb-6 px-4">Feed Global</h1>

      {/* ÁREA DE POSTS */}
      <div className="flex flex-col gap-6 px-4">
        {mensagens.length === 0 ? (
          <p className="text-center opacity-50 py-10">O feed está silencioso hoje. Seja o primeiro a postar!</p>
        ) : (
          mensagens.map((post) => (
            <PostThread
              key={post.id}
              post={post}
              // Precisaremos pegar o id do usuário logado no começo do feed para passar aqui
              meuId={meuId}
            />
          ))
        )}
      </div>

      {/* PLACEHOLDER: O Botão Flutuante que criaremos depois */}
      <BotaoCriarPost />
    </div>
  );
}