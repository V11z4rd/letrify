"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { grupoService, GrupoResumo } from "@/app/lib/grupoService";
import ModalCriarGrupo from "@/components/grupos/ModalCriarGrupo"; 
import { authService } from "@/app/lib/authService";
import { 
  PlusIcon, 
  UserGroupIcon, 
  BookOpenIcon, 
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowLeftStartOnRectangleIcon
} from "@heroicons/react/24/outline";

export default function GruposPage() {
  const [grupos, setGrupos] = useState<GrupoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  const [processandoSair, setProcessandoSair] = useState<number | null>(null);

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

  const handleSairRapido = async (e: React.MouseEvent, grupoId: number) => {
    e.preventDefault(); 
    
    if (!confirm("Tem certeza que deseja sair deste clube?")) return;
    
    setProcessandoSair(grupoId);
    try {
      await grupoService.sair(String(grupoId));
      alert("Você saiu do clube.");
      await carregarGrupos(); 
    } catch (err: any) {
      alert(err.message || "Não foi possível processar a saída. Verifique se você é membro deste grupo.");
    } finally {
      setProcessandoSair(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pt-6 pb-24 px-4 relative min-h-screen animate-fade-in">
      
      {/* CABEÇALHO DA VITRINE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1.5" style={{ color: 'var(--cor-texto-principal)' }}>
            Clubes do Livro
          </h1>
          <p className="text-xs sm:text-sm font-semibold opacity-70" style={{ color: 'var(--cor-texto-secundario)' }}>
            Junte-se a outros leitores, debata capítulos e expanda seu universo literário.
          </p>
        </div>
        
        <button 
          onClick={() => setModalAberto(true)}
          className="px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0 shadow-md hover:shadow-lg"
          style={{ 
            backgroundColor: 'var(--cor-destaque)', 
            color: '#ffffff'
          }}
        >
          <PlusIcon className="w-4 h-4 stroke-[3]" />
          <span>Criar Clube</span>
        </button>
      </div>

      {/* FEEDBACKS DE ESTADO (LOADING) */}
      {carregando && (
        <div 
          className="flex flex-col items-center justify-center py-32 text-xs font-black uppercase tracking-widest gap-3"
          style={{ color: 'var(--cor-texto-secundario)' }}
        >
          <ArrowPathIcon className="w-6 h-6 animate-spin text-[var(--cor-primaria)]" style={{ color: 'var(--cor-primaria)' }} />
          <span>Buscando universos literários...</span>
        </div>
      )}

      {/* FEEDBACKS DE ESTADO (ERRO) */}
      {erro && !carregando && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center text-xs font-bold flex items-center justify-center gap-2 max-w-xl mx-auto">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>{erro}</span>
        </div>
      )}

      {/* FEEDBACKS DE ESTADO (VAZIO) */}
      {!carregando && !erro && grupos.length === 0 && (
        <div 
          className="text-center py-20 border-2 border-dashed rounded-3xl p-6 max-w-xl mx-auto flex flex-col items-center"
          style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--cor-fundo-app)' }}>
            <BookOpenIcon className="w-6 h-6 opacity-40" style={{ color: 'var(--cor-texto-principal)' }} />
          </div>
          <p className="font-black text-lg tracking-tight mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Nenhum clube por aqui.</p>
          <p className="text-xs font-semibold opacity-60 max-w-sm" style={{ color: 'var(--cor-texto-secundario)' }}>
            Seja o pioneiro e crie o primeiro clube do livro oficial do Letrify!
          </p>
        </div>
      )}

      {/* GRADE DE CLUBES (VITRINE) */}
      {!carregando && !erro && grupos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map((grupo) => (
            <Link 
              href={`/grupos/${grupo.id}`} 
              key={grupo.id}
              className="group flex flex-col border rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
              style={{ 
                backgroundColor: 'var(--cor-fundo-card)', 
                borderColor: 'var(--cor-fundo-sidebar)' 
              }}
            >
              {/* Capa do Grupo */}
              <div 
                className="h-36 w-full relative border-b overflow-hidden flex-shrink-0"
                style={{ borderColor: 'var(--cor-fundo-sidebar)', backgroundColor: 'var(--cor-fundo-app)' }}
              >
                {grupo.fotoCapa ? (
                  <img 
                    src={grupo.fotoCapa} 
                    alt={grupo.nome} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <BookOpenIcon className="w-10 h-10 stroke-[2]" style={{ color: 'var(--cor-texto-secundario)' }} />
                  </div>
                )}
                
                {/* Badge de Status Integrada ao Tema */}
                <div 
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-xl border backdrop-blur-md flex items-center gap-1.5"
                  style={{ 
                    backgroundColor: 'rgba(var(--cor-fundo-card-rgb, 255, 255, 255), 0.75)',
                    borderColor: 'var(--cor-fundo-sidebar)'
                  }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${grupo.status === 'Aberto' ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--cor-texto-principal)' }}>
                    {grupo.status}
                  </span>
                </div>
              </div>

              {/* Corpo informativo do Card */}
              <div className="p-5 flex flex-col flex-1">
                <h3 
                  className="font-black text-base mb-1 line-clamp-1 transition-colors group-hover:text-[var(--cor-destaque)]"
                  style={{ color: 'var(--cor-texto-principal)' }}
                >
                  {grupo.nome}
                </h3>
                <p 
                  className="text-xs font-medium opacity-70 line-clamp-2 mb-5 flex-1 leading-relaxed"
                  style={{ color: 'var(--cor-texto-secundario)' }}
                >
                  {grupo.descricao || "Explore discussões e cronogramas literários estruturados neste clube."}
                </p>
                
                {/* Footer do Card */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center gap-1.5 text-xs font-bold opacity-70"
                      style={{ color: 'var(--cor-texto-secundario)' }}
                    >
                      <UserGroupIcon className="w-3.5 h-3.5" />
                      <span>{grupo.membrosCount || 0} membros</span>
                    </div>

                    {/* BOTÃO RÁPIDO DE SAIR ADAPTADO */}
                    <button
                      onClick={(e) => handleSairRapido(e, grupo.id)}
                      disabled={processandoSair === grupo.id}
                      className="text-[9px] uppercase font-black tracking-wider transition-all flex items-center gap-1 border px-2 py-1 rounded-lg hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95"
                      style={{ 
                        backgroundColor: 'var(--cor-fundo-app)', 
                        borderColor: 'var(--cor-fundo-sidebar)',
                        color: 'var(--cor-texto-secundario)'
                      }}
                    >
                      {processandoSair === grupo.id ? (
                        <ArrowPathIcon className="w-3 h-3 animate-spin stroke-[2.5]" />
                      ) : (
                        <>
                          <ArrowLeftStartOnRectangleIcon className="w-3 h-3 stroke-[2.5]" />
                          <span>Sair</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Link Explorar com animação controlada */}
                  <span 
                    className="text-[10px] font-black uppercase tracking-widest flex items-center gap-0.5 transition-all duration-300 transform translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                    style={{ color: 'var(--cor-destaque)' }}
                  >
                    <span>Entrar</span>
                    <ArrowRightIcon className="w-3 h-3 stroke-[2.5]" />
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