"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { metasService, MetaLeitura } from "@/app/lib/metasService";
import { 
  ArrowLeftIcon, 
  FireIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  BookOpenIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

export default function ConfigurarMetasPage() {
  const router = useRouter();

  // Estados da Tela
  const [metas, setMetas] = useState<MetaLeitura[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estados do Formulário
  const [tipo, setTipo] = useState<"Paginas" | "Minutos" | "Livros">("Paginas");
  const [periodicidade, setPeriodicidade] = useState<"Diaria" | "Semanal" | "Mensal">("Diaria");
  const [valorAlvo, setValorAlvo] = useState<number | "">("");

  const carregarMetas = async () => {
    setCarregando(true);
    try {
      const dados = await metasService.listarMetasAtivas();
      setMetas(dados);
    } catch (err: any) {
      setErro(err.message || "Erro ao carregar suas metas.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarMetas();
  }, []);

  const handleCriarMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorAlvo || valorAlvo <= 0) {
      alert("Por favor, insira um valor válido maior que zero.");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      await metasService.criarMeta(tipo, periodicidade, Number(valorAlvo));
      setValorAlvo(""); // Limpa o input
      carregarMetas(); // Recarrega a lista para mostrar a nova meta (e sumir com a antiga se houver sobreposição)
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleDesativarMeta = async (metaId: number) => {
    if (!confirm("Tem a certeza que deseja remover esta meta de leitura?")) return;
    try {
      await metasService.desativarMeta(metaId);
      setMetas(prev => prev.filter(m => m.id !== metaId));
    } catch (err: any) {
      alert("Erro ao remover meta: " + err.message);
    }
  };

  // Ícones mapeados para cada tipo de meta
  const IconesMeta = {
    Paginas: DocumentTextIcon,
    Minutos: ClockIcon,
    Livros: BookOpenIcon
  };

  return (
    <div className="max-w-3xl mx-auto w-full pt-4 pb-24 px-4 sm:px-6 animate-fade-in relative">
      
      {/* HEADER STICKY (Padrão mobile-first de voltar) */}
      <div 
        className="sticky top-0 z-40 bg-[var(--cor-fundo-app)]/95 backdrop-blur-xl border-b py-4 mb-8 flex items-center gap-4 transition-all"
        style={{ borderColor: 'var(--cor-fundo-sidebar)', margin: '0 -16px', paddingLeft: '16px', paddingRight: '16px' }}
      >
        <button 
          onClick={() => router.back()}
          className="p-2.5 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 shrink-0"
          style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
        >
          <ArrowLeftIcon className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--cor-texto-principal)' }}>
            <FireIcon className="w-6 h-6 stroke-[2.5]" style={{ color: 'var(--cor-destaque)' }} />
            Metas de Leitura
          </h1>
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-60 mt-0.5" style={{ color: 'var(--cor-texto-secundario)' }}>
            Acompanhe o seu progresso diário
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* COLUNA 1: CRIAR NOVA META */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'var(--cor-texto-principal)' }}>Definir Novo Alvo</h2>
          
          <form 
            onSubmit={handleCriarMeta}
            className="p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col gap-6 transition-all"
            style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            {/* TIPO DE META */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-3 opacity-80" style={{ color: 'var(--cor-texto-secundario)' }}>O que deseja rastrear?</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(["Paginas", "Minutos", "Livros"] as const).map(t => {
                  const Icone = IconesMeta[t];
                  const ativo = tipo === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipo(t)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95 ${ativo ? 'shadow-md' : 'opacity-60 grayscale'}`}
                      style={{ 
                        borderColor: ativo ? 'var(--cor-destaque)' : 'var(--cor-fundo-sidebar)',
                        backgroundColor: ativo ? 'rgba(var(--cor-destaque-rgb), 0.05)' : 'transparent',
                        color: ativo ? 'var(--cor-destaque)' : 'var(--cor-texto-principal)'
                      }}
                    >
                      <Icone className={`w-6 h-6 ${ativo ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{t === "Paginas" ? "Páginas" : t}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FREQUÊNCIA */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-3 opacity-80" style={{ color: 'var(--cor-texto-secundario)' }}>Frequência</label>
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                {(["Diaria", "Semanal", "Mensal"] as const).map(p => {
                  const ativo = periodicidade === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriodicidade(p)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${ativo ? 'shadow-sm' : 'opacity-50'}`}
                      style={{ 
                        backgroundColor: ativo ? 'var(--cor-fundo-card)' : 'transparent',
                        color: ativo ? 'var(--cor-texto-principal)' : 'var(--cor-texto-secundario)'
                      }}
                    >
                      {p === "Diaria" ? "Diária" : p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUANTIDADE / VALOR ALVO */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-3 opacity-80" style={{ color: 'var(--cor-texto-secundario)' }}>Quantidade de {tipo === "Paginas" ? "Páginas" : tipo}</label>
              <input 
                type="number" 
                min="1"
                required
                value={valorAlvo}
                onChange={(e) => setValorAlvo(e.target.value ? Number(e.target.value) : "")}
                placeholder="Ex: 20"
                className="w-full text-center text-3xl font-black rounded-2xl p-4 border outline-none focus:ring-2 transition-shadow"
                style={{ 
                  backgroundColor: 'var(--cor-fundo-app)', 
                  borderColor: 'var(--cor-fundo-sidebar)',
                  color: 'var(--cor-texto-principal)',
                  '--tw-ring-color': 'var(--cor-destaque)'
                } as any}
              />
            </div>

            <button 
              type="submit"
              disabled={salvando || !valorAlvo}
              className="w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 mt-2"
              style={{ backgroundColor: 'var(--cor-destaque)', color: '#ffffff' }}
            >
              {salvando ? <ArrowPathIcon className="w-5 h-5 animate-spin stroke-[2.5]" /> : <PlusIcon className="w-5 h-5 stroke-[2.5]" />}
              <span>Criar Meta</span>
            </button>
            <p className="text-[9px] text-center font-bold opacity-40 uppercase tracking-widest" style={{ color: 'var(--cor-texto-secundario)' }}>
              Criar uma nova meta de {tipo === "Paginas" ? "Páginas" : tipo} substituirá a anterior.
            </p>
          </form>
        </section>

        {/* COLUNA 2: LISTA DE METAS ATIVAS */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'var(--cor-texto-principal)' }}>Seus Alvos Ativos</h2>
          
          <div className="flex flex-col gap-4">
            {carregando ? (
              <div className="flex justify-center p-8 opacity-50"><ArrowPathIcon className="w-8 h-8 animate-spin" /></div>
            ) : metas.length === 0 ? (
              <div className="text-center p-10 border-2 border-dashed rounded-3xl opacity-50" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                <FireIcon className="w-12 h-12 mx-auto mb-3 stroke-[1.5]" />
                <p className="text-sm font-bold">Nenhuma meta ativa.</p>
                <p className="text-xs mt-1">Configure o seu primeiro alvo ao lado!</p>
              </div>
            ) : (
              metas.map(meta => {
                const IconeCard = IconesMeta[meta.tipo];
                return (
                  <div 
                    key={meta.id}
                    className="p-5 rounded-3xl border flex items-center justify-between group transition-all hover:-translate-y-1 shadow-sm hover:shadow-md bg-[var(--cor-fundo-card)]"
                    style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--cor-destaque-rgb), 0.1)', color: 'var(--cor-destaque)' }}>
                        <IconeCard className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>
                          {meta.valorAlvo} <span className="text-sm font-bold opacity-60 uppercase">{meta.tipo === "Paginas" ? "Páginas" : meta.tipo}</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
                          Frequência {meta.periodicidade}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDesativarMeta(meta.id)}
                      className="p-2.5 rounded-xl border opacity-30 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-95"
                      style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
                      title="Remover Meta"
                    >
                      <TrashIcon className="w-5 h-5 stroke-[2]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>
    </div>
  );
}