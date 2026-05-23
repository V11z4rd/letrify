"use client";

import { useState, useEffect } from "react";
import { 
  CheckIcon, 
  SparklesIcon, 
  BookOpenIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { authService } from "@/app/lib/authService";

interface AnalisePremiumData {
  analise: string;
  recomendacoes: {
    titulo: string;
    autor: string;
    justificativa: string;
  }[];
}

export default function PremiumPage() {
  const [carregandoStatus, setCarregandoStatus] = useState(true);
  const [isPremium, setIsPremium] = useState<number | null>(null); // 0 = Não Premium, 1 = Premium
  
  // Estados da assinatura
  const [carregandoAssinatura, setCarregandoAssinatura] = useState(false);
  
  // Estados da Análise da IA
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [dadosIA, setDadosIA] = useState<AnalisePremiumData | null>(null);
  const [erroIA, setErroIA] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  // 1. CHECAR STATUS DE PREMIUM AO CARREGAR A TELA
  useEffect(() => {
    const checarStatusUsuario = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null;
        const usuarioId = (typeof window !== 'undefined' ? localStorage.getItem('letrify_user_id') : null) || authService.getUserId();

        if (!token || !usuarioId) {
          setIsPremium(0);
          return;
        }

        const resposta = await fetch(`${BASE_URL}/usuario/informacoes/${usuarioId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (resposta.ok) {
          const dadosDoUsuario = await resposta.json();
          
          // LOG DE DEBUG: Abra o console do navegador (F12) para ver o que o backend respondeu aqui!
          console.log("Retorno do payload do usuário:", dadosDoUsuario);
          
          // Mapeia rigidamente se é premium
          const statusPremium = 
            Number(dadosDoUsuario.premium) === 1 || 
            dadosDoUsuario.isPremium === true || 
            dadosDoUsuario.premium === "1" ? 1 : 0;
            
          setIsPremium(statusPremium);

          // Se for premium, dispara a busca da IA
          if (statusPremium === 1) {
            await buscarAnaliseLiterariaIA(token);
          }
        } else {
          setIsPremium(0);
        }
      } catch (err) {
        console.error("Erro crítico ao buscar informações do usuário:", err);
        setIsPremium(0); 
      } finally {
        setCarregandoStatus(false);
      }
    };

    checarStatusUsuario();
  }, [BASE_URL]);

  // 2. DISPARAR INTEGRAÇÃO DA IA (GEMINI)
  const buscarAnaliseLiterariaIA = async (tokenExistente?: string) => {
    setCarregandoIA(true);
    setErroIA(null);
    try {
      const token = tokenExistente || authService.getToken() || (typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null);
      
      const resposta = await fetch(`${BASE_URL}/premium/analise`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!resposta.ok) {
        // Se a resposta for 404 ou erro, não quebramos a verificação de assinatura
        throw new Error("Você ainda não possui um relatório gerado. Clique em 'Atualizar Relatório' para iniciar.");
      }

      const data = await resposta.json();
      setDadosIA(data);
    } catch (err: any) {
      // Captura o erro apenas para a caixa de texto da IA, sem alterar o estado do isPremium
      setErroIA(err.message || "Erro de conexão com o ecossistema de IA.");
    } finally {
      setCarregandoIA(false);
    }
  };

  // 3. ENVIAR REQUISIÇÃO DE ASSINATURA PRO
  const lidarComAssinatura = async () => {
    setCarregandoAssinatura(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null;
      
      if (!token) {
        alert("Você precisa estar logado para assinar o Letrify Pro.");
        return;
      }

      const resposta = await fetch(`${BASE_URL}/usuario/tornar-premium`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ activar: true }) 
      });
      
      if (resposta.ok) {
        alert("Parabéns! Agora você é um leitor Premium Letrify! 🎉");
        window.location.reload();
      } else {
        const erroData = await resposta.json().catch(() => ({}));
        alert(erroData.erro || "Ocorreu um erro ao processar sua assinatura.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor. Tente novamente mais tarde.");
    } finally {
      setCarregandoAssinatura(false);
    }
  };

  const diferenciais = [
    { icone: ChartBarIcon, titulo: "Gráficos de Teia Completos", descricao: "Desbloqueie análises profundas sobre os seus hábitos de leitura, autores favoritos e distribuição detalhada." },
    { icone: BookOpenIcon, titulo: "Estante Sem Limites", descricao: "Adicione quantos livros quiser nas suas seções de 'Lidos', 'Lendo' e 'Quero Ler'." },
    { icone: UserGroupIcon, titulo: "Comunidades e Guias", descricao: "Crie ou participe de clubes de leitura, compartilhe guias literários exclusivos e interaja." },
    { icone: ShieldCheckIcon, titulo: "Navegação Sem Anúncios", descricao: "Uma experiência totalmente limpa, focada e imersiva nas suas estatísticas, livre de interrupções." }
  ];

  const vantagensPlano = [
    "Acesso ilimitado aos gráficos de Radar (Teia)",
    "Metas de leitura anuais personalizadas",
    "Selos exclusivos de assinante no perfil",
    "Exportação de dados de leitura em PDF/CSV",
    "Suporte prioritário da equipe Letrify"
  ];

  if (carregandoStatus) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-3">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-[var(--cor-primaria)] stroke-[2.5]" />
        <p className="text-xs font-black uppercase tracking-widest opacity-60">Sincronizando Ecossistema Letrify...</p>
      </div>
    );
  }

  // ==================== TELA SE FOR PREMIUM (isPremium === 1) ====================
  if (isPremium === 1) {
    return (
      <div className="min-h-screen w-full py-12 px-4 md:px-8 max-w-4xl mx-auto flex flex-col justify-center animate-fade-in space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 bg-amber-500/10 text-amber-500">
              <SparklesIcon className="w-3.5 h-3.5 stroke-[2]" />
              <span>Assinatura Pro Ativa</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>Seu Painel de Inteligência</h1>
          </div>
          
          <button
            onClick={() => buscarAnaliseLiterariaIA()}
            disabled={carregandoIA}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
            style={{ color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 stroke-[2.5] ${carregandoIA ? 'animate-spin' : ''}`} />
            <span>Atualizar Relatório</span>
          </button>
        </div>

        {carregandoIA && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-amber-500 stroke-[2.5]" />
            <p className="text-xs font-black uppercase tracking-widest text-amber-500 animate-pulse">Google Gemini decodificando sua estante...</p>
          </div>
        )}

        {erroIA && !carregandoIA && (
          <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] text-center max-w-md mx-auto">
            <p className="text-[var(--cor-texto-principal)] text-sm font-medium mb-4">{erroIA}</p>
            <button 
              onClick={() => buscarAnaliseLiterariaIA()} 
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 text-black transition-all active:scale-95"
            >
              Gerar Diagnóstico Agora
            </button>
          </div>
        )}

        {dadosIA && !carregandoIA && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl border" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 stroke-[2]" />
                <span>Análise de Perfil por Inteligência Artificial</span>
              </h3>
              <p className="text-sm leading-relaxed font-medium opacity-90 whitespace-pre-wrap" style={{ color: 'var(--cor-texto-principal)' }}>
                {dadosIA.analise}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-50 px-1" style={{ color: 'var(--cor-texto-principal)' }}>
                5 Recomendações Baseadas na sua Estante
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {dadosIA.recomendacoes?.map((livro, idx) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-2xl border transition-all"
                    style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
                  >
                    <div className="flex justify-between items-baseline gap-4 mb-2">
                      <span className="font-black text-base" style={{ color: 'var(--cor-texto-principal)' }}>{livro.titulo}</span>
                      <span className="text-xs font-bold shrink-0 text-amber-500">{livro.autor}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium opacity-60 leading-relaxed" style={{ color: 'var(--cor-texto-secundario)' }}>
                      {livro.justificativa}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== TELA SE NÃO FOR PREMIUM (isPremium === 0) ====================
  return (
    <div className="min-h-screen w-full py-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col justify-center animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-32 h-32 bg-[var(--cor-primaria)] opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 bg-[var(--cor-primaria)]/10 text-[var(--cor-primaria)]">
          <SparklesIcon className="w-4 h-4 stroke-[2]" />
          <span>Letrify Pro</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>
          Leve a sua jornada literária ao próximo nível
        </h1>
        <p className="mt-4 text-sm md:text-base font-medium opacity-70" style={{ color: 'var(--cor-texto-secundario)' }}>
          Estatísticas avançadas, estantes ilimitadas e uma comunidade apaixonada por livros esperando por você.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-7 gap-4">
          {diferenciais.map((item, idx) => {
            const Icone = item.icone;
            return (
              <div key={idx} className="p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-transparent to-black/[0.01] dark:to-white/[0.01]" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border" style={{ backgroundColor: 'var(--cor-botao-primario)', borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-primaria)' }}>
                  <Icone className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold tracking-tight mb-2" style={{ color: 'var(--cor-texto-principal)' }}>{item.titulo}</h3>
                <p className="text-xs font-medium leading-relaxed opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>{item.descricao}</p>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="rounded-3xl border p-8 shadow-2xl relative overflow-hidden transition-all duration-300" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-primaria)' }}>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--cor-primaria)] opacity-10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="mb-6">
              <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>Plano Mensal</h3>
              <p className="text-xs font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>Cancele a qualquer momento, sem taxas ocultas.</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-2xl font-black" style={{ color: 'var(--cor-texto-principal)' }}>R$</span>
              <span className="text-5xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>14,90</span>
              <span className="text-xs font-bold opacity-60 ml-1" style={{ color: 'var(--cor-texto-secundario)' }}>/ mês</span>
            </div>

            <ul className="space-y-3.5 mb-8">
              {vantagensPlano.map((vantagem, index) => (
                <li key={index} className="flex items-start gap-3 text-xs font-semibold">
                  <div className="rounded-full p-0.5 mt-0.5 flex-shrink-0" style={{ backgroundColor: 'var(--cor-botao-primario)' }}>
                    <CheckIcon className="w-3 h-3 stroke-[3.5] text-white" />
                  </div>
                  <span style={{ color: 'var(--cor-texto-principal)' }}>{vantagem}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={lidarComAssinatura}
              disabled={carregandoAssinatura}
              className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
              style={{ backgroundColor: 'var(--cor-botao-primario)', color: '#FFFFFF' }}
            >
              {carregandoAssinatura ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processando...</span>
                </div>
              ) : (
                "Seja Premium Agora"
              )}
            </button>
            <p className="text-center text-[10px] font-bold opacity-40 mt-4 uppercase tracking-widest" style={{ color: 'var(--cor-texto-secundario)' }}>Pagamento 100% Seguro</p>
          </div>
        </div>
      </div>
    </div>
  );
}