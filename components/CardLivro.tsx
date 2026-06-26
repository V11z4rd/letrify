"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";
import { BookmarkIcon, BookOpenIcon, CheckCircleIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

export interface LivroDados {
  id?: number; 
  isbn?: string;
  titulo?: string;
  autor?: string;
  autores?: string[];
  autorPrincipal?: string;
  status?: string; 
}

interface CardLivroProps {
  livro: LivroDados;
  variante?: "busca" | "estante" | "simples";
  onRemove?: (id: number) => void; 
  // 🟢 1. ADICIONADO O CALLBACK DE ATUALIZAÇÃO NAS PROPS
  onUpdate?: () => void; 
}

export default function CardLivro({ livro, variante = "busca", onRemove, onUpdate }: CardLivroProps) {
  const [carregandoStatus, setCarregandoStatus] = useState<string | null>(null);
  const [sucessoNoBotao, setSucessoNoBotao] = useState<string | null>(null);

  const tituloFinal = livro.titulo || "Título Desconhecido";
  const autorFinal = livro.autor || (livro.autores && livro.autores.join(", ")) || livro.autorPrincipal || "Autor Desconhecido";
  const isbnFinal = livro.isbn && !livro.isbn.includes("Sem ISBN") ? livro.isbn.trim() : null;
  const [urlCapa, setUrlCapa] = useState<string | null>(null);
  const [erroCapa, setErroCapa] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  // 🎨 FUNÇÃO PARA GERAR UMA COR DE FUNDO EXCLUSIVA BASEADA NO TÍTULO DO LIVRO
  const gerarCorPorTexto = (texto: string) => {
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Paleta de cores elegantes e fechadas para estilo capa dura (Livros antigos/modernos)
    const paleta = [
      "#2b4c3f", "#1e3a5f", "#4a2840", "#5c2e2b", "#334155", 
      "#1e293b", "#563d2d", "#3f2b5c", "#1c3d5a", "#2e4a62"
    ];
    const index = Math.abs(hash) % paleta.length;
    return paleta[index];
  };

  const corCapaDura = gerarCorPorTexto(tituloFinal);

  // Inicializa a URL da capa com base no Open Library se houver ISBN
  useEffect(() => {
    if (isbnFinal) {
      // Se tem ISBN, começa pela Open Library de forma padrão
      setUrlCapa(`https://covers.openlibrary.org/b/isbn/${isbnFinal}-M.jpg?default=false`);
      setErroCapa(false);
    } else {
      // 🟢 SE NÃO TEM ISBN: Fazemos uma busca textual inteligente no Google Books por Título + Autor!
      const queryBusca = encodeURIComponent(`intitle:${tituloFinal} inauthor:${autorFinal}`);
      setUrlCapa(`https://books.google.com/books/content?query=${queryBusca}&printsec=frontcover&img=1&zoom=1`);
      setErroCapa(false);
    }
  }, [isbnFinal, tituloFinal, autorFinal]);

  const handleErroCapa = () => {
    // Se o Open Library com ISBN falhar, migra para o Google Books por ISBN
    if (isbnFinal && urlCapa?.includes("openlibrary")) {
      setUrlCapa(`https://books.google.com/books/content?id=&vid=ISBN:${isbnFinal}&printsec=frontcover&img=1&zoom=1`);
    } else {
      // Se falhar a busca por texto ou por ISBN no Google, assume o Mockup Editorial
      setErroCapa(true);
    }
  };

  // 🟢 SOLUÇÃO PARA O BUG DA IMAGEM "IMAGE NOT AVAILABLE" (image_065a25.jpg)
  // Imagens fantasmas do Google Books têm dimensões específicas (como 132x192 ou tamanhos muito pequenos)
  // O código abaixo valida se a imagem carregada na tela é o placeholder cinza indesejado
  const validarTamanhoImagem = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // O placeholder de erro do Google Books geralmente tem exatamente 128 ou 132 de largura por 192 de altura
    if (img.naturalWidth === 128 || img.naturalWidth === 132) {
      setErroCapa(true); 
    }
  };

  // Função para ADICIONAR ou MOVER
  const adicionarNaEstante = async (statusEscolhido: string) => {
    setCarregandoStatus(statusEscolhido);
    setSucessoNoBotao(null);

    try {
      const token = authService.getToken();
      if (!token) throw new Error("Faça login para salvar.");

      const resposta = await fetch(`https://letrify.fly.dev/api/usuario/meus-livros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo: tituloFinal,
          autor: autorFinal,
          isbn: isbnFinal || "Sem ISBN",
          status: statusEscolhido 
        })
      });

      if (resposta.ok || resposta.status === 200) {
        setSucessoNoBotao(statusEscolhido);
        
        // 🟢 2. SE O LIVRO FOI MOVIDO COM SUCESSO, AVISA A ESTANTE PARA SE RECARREGAR
        if (onUpdate) {
          onUpdate();
        }
      } else {
        const erroMsg = await resposta.text();
        if (erroMsg.includes("duplicate") || erroMsg.includes("unique")) {
           alert("Livro já está nesta prateleira!");
        } else {
           alert("Erro ao adicionar.");
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCarregandoStatus(null);
      setTimeout(() => setSucessoNoBotao(null), 2500);
    }
  };

  // Função para REMOVER
  const removerDaEstante = async () => {
    if (!livro.id) {
      alert("Não foi possível identificar o livro para remoção.");
      return;
    }
    
    if (!confirm(`Tem certeza que deseja remover "${tituloFinal}" da sua estante?`)) return;

    setCarregandoStatus("Remover");
    try {
      const token = authService.getToken();
      const resposta = await fetch(`https://letrify.fly.dev/api/usuario/meus-livros/${livro.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!resposta.ok) throw new Error("Erro ao remover o livro da estante.");
      
      // 🟢 3. SE O LIVRO FOI DELETADO, PRIORIZA RECARREGAR A API DA ESTANTE INTERA
      if (onUpdate) {
        onUpdate();
      } else if (onRemove) {
        onRemove(livro.id); // Mantém o fallback caso a estante antiga ainda use o onRemove por ID
      }

    } catch (err: any) {
      alert(err.message);
      setCarregandoStatus(null);
    }
  };

  const botoesStatus = [
    { label: "Quero Ler", icone: <BookmarkIcon className="w-4 h-4" /> },
    { label: "Lendo", icone: <BookOpenIcon className="w-4 h-4" /> },
    { label: "Lido", icone: <CheckCircleIcon className="w-4 h-4" /> }
  ];

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-sm border flex flex-col transition-transform hover:-translate-y-1 hover:shadow-lg h-full bg-card-limpo relative"
      style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* TAG DE STATUS */}
      {variante === "estante" && livro.status && (
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 z-10 flex items-center gap-1.5 shadow-lg">
          {livro.status === "Quero Ler" && <BookmarkIcon className="w-3 h-3 text-blue-400" />}
          {livro.status === "Lendo" && <BookOpenIcon className="w-3 h-3 text-orange-400" />}
          {livro.status === "Lido" && <CheckCircleIcon className="w-3 h-3 text-green-400" />}
          {livro.status}
        </div>
      )}

      {/* ÁREA DA CAPA DO LIVRO */}
      <div className="h-64 flex items-center justify-center p-4 bg-black/5 dark:bg-white/5 relative border-b border-black/5 dark:border-white/5">
        {urlCapa && !erroCapa ? (
          <img 
            src={urlCapa} 
            alt={`Capa de ${tituloFinal}`} 
            className="h-full object-contain shadow-md rounded transition-transform duration-300 hover:scale-105"
            onLoad={validarTamanhoImagem} // Intercepta imagens quebras que fingem sucesso
            onError={handleErroCapa}
          />
        ) : (
          /* DESIGN EDITORIAL PREMIUM PARA LIVROS SEM CAPA */
          <div 
            className="flex flex-col justify-between p-4 w-full h-full rounded-r-xl rounded-l-sm shadow-xl relative overflow-hidden border-l-4 animate-fade-in text-left select-none"
            style={{ 
              backgroundColor: corCapaDura, 
              borderColor: 'rgba(0,0,0,0.25)',
            }}
          >
            <div className="absolute inset-x-0 top-3 border-t border-b border-white/10 h-1 pointer-events-none"></div>

            <div className="flex flex-col gap-1 mt-3 z-10">
              <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest line-clamp-1">
                {autorFinal.split(',')[0]}
              </span>
              <span className="text-sm lg:text-base font-black leading-tight text-white line-clamp-4 drop-shadow-sm">
                {tituloFinal}
              </span>
            </div>

            <div className="z-10 border-t border-white/20 pt-2 pb-1 flex justify-between items-center">
              <span className="text-[8px] uppercase tracking-wider text-white/50 font-mono">
                Letrify Editora
              </span>
              <BookOpenIcon className="w-3 h-3 text-white/30" />
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10 pointer-events-none" />
          </div>
        )}
      </div>
      
      {/* CORPO DO CARD */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm lg:text-base line-clamp-2 leading-tight" style={{ color: 'var(--cor-texto-principal)' }} title={tituloFinal}>
          {tituloFinal}
        </h3>
        <p className="text-xs mt-1 line-clamp-1 opacity-70" style={{ color: 'var(--cor-texto-principal)' }} title={autorFinal}>
          {autorFinal}
        </p>
        
        {isbnFinal && (
          <p className="text-[10px] mt-2 opacity-40 font-mono" style={{ color: 'var(--cor-texto-principal)' }}>
            ISBN: {isbnFinal}
          </p>
        )}

        <div className="mt-auto pt-4">
          
          {/* VARIANTE 1: BUSCA */}
          {variante === "busca" && (
            <div className="flex flex-col gap-2">
              {botoesStatus.map((btn) => (
                <button 
                  key={btn.label}
                  onClick={() => adicionarNaEstante(btn.label)} 
                  disabled={!!carregandoStatus}
                  className={`py-1.5 px-3 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                    sucessoNoBotao === btn.label ? 'bg-green-500/10 border-green-500 text-green-500' : 'hover:opacity-80'
                  }`}
                  style={sucessoNoBotao === btn.label ? {} : { borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
                >
                  {carregandoStatus === btn.label ? "⏳ ..." : sucessoNoBotao === btn.label ? "Salvo!" : (
                    <><span className="opacity-80">{btn.icone}</span> {btn.label}</>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* VARIANTE 2: ESTANTE */}
          {variante === "estante" && (
            <div className="flex justify-between items-center gap-2 border-t pt-3 mt-1" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
              {botoesStatus
                .filter(btn => btn.label !== livro.status)
                .map((btn) => (
                <button
                  key={btn.label}
                  title={`Mover para ${btn.label}`}
                  onClick={() => adicionarNaEstante(btn.label)}
                  disabled={!!carregandoStatus}
                  className={`flex-1 py-1.5 rounded-md text-sm transition-all flex items-center justify-center border ${
                    sucessoNoBotao === btn.label ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-300'
                  }`}
                  style={sucessoNoBotao === btn.label ? {} : { borderColor: 'var(--cor-fundo-sidebar)' }}
                >
                  {carregandoStatus === btn.label ? <span className="animate-spin text-xs">↻</span> : sucessoNoBotao === btn.label ? "✨" : btn.icone}
                </button>
              ))}

              <button
                onClick={removerDaEstante}
                disabled={!!carregandoStatus}
                title="Remover da Estante"
                className="flex-1 py-1.5 rounded-md text-sm transition-all flex items-center justify-center border bg-transparent hover:bg-red-500/10 border-transparent hover:border-red-500/30 text-zinc-600 hover:text-red-500"
              >
                {carregandoStatus === "Remover" ? <span className="animate-spin text-xs">↻</span> : <TrashIcon className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* VARIANTE 3: SIMPLES */}
          {variante === "simples" && (
            <button 
              onClick={() => adicionarNaEstante("Quero Ler")} 
              disabled={!!carregandoStatus}
              className={`py-2 w-full rounded font-bold text-sm transition-opacity border flex items-center justify-center gap-2 ${
                sucessoNoBotao ? 'bg-green-500/10 border-green-500 text-green-500' : 'hover:opacity-80'
              }`}
              style={sucessoNoBotao ? {} : { backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-sidebar)', borderColor: 'var(--cor-fundo-sidebar)' }}
            >
              {carregandoStatus ? "Salvando..." : sucessoNoBotao ? "Salvo!" : <><PlusIcon className="w-4 h-4"/> Adicionar</>}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}