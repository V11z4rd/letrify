"use client";

import { useState, useEffect, useRef } from "react";
import { signalRService } from "@/app/lib/signalrService";
import { authService } from "@/app/lib/authService";
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from "@heroicons/react/24/outline";
import BotaoChatBottom from "@/components/ui/BotaoChatBottom";

interface MensagemGrupo {
  id: number;
  conteudo: string;
  dataEnvio: string;
  usuario: {
    id: number;
    nome: string;
    fotoPerfil: string | null;
  };
}

interface ChatGrupoProps {
  grupoId: number;
}

export default function ChatGrupo({ grupoId }: ChatGrupoProps) {
  const [mensagens, setMensagens] = useState<MensagemGrupo[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [meuId, setMeuId] = useState<number | null>(null);
  const [alertaNovasMsg, setAlertaNovasMsg] = useState(false);
  
  // Guardamos o seu perfil assim que o histórico carrega para uso posterior
  const meuPerfilRef = useRef<{ id: number; nome: string; fotoPerfil: string | null } | null>(null);
  
  const areaMensagensRef = useRef<HTMLDivElement>(null);
  const fimDoChatRef = useRef<HTMLDivElement>(null);

  const rolarParaBaixo = (behavior: "smooth" | "auto" = "smooth") => {
    setTimeout(() => {
      fimDoChatRef.current?.scrollIntoView({ behavior });
      setAlertaNovasMsg(false);
    }, 50);
  };

  // Monitora a entrada de mensagens para decidir se desce a tela ou ativa o alerta de novas mensagens
  useEffect(() => {
    const container = areaMensagensRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const restanteParaOFundo = scrollHeight - scrollTop - clientHeight;

    // Se o usuário já estiver próximo do fim do chat (menos de 200px) ou for a carga inicial, rola para baixo automaticamente
    if (restanteParaOFundo < 200 || mensagens.length <= 30) {
      rolarParaBaixo("smooth");
    } else {
      // Se ele estiver lendo o histórico mais acima, ativa a bolinha de aviso no botão
      setAlertaNovasMsg(true);
    }
  }, [mensagens]);

  useEffect(() => {
    const idAtual = authService.getUserId();
    if (idAtual) setMeuId(Number(idAtual));

    const carregarHistorico = async () => {
      try {
        const token = authService.getToken();
        const res = await fetch(`https://letrify.fly.dev/api/grupos/${grupoId}/chat`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const hist = await res.json();
          const historicoOrdenado = Array.isArray(hist) ? hist.reverse() : [];
          setMensagens(historicoOrdenado);

          // Força o chat a iniciar posicionado lá embaixo nas mensagens recentes
          setTimeout(() => rolarParaBaixo("auto"), 100);

          // Salva os dados do seu próprio usuário baseado no histórico para blindar novos envios
          if (idAtual) {
            const minhaMsg = historicoOrdenado.find((m: any) => m.usuario?.id === Number(idAtual));
            if (minhaMsg?.usuario) {
              meuPerfilRef.current = {
                id: minhaMsg.usuario.id,
                nome: minhaMsg.usuario.nome,
                fotoPerfil: minhaMsg.usuario.fotoPerfil
              };
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar histórico do chat:", err);
      }
    };
    carregarHistorico();

    const token = authService.getToken();
    if (token) {
      signalRService.iniciarConexao(token)
        .then(() => {
          signalRService.entrarSalaGrupo(grupoId);

          const lidarComMensagemEntrada = (msgRecebida: any) => {
            if (!msgRecebida || (!msgRecebida.conteudo && !msgRecebida.texto)) return;

            setMensagens((mensagensAtuais) => {
              // Se a mensagem já existe na tela (pelo ID), ignora para não duplicar ou quebrar
              if (mensagensAtuais.some(m => m.id === msgRecebida.id)) {
                return mensagensAtuais;
              }

              // Normaliza a mensagem recebida do SignalR caso falte o nó do usuário
              const msgFormatada: MensagemGrupo = {
                id: msgRecebida.id,
                conteudo: msgRecebida.conteudo || msgRecebida.texto || "",
                dataEnvio: msgRecebida.dataEnvio || msgRecebida.dataCriacao || new Date().toISOString(),
                usuario: msgRecebida.usuario ? {
                  id: msgRecebida.usuario.id,
                  nome: msgRecebida.usuario.nome,
                  fotoPerfil: msgRecebida.usuario.fotoPerfil
                } : {
                  id: msgRecebida.usuarioId || 0,
                  nome: msgRecebida.usuarioNome || "Usuário",
                  fotoPerfil: msgRecebida.fotoPerfil || null
                }
              };

              // Se a mensagem recebida for nossa própria mensagem via WebSocket, ajustamos com os dados corretos do perfil
              if (msgFormatada.usuario.id === meuId && meuPerfilRef.current) {
                msgFormatada.usuario = meuPerfilRef.current;
              }

              return [...mensagensAtuais, msgFormatada];
            });
          };

          signalRService.onReceberMensagemGrupo(lidarComMensagemEntrada);
          signalRService.onReceberNovaMensagem(lidarComMensagemEntrada);
        })
        .catch((err) => console.error("Erro ao estabelecer conexão em tempo real:", err));
    }

    return () => {
      signalRService.sairSalaGrupo(grupoId);
    };
  }, [grupoId, meuId]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    const texto = novaMensagem;
    setNovaMensagem("");

    // Usamos o timestamp atual como ID temporário
    const idProvisorio = Date.now(); 
    
    const mensagemOtimista: MensagemGrupo = {
      id: idProvisorio,
      conteudo: texto,
      dataEnvio: new Date().toISOString(),
      usuario: meuPerfilRef.current || {
        id: meuId || 0,
        nome: "Você",
        fotoPerfil: null
      }
    };

    // 1. Insere na tela instantaneamente
    setMensagens((prev) => [...prev, mensagemOtimista]);
    rolarParaBaixo("smooth");

    try {
      const token = authService.getToken();
      const res = await fetch(`https://letrify.fly.dev/api/grupos/${grupoId}/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ conteudo: texto })
      });

      if (!res.ok) {
        // Se o servidor rejeitar a mensagem, removemos o balão otimista da tela
        setMensagens((prev) => prev.filter(m => m.id !== idProvisorio));
        setNovaMensagem(texto);
      }
      // 💡 NOTA: Removemos o bloco que tentava substituir o objeto por "msgReal".
      // Mantendo a mensagem otimista intacta na tela, ela NUNCA mais vai sumir do nada!
      
    } catch (err) {
      // Se der erro de rede, remove a mensagem da tela e devolve ao input
      setMensagens((prev) => prev.filter(m => m.id !== idProvisorio));
      setNovaMensagem(texto);
    }
  };

  return (
    <div 
      className="relative border rounded-2xl flex flex-col h-[600px] shadow-sm animate-fade-in transition-all"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* CABEÇALHO */}
      <div 
        className="p-4 border-b flex items-center justify-between rounded-t-2xl"
        style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--cor-texto-principal)' }}>
          <ChatBubbleLeftRightIcon className="w-4 h-4 stroke-[2.5]" style={{ color: 'var(--cor-destaque)' }} />
          <span>Chat Global ao Vivo</span>
        </h3>
        <span className="text-[10px] font-black opacity-60 uppercase tracking-wider" style={{ color: 'var(--cor-texto-secundario)' }}>
          Sala #{grupoId}
        </span>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div 
        ref={areaMensagensRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5"
      >
        {mensagens.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 mb-2" style={{ color: 'var(--cor-destaque)' }} />
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--cor-texto-secundario)' }}>Nenhuma mensagem por aqui. Comece a conversa!</p>
          </div>
        ) : (
          mensagens.map((msg, index) => {
            const idUsuarioMsg = msg.usuario?.id || 0;
            const nomeUsuarioMsg = msg.usuario?.nome || "Usuário";
            const fotoUsuarioMsg = msg.usuario?.fotoPerfil || null;
            
            const isMinha = idUsuarioMsg === meuId && idUsuarioMsg !== 0;

            // Se o conteúdo estiver vazio por algum erro de transmissão da API, pula a renderização deste balão vazio
            if (!msg.conteudo) return null;

            return (
              <div key={msg.id || index} className={`flex gap-3 max-w-[85%] ${isMinha ? "ml-auto flex-row-reverse" : ""}`}>
                {!isMinha && (
                  <div 
                    className="w-8 h-8 rounded-xl flex-shrink-0 overflow-hidden border flex items-center justify-center font-black text-[10px] shadow-sm"
                    style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-sidebar)', borderColor: 'var(--cor-fundo-sidebar)' }}
                  >
                    {fotoUsuarioMsg ? (
                      <img src={fotoUsuarioMsg} alt={nomeUsuarioMsg} className="w-full h-full object-cover" />
                    ) : (
                      nomeUsuarioMsg.charAt(0).toUpperCase()
                    )}
                  </div>
                )}

                <div className={`flex flex-col ${isMinha ? "items-end" : "items-start"}`}>
                  {!isMinha && (
                    <span className="text-[10px] font-bold opacity-60 mb-1 ml-1" style={{ color: 'var(--cor-texto-secundario)' }}>
                      {nomeUsuarioMsg}
                    </span>
                  )}
                  
                  <div 
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm border ${
                      isMinha ? "rounded-tr-xs" : "rounded-tl-xs"
                    }`}
                    style={{
                      backgroundColor: isMinha ? 'var(--cor-botao-primario)' : 'var(--cor-fundo-app)',
                      color: isMinha ? 'var(--cor-botao-texto)' : 'var(--cor-texto-principal)',
                      borderColor: isMinha ? 'var(--cor-botao-primario)' : 'var(--cor-fundo-sidebar)'
                    }}
                  >
                    {msg.conteudo}
                  </div>
                  
                  <span className="text-[9px] font-semibold opacity-40 mt-1 px-1" style={{ color: 'var(--cor-texto-secundario)' }}>
                    {msg.dataEnvio ? new Date(msg.dataEnvio).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={fimDoChatRef} />
      </div>

      {/* BOTÃO FLUTUANTE INJETADO DIRETAMENTE NO ESCOPO DO BOX DO CHAT */}
      <BotaoChatBottom 
        containerRef={areaMensagensRef}
        temNovasMensagens={alertaNovasMsg}
        onClick={() => rolarParaBaixo("smooth")}
      />

      {/* ÁREA DE INPUT */}
      <div 
        className="p-4 border-t rounded-b-2xl"
        style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <form onSubmit={handleEnviar} className="flex gap-3">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Diga algo aos leitores globais..."
            className="flex-1 px-4 text-xs sm:text-sm font-medium rounded-xl border outline-none transition-all focus:ring-1 focus:ring-[var(--cor-destaque)]"
            style={{ 
              backgroundColor: 'var(--cor-fundo-card)', 
              color: 'var(--cor-texto-principal)', 
              borderColor: 'var(--cor-fundo-sidebar)' 
            }}
            maxLength={300}
          />
          <button
            type="submit"
            disabled={!novaMensagem.trim()}
            className="w-12 h-12 flex items-center justify-center rounded-xl transition-all shadow-sm flex-shrink-0 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
          >
            <PaperAirplaneIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}