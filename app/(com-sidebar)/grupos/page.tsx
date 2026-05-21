"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { grupoService, GrupoResumo } from "@/app/lib/grupoService";
import ModalCriarGrupo from "@/components/grupos/ModalCriarGrupo"; 

export default function GruposPage() {
  const [grupos, setGrupos] = useState<GrupoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Controle do modal de criação
  const [modalAberto, setModalAberto] = useState(false);

  const carregarGrupos = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await grupoService.listarTodos();
      setGrupos(dados);
    } catch (err: any) {
      setErro(err.message || "Não foi possível carregar os clubes de leitura.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarGrupos();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full pt-8 pb-24 px-4 relative min-h-screen animate-fade-in">
      
      {/* CABEÇALHO DA VITRINE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-100 mb-2">Clubes do Livro</h1>
          <p className="text-sm text-zinc-400">Junte-se a outros leitores, debata capítulos e expanda seu universo literário.</p>
        </div>
        
        <button 
          onClick={() => setModalAberto(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Criar Clube
        </button>
      </div>

      {/* FEEDBACKS DE ESTADO */}
      {carregando && (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <span className="text-4xl animate-pulse mb-4">📚</span>
          <p className="font-bold text-sm tracking-widest uppercase">Buscando clubes...</p>
        </div>
      )}

      {erro && !carregando && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center font-bold">
          {erro}
        </div>
      )}

      {!carregando && !erro && grupos.length === 0 && (
        <div className="text-center py-20 opacity-50 border-2 border-dashed border-white/10 rounded-3xl">
          <span className="text-5xl block mb-4">🏜️</span>
          <p className="font-bold text-xl text-zinc-200">Nenhum clube por aqui.</p>
          <p className="text-sm text-zinc-400">Seja o pioneiro e crie o primeiro clube do livro do Letrify!</p>
        </div>
      )}

      {/* GRADE DE CLUBES (VITRINE) */}
      {!carregando && !erro && grupos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map((grupo) => (
            <Link 
              href={`/grupos/${grupo.id}`} 
              key={grupo.id}
              className="group flex flex-col bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:-translate-y-1 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10"
            >
              {/* Capa do Grupo */}
              <div className="h-32 w-full bg-zinc-800 relative border-b border-white/5 overflow-hidden flex-shrink-0">
                {grupo.fotoCapa ? (
                  <img src={grupo.fotoCapa} alt={grupo.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-10 bg-gradient-to-br from-blue-900 to-zinc-900">
                    📖
                  </div>
                )}
                {/* Badge de Status */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${grupo.status === 'Aberto' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                    {grupo.status}
                  </span>
                </div>
              </div>

              {/* Informações */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-black text-lg text-zinc-100 mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {grupo.nome}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">
                  {grupo.descricao || "Sem descrição."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                    <span className="text-lg">👥</span> {grupo.membrosCount || 0} membros
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                    Explorar →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO */}
      {modalAberto && (
        <ModalCriarGrupo 
          onClose={() => setModalAberto(false)} 
        />
      )} 
      
    </div>
  );
}