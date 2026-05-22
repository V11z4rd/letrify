"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/app/lib/api"; 
import { LivroDados } from "@/components/CardLivro"; 
import { 
  MagnifyingGlassIcon, 
  StarIcon as StarIconOutline,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface ListarLivrosProps {
  onFechar?: () => void;
}

export default function ListarLivros({ onFechar }: ListarLivrosProps) {
  const [pesquisa, setPesquisa] = useState("");
  const [livros, setLivros] = useState<LivroDados[]>([]); 
  const [idLivroFavorito, setIdLivroFavorito] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [favoritandoId, setFavoritandoId] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  // 1. BUSCA DIRETAMENTE NA ROTA DE TÍTULOS
  useEffect(() => {
    if (pesquisa.trim().length < 3) {
      setLivros([]);
      return;
    }

    const buscarLivrosDoLetrify = async () => {
      setCarregando(true);
      setErro("");
      try {
        const endpoint = `/livro/livrostitulo?titulo=${encodeURIComponent(pesquisa)}&quantidade=10`;
        const resposta = await apiFetch(endpoint);

        if (!resposta.ok) throw new Error("Não foi possível encontrar livros com esse título.");
        
        const dados = await resposta.json();
        setLivros(dados || []); 
      } catch (err: any) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      buscarLivrosDoLetrify();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [pesquisa]);

  // 2. SALVA O FAVORITO ENVIANDO OS DADOS CORRETOS
  const handleFavoritarLivro = async (livro: LivroDados) => {
    // A API usa 'isbn' como o identificador mestre do livro aqui
    const livroId = livro.isbn || (livro as any).id || (livro as any)._id;
    if (!livroId) return;

    setFavoritandoId(livroId);
    setErro("");

    const urlCapaFinal = livro.isbn ? `https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg` : "";

    try {
      const resposta = await apiFetch(`/favoritos/add`, {
        method: "POST",
        body: JSON.stringify({ 
          id: livroId,
          titulo: livro.titulo,
          autor: (livro as any).autorPrincipal || livro.autor || "Autor Desconhecido",
          capaUrl: urlCapaFinal
        })
      });

      if (!resposta.ok) throw new Error("Erro ao definir este livro como seu favorito.");

      setIdLivroFavorito(livroId);

      if (onFechar) {
        setTimeout(() => onFechar(), 800);
      }

    } catch (err: any) {
      setErro(err.message);
    } finally {
      setFavoritandoId(null);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto animate-fade-in">
      
      {/* BARRA DE PESQUISA */}
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex items-center group flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
          <input 
            type="text"
            placeholder="Buscar livro por título..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="w-full p-3.5 pl-12 rounded-2xl border bg-transparent text-sm outline-none transition-all duration-200"
            style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--cor-primaria)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--cor-fundo-sidebar)'}
          />
          {carregando && (
            <ArrowPathIcon className="w-4 h-4 absolute right-4 animate-spin opacity-60" style={{ color: 'var(--cor-primaria)' }} />
          )}
        </div>

        {onFechar && (
          <button 
            onClick={onFechar}
            className="p-3.5 rounded-2xl border transition-all active:scale-95 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
            style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
          >
            <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* FEEDBACK DE ERRO */}
      {erro && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-wider flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>{erro}</span>
        </div>
      )}

      {/* RESULTADOS DA BUSCA */}
      {livros.length > 0 && (
        <div 
          className="rounded-2xl border overflow-hidden shadow-xl animate-scale-up"
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          {livros.map((livro, index) => {
            const livroId = livro.isbn || (livro as any).id || (livro as any)._id;
            const ehFavorito = idLivroFavorito === livroId;
            const estaSalvando = favoritandoId === livroId;

            // 🌟 A MÁGICA DA CAPA: Como a sua API envia o isbn puro, montamos o link oficial por ele!
            const urlImagemFinal = livro.isbn 
              ? `https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg` 
              : "";

            // Coleta o nome correto do autor enviado pelo seu Back-end
            const autorFinal = (livro as any).autorPrincipal || livro.autor || "Autor não informado";

            return (
              <div 
                key={livroId || index} 
                className={`p-4 flex items-center justify-between gap-4 transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01] ${
                  index !== 0 ? 'border-t' : ''
                }`}
                style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
              >
                <div className="flex items-center gap-4">
                  {/* CONTAINER DA CAPA */}
                  <div className="w-12 h-16 rounded-md bg-black/5 dark:bg-white/5 shrink-0 flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10 shadow-sm">
                    {urlImagemFinal ? (
                      <img 
                        src={urlImagemFinal} 
                        alt={livro.titulo} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          // Se o livro não possuir capa cadastrada no servidor da Open Library, mostra o fallback
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-[9px] font-black opacity-30 tracking-wider">CAPA</span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm tracking-tight text-left" style={{ color: 'var(--cor-texto-principal)' }}>
                      {livro.titulo}
                    </span>
                    <span className="text-xs opacity-60 text-left" style={{ color: 'var(--cor-texto-secundario)' }}>
                      {autorFinal}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleFavoritarLivro(livro)}
                  disabled={estaSalvando}
                  className="p-2.5 rounded-xl border transition-all duration-200 active:scale-95 disabled:opacity-50"
                  style={{ 
                    borderColor: ehFavorito ? 'transparent' : 'var(--cor-fundo-sidebar)',
                    backgroundColor: ehFavorito ? 'var(--cor-primaria)' : 'transparent'
                  }}
                >
                  {estaSalvando ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin stroke-[2.5]" style={{ color: 'var(--cor-primaria)' }} />
                  ) : ehFavorito ? (
                    <StarIconSolid className="w-4 h-4 text-white animate-scale-up" />
                  ) : (
                    <StarIconOutline className="w-4 h-4 opacity-40 hover:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}