"use client";

import { useState, useEffect, useCallback } from "react";
import { signalRService } from "@/app/lib/signalrService";
import { authService } from "@/app/lib/authService";
import BotaoCriarPost from "@/components/feed/BotaoCriarPost";
import PostThread from "@/components/feed/PostThread";
import BotaoPostTop from "@/components/ui/BotaoPostTop";
import BotaoFlutuanteCriarPost from "@/components/ui/BotaoFlutuanteCriarPost";

interface UsuarioChat {
  id: number;
  nome: string;
  fotoPerfil: string;
  isPremium?: boolean;
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

  // 💡 Estado para monitorar se existem posts não lidos acima do scroll atual
  const [novosPostsDisponiveis, setNovosPostsDisponiveis] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  // Busca o histórico inicial e serve de atualização forçada
  const carregarHistorico = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;
    if (!token) return;

    try {
      const resposta = await fetch(`${BASE_URL}/chat/listar?pagina=1&tamanhoPagina=50`, {
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
  }, [BASE_URL]);

  // 🟢 ADICIONADO: Ouvinte do evento customizado invisível do navegador
  // Captura ações disparadas de dentro de subcomponentes como o PostThread e o MenuTresPontinhos
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("atualizar_feed_global", carregarHistorico);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("atualizar_feed_global", carregarHistorico);
      }
    };
  }, [carregarHistorico]);

  useEffect(() => {
    const idString = authService.getUserId();
    if (idString) setMeuId(parseInt(idString, 10));
    
    const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;
    if (!token) return;

    carregarHistorico();

    // OUVINTE A: Nova Mensagem ou Resposta
    signalRService.iniciarConexao(token).catch(() => {});

    signalRService.onReceberNovaMensagem((novaMensagem: MensagemChat) => {
      setMensagens((estadoAnterior) => {
        if (!novaMensagem.mensagemPaiId) {
          if (estadoAnterior.some(m => m.id === novaMensagem.id)) return estadoAnterior;

          // 💡 UX Inteligente de Scroll:
          // Se o usuário está lendo algo lá embaixo, não joga a tela dele para cima. Ativa o alerta do botão.
          if (typeof window !== "undefined" && window.scrollY > 150) {
            setNovosPostsDisponiveis(true);
          } else if (typeof window !== "undefined") {
            // Se ele já está no topo, rola sutilmente para acomodar o novo post sem quebra brusca
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }, 100);
          }

          const mensagemFormatada = { ...novaMensagem, respostas: [] };
          return [mensagemFormatada, ...estadoAnterior];
        }

        return estadoAnterior.map((postPai) => {
          if (postPai.id === novaMensagem.mensagemPaiId) {
            if (postPai.respostas?.some(r => r.id === novaMensagem.id)) return postPai;
            return {
              ...postPai,
              respostas: [...(postPai.respostas || []), novaMensagem]
            };
          }
          return postPai;
        });
      });
    });

    // OUVINTE B: Remoção em Tempo Real
    signalRService.onMensagemDeletada((idDeletado: number) => {
      setMensagens((estadoAnterior) => {
        // Remove do feed se for um post principal
        const feedSemOPai = estadoAnterior.filter((post) => post.id !== idDeletado);
        
        // Remove de dentro das respostas se for um comentário filho
        return feedSemOPai.map((post) => ({
          ...post,
          respostas: post.respostas ? post.respostas.filter((resp) => resp.id !== idDeletado) : []
        }));
      });
    });

    return () => {
      signalRService.pararConexao();
    };
  }, [carregarHistorico]);

  if (carregando) {
    return (
      <div 
        className="p-8 text-center text-xs uppercase tracking-widest font-black flex items-center justify-center min-h-screen"
        style={{ color: 'var(--cor-texto-secundario)' }}
      >
        📡 Sintonizando o feed...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full pt-8 pb-24 relative min-h-screen">
      <h1 
        className="text-2xl font-black tracking-tight mb-6 px-4"
        style={{ color: 'var(--cor-texto-principal)' }}
      >
        Feed Global
      </h1>

      {/* ÁREA DO EDITOR DE POSTAGEM */}
      <div className="px-4 mb-6">
        <BotaoCriarPost onPostCreated={carregarHistorico} />
      </div>

      {/* ÁREA DE POSTS */}
      <div className="flex flex-col gap-6 px-4">
        {mensagens.length === 0 ? (
          <p 
            className="text-center font-medium text-sm opacity-40 py-12 italic"
            style={{ color: 'var(--cor-texto-principal)' }}
          >
            O feed está silencioso hoje. Seja o primeiro a postar!
          </p>
        ) : (
          mensagens.map((post) => (
            <PostThread
              key={post.id}
              post={post}
              meuId={meuId}
            />
          ))
        )}
      </div>

      {/* 🚀 HUB DE ELEMENTOS FIXOS/FLUTUANTES COORDENADOS */}
      <div className="z-40 pointer-events-none">
        <BotaoPostTop
          temNovosPosts={novosPostsDisponiveis} 
          onLimparAlerta={() => setNovosPostsDisponiveis(false)}
        />
        <BotaoFlutuanteCriarPost onPostCreated={carregarHistorico} />
      </div>
    </div>
  );
}