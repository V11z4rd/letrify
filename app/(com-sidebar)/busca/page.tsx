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
  ExclamationCircleIcon,
  AdjustmentsHorizontalIcon,
  UserIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

// 👇 Mapeamento de Gêneros: O que o utilizador lê (rotulo) vs O que a API (valor) aceita
const GENEROS_DISPONIVEIS = [
  { rotulo: "Romance", valor: "Romance" },
  { rotulo: "Ficção Científica", valor: "Science Fiction" },
  { rotulo: "Suspense", valor: "Thriller" },
  { rotulo: "Fantasia", valor: "Fantasy" },
  { rotulo: "Ficção Histórica", valor: "Historical Fiction" },
  { rotulo: "História", valor: "History" },
  { rotulo: "Biografia", valor: "Biography" },
  { rotulo: "Ciência e Matemática", valor: "Science & Mathematics" },
  { rotulo: "Negócios e Finanças", valor: "Business & Finance" },
  { rotulo: "Saúde e Bem-estar", valor: "Health & Wellness" }
];

export default function BuscaLivrosPage() {
  const [termo, setTermo] = useState("");
  const [termoAutorExtra, setTermoAutorExtra] = useState(""); 
  const [carregando, setCarregando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);
  
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [tipoFocoComum, setTipoFocoComum] = useState<"titulo" | "autor" | "usuario">("titulo");
  const [modoEstrategia, setModoEstrategia] = useState<"comum" | "composta" | "semantica">("comum");
  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([]);

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [temMaisResultados, setTemMaisResultados] = useState(false);
  const TAMANHO_PAGINA = 15;

  const [prateleiras, setPrateleiras] = useState({
    livros: [] as LivroDados[],
    perfis: [] as PerfilDados[]
  });

  const toggleGenero = (valorOriginal: string) => {
    setGenerosSelecionados(prev => 
      prev.includes(valorOriginal) ? prev.filter(t => t !== valorOriginal) : [...prev, valorOriginal]
    );
  };

  const podeBuscar = termo.trim().length > 0 || generosSelecionados.length > 0;

  const realizarBusca = async (e?: FormEvent, novaBusca: boolean = true) => {
    if (e) e.preventDefault();
    if (!podeBuscar) return;

    const paginaParaBuscar = novaBusca ? 1 : paginaAtual + 1;

    if (novaBusca) {
      setCarregando(true);
      setBuscaFeita(true);
      setPrateleiras({ livros: [], perfis: [] });
    } else {
      setCarregandoMais(true);
    }

    try {
      const generosString = generosSelecionados.join(",");

      // =========================================================
      // 🧠 CENÁRIO 1: BUSCA SEMÂNTICA COM IA
      // =========================================================
      if (modoEstrategia === "semantica") {
        let textoFinalIA = termo.trim();
        
        // Traduz os 'values' de volta para os rótulos em pt-BR para a IA entender melhor o contexto
        if (generosSelecionados.length > 0) {
          const generosRotulos = GENEROS_DISPONIVEIS
            .filter(g => generosSelecionados.includes(g.valor))
            .map(g => g.rotulo);
          textoFinalIA += ` focado nos gêneros: ${generosRotulos.join(" e ")}`;
        }

        const res = await fetch("https://letrify.fly.dev/api/livro/busca/semantica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Texto: textoFinalIA })
        });
        
        if (res.ok) {
          const dadosIA = await res.json();
          setPrateleiras({ livros: dadosIA, perfis: [] });
          setTemMaisResultados(false); 
        } else {
          if (novaBusca) setPrateleiras({ livros: [], perfis: [] });
        }
      } 
      // =========================================================
      // 👥 CENÁRIO 2: BUSCA EXCLUSIVA DE USUÁRIOS
      // =========================================================
      else if (modoEstrategia === "comum" && tipoFocoComum === "usuario") {
        if (!termo.trim()) return; 
        
        const urlPerfis = `https://letrify.fly.dev/api/usuario/usuariosPorNome?nome=${encodeURIComponent(termo.trim())}&pagina=${paginaParaBuscar}&tamanhoPagina=${TAMANHO_PAGINA}`;
        const res = await fetch(urlPerfis);
        
        if (res.ok) {
          const dados = await res.json();
          // 👇 Lemos exatamente o array 'resultados' e usamos a prop 'temMais' do C#
          const listaPerfisRaw = dados.resultados || []; 
          
          // Mapeia para garantir blindagem contra maiúsculas/minúsculas do C#
          const listaPerfisNormalizada: PerfilDados[] = listaPerfisRaw.map((p: any) => ({
            id: p.id ?? p.Id,
            nome: p.nome ?? p.Nome,
            fotoPerfil: p.fotoPerfil ?? p.FotoPerfil,
            cidade: p.cidade ?? p.Cidade
          }));
          
          setPrateleiras(prev => ({ 
            livros: [], 
            perfis: novaBusca ? listaPerfisNormalizada : [...prev.perfis, ...listaPerfisNormalizada] 
          }));
          
          setTemMaisResultados(dados.temMais ?? false);
        } else {
           if(novaBusca) setPrateleiras({ livros: [], perfis: [] });
           setTemMaisResultados(false);
        }
      }
      // =========================================================
      // 🔍 CENÁRIO 3: ENDPOINT UNIFICADO DE LIVROS
      // =========================================================
      else {
        const queryParams = new URLSearchParams();
        queryParams.append("pagina", paginaParaBuscar.toString());
        queryParams.append("quantidade", TAMANHO_PAGINA.toString());

        if (modoEstrategia === "composta") {
          if (termo.trim()) queryParams.append("titulo", termo.trim());
          if (termoAutorExtra.trim()) queryParams.append("autor", termoAutorExtra.trim());
        } else {
          if (termo.trim()) {
            if (tipoFocoComum === "titulo") queryParams.append("titulo", termo.trim());
            if (tipoFocoComum === "autor") queryParams.append("autor", termo.trim());
          }
        }

        if (generosSelecionados.length > 0) {
          queryParams.append("tema", generosString);
        }

        const urlLivros = `https://letrify.fly.dev/api/livro/buscar?${queryParams.toString()}`;
        const res = await fetch(urlLivros);
        
        if (res.ok) {
          const resultadosLivros = await res.json();
          setPrateleiras(prev => ({
            perfis: [], 
            livros: novaBusca ? resultadosLivros : [...prev.livros, ...resultadosLivros]
          }));
          setTemMaisResultados(resultadosLivros.length === TAMANHO_PAGINA);
        } else {
          if (novaBusca) setPrateleiras({ livros: [], perfis: [] });
          setTemMaisResultados(false);
        }
      }

      setPaginaAtual(paginaParaBuscar);

    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setCarregando(false);
      setCarregandoMais(false);
    }
  };

  const tudoVazio = buscaFeita && !carregando && prateleiras.livros.length === 0 && prateleiras.perfis.length === 0;

  const alternarFoco = () => {
    if (tipoFocoComum === "titulo") setTipoFocoComum("autor");
    else if (tipoFocoComum === "autor") setTipoFocoComum("usuario");
    else setTipoFocoComum("titulo");
  };

  return (
    <div className="max-w-5xl mx-auto pt-6 px-4 pb-24 animate-fade-in">
      
      {/* CABEÇALHO */}
      <div className="mb-10 flex flex-col items-center text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--cor-texto-principal)' }}>
          Explorar
        </h1>
        <p className="text-xs sm:text-sm font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
          Vasculhe o acervo completo da plataforma através de filtros avançados ou inteligência artificial.
        </p>
      </div>

      {/* BARRA DE PESQUISA COMPOSICIONAL */}
      <div className="max-w-2xl mx-auto mb-6">
        <form onSubmit={(e) => realizarBusca(e, true)} className="flex flex-col gap-3">
          <div 
            className="w-full shadow-md rounded-2xl flex items-center border transition-all duration-300 bg-[var(--cor-fundo-card)] relative" 
            style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            
            {/* LADO ESQUERDO: SELETOR RÁPIDO */}
            {modoEstrategia === "comum" && (
              <div className="pl-2 border-r flex items-center shrink-0" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                <button
                  type="button"
                  onClick={alternarFoco}
                  className="px-3 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1 opacity-75 hover:opacity-100 transition-opacity w-[90px] justify-center"
                  style={{ color: 'var(--cor-primaria)' }}
                >
                  {tipoFocoComum === "titulo" && <BookOpenIcon className="w-3.5 h-3.5" />}
                  {tipoFocoComum === "autor" && <PencilIcon className="w-3.5 h-3.5" />}
                  {tipoFocoComum === "usuario" && <UserIcon className="w-3.5 h-3.5" />}
                  
                  <span>
                    {tipoFocoComum === "titulo" ? "Obra" : tipoFocoComum === "autor" ? "Autor" : "Leitor"}
                  </span>
                  <ChevronDownIcon className="w-2.5 h-2.5 opacity-50 ml-0.5" />
                </button>
              </div>
            )}

            {/* INPUT PRINCIPAL */}
            <div className="pl-3 opacity-30">
              <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" style={{ color: 'var(--cor-texto-principal)' }} />
            </div>
            <input 
              type="text"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder={
                modoEstrategia === "semantica" 
                  ? "Descreva a sensação ou história que quer sentir..." 
                  : modoEstrategia === "composta" 
                    ? "Nome da obra / título..." 
                    : tipoFocoComum === "usuario"
                      ? "Buscar por leitores da comunidade..."
                      : `Buscar por ${tipoFocoComum === "titulo" ? "título do livro..." : "nome do autor..."}`
              }
              className="flex-1 p-4 pl-2 bg-transparent outline-none text-xs sm:text-sm font-semibold placeholder:opacity-30 text-[var(--cor-texto-principal)]"
            />

            {/* LADO DIREITO: BOTÃO FILTRO (FUNIL) */}
            <button
              type="button"
              onClick={() => setFiltrosAbertos(!filtrosAbertos)}
              className={`p-3 mr-1.5 rounded-xl border transition-all active:scale-95 ${filtrosAbertos ? 'bg-[var(--cor-fundo-sidebar)]' : 'opacity-60 hover:opacity-100'}`}
              style={{ borderColor: 'var(--cor-fundo-sidebar)', color: filtrosAbertos ? 'var(--cor-destaque)' : 'var(--cor-texto-principal)' }}
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* BOTÃO SUBMIT */}
            <button 
              type="submit"
              disabled={carregando || !podeBuscar}
              className="w-24 h-[54px] flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-40 shrink-0 rounded-r-2xl"
              style={{ backgroundColor: modoEstrategia === "semantica" ? 'var(--cor-destaque)' : 'var(--cor-primaria)', color: '#ffffff' }}
            >
              {carregando ? <ArrowPathIcon className="w-4 h-4 animate-spin stroke-[3]" /> : "Buscar"}
            </button>
          </div>

          {/* INPUT EXTRA: EXIBIDO APENAS SE FOR BUSCA COMPOSTA */}
          {modoEstrategia === "composta" && (
            <div 
              className="w-full shadow-sm rounded-2xl flex items-center border p-1 bg-[var(--cor-fundo-card)] animate-slide-down" 
              style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
            >
              <div className="pl-3.5 pr-2 opacity-30">
                <UserIcon className="w-4 h-4 stroke-[2.5]" style={{ color: 'var(--cor-texto-principal)' }} />
              </div>
              <input 
                type="text"
                value={termoAutorExtra}
                onChange={(e) => setTermoAutorExtra(e.target.value)}
                placeholder="Nome do autor da obra (Filtro composto)..."
                className="flex-1 p-3 bg-transparent outline-none text-xs sm:text-sm font-semibold placeholder:opacity-30 text-[var(--cor-texto-principal)]"
              />
            </div>
          )}
        </form>

        {/* =========================================================
            ⚙️ PAINEL EXPANSÍVEL DE FILTROS (FUNIL)
           ========================================================= */}
        {filtrosAbertos && (
          <div 
            className="mt-3 p-5 rounded-2xl border shadow-xl flex flex-col gap-5 animate-fade-in"
            style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            {/* SUB-SEÇÃO: ESTRATÉGIAS DE BUSCA */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3" style={{ color: 'var(--cor-texto-secundario)' }}>Buscas</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "comum", label: "Busca Rápida", estrategia: "comum" },
                  { id: "composta", label: "Composta (Título + Autor)", estrategia: "composta" },
                  { id: "semantica", label: "Semântica com IA", estrategia: "semantica" }
                ].map(opt => {
                  const ativo = modoEstrategia === opt.estrategia;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setModoEstrategia(opt.estrategia as any);
                        if (opt.estrategia !== "composta") setTermoAutorExtra("");
                        if (opt.estrategia === "comum") setTipoFocoComum("titulo"); 
                      }}
                      className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all`}
                      style={{ 
                        backgroundColor: ativo ? 'var(--cor-fundo-sidebar)' : 'transparent',
                        color: ativo ? (opt.estrategia === 'semantica' ? 'var(--cor-destaque)' : 'var(--cor-primaria)') : 'var(--cor-texto-principal)',
                        borderColor: ativo ? 'var(--cor-fundo-sidebar)' : 'rgba(var(--cor-texto-principal-rgb), 0.1)'
                      }}
                    >
                      {opt.estrategia === "semantica" && <SparklesIcon className="w-3 h-3 inline mr-1 -mt-0.5 stroke-[2.5]" />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SUB-SEÇÃO: GÊNEROS (Esconde se o foco for Usuário) */}
            {!(modoEstrategia === "comum" && tipoFocoComum === "usuario") && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Gêneros</h3>
                  <span className="text-[9px] font-bold opacity-40 italic">(Selecione um ou mais)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GENEROS_DISPONIVEIS.map(g => {
                    const ativo = generosSelecionados.includes(g.valor);
                    return (
                      <button
                        key={g.valor}
                        type="button"
                        onClick={() => toggleGenero(g.valor)}
                        className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95`}
                        style={{ 
                          backgroundColor: ativo ? 'var(--cor-primaria)' : 'transparent',
                          color: ativo ? 'var(--cor-botao-texto)' : 'var(--cor-texto-principal)',
                          borderColor: ativo ? 'var(--cor-primaria)' : 'rgba(var(--cor-texto-principal-rgb), 0.1)'
                        }}
                      >
                        {g.rotulo}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FEEDBACK DE CARREGAMENTO INICIAL */}
      {carregando && (
        <div className="flex flex-col items-center justify-center py-20 text-xs font-black uppercase tracking-widest gap-3 opacity-60 text-[var(--cor-texto-secundario)]">
          <ArrowPathIcon className="w-7 h-7 animate-spin" style={{ color: modoEstrategia === "semantica" ? 'var(--cor-destaque)' : 'var(--cor-primaria)' }} />
          <span>{modoEstrategia === "semantica" ? "A Inteligência Artificial está decodificando sensações..." : "Consultando o acervo unificado..."}</span>
        </div>
      )}

      {/* COMPONENTE DE ZERO ESTADO */}
      {tudoVazio && (
        <div className="text-center py-16 border-2 border-dashed rounded-3xl max-w-md mx-auto p-6 flex flex-col items-center animate-fade-in" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <ExclamationCircleIcon className="w-10 h-10 text-red-500/60 mb-3" />
          <p className="font-black text-base tracking-tight mb-0.5 text-[var(--cor-texto-principal)]">Nenhum acervo localizado</p>
          <p className="text-xs font-medium opacity-50 text-[var(--cor-texto-secundario)]">Refine seus parâmetros ou limpe os filtros selecionados.</p>
        </div>
      )}

      {/* PRATELEIRAS EXIBIDAS DE RESULTADO */}
      {!carregando && buscaFeita && (
        <div className="space-y-12">
          
          {/* SEÇÃO: LIVROS RETORNADOS */}
          {prateleiras.livros.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: modoEstrategia === "semantica" ? 'var(--cor-destaque)' : 'var(--cor-primaria)' }}>
                {modoEstrategia === "semantica" ? <SparklesIcon className="w-4 h-4 stroke-[2.5]" /> : <BookOpenIcon className="w-4 h-4 stroke-[2.5]" />}
                <span>{modoEstrategia === "semantica" ? "Recomendações da Inteligência Artificial" : "Obras Encontradas"}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {prateleiras.livros.map((livro, i) => (
                  <CardLivro key={`livro-${livro.isbn || i}`} livro={livro} variante="busca" />
                ))}
              </div>
            </section>
          )}

          {/* SEÇÃO: PERFIS ENCONTRADOS */}
          {prateleiras.perfis.length > 0 && (
            <section className="animate-fade-in pt-4">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                <UserCircleIcon className="w-4 h-4 stroke-[2.5]" />
                <span>Leitores Encontrados</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {prateleiras.perfis.map((perfil, i) => (
                  <CardPerfil key={perfil.id || i} perfil={perfil} />
                ))}
              </div>
            </section>
          )}

          {/* PAGINAÇÃO: BOTÃO CARREGAR MAIS */}
          {temMaisResultados && (
            <div className="flex justify-center pt-8 border-t" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
              <button
                onClick={() => realizarBusca(undefined, false)}
                disabled={carregandoMais}
                className="px-8 py-3 text-xs font-black uppercase tracking-widest rounded-xl shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: 'var(--cor-fundo-card)', color: 'var(--cor-texto-principal)', border: '1px solid var(--cor-fundo-sidebar)' }}
              >
                {carregandoMais && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                Carregar Mais Resultados
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}