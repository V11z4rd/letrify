"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";

interface Livro {
  isbn?: string;
  titulo: string;
  autor: string;
  tema: string;
}

interface ListarLivrosProps {
  onSelecionarLivro?: (livro: Livro) => void;
  onFechar?: () => void;
}

export default function ListarLivros({ onSelecionarLivro, onFechar }: ListarLivrosProps) {
  const [pesquisa, setPesquisa] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<"titulo" | "autor" | "tema">("titulo");
  const [temaSelecionado, setTemaSelecionado] = useState<string | null>(null);
  
  // Estados para controle de dados da API
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Lista de temas preparada por nós (Letrify)
  const temasPredefinidos = [
    "Mistério", "Filosofia", "Romance", "História", 
    "Ficção Científica", "Distopia", "Fantasia", "Biografia"
  ];

  // Efeito para buscar livros na API com Debounce (atraso de 500ms na digitação)
  useEffect(() => {
    // Se o filtro for tema e nenhum tema foi clicado, limpa a lista e não busca
    if (filtroAtivo === "tema" && !temaSelecionado) {
      setLivros([]);
      return;
    }

    // Se não for filtro por tema e o campo de pesquisa estiver vazio, limpa a lista
    if (filtroAtivo !== "tema" && pesquisa.trim().length < 2) {
      setLivros([]);
      return;
    }

    const buscarDados = async () => {
      setCarregando(true);
      setErro(null);

      try {
        let url = "https://letrify.fly.dev/api/livro";
        const params = new URLSearchParams({
          pagina: "1",
          quantidade: "15"
        });

        // Configura o endpoint e o parâmetro correto com base no botão ativo
        if (filtroAtivo === "tema" && temaSelecionado) {
          url += "/livrostema";
          params.append("tema", temaSelecionado);
          // Caso queira refinar o tema com texto digitado na barra superior
          if (pesquisa.trim()) params.append("titulo", pesquisa); 
        } else if (filtroAtivo === "titulo") {
          url += "/livrostitulo";
          params.append("titulo", pesquisa);
        } else if (filtroAtivo === "autor") {
          url += "/livrosautor";
          params.append("autor", pesquisa);
        }

        const resposta = await fetch(`${url}?${params.toString()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (!resposta.ok) throw new Error("Não foi possível buscar os livros.");

        const dadosDaApi = await resposta.json();

        // Mapeamento preventivo tratando variações de retorno (inglês/português) da API
        const livrosTratados = (Array.isArray(dadosDaApi) ? dadosDaApi : dadosDaApi.resultados || []).map((item: any) => ({
          titulo: item.titulo || item.title || "Título Desconhecido",
          autor: item.autor || item.author || item.author_name?.[0] || "Autor Desconhecido",
          tema: item.tema || item.subject?.[0] || temaSelecionado || "Geral",
          isbn: item.isbn || item.isbn?.[0] || ""
        }));

        setLivros(livrosTratados);
      } catch (err: any) {
        console.error(err);
        setErro("Erro ao carregar obras da Open Library.");
      } finally {
        setCarregando(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      buscarDados();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [pesquisa, filtroAtivo, temaSelecionado]);

  return (
    <section className="bg-zinc-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in backdrop-blur-md max-w-lg w-full mx-auto">
      {/* CABEÇALHO */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200">🔍 Buscar Obra (Open Library)</h3>
        {onFechar && (
          <button 
            onClick={onFechar} 
            className="text-xs font-bold text-zinc-500 hover:text-white transition-colors"
          >
            [ fechar ]
          </button>
        )}
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder={
            filtroAtivo === "tema" && temaSelecionado 
              ? `Filtrar título em ${temaSelecionado}...` 
              : `Digite para buscar por ${filtroAtivo === "titulo" ? "nome do livro" : filtroAtivo}...`
          }
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
        />
      </div>

      {/* SELETORES DE FILTRO */}
      <div className="flex gap-2 mb-6">
        {(["titulo", "autor", "tema"] as const).map((tipo) => (
          <button
            key={tipo}
            onClick={() => {
              setFiltroAtivo(tipo);
              setPesquisa(""); // Limpa o campo para nova busca clara
              if (tipo !== "tema") setTemaSelecionado(null);
            }}
            className={`flex-1 py-2 text-[10px] uppercase font-black tracking-wider rounded-lg border transition-all ${
              filtroAtivo === tipo
                ? "bg-blue-500/10 border-blue-500 text-blue-500 shadow-md shadow-blue-500/5"
                : "bg-transparent border-white/5 text-zinc-400 opacity-60 hover:opacity-100"
            }`}
          >
            {tipo === "titulo" ? "Nome" : tipo}
          </button>
        ))}
      </div>

      {/* COMPONENTE INTERNO: GRADE DE TEMAS PREPARADOS */}
      {filtroAtivo === "tema" && (
        <div className="mb-6 animate-fade-in">
          <p className="text-[10px] uppercase font-black tracking-wider text-zinc-500 mb-3">Nossos Temas:</p>
          <div className="grid grid-cols-2 gap-2">
            {temasPredefinidos.map((tema) => (
              <button
                key={tema}
                onClick={() => {
                  setTemaSelecionado(tema === temaSelecionado ? null : tema);
                  setPesquisa(""); // Limpa refino de input ao trocar categoria
                }}
                className={`py-2 px-3 text-left text-xs font-bold rounded-xl border transition-all ${
                  temaSelecionado === tema
                    ? "bg-zinc-100 text-zinc-950 border-white"
                    : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {temaSelecionado === tema ? `✅ ${tema}` : tema}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CONTAINER DA LISTAGEM DE LIVROS RESULTANTES */}
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
        {carregando && (
          <div className="text-center py-10 text-xs font-bold text-zinc-500 animate-pulse">
            🌐 Vasculhando acervo internacional...
          </div>
        )}

        {erro && (
          <div className="text-center py-10 text-xs font-semibold text-red-400">
            {erro}
          </div>
        )}

        {!carregando && !erro && livros.length > 0 ? (
          livros.map((livro, idx) => (
            <div
              key={idx}
              onClick={() => onSelecionarLivro?.(livro)}
              className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all cursor-pointer group"
            >
              {/* Capa */}
              <div className="w-10 h-14 bg-zinc-800 rounded-md flex items-center justify-center border border-white/5 overflow-hidden shadow-md shrink-0 relative">
                {livro.isbn ? (
                  <img
                    src={`https://covers.openlibrary.org/b/isbn/${livro.isbn}-M.jpg`}
                    alt="Capa"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      // Oculta imagem quebrada se a Open Library não possuir a capa deste ISBN
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-xs opacity-30">📖</span>
                )}
              </div>

              {/* Informações */}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-zinc-100 truncate group-hover:text-blue-400 transition-colors">
                  {livro.titulo}
                </h4>
                <p className="text-xs text-zinc-400 font-medium truncate mt-0.5">
                  {livro.autor}
                </p>
                <span className="inline-block bg-blue-500/10 text-blue-400 font-mono font-bold text-[9px] uppercase px-1.5 py-0.5 rounded mt-1">
                  {livro.tema}
                </span>
              </div>
            </div>
          ))
        ) : (
          !carregando && !erro && (
            <p className="opacity-40 italic text-center text-xs py-8">
              {filtroAtivo === "tema" && !temaSelecionado 
                ? "Escolha um tema acima para listar as obras."
                : "Digite ao menos 2 caracteres para pesquisar."}
            </p>
          )
        )}
      </div>
    </section>
  );
}