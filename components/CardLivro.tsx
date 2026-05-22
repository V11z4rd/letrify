"use client";

import { useState } from "react";
import { authService } from "@/app/lib/authService";
import { BookmarkIcon, BookOpenIcon, CheckCircleIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

export interface LivroDados {
  id?: number; // O Back-end costuma devolver o ID interno do livro na estante
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
  onRemove?: (id: number) => void; // Callback para avisar a Estante que o livro foi apagado
}

export default function CardLivro({ livro, variante = "busca", onRemove }: CardLivroProps) {
  const [carregandoStatus, setCarregandoStatus] = useState<string | null>(null);
  const [sucessoNoBotao, setSucessoNoBotao] = useState<string | null>(null);

  const tituloFinal = livro.titulo || "Título Desconhecido";
  const autorFinal = livro.autor || (livro.autores && livro.autores.join(", ")) || livro.autorPrincipal || "Autor Desconhecido";
  const isbnFinal = livro.isbn && livro.isbn !== 'Sem ISBN' ? livro.isbn.trim() : null;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

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
      
      // Avisa o componente pai (EstanteUsuario) para tirar o livro da tela!
      if (onRemove) onRemove(livro.id);

    } catch (err: any) {
      alert(err.message);
      setCarregandoStatus(null);
    }
  };

  // Definição global dos botões para facilitar o mapeamento
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
      {/* TAG DE STATUS (Aparece apenas na Estante) */}
      {variante === "estante" && livro.status && (
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 z-10 flex items-center gap-1.5 shadow-lg">
          {livro.status === "Quero Ler" && <BookmarkIcon className="w-3 h-3 text-blue-400" />}
          {livro.status === "Lendo" && <BookOpenIcon className="w-3 h-3 text-orange-400" />}
          {livro.status === "Lido" && <CheckCircleIcon className="w-3 h-3 text-green-400" />}
          {livro.status}
        </div>
      )}

      <div className="h-64 flex items-center justify-center p-4 bg-black/5 dark:bg-white/5 relative">
        {isbnFinal ? (
          <img 
            src={`https://covers.openlibrary.org/b/isbn/${isbnFinal}-M.jpg`} 
            alt={`Capa`} 
            className="h-full object-contain shadow-md rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl opacity-20"><svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></span>';
            }}
          />
        ) : (
          <BookOpenIcon className="w-16 h-16 opacity-20" />
        )}
      </div>
      
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

          {/* VARIANTE 2: ESTANTE (Sem o botão do status atual e com Lixeira) */}
          {variante === "estante" && (
            <div className="flex justify-between items-center gap-2 border-t pt-3 mt-1" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
              
              {/* Renderiza apenas os botões que são diferentes do status atual do livro */}
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

              {/* Botão de Excluir */}
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