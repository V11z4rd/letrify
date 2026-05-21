"use client";

import { useState, useEffect, useRef } from "react";
import { signalRService } from "@/app/lib/signalrService";
import { authService } from "@/app/lib/authService";

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

  // Faz o scroll automático para a mensagem mais recente
  const rolarParaBaixo = () => {
    fimDoChatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    rolarParaBaixo();
  }, [mensagens]);

  useEffect(() => {
    // 1. Identifica o utilizador
    const idAtual = authService.getUserId();
    if (idAtual) setMeuId(Number(idAtual));

    // 2. Traz o histórico (Ajuste o endpoint se necessário)
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

    // 3. Conecta na Sala do SignalR
    const token = authService.getToken();
    if (token) {
      signalRService.iniciarConexao(token); // Garante que a ligação principal existe
      
      // Dá 1 segundo para a conexão estabilizar antes de invocar a sala
      setTimeout(() => {
        signalRService.entrarNoGrupo(grupoId);
      }, 1000);

      // 4. Fica à escuta de novas mensagens desta sala
      signalRService.onReceberMensagemGrupo((msgRecebida) => {
        setMensagens((prev) => [...prev, msgRecebida]);
      });
    }

    // 5. Cleanup: Sai da sala quando o utilizador muda de aba
    return () => {
      signalRService.sairDoGrupo(grupoId);
    };
  }, [grupoId]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    const texto = novaMensagem;
    setNovaMensagem(""); // Limpa o input imediatamente (Optimistic feel)

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
      // Não precisamos de fazer um push manual para o array de mensagens aqui
      // O Back-end vai receber o POST e disparar o SignalR de volta para nós!
    } catch (err) {
      alert("Erro ao enviar mensagem.");
      setNovaMensagem(texto); // Devolve o texto em caso de erro
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl flex flex-col h-[600px] shadow-lg animate-fade-in">
      
      {/* CABEÇALHO DO CHAT */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900/80 rounded-t-2xl">
        <h3 className="font-black text-zinc-100 flex items-center gap-2">
          <span className="text-blue-500">🔴</span> Chat ao Vivo
        </h3>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Sala #{grupoId}
        </span>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
        {mensagens.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center">
            <span className="text-3xl mb-2">💬</span>
            <p className="text-xs font-bold uppercase tracking-widest">Seja o primeiro a falar!</p>
          </div>
        ) : (
          mensagens.map((msg, index) => {
            const isMinha = msg.usuario.id === meuId;
            return (
              <div key={msg.id || index} className={`flex gap-3 max-w-[85%] ${isMinha ? "ml-auto flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {!isMinha && (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden border border-white/5">
                    {msg.usuario.fotoPerfil ? (
                      <img src={msg.usuario.fotoPerfil} alt={msg.usuario.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[10px] bg-blue-600">
                        {msg.usuario.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                {/* Balão de Mensagem */}
                <div className={`flex flex-col ${isMinha ? "items-end" : "items-start"}`}>
                  {!isMinha && <span className="text-[10px] font-bold text-zinc-500 mb-1 ml-1">{msg.usuario.nome}</span>}
                  
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMinha ? "bg-blue-600 text-white rounded-br-sm" : "bg-zinc-800 text-zinc-200 rounded-bl-sm border border-white/5"
                  }`}>
                    {msg.conteudo}
                  </div>
                  
                  <span className="text-[9px] text-zinc-600 font-semibold mt-1">
                    {new Date(msg.dataEnvio).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={fimDoChatRef} />
      </div>

      {/* ÁREA DE INPUT */}
      <div className="p-4 border-t border-white/5 bg-zinc-900/80 rounded-b-2xl">
        <form onSubmit={handleEnviar} className="flex gap-3">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Diga algo à malta..."
            className="flex-1 bg-zinc-800/80 border border-white/5 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            maxLength={300}
          />
          <button
            type="submit"
            disabled={!novaMensagem.trim()}
            className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white rounded-xl transition-all shadow-md flex-shrink-0"
          >
            ➤
          </button>
        </form>
      </div>
      
    </div>
  );
}