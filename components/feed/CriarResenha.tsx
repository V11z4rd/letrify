"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";
import { PaperAirplaneIcon, BookOpenIcon } from "@heroicons/react/24/outline";

interface LivroLido {
  livroId: number;
  titulo: string;
  autor: string;
  capaUrl: string;
}

interface CriarResenhaProps {
  onResenhaCreated?: () => void;
  grupoIdContexto?: string | number | null; // Caso publique direto em um clube
}

export default function CriarResenha({ onResenhaCreated, grupoIdContexto = null }: CriarResenhaProps) {
  const [livros, setLivros] = useState<LivroLido[]>([]);
  const [livroSelecionadoId, setLivroSelecionadoId] = useState<string>("");
  const [conteudo, setConteudo] = useState("");
  const [notaLivro, setNotaLivro] = useState<number>(5);
  
  const [carregandoLivros, setCarregandoLivros] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  // 1. CARREGA OS LIVROS LIDOS DO BACKEND REAL
  useEffect(() => {
    const token = authService.getToken();
    
    fetch(`${BASE_URL}/usuario/livroslidos`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then((res) => {
      if (!res.ok) throw new Error("Nenhum livro lido encontrado.");
      return res.json();
    })
    .then((dados) => {
      setLivros(dados || []);
    })
    .catch((err) => {
      setErro("Você precisa marcar algum livro como 'Lido' na estante antes de resenhar.");
    })
    .finally(() => setCarregandoLivros(false));
  }, [BASE_URL]);

  // Encontra o objeto do livro selecionado para exibir uma mini prévia da capa se quiser
  const livroSelecionado = livros.find(l => l.livroId === Number(livroSelecionadoId));

  const handlePublicarResenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim() || !livroSelecionadoId || enviando) return;

    if (conteudo.trim().length > 750) {
      setErro("A resenha excede o limite de 750 caracteres.");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const token = authService.getToken();
      
      // Rota exata da sua especificação: POST /api/chat/resenha
      const resposta = await fetch(`${BASE_URL}/chat/resenha`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          livroId: Number(livroSelecionadoId),
          conteudo: conteudo.trim(),
          notaLivro: notaLivro,
          grupoId: grupoIdContexto ? Number(grupoIdContexto) : null
        })
      });

      const data = await resposta.json();

      if (!resposta.ok) {
        throw new Error(data.erro || "Falha ao publicar resenha.");
      }

      // Reset de estados após sucesso
      setConteudo("");
      setLivroSelecionadoId("");
      setNotaLivro(5);
      
      if (onResenhaCreated) onResenhaCreated();
      
    } catch (err: any) {
      setErro(err.message || "Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handlePublicarResenha} className="flex flex-col gap-4 animate-fade-in">
      
      {/* SELEÇÃO DO LIVRO */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-widest font-black" style={{ color: 'var(--cor-primaria)' }}>
          Qual livro você quer resenhar?
        </label>
        
        {carregandoLivros ? (
          <span className="text-xs font-medium opacity-50 italic" style={{ color: 'var(--cor-texto-principal)' }}>
            Carregando sua estante...
          </span>
        ) : (
          <select
            value={livroSelecionadoId}
            onChange={(e) => {
              setLivroSelecionadoId(e.target.value);
              setErro(null);
            }}
            disabled={livros.length === 0}
            className="w-full text-xs font-bold rounded-xl p-3 outline-none border cursor-pointer transition-all"
            style={{ 
              backgroundColor: 'var(--cor-fundo-app)', 
              borderColor: 'var(--cor-fundo-sidebar)',
              color: 'var(--cor-texto-principal)'
            }}
            required
          >
            <option value="">-- Escolha um livro da sua lista de Lidos --</option>
            {livros.map((l) => (
              <option key={l.livroId} value={l.livroId}>
                {l.titulo} — {l.autor}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* SELEÇÃO DA NOTA EM ESTRELAS */}
      <div className="flex items-center gap-3 bg-opacity-20 p-2.5 rounded-xl border w-fit" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
        <span className="text-xs font-black opacity-70" style={{ color: 'var(--cor-texto-principal)' }}>Sua nota:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((estrela) => (
            <button
              key={estrela}
              type="button"
              onClick={() => setNotaLivro(estrela)}
              className="text-lg transition-transform active:scale-90"
              style={{ color: estrela <= notaLivro ? 'var(--cor-destaque, #f59e0b)' : 'var(--cor-texto-secundario)' }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DO TEXTO (750 CARACTERES) */}
      <div className="flex flex-col gap-1">
        <textarea
          value={conteudo}
          onChange={(e) => {
            setConteudo(e.target.value);
            if (erro) setErro(null);
          }}
          placeholder="Escreva sua resenha crítica... (O que achou da escrita, personagens, plot twists?)"
          className="w-full bg-transparent text-sm sm:text-base resize-none outline-none min-h-[120px] font-medium placeholder:opacity-30 border p-3 rounded-2xl"
          style={{ color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
          maxLength={750}
          required
        />
        
        <div className="flex justify-between items-center px-1 mt-1">
          <span className="text-[9px] font-mono font-bold opacity-30" style={{ color: 'var(--cor-texto-principal)' }}>
            {conteudo.length}/750 caracteres
          </span>
        </div>
      </div>

      {erro && <p className="text-red-500 text-xs font-bold px-1">{erro}</p>}

      {/* BOTÃO DE SUBMIT */}
      <div className="flex justify-end pt-2 border-t" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <button
          type="submit"
          disabled={enviando || !conteudo.trim() || !livroSelecionadoId}
          className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md active:scale-95 disabled:opacity-30"
          style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)' }}
        >
          <PaperAirplaneIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{enviando ? "Avaliando..." : "Publicar Resenha"}</span>
        </button>
      </div>

    </form>
  );
}