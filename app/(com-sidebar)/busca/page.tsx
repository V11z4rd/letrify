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
  ExclamationCircleIcon
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

  const [prateleiras, setPrateleiras] = useState({
    isbn: [] as LivroDados[],
    titulos: [] as LivroDados[],
    autores: [] as LivroDados[],
    temas: [] as LivroDados[],
    perfis: [] as PerfilDados[]
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
    
    setPrateleiras({ isbn: [], titulos: [], autores: [], temas: [], perfis: [] });

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

    setPrateleiras({
      isbn: [],
      titulos: resultadosTitulos,
      autores: resultadosAutores,
      temas: resultadosTemas,
      perfis: resultadosPerfis
    });

    setCarregando(false);
  };

  const tudoVazio = buscaFeita && !carregando && 
    prateleiras.isbn.length === 0 && 
    prateleiras.titulos.length === 0 && 
    prateleiras.autores.length === 0 && 
    prateleiras.temas.length === 0 &&
    prateleiras.perfis.length === 0;

  return (
    <div className="max-w-7xl mx-auto pt-6 px-4 pb-24 animate-fade-in">
      
      {/* 1. SEÇÃO DE CAMPO DE BUSCA */}
      <div className="mb-14 flex flex-col items-center text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--cor-texto-principal)' }}>
          Explorar
        </h1>
        <p className="text-xs sm:text-sm font-medium opacity-60 mb-8" style={{ color: 'var(--cor-texto-secundario)' }}>
          Descubra obras, mapeie autores, encontre leitores e vasculhe novos horizontes.
        </p>
        
        <form 
          onSubmit={realizarBusca} 
          className="w-full relative flex items-center shadow-lg rounded-2xl overflow-hidden border transition-all duration-300 focus-within:ring-2 focus-within:ring-offset-0 focus-within:border-[var(--cor-destaque)]" 
          style={{ borderColor: 'var(--cor-fundo-sidebar)', backgroundColor: 'var(--cor-fundo-card)' }}
        >
          <div className="pl-4 opacity-40">
            <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" style={{ color: 'var(--cor-texto-principal)' }} />
          </div>
          <input 
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Livros, autores, tags, leitores ou ISBN..."
            className="flex-1 p-3.5 pl-3 bg-transparent outline-none text-xs sm:text-sm font-semibold placeholder:opacity-40"
            style={{ color: 'var(--cor-texto-principal)' }}
          />
          {/* Corrigido w-28 fixo para evitar que o botão mude de tamanho no carregamento */}
          <button 
            type="submit"
            disabled={carregando}
            className="w-28 h-[52px] flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 shrink-0"
            style={{ backgroundColor: 'var(--cor-destaque)', color: '#ffffff' }}
          >
            {carregando ? <ArrowPathIcon className="w-4 h-4 animate-spin stroke-[3]" /> : "Buscar"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["Fantasia", "Ficção", "Romance", "Terror", "Ciência", "Filosofia"].map((tema) => (
            <button
              key={tema}
              onClick={() => { setTermo(tema); realizarBusca(undefined, tema); }}
              className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'var(--cor-fundo-card)', color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
            >
              {tema}
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
          <ArrowPathIcon className="w-7 h-7 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
          <span>Vasculhando os acervos da biblioteca...</span>
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
            Não localizamos títulos, autores ou perfis associados ao termo <span className="font-bold">"{termo}"</span>.
          </p>
        </div>
      )}

      {/* 3. CONTEÚDO DISTRIBUÍDO EM LINHAS */}
      {!carregando && buscaFeita && (
        <div className="space-y-14">

          {/* PRATELEIRA: PERFIS DE USUÁRIOS */}
          {prateleiras.perfis.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                <UserCircleIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Perfis Relacionados</span>
              </h2>
              {/* Adicionado padding horizontal e margem negativa para manter o alinhamento da rolagem de tela */}
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
                {prateleiras.isbn.map((livro, i) => <CardLivro key={i} livro={livro} variante="busca" />)}
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
                <span className="text-[10px] font-black uppercase tracking-wider opacity-40 hover:opacity-100 cursor-pointer transition-all hover:text-[var(--cor-destaque)]">Ver Todos</span>
              </div>
              <div className="flex overflow-x-auto gap-5 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {prateleiras.titulos.map((livro, i) => (
                  <div key={i} className="min-w-[240px] sm:min-w-[260px] snap-start shrink-0">
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
                <span className="text-[10px] font-black uppercase tracking-wider opacity-40 hover:opacity-100 cursor-pointer transition-all hover:text-[var(--cor-destaque)]">Ver Todos</span>
              </div>
              <div className="flex overflow-x-auto gap-5 pb-4 -mx-4 px-4 snap-x hide-scrollbar">
                {prateleiras.autores.map((livro, i) => (
                  <div key={i} className="min-w-[240px] sm:min-w-[260px] snap-start shrink-0">
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
                  <div key={i} className="min-w-[240px] sm:min-w-[260px] snap-start shrink-0">
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