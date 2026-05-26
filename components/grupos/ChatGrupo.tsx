"use client";

import { useState, useEffect, useRef } from "react";
import { signalRService } from "@/app/lib/signalrService";
import { authService } from "@/app/lib/authService";
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from "@heroicons/react/24/outline";

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
  
  const fimDoChatRef = useRef<HTMLDivElement>(null);

  const rolarParaBaixo = () => {
    fimDoChatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    rolarParaBaixo();
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
          setMensagens(hist);
        }
      } catch (err) {
        console.error("Erro ao carregar histórico do chat:", err);
      }
    };
    carregarHistorico();

    const token = authService.getToken();
    if (token) {
      signalRService.iniciarConexao(token);
      
      setTimeout(() => {
        signalRService.entrarNoGrupo(grupoId);
      }, 1000);

      signalRService.onReceberMensagemGrupo((msgRecebida) => {
        setMensagens((prev) => [...prev, msgRecebida]);
      });
    }

    return () => {
      signalRService.sairDoGrupo(grupoId);
    };
  }, [grupoId]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    const texto = novaMensagem;
    setNovaMensagem("");

    try {
      const token = authService.getToken();
      await fetch(`https://letrify.fly.dev/api/grupos/${grupoId}/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ conteudo: texto })
      });
    } catch (err) {
      alert("Erro ao enviar mensagem.");
      setNovaMensagem(texto);
    }
  };

  return (
    <div 
      className="border rounded-2xl flex flex-col h-[600px] shadow-sm animate-fade-in transition-all"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      
      {/* CABEÇALHO DO CHAT */}
      <div 
        className="p-4 border-b flex items-center justify-between rounded-t-2xl"
        style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--cor-texto-principal)' }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span>Chat ao Vivo</span>
        </h3>
        <span className="text-[10px] font-black opacity-60 uppercase tracking-wider" style={{ color: 'var(--cor-texto-secundario)' }}>
          Sala #{grupoId}
        </span>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
        {mensagens.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 mb-2" style={{ color: 'var(--cor-destaque)' }} />
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--cor-texto-secundario)' }}>Seja o primeiro a falar!</p>
          </div>
        ) : (
          mensagens.map((msg, index) => {
            const isMinha = msg.usuario.id === meuId;
            return (
              <div key={msg.id || index} className={`flex gap-3 max-w-[85%] ${isMinha ? "ml-auto flex-row-reverse" : ""}`}>
                
                {/* Avatar Modernizado */}
                {!isMinha && (
                  <div 
                    className="w-8 h-8 rounded-xl flex-shrink-0 overflow-hidden border flex items-center justify-center font-black text-[10px] shadow-sm"
                    style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-sidebar)', borderColor: 'var(--cor-fundo-sidebar)' }}
                  >
                    {msg.usuario.fotoPerfil ? (
                      <img src={msg.usuario.fotoPerfil} alt={msg.usuario.nome} className="w-full h-full object-cover" />
                    ) : (
                      msg.usuario.nome.charAt(0).toUpperCase()
                    )}
                  </div>
                )}

                {/* Balão de Mensagem */}
                <div className={`flex flex-col ${isMinha ? "items-end" : "items-start"}`}>
                  {!isMinha && (
                    <span className="text-[10px] font-bold opacity-60 mb-1 ml-1" style={{ color: 'var(--cor-texto-secundario)' }}>
                      {msg.usuario.nome}
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
                    {new Date(msg.dataEnvio).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

              </div>
            );
          })
        )}
        <div ref={fimDoChatRef} />
      </div>

      {/* ÁREA DE INPUT ADAPTADA */}
      <div 
        className="p-4 border-t rounded-b-2xl"
        style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <form onSubmit={handleEnviar} className="flex gap-3">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Diga algo aos leitores..."
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