"use client";

import { useState, useRef, useEffect } from "react";

export default function BotaoCriarPost() {
  const [aberto, setAberto] = useState(false);
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Referência para focar no textarea assim que o modal abrir
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (aberto && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [aberto]);

  const fecharModal = () => {
    setAberto(false);
    setConteudo("");
    setErro(null);
  };

  const handleEnviar = async () => {
    const textoLimpo = conteudo.trim();
    
    // Validações de segurança antes de bater na API
    if (textoLimpo.length === 0) return;
    if (textoLimpo.length > 150) {
      setErro("Você ultrapassou o limite de 150 caracteres.");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;
      
      const resposta = await fetch("https://letrify.fly.dev/api/chat/enviar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // Como é um post inicial do Feed (Pai), o MensagemPaiId vai nulo
        body: JSON.stringify({ conteudo: textoLimpo, mensagemPaiId: null }) 
      });

      // Capturando a proteção Anti-Spam (Rate Limiting)
      if (resposta.status === 429) {
        setErro("Calma aí, velocista! Aguarde um minuto antes de postar novamente.");
        return;
      }

      if (!resposta.ok) {
        const dadosErro = await resposta.json();
        setErro(dadosErro.erro || "Falha ao enviar a mensagem. Tente novamente.");
        return;
      }

      // Sucesso! Limpa o form e fecha o modal.
      // O SignalR no page.tsx vai capturar a mensagem e exibir na tela instantaneamente.
      fecharModal();

    } catch (err) {
      setErro("Erro de conexão. Verifique sua internet.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* BOTÃO FLUTUANTE (FAB) */}
      <button 
        onClick={() => setAberto(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 rounded-full shadow-2xl shadow-blue-500/30 flex items-center justify-center text-white text-3xl font-light hover:scale-105 active:scale-95 transition-all z-40"
        aria-label="Criar novo post"
      >
        +
      </button>

      {/* MODAL / OVERLAY */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          
          {/* Fundo escuro com desfoque */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={fecharModal}
          ></div>

          {/* Caixa do Formulário */}
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl animate-slide-up sm:animate-zoom-in">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Novo Post</h2>
              <button 
                onClick={fecharModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm font-bold opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={conteudo}
              onChange={(e) => {
                setConteudo(e.target.value);
                if (erro) setErro(null); // Limpa o erro quando o usuário volta a digitar
              }}
              placeholder="O que você está lendo ou pensando agora?"
              className="w-full h-32 bg-zinc-800/50 border border-white/5 rounded-2xl p-4 text-white resize-none outline-none focus:border-blue-500/50 focus:bg-zinc-800 transition-all"
              maxLength={150}
              disabled={enviando}
            />

            {/* Mensagem de Erro (Rate Limit ou API) */}
            {erro && (
              <p className="text-red-400 text-xs font-semibold mt-2 animate-pulse">{erro}</p>
            )}

            <div className="flex justify-between items-center mt-4">
              
              {/* Contador de Caracteres */}
              <span className={`text-xs font-mono font-bold ${conteudo.length >= 150 ? "text-red-500" : "text-zinc-500"}`}>
                {conteudo.length}/150
              </span>

              {/* Botão Enviar */}
              <button
                onClick={handleEnviar}
                disabled={conteudo.trim().length === 0 || conteudo.length > 150 || enviando}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-bold rounded-full transition-colors"
              >
                {enviando ? "Enviando..." : "Publicar"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}