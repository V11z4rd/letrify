"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/app/lib/authService";
import { 
  ArrowLeftIcon, 
  UserGroupIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

function MembrosClubesContent() {
  const searchParams = useSearchParams();
  const idDoUsuario = searchParams.get("id");

  const [grupos, setGrupos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  useEffect(() => {
    const carregarGrupos = async () => {
      if (!idDoUsuario) {
        setErro("Usuário não identificado.");
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const token = authService.getToken();
        
        const resposta = await fetch(`${BASE_URL}/usuario/gruposPertence/${idDoUsuario}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!resposta.ok) throw new Error("Não foi possível carregar os clubes deste usuário.");

        const dados = await resposta.json();
        setGrupos(dados);
      } catch (err: any) {
        setErro(err.message || "Erro ao carregar os grupos.");
      } finally {
        setCarregando(false);
      }
    };

    carregarGrupos();
  }, [idDoUsuario, BASE_URL]);

  const renderCardGrupo = (grupo: any) => {
    const idGrupo = grupo.id || grupo.Id;
    const nomeGrupo = grupo.nome || grupo.Nome;
    const descricaoGrupo = grupo.descricao || grupo.Descricao;
    const statusGrupo = grupo.status || grupo.Status;
    const fotoCapaGrupo = grupo.fotoCapa || grupo.FotoCapa;
    const totalMembros = grupo.totalMembros ?? grupo.TotalMembros;
    
    return (
      <Link 
        key={idGrupo} 
        href={`/grupos/${idGrupo}`}
        className="group block rounded-3xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden relative bg-black/5 dark:bg-white/5"
        style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <div 
          className="h-32 w-full bg-cover bg-center relative"
          style={{ 
            backgroundImage: fotoCapaGrupo ? `url("${fotoCapaGrupo}")` : 'none',
            backgroundColor: 'var(--cor-fundo-sidebar)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--cor-fundo-card)] to-transparent"></div>
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

        <div className="p-5 relative bg-[var(--cor-fundo-card)]">
          <h3 className="text-lg font-black tracking-tight mb-1 line-clamp-1 group-hover:text-[var(--cor-primaria)] transition-colors" style={{ color: 'var(--cor-texto-principal)' }}>
            {nomeGrupo}
          </h3>
          <p className="text-xs font-medium opacity-60 line-clamp-2 h-8 mb-4 leading-relaxed" style={{ color: 'var(--cor-texto-secundario)' }}>
            {descricaoGrupo || <span className="italic">Nenhuma descrição informada.</span>}
          </p>

          <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
            <div className="flex items-center gap-3">
              {totalMembros !== undefined ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--cor-texto-principal)' }}>
                  <UserGroupIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                  {totalMembros} {totalMembros === 1 ? "Membro" : "Membros"}
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">
                  Comunidade
                </span>
              )}
            </div>

            <span 
              className="text-[10px] font-black uppercase tracking-widest flex items-center gap-0.5 transition-all duration-300 transform translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
              style={{ color: 'var(--cor-destaque)' }}
            >
              <span>Visitar</span>
              <ArrowRightIcon className="w-3 h-3 stroke-[2.5]" />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="max-w-7xl mx-auto w-full pt-4 pb-24 px-4 sm:px-6 animate-fade-in">
      
      {/* HEADER: Botão de voltar firme usando Link */}
      <div className="flex items-center gap-4 mb-8 border-b pb-6" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <Link 
          href={idDoUsuario ? `/perfil?id=${idDoUsuario}` : "/perfil"}
          className="p-2.5 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
          style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
          aria-label="Voltar para o perfil"
        >
          <ArrowLeftIcon className="w-5 h-5 stroke-[2.5]" />
        </Link>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--cor-primaria)' }}>
            Clubes Literários
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1" style={{ color: 'var(--cor-texto-secundario)' }}>
            Comunidades deste leitor
          </p>
        </div>
      </div>

      {carregando ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>
          <ArrowPathIcon className="w-8 h-8 animate-spin mb-4" style={{ color: 'var(--cor-primaria)' }} />
          <p className="font-black text-xs tracking-widest uppercase">Carregando grupos...</p>
        </div>
      ) : erro ? (
        <div className="max-w-xl mx-auto mt-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex flex-col items-center text-center gap-3">
          <ExclamationTriangleIcon className="w-8 h-8 stroke-[2]" />
          <p className="font-bold text-sm">{erro}</p>
        </div>
      ) : grupos.length === 0 ? (
        <div className="text-center py-24 opacity-60 border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <UserGroupIcon className="w-16 h-16 mx-auto mb-4 stroke-[1.5]" style={{ color: 'var(--cor-texto-secundario)' }} />
          <p className="font-black text-lg mb-2" style={{ color: 'var(--cor-texto-principal)' }}>Nenhum clube encontrado.</p>
          <p className="text-xs font-medium max-w-md mx-auto" style={{ color: 'var(--cor-texto-secundario)' }}>
            Ainda não há participação em nenhuma comunidade literária.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map(renderCardGrupo)}
        </div>
      )}
    </div>
  );
}

export default function MembrosClubesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[50vh]"><ArrowPathIcon className="w-8 h-8 animate-spin opacity-50" /></div>}>
      <MembrosClubesContent />
    </Suspense>
  );
}