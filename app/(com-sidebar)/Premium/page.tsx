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
  // MODIFICAÇÃO DE TESTE: Iniciamos como false para ver a tela carregando por 1 segundo
  const [carregandoStatus, setCarregandoStatus] = useState(true);
  
  // MODIFICAÇÃO DE TESTE: Forçado estaticamente para 1 para pular a tela de assinatura e exibir os recursos Pro
  const [isPremium, setIsPremium] = useState<number | null>(1); 
  
  // Estados da assinatura
  const [carregandoAssinatura, setCarregandoAssinatura] = useState(false);
  
  // Estados da Análise da IA
  const [carregandoIA, setCarregandoIA] = useState(false);
  const [erroIA, setErroIA] = useState<string | null>(null);

  // MODIFICAÇÃO DE TESTE: Dados mockados aplicados diretamente para renderizar a interface Pro sem erros de API
  const [dadosIA, setDadosIA] = useState<AnalisePremiumData | null>({
    analise: "O seu perfil demonstra uma forte inclinação para narrativas complexas e desenvolvimento profundo de personagens. Há um equilíbrio cirúrgico entre ficção contemporânea e clássicos modernos na sua estante virtual, indicando que você busca leituras que provocam reflexão crítica e debates existenciais fundamentados.",
    recomendacoes: [
      { titulo: "Cem Anos de Solidão", autor: "Gabriel García Márquez", justificativa: "Pelo seu apreço por tramas multigeracionais e realismo mágico de alta imersão." },
      { titulo: "A Coisa", autor: "Stephen King", justificativa: "Com base na sua preferência por calhamaços com forte desenvolvimento psicológico e mistério." },
      { titulo: "Admirável Mundo Novo", autor: "Aldous Huxley", justificativa: "Ideal para complementar sua estante de distopias políticas e ficção científica clássica." },
      { titulo: "O Avesso da Pele", autor: "Jeferson Tenório", justificativa: "Uma recomendação contemporânea impactante que casa perfeitamente com as resenhas que você consuma interagir." },
      { titulo: "Ficções", autor: "Jorge Luis Borges", justificativa: "Para desafiar seu lado de leitor analítico com labirintos conceituais e metáforas filosóficas." }
    ]
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  // 1. CHECAR STATUS DE PREMIUM AO CARREGAR A TELA
  useEffect(() => {
    const checarStatusUsuario = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null;
        const usuarioId = (typeof window !== 'undefined' ? localStorage.getItem('letrify_user_id') : null) || authService.getUserId();

        if (!token || !usuarioId) {
          // Mantido comportamento padrão, mas ignorado pelo estado forçado acima
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
          const statusPremium = Number(dadosDoUsuario.premium) === 1 || dadosDoUsuario.isPremium === true || dadosDoUsuario.premium === "1" ? 1 : 0;
          
          /* COMENTADO PARA TESTE LOCAL:
            Descomente a linha abaixo quando for enviar para produção para voltar a respeitar o banco de dados.
          */
          // setIsPremium(statusPremium);

          // Se em produção for premium de verdade, tenta buscar dados atualizados da API
          if (statusPremium === 1) {
            const tokenValido = token || authService.getToken();
            if (tokenValido) buscarAnaliseLiterariaIA(tokenValido);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar informações do usuário:", err);
      } finally {
        // Simula o delay de resposta para fins estéticos de carregamento da interface
        setTimeout(() => {
          setCarregandoStatus(false);
        }, 800);
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

      if (!resposta.ok) throw new Error("Não foi possível decodificar seus dados literários agora.");

      const data = await resposta.json();
      setDadosIA(data);
    } catch (err: any) {
      // No modo de teste local, não deixamos a tela quebrar se a rota do backend falhar
      console.log("Mantendo dados fictícios ativos devido ao ambiente de preview local.");
    } finally {
      // Simula um loading rápido na interface ao clicar em atualizar
      setTimeout(() => {
        setCarregandoIA(false);
      }, 1000);
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
        body: JSON.stringify({ ativar: true }) 
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
        <p className="text-xs font-black uppercase tracking-widest opacity-60">Modo de Teste: Forçando Interface Pro...</p>
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
              <span>Visualização de Teste Ativa</span>
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
            <span>Simular Atualização</span>
          </button>
        </div>

        {carregandoIA && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-amber-500 stroke-[2.5]" />
            <p className="text-xs font-black uppercase tracking-widest text-amber-500 animate-pulse">Google Gemini decodificando sua estante...</p>
          </div>
        )}

        {erroIA && !carregandoIA && (
          <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.02] text-center max-w-md mx-auto">
            <p className="text-red-500 text-xs font-bold mb-3">{erroIA}</p>
            <button onClick={() => buscarAnaliseLiterariaIA()} className="text-xs font-black uppercase tracking-wider text-amber-500 hover:underline">Tentar de novo</button>
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
                5 Recomendações Cirúrgicas Baseadas na sua Estante
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
      {/* Elementos ocultos temporariamente por conta da condicional isPremium acima */}
    </div>
  );
}