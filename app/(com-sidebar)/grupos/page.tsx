"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { grupoService, GrupoResumo } from "@/app/lib/grupoService";
import ModalCriarGrupo from "@/components/grupos/ModalCriarGrupo";

import { authService } from "@/app/lib/authService";
import { 
  PlusIcon, 
  UserGroupIcon, 
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowLeftStartOnRectangleIcon,
  LockClosedIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

export default function GruposPage() {
  const [meusClubes, setMeusClubes] = useState<any[]>([]);
  const [outrosClubes, setOutrosClubes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  const [processandoSair, setProcessandoSair] = useState<number | null>(null);
  
  const meuId = authService.getUserId();
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const carregarGrupos = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const token = authService.getToken();
      
      // 1. Traz a Lista Geral Rica da API
      const todosGrupos = await grupoService.listarTodos();

      // 2. Traz a Lista do Usuário (Para usarmos como filtro)
      let meusGruposIds = new Set();
      if (token) {
        // A rota é /grupos/gruposPertence porque está na GruposController
        const resMeus = await fetch(`${BASE_URL}/usuario/gruposPertence`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (resMeus.ok) {
          const meusGruposData = await resMeus.json();
          // Guarda apenas os IDs dos grupos que o usuário participa
          meusGruposData.forEach((g: any) => meusGruposIds.add(g.id || g.Id));
        }
      }

      // 3. A MÁGICA: Cruza os dados! Usa os IDs como filtro.
      const filtradosMeus = todosGrupos.filter((g: any) => {
        const idGrupo = g.id || g.Id;
        const liderId = g.lider?.id || g.Lider?.Id;
        // Pertence se o ID do grupo veio na rota gruposPertence OU se ele for o Líder
        return meusGruposIds.has(idGrupo) || String(liderId) === String(meuId);
      });

      const filtradosOutros = todosGrupos.filter((g: any) => {
        const idGrupo = g.id || g.Id;
        const liderId = g.lider?.id || g.Lider?.Id;
        // É "Outros" apenas se não tiver o ID na lista do usuário e não for líder
        return !meusGruposIds.has(idGrupo) && String(liderId) !== String(meuId);
      });

      setMeusClubes(filtradosMeus);
      setOutrosClubes(filtradosOutros);

    } catch (err: any) {
      setErro(err.message || "Não foi possível carregar os grupos.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarGrupos();
  }, []);

  const handleSairDoGrupo = async (e: React.MouseEvent, idGrupo: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Tem certeza que deseja sair deste clube?")) return;

    setProcessandoSair(idGrupo);
    try {
      const resposta = await grupoService.sair(idGrupo);
      if (resposta.ok || resposta.status === 200 || resposta.status === 204) {
        alert("Você saiu do clube com sucesso.");
        carregarGrupos(); // Recarrega para o grupo pular de seção automaticamente
      } else {
        throw new Error("Erro ao sair do grupo.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao tentar sair do grupo.");
    } finally {
      setProcessandoSair(null);
    }
  };

  // ==========================================
  // COMPONENTE REUTILIZÁVEL: CARD DO CLUBE
  // ==========================================
  const renderCardGrupo = (grupo: any, isMeuClube: boolean) => {
    const idGrupo = grupo.id || grupo.Id;
    const nomeGrupo = grupo.nome || grupo.Nome;
    const descricaoGrupo = grupo.descricao || grupo.Descricao;
    const statusGrupo = grupo.status || grupo.Status;
    const fotoCapaGrupo = grupo.fotoCapa || grupo.FotoCapa;
    
    // 👇 O ERRO CORRIGIDO: Agora pega a quantidade exata enviada pelo C#
    const totalMembros = grupo.totalMembros ?? grupo.TotalMembros ?? 0; 
    
    const liderId = grupo.lider?.id || grupo.Lider?.Id;
    const euSouOLider = String(liderId) === String(meuId);

    return (
      <Link 
        key={idGrupo} 
        href={`/grupos/${idGrupo}`}
        className="group block rounded-3xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden relative bg-black/5 dark:bg-white/5"
        style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        {/* IMAGEM DE CAPA */}
        <div 
          className="h-32 w-full bg-cover bg-center relative"
          style={{ 
            backgroundImage: fotoCapaGrupo ? `url("${fotoCapaGrupo}")` : 'none',
            backgroundColor: 'var(--cor-fundo-sidebar)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--cor-fundo-card)] to-transparent"></div>
          
          {/* TAG DE STATUS */}
          <div className="absolute top-3 right-3">
            <span 
              className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border flex items-center gap-1"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                color: statusGrupo === "Aberto" ? 'var(--cor-destaque)' : '#FFF',
                borderColor: 'var(--cor-fundo-sidebar)'
              }}
            >
              {statusGrupo === "Fechado" && <LockClosedIcon className="w-3 h-3 stroke-[2.5]" />}
              {statusGrupo}
            </span>
          </div>
        </div>

        {/* CORPO DO CARD */}
        <div className="p-5 relative bg-[var(--cor-fundo-card)]">
          <h3 className="text-lg font-black tracking-tight mb-1 line-clamp-1 group-hover:text-[var(--cor-primaria)] transition-colors" style={{ color: 'var(--cor-texto-principal)' }}>
            {nomeGrupo}
          </h3>
          <p className="text-xs font-medium opacity-60 line-clamp-2 h-8 mb-4 leading-relaxed" style={{ color: 'var(--cor-texto-secundario)' }}>
            {descricaoGrupo || <span className="italic">Nenhuma descrição informada.</span>}
          </p>

          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
            {/* CONTAGEM DE MEMBROS */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--cor-texto-principal)' }}>
                <UserGroupIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                {totalMembros} Membros
              </span>
            </div>

            {/* BOTÕES DE AÇÃO DO CARD */}
            <div className="flex items-center gap-2">
              {isMeuClube && !euSouOLider && (
                <button 
                  onClick={(e) => handleSairDoGrupo(e, idGrupo)}
                  disabled={processandoSair === idGrupo}
                  className="px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-1 z-10"
                  style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-secundario)' }}
                >
                  {processandoSair === idGrupo ? (
                    <ArrowPathIcon className="w-3 h-3 animate-spin stroke-[2.5]" />
                  ) : (
                    <>
                      <ArrowLeftStartOnRectangleIcon className="w-3 h-3 stroke-[2.5]" />
                      <span>Sair</span>
                    </>
                  )}
                </button>
              )}
              
              <span 
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-0.5 transition-all duration-300 transform translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                style={{ color: 'var(--cor-destaque)' }}
              >
                <span>{isMeuClube ? "Acessar" : "Entrar"}</span>
                <ArrowRightIcon className="w-3 h-3 stroke-[2.5]" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="max-w-7xl mx-auto w-full pt-2 pb-24 px-4 sm:px-6 relative animate-fade-in">
      
      {/* 1. NAVBAR PRINCIPAL FIXA (STICKY TOP) */}
      <div 
        className="sticky top-0 z-40 bg-[var(--cor-fundo-app)]/90 backdrop-blur-xl border-b pb-4 pt-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
        style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>
            Clubes de Literatura
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1 flex items-center gap-1" style={{ color: 'var(--cor-texto-secundario)' }}>
            <SparklesIcon className="w-3.5 h-3.5" />
            Explore novos mundos em conjunto
          </p>
        </div>
        
        <button 
          onClick={() => setModalAberto(true)} 
          className="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 justify-center w-full sm:w-auto"
          style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
        >
          <PlusIcon className="w-4 h-4 stroke-[3]" />
          <span>Criar Clube</span>
        </button>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>
          <ArrowPathIcon className="w-8 h-8 animate-spin mb-4" style={{ color: 'var(--cor-primaria)' }} />
          <p className="font-black text-xs tracking-widest uppercase">Procurando comunidades...</p>
        </div>
      ) : erro ? (
        <div className="max-w-xl mx-auto mt-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex flex-col items-center text-center gap-3">
          <ExclamationTriangleIcon className="w-8 h-8 stroke-[2]" />
          <p className="font-bold text-sm">{erro}</p>
        </div>
      ) : meusClubes.length === 0 && outrosClubes.length === 0 ? (
        <div className="text-center py-24 opacity-60 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <UserGroupIcon className="w-16 h-16 mx-auto mb-4 stroke-[1.5]" style={{ color: 'var(--cor-primaria)' }} />
          <p className="font-black text-lg mb-2" style={{ color: 'var(--cor-texto-principal)' }}>Nenhum clube literário por aqui.</p>
          <p className="text-xs font-medium max-w-md mx-auto" style={{ color: 'var(--cor-texto-secundario)' }}>Seja o primeiro a fundar um espaço para debater suas obras favoritas!</p>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* SEÇÃO 1: MEUS CLUBES */}
          {meusClubes.length > 0 && (
            <section>
              {/* HEADER STICKY */}
              <div 
                className="sticky top-[88px] sm:top-[80px] z-30 bg-[var(--cor-fundo-app)]/95 backdrop-blur-md border-b py-3 mb-6 transition-all"
                style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--cor-primaria)' }}>
                  <UserGroupIcon className="w-5 h-5 stroke-[2.5]" />
                  Meus Clubes
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meusClubes.map((g) => renderCardGrupo(g, true))}
              </div>
            </section>
          )}

          {/* SEÇÃO 2: OUTROS CLUBES (GERAIS) */}
          {outrosClubes.length > 0 && (
            <section>
              {/* HEADER STICKY */}
              <div 
                className="sticky top-[88px] sm:top-[80px] z-30 bg-[var(--cor-fundo-app)]/95 backdrop-blur-md border-b py-3 mb-6 transition-all"
                style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
              >
                <h2 className="text-sm sm:text-base font-black uppercase tracking-widest flex items-center gap-2 opacity-60" style={{ color: 'var(--cor-texto-principal)' }}>
                  Outros Clubes
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outrosClubes.map((g) => renderCardGrupo(g, false))}
              </div>
            </section>
          )}
          
        </div>
      )}

      {modalAberto && (
        <ModalCriarGrupo onClose={() => setModalAberto(false)} />
      )} 
    </div>
  );
}