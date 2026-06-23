"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { dmService, ConversaResumo, MensagemDireta } from "@/app/lib/dmService";
import { authService } from "@/app/lib/authService";
import { signalRService } from "@/app/lib/signalrService";
import { 
  PaperAirplaneIcon, 
  ArrowLeftIcon,
  UserCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function MensagensPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idInicial = searchParams.get("id"); 

  const meuId = Number(authService.getUserId());

  const [conversas, setConversas] = useState<ConversaResumo[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<ConversaResumo | null>(null);
  const [mensagens, setMensagens] = useState<MensagemDireta[]>([]);
  
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregandoConversas, setCarregandoConversas] = useState(true);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);

  const mensagensEndRef = useRef<HTMLDivElement>(null);

  // 👇 MÁGICA 1: Normalizador de conversas (Protege contra letras maiúsculas/minúsculas do C#)
  const normalizarConversa = (c: any): ConversaResumo => {
    const outroObj = c.outroUsuario ?? c.OutroUsuario ?? {};
    
    // Captura a última mensagem (string ou objeto)
    const msgUltimaRaw = c.ultimaMensagem ?? c.UltimaMensagem;
    const textoUltimaMsg = typeof msgUltimaRaw === 'object' && msgUltimaRaw !== null
        ? (msgUltimaRaw.conteudo ?? msgUltimaRaw.Conteudo ?? "") 
        : (msgUltimaRaw || "");

    return {
      // O C# retorna c.Id para identificar a conversa!
      conversaId: c.id ?? c.Id ?? c.conversaId ?? c.ConversaId ?? 0,
      outroUsuario: {
        id: outroObj.id ?? outroObj.Id ?? 0,
        nome: outroObj.nome ?? outroObj.Nome ?? "Usuário",
        fotoPerfil: outroObj.fotoPerfil ?? outroObj.FotoPerfil ?? ""
      },
      ultimaMensagem: textoUltimaMsg,
      dataUltimaMensagem: c.dataUltimaMensagem ?? c.DataUltimaMensagem ?? "",
      naoLidas: c.naoLidas ?? c.NaoLidas ?? 0
    };
  };

  const normalizarMensagem = (m: any): MensagemDireta => {
    // Captura o remetente tanto do GET (RemetenteId) quanto do SignalR (Remetente: { Id })
    const remetenteObj = m.remetente ?? m.Remetente ?? {};
    const remetenteIdReal = m.remetenteId ?? m.RemetenteId ?? remetenteObj.id ?? remetenteObj.Id ?? 0;

    return {
      id: m.id ?? m.Id ?? 0,
      remetenteId: remetenteIdReal,
      destinatarioId: m.destinatarioId ?? m.DestinatarioId ?? 0,
      conteudo: m.conteudo ?? m.Conteudo ?? "",
      dataEnvio: m.dataEnvio ?? m.DataEnvio ?? new Date().toISOString(),
      lida: m.lida ?? m.Lida ?? false
    };
  };

  const carregarConversas = async () => {
    try {
      const dados = await dmService.listarConversas();
      // Aplica a normalização imediatamente
      const conversasLimpas = dados.map(normalizarConversa);
      setConversas(conversasLimpas);
      
      if (idInicial && !conversaAtiva) {
        const chatExistente = conversasLimpas.find(c => String(c.outroUsuario.id) === idInicial);
        if (chatExistente) {
          setConversaAtiva(chatExistente);
        } else {
          setConversaAtiva({
            conversaId: 0, 
            outroUsuario: { id: Number(idInicial), nome: "Novo Chat", fotoPerfil: "" },
            ultimaMensagem: "",
            dataUltimaMensagem: "",
            naoLidas: 0
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setCarregandoConversas(false);
    }
  };

  useEffect(() => {
    carregarConversas();
    
    // Escuta SignalR
    signalRService.onReceberMensagemDireta((novaMsgRaw: any) => {
      const novaMsg = normalizarMensagem(novaMsgRaw);
      
      setConversas(prevConversas => {
        const novasConversas = [...prevConversas];
        const index = novasConversas.findIndex(c => 
          c.outroUsuario.id === novaMsg.remetenteId || c.outroUsuario.id === novaMsg.destinatarioId
        );
        
        if (index !== -1) {
          novasConversas[index].ultimaMensagem = novaMsg.conteudo;
          novasConversas[index].dataUltimaMensagem = novaMsg.dataEnvio;
          if (conversaAtiva?.outroUsuario.id !== novaMsg.remetenteId) {
            novasConversas[index].naoLidas += 1;
          }
          const [chatMovido] = novasConversas.splice(index, 1);
          novasConversas.unshift(chatMovido);
        } else {
          carregarConversas();
        }
        return novasConversas;
      });

      setConversaAtiva(atual => {
        if (atual && (novaMsg.remetenteId === atual.outroUsuario.id || novaMsg.destinatarioId === atual.outroUsuario.id)) {
          setMensagens(prev => [...prev, novaMsg]);
          scrollToBottom();
        }
        return atual;
      });
    });
  }, []);

  useEffect(() => {
    if (conversaAtiva && conversaAtiva.conversaId !== 0) {
      const carregarHistorico = async () => {
        setCarregandoMensagens(true);
        try {
          const hist = await dmService.buscarHistorico(conversaAtiva.conversaId);
          const histLimpo = hist.map(normalizarMensagem);
          setMensagens(histLimpo.reverse()); 
          scrollToBottom();
          
          setConversas(prev => prev.map(c => 
            c.conversaId === conversaAtiva.conversaId ? { ...c, naoLidas: 0 } : c
          ));
        } catch (error) {
          console.error(error);
        } finally {
          setCarregandoMensagens(false);
        }
      };
      carregarHistorico();
    } else if (conversaAtiva?.conversaId === 0) {
      setMensagens([]); 
    }
  }, [conversaAtiva]);

  const scrollToBottom = () => {
    setTimeout(() => {
      mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !conversaAtiva || enviando) return;

    setEnviando(true);
    // Salva o texto antes de limpar o input
    const textoEnviado = texto.trim(); 
    setTexto("");

    try {
      // A API devolve: { mensagem: "Mensagem enviada!", conversaId: X, mensagemId: Y }
      const respostaApiRaw = await dmService.enviarMensagem(conversaAtiva.outroUsuario.id, textoEnviado);
      
      // Montamos a mensagem manualmente para desenhar na tela imediatamente!
      const msgEnviada: MensagemDireta = {
        id: respostaApiRaw.mensagemId ?? respostaApiRaw.MensagemId ?? Date.now(),
        remetenteId: meuId,
        destinatarioId: conversaAtiva.outroUsuario.id,
        conteudo: textoEnviado, // Colocamos o texto aqui!
        dataEnvio: new Date().toISOString(),
        lida: false
      };

      setMensagens(prev => [...prev, msgEnviada]);
      scrollToBottom();
      
      setConversas(prev => {
        const novas = [...prev];
        const index = novas.findIndex(c => c.outroUsuario.id === conversaAtiva.outroUsuario.id);
        if (index !== -1) {
          novas[index].ultimaMensagem = msgEnviada.conteudo;
          novas[index].dataUltimaMensagem = msgEnviada.dataEnvio;
          const [chat] = novas.splice(index, 1);
          novas.unshift(chat);
        } else {
          carregarConversas();
        }
        return novas;
      });
      
      // Atualiza o ID da conversa se for um chat totalmente novo
      if (conversaAtiva.conversaId === 0) {
         const novoId = respostaApiRaw.conversaId ?? respostaApiRaw.ConversaId;
         setConversaAtiva(prev => prev ? { ...prev, conversaId: novoId } : prev);
         carregarConversas(); 
      }
    } catch (error: any) {
      alert(error.message); 
      // Se deu erro (ex: não seguem mutuamente), devolve o texto para o input
      setTexto(textoEnviado);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] flex border rounded-3xl overflow-hidden shadow-sm bg-[var(--cor-fundo-card)]" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
      
      {/* 1. LATERAL: LISTA DE CONVERSAS 
          No telemóvel: Mostra se NÃO houver conversa ativa. Esconde se houver.
          No Desktop (md:): Mostra sempre. */}
      <div 
        className={`${conversaAtiva ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 flex-col border-r h-full transition-all`} 
        style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <div className="p-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>Mensagens</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {carregandoConversas ? (
            <div className="flex justify-center p-8 opacity-50"><ArrowPathIcon className="w-6 h-6 animate-spin" /></div>
          ) : conversas.length === 0 ? (
            <div className="text-center p-8 opacity-50 text-sm font-medium">Nenhuma conversa iniciada.</div>
          ) : (
            conversas.map(chat => (
              <button
                key={`user-${chat.outroUsuario.id}`} // 👈 Chave TS perfeita e segura!
                onClick={() => setConversaAtiva(chat)}
                className={`w-full p-4 flex items-center gap-3 border-b text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${conversaAtiva?.outroUsuario.id === chat.outroUsuario.id ? 'bg-black/5 dark:bg-white/5' : ''}`}
                style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
              >
                {chat.outroUsuario.fotoPerfil ? (
                  <img src={chat.outroUsuario.fotoPerfil} alt={chat.outroUsuario.nome} className="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800"><UserCircleIcon className="w-8 h-8 opacity-50" /></div>
                )}
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm truncate" style={{ color: 'var(--cor-texto-principal)' }}>{chat.outroUsuario.nome}</span>
                  </div>
                  <p className={`text-xs truncate ${chat.naoLidas > 0 ? 'font-bold' : 'opacity-60'}`} style={{ color: chat.naoLidas > 0 ? 'var(--cor-texto-principal)' : 'var(--cor-texto-secundario)' }}>
                    {chat.ultimaMensagem || 'Inicie a conversa'}
                  </p>
                </div>
                {chat.naoLidas > 0 && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0" style={{ backgroundColor: 'var(--cor-destaque)', color: 'white' }}>
                    {chat.naoLidas > 9 ? '9+' : chat.naoLidas}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. ÁREA CENTRAL: O CHAT ATIVO 
          No telemóvel: Esconde se NÃO houver conversa ativa. Mostra se houver.
          No Desktop (md:): Mostra sempre. */}
      <div 
        className={`${!conversaAtiva ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 flex-col h-full bg-black/[0.02] dark:bg-white/[0.02]`}
      >
        {conversaAtiva ? (
          <>
            {/* Header do Chat Ativo */}
            <div className="p-4 border-b flex items-center gap-3 shrink-0 bg-[var(--cor-fundo-card)] z-10 shadow-sm" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
              {/* 👇 Botão de voltar exclusivo para o Mobile (md:hidden) */}
              <button 
                onClick={() => setConversaAtiva(null)} 
                className="md:hidden p-2 -ml-2 rounded-full hover:bg-black/10 active:scale-95"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>

              {conversaAtiva.outroUsuario.fotoPerfil ? (
                <img src={conversaAtiva.outroUsuario.fotoPerfil} alt={conversaAtiva.outroUsuario.nome} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-10 h-10 opacity-50" />
              )}
              <span className="font-black text-lg" style={{ color: 'var(--cor-texto-principal)' }}>{conversaAtiva.outroUsuario.nome}</span>
            </div>

            {/* Feed de Balões de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {carregandoMensagens ? (
                <div className="flex justify-center p-8 opacity-50"><ArrowPathIcon className="w-6 h-6 animate-spin" /></div>
              ) : (
                <>
                  <div className="text-center opacity-40 text-[10px] font-bold uppercase tracking-widest my-6">Início da conversa criptografada</div>
                  {mensagens.map((msg, idx) => {
                    const isMinha = msg.remetenteId === meuId;
                    return (
                      <div key={msg.id || idx} className={`flex flex-col ${isMinha ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`max-w-[75%] p-3 text-sm shadow-sm ${isMinha ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}
                          style={{ 
                            backgroundColor: isMinha ? 'var(--cor-primaria)' : 'var(--cor-fundo-sidebar)',
                            color: isMinha ? 'var(--cor-botao-texto)' : 'var(--cor-texto-principal)'
                          }}
                        >
                          {msg.conteudo}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={mensagensEndRef} />
                </>
              )}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleEnviar} className="p-3 sm:p-4 border-t shrink-0 flex gap-2" style={{ borderColor: 'var(--cor-fundo-sidebar)', backgroundColor: 'var(--cor-fundo-card)' }}>
              <input 
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 bg-transparent border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-shadow"
                style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)', '--tw-ring-color': 'var(--cor-primaria)' } as any}
              />
              <button 
                type="submit"
                disabled={!texto.trim() || enviando}
                className="p-3 rounded-full flex items-center justify-center transition-all disabled:opacity-50 active:scale-95 shadow-sm"
                style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)' }}
              >
                {enviando ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5 -ml-1" />}
              </button>
            </form>
          </>
        ) : (
          /* Blank State (Ecrã Inicial no Desktop) */
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <PaperAirplaneIcon className="w-20 h-20 mb-4 stroke-[1]" />
            <h3 className="text-2xl font-black tracking-tight">Suas Mensagens</h3>
            <p className="text-sm font-medium mt-2 max-w-xs text-center leading-relaxed">Selecione uma conversa ao lado para começar a ler ou enviar mensagens.</p>
          </div>
        )}
      </div>
    </div>
  );
}