"use client";

import { useState, FormEvent } from "react";
import CardLivro, { LivroDados } from "@/components/CardLivro";
import CardPerfil, { PerfilDados } from "@/components/CardPerfil";
import { 
  MagnifyingGlassIcon,
  UserCircleIcon,
  BookOpenIcon,
  PencilIcon,
  SparklesIcon,
  ArrowPathIcon,
  HashtagIcon,
  ExclamationCircleIcon,
  ChatBubbleBottomCenterTextIcon
} from "@heroicons/react/24/outline";

const tradutorTemas: Record<string, string> = {
  "fantasia": "fantasy",
  "ficção": "fiction",
  "ficcao": "fiction",
  "terror": "horror",
  "horror": "horror",
  "romance": "romance",
  "ciência": "science",
  "ciencia": "science",
  "filosofia": "philosophy",
  "história": "history",
  "historia": "history"
};

export default function BuscaLivrosPage() {
  const [termo, setTermo] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);
  
  // 👇 NOVO: Controle do modo de busca (Tradicional ou Semântica por IA)
  const [modoBusca, setModoBusca] = useState<"comum" | "semantica">("comum");

  const [prateleiras, setPrateleiras] = useState({
    isbn: [] as LivroDados[],
    titulos: [] as LivroDados[],
    autores: [] as LivroDados[],
    temas: [] as LivroDados[],
    perfis: [] as PerfilDados[],
    semantica: [] as LivroDados[] // 👈 NOVA: Prateleira da Inteligência Artificial
  });

  const fetchSeguro = async (url: string, chaveDados?: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const dados = await res.json();
      
      if (chaveDados && dados[chaveDados]) {
        return dados[chaveDados];
      }
      
      if (!Array.isArray(dados) && typeof dados === "object") {
        return dados.resultados || dados.usuarios || dados.content || [dados];
      }

      return Array.isArray(dados) ? dados : [dados];
    } catch {
      return [];
    }
  };

  const realizarBusca = async (e?: FormEvent, termoDireto?: string) => {
    if (e) e.preventDefault();
    const textoBusca = termoDireto || termo;
    if (!textoBusca.trim()) return;

    setCarregando(true);
    setBuscaFeita(true);
    
    // Limpa todas as prateleiras antes de buscar
    setPrateleiras({ isbn: [], titulos: [], autores: [], temas: [], perfis: [], semantica: [] });

    try {
      // =========================================================
      // 🧠 ROTA 1: BUSCA SEMÂNTICA (INTELIGÊNCIA ARTIFICIAL)
      // =========================================================
      if (modoBusca === "semantica") {
        const res = await fetch("https://letrify.fly.dev/api/livro/busca/semantica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Texto: textoBusca })
        });
        
        if (res.ok) {
          const dadosRecomendados = await res.json();
          setPrateleiras(prev => ({ ...prev, semantica: dadosRecomendados }));
        }
      } 
      // =========================================================
      // 🔍 ROTA 2: BUSCA TRADICIONAL (ISBN, Título, Autor, Perfil)
      // =========================================================
      else {
        const apenasNumeros = textoBusca.replace(/\D/g, '');
        const isIsbn = apenasNumeros.length === 10 || apenasNumeros.length === 13;

        if (isIsbn) {
          const livrosIsbn = await fetchSeguro(`https://letrify.fly.dev/api/livro/livroespecifico/${apenasNumeros}`);
          setPrateleiras(prev => ({ ...prev, isbn: livrosIsbn }));
          setCarregando(false);
          return;
        }

        const termoLimpo = textoBusca.toLowerCase().trim();
        const termoTema = tradutorTemas[termoLimpo] || textoBusca;

        const urlTitulo = `https://letrify.fly.dev/api/livro/livrostitulo?titulo=${encodeURIComponent(textoBusca)}&quantidade=10`;
        const urlAutor = `https://letrify.fly.dev/api/livro/livrosautor?autor=${encodeURIComponent(textoBusca)}&quantidade=10`;
        const urlTema = `https://letrify.fly.dev/api/livro/livrostema?tema=${encodeURIComponent(termoTema)}&quantidade=10`;
        const urlPerfis = `https://letrify.fly.dev/api/usuario/usuariosPorNome?nome=${encodeURIComponent(textoBusca)}&pagina=1&tamanhoPagina=10`;

        const [resultadosTitulos, resultadosAutores, resultadosTemas, resultadosPerfis] = await Promise.all([
          fetchSeguro(urlTitulo),
          fetchSeguro(urlAutor),
          fetchSeguro(urlTema),
          fetchSeguro(urlPerfis)
        ]);

        setPrateleiras(prev => ({
          ...prev,
          titulos: resultadosTitulos,
          autores: resultadosAutores,
          temas: resultadosTemas,
          perfis: resultadosPerfis
        }));
      }
    } catch (error) {
      console.error("Erro ao realizar busca:", error);
    } finally {
      setCarregando(false);
    }
  };

  const tudoVazio = buscaFeita && !carregando && 
    prateleiras.isbn.length === 0 && 
    prateleiras.titulos.length === 0 && 
    prateleiras.autores.length === 0 && 
    prateleiras.temas.length === 0 &&
    prateleiras.perfis.length === 0 &&
    prateleiras.semantica.length === 0;

  // Sugestões visuais que mudam dependendo do modo de busca!
  const sugestoesComuns = ["Fantasia", "Ficção", "Romance", "Terror", "Ciência", "Filosofia"];
  const sugestoesIA = ["Me faça chorar", "Aventura épica espacial", "Mistério de detetive", "Romance levinho", "Terror psicológico"];
  const tagsParaExibir = modoBusca === "semantica" ? sugestoesIA : sugestoesComuns;

  return (
    <div className="max-w-7xl mx-auto pt-6 px-4 pb-24 animate-fade-in">
      
      {/* 1. SEÇÃO DE CAMPO DE BUSCA */}
      <div className="mb-14 flex flex-col items-center text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--cor-texto-principal)' }}>
          Explorar
        </h1>
        <p className="text-xs sm:text-sm font-medium opacity-60 mb-6" style={{ color: 'var(--cor-texto-secundario)' }}>
          {modoBusca === "semantica" 
            ? "A Inteligência Artificial vai analisar os sentimentos e encontrar o livro perfeito."
            : "Descubra obras, mapeie autores, encontre leitores e vasculhe novos horizontes."}
        </p>
        
        {/* 👇 TOGGLE PARA TROCAR O MODO DE BUSCA 👇 */}
        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl w-fit mx-auto mb-6">
          <button 
            type="button" 
            onClick={() => { setModoBusca("comum"); setBuscaFeita(false); }}
            className={`px-5 sm:px-6 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${modoBusca === "comum" ? 'bg-[var(--cor-fundo-card)] shadow-sm text-[var(--cor-texto-principal)]' : 'text-[var(--cor-texto-secundario)] opacity-60 hover:opacity-100'}`}
          >
            <MagnifyingGlassIcon className="w-4 h-4 stroke-[2.5]" />
            Busca Exata
          </button>
          <button 
            type="button" 
            onClick={() => { setModoBusca("semantica"); setBuscaFeita(false); }}
            className={`px-5 sm:px-6 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${modoBusca === "semantica" ? 'bg-[var(--cor-fundo-card)] shadow-sm text-[var(--cor-destaque)]' : 'text-[var(--cor-texto-secundario)] opacity-60 hover:opacity-100'}`}
          >
            <SparklesIcon className="w-4 h-4 stroke-[2.5]" />
            Inteligência Artificial
          </button>
        </div>

        <form 
          onSubmit={realizarBusca} 
          className="w-full relative flex items-center shadow-lg rounded-2xl overflow-hidden border transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-0 focus-within:border-[var(--cor-destaque)]" 
          style={{ 
            borderColor: modoBusca === "semantica" ? 'var(--cor-destaque)' : 'var(--cor-fundo-sidebar)', 
            backgroundColor: 'var(--cor-fundo-card)' 
          }}
        >
          <div className="pl-4 opacity-40">
            {modoBusca === "semantica" ? (
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 stroke-[2.5]" style={{ color: 'var(--cor-destaque)' }} />
            ) : (
              <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" style={{ color: 'var(--cor-texto-principal)' }} />
            )}
          </div>
          <input 
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder={modoBusca === "semantica" ? "Descreva o que você quer sentir lendo..." : "Livros, autores, tags, leitores ou ISBN..."}
            className="flex-1 p-3.5 pl-3 bg-transparent outline-none text-xs sm:text-sm font-semibold placeholder:opacity-40"
            style={{ color: 'var(--cor-texto-principal)' }}
          />
          <button 
            type="submit"
            disabled={carregando}
            className="w-28 h-[52px] flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 shrink-0"
            style={{ backgroundColor: modoBusca === "semantica" ? 'var(--cor-destaque)' : 'var(--cor-primaria)', color: '#ffffff' }}
          >
            {carregando ? <ArrowPathIcon className="w-4 h-4 animate-spin stroke-[3]" /> : (modoBusca === "semantica" ? "Sentir" : "Buscar")}
          </button>
        </form>

        {/* 👇 TAGS RÁPIDAS QUE MUDAM CONSOANTE O MODO 👇 */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {tagsParaExibir.map((tag) => (
            <button
              key={tag}
              onClick={() => { setTermo(tag); realizarBusca(undefined, tag); }}
              className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: 'var(--cor-fundo-card)', 
                color: 'var(--cor-texto-principal)', 
                borderColor: modoBusca === "semantica" ? 'rgba(var(--cor-destaque-rgb), 0.3)' : 'var(--cor-fundo-sidebar)' 
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ESTADOS DE FEEDBACK */}
      {carregando && (
        <div 
          className="flex flex-col items-center justify-center py-20 text-xs font-black uppercase tracking-widest gap-3 animate-pulse"
          style={{ color: 'var(--cor-texto-secundario)' }}
        >
          <ArrowPathIcon className="w-7 h-7 animate-spin" style={{ color: modoBusca === "semantica" ? 'var(--cor-destaque)' : 'var(--cor-primaria)' }} />
          <span>{modoBusca === "semantica" ? "A IA está a analisar o cosmos literário..." : "Vasculhando os acervos da biblioteca..."}</span>
        </div>
      )}

      {tudoVazio && (
        <div 
          className="text-center py-20 border-2 border-dashed rounded-3xl max-w-xl mx-auto p-6 flex flex-col items-center animate-fade-in" 
          style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <ExclamationCircleIcon className="w-6 h-6 text-red-500" />
          </div>
          <p className="font-black text-lg tracking-tight mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Nenhum resultado encontrado</p>
          <p className="text-xs font-medium opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>
            Não localizamos títulos ou perfis associados ao termo <span className="font-bold">"{termo}"</span>.
          </p>
        </div>
      )}

      {/* 3. CONTEÚDO DISTRIBUÍDO EM LINHAS */}
      {!carregando && buscaFeita && (
        <div className="space-y-14">

          {/* 🧠 NOVA PRATELEIRA: INTELIGÊNCIA ARTIFICIAL */}
          {prateleiras.semantica.length > 0 && (
            <section className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-destaque)' }}>
                  <SparklesIcon className="w-5 h-5 stroke-[2.5]" />
                  <span>Leituras Perfeitas Recomendadas pela IA</span>
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-5 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {prateleiras.semantica.map((livro, i) => (
                  <div key={`semantica-${i}`} className="min-w-[240px] sm:min-w-[260px] snap-start shrink-0">
                    <CardLivro livro={livro} variante="busca" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PRATELEIRA: PERFIS DE USUÁRIOS */}
          {prateleiras.perfis.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                <UserCircleIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Perfis Relacionados</span>
              </h2>
              <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {prateleiras.perfis.map((perfil, i) => (
                  <CardPerfil key={perfil.id || i} perfil={perfil} />
                ))}
              </div>
            </section>
          )}

          {/* PRATELEIRA: ISBN */}
          {prateleiras.isbn.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                <HashtagIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Resultado por Código ISBN</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {prateleiras.isbn.map((livro, i) => <CardLivro key={`isbn-${i}`} livro={livro} variante="busca" />)}
              </div>
            </section>
          )}

          {/* PRATELEIRA: TÍTULOS */}
          {prateleiras.titulos.length > 0 && (
            <section className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                  <BookOpenIcon className="w-4 h-4 stroke-[2.5]" />
                  <span>Livros Correspondentes</span>
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-5 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {prateleiras.titulos.map((livro, i) => (
                  <div key={`titulo-${i}`} className="min-w-[240px] sm:min-w-[260px] snap-start shrink-0">
                    <CardLivro livro={livro} variante="busca" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PRATELEIRA: AUTORES */}
          {prateleiras.autores.length > 0 && (
            <section className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                  <PencilIcon className="w-4 h-4 stroke-[2.5]" />
                  <span>Obras Relacionadas ao Autor</span>
                </h2>
              </div>
              <div className="flex overflow-x-auto gap-5 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {prateleiras.autores.map((livro, i) => (
                  <div key={`autor-${i}`} className="min-w-[240px] sm:min-w-[260px] snap-start shrink-0">
                    <CardLivro livro={livro} variante="busca" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PRATELEIRA: TEMAS */}
          {prateleiras.temas.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                <SparklesIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Explorando o Gênero Coincidente</span>
              </h2>
              <div className="flex overflow-x-auto gap-5 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {prateleiras.temas.map((livro, i) => (
                  <div key={`tema-${i}`} className="min-w-[240px] sm:min-w-[260px] snap-start shrink-0">
                    <CardLivro livro={livro} variante="busca" />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}