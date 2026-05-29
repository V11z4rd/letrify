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

export default function PremiumPage() {
  const [carregandoAssinatura, setCarregandoAssinatura] = useState(false);
  const [carregandoPagina, setCarregandoPagina] = useState(true);
  
  // Estados para o Painel Premium
  const [isPremium, setIsPremium] = useState(false);
  const [analiseIa, setAnaliseIa] = useState<any>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  // Ao montar a página, tenta buscar a análise premium
  useEffect(() => {
    const verificarStatusPremium = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null;
        if (!token) {
          setCarregandoPagina(false);
          return;
        }

        const resposta = await fetch(`${BASE_URL}/premium/analise`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (resposta.ok) {
          const dados = await resposta.json();
          console.log("🕵️ ESPIÃO DA IA - O que a API Premium retornou:", dados);
          
          setAnaliseIa(dados);
          setIsPremium(true);
        } else {
          setIsPremium(false);
        }
      } catch (err) {
        console.error("Erro ao verificar status premium:", err);
        setIsPremium(false);
      } finally {
        setCarregandoPagina(false);
      }
    };

    verificarStatusPremium();
  }, [BASE_URL]);

  const lidarComAssinatura = async () => {
    setCarregandoAssinatura(true);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null;
      const userId = typeof window !== 'undefined' ? localStorage.getItem('letrify_user_id') : null;
      
      if (!token || !userId) {
        alert("Você precisa estar logado para assinar o Letrify Pro.");
        setCarregandoAssinatura(false);
        return;
      }
      
      const resposta = await fetch(`${BASE_URL}/usuario/premium/${userId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
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
    { icone: ChartBarIcon, titulo: "Gráficos de Teia Completos", descricao: "Desbloqueie análises profundas sobre os seus hábitos de leitura, autores favoritos e distribuição detalhada de gêneros literários." },
    { icone: BookOpenIcon, titulo: "Estante Sem Limites", descricao: "Adicione quantos livros quiser nas suas seções de 'Lidos', 'Lendo' e 'Quero Ler' sem restrições de armazenamento." },
    { icone: UserGroupIcon, titulo: "Comunidades e Guias", descricao: "Crie ou participe de clubes de leitura, compartilhe guias literários exclusivos e interaja com círculos fechados de leitores." },
    { icone: ShieldCheckIcon, titulo: "Navegação Sem Anúncios", descricao: "Uma experiência totalmente limpa, focada e imersiva nas suas estatísticas e resumos, livre de interrupções." }
  ];

  const vantagensPlano = [
    "Acesso ilimitado aos gráficos de Radar (Teia)",
    "Metas de leitura anuais personalizadas",
    "Selos exclusivos de assinante no perfil",
    "Exportação de dados de leitura em PDF/CSV",
    "Suporte prioritário da equipe Letrify"
  ];

  if (carregandoPagina) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-50">
        <ArrowPathIcon className="w-10 h-10 animate-spin mb-4" style={{ color: 'var(--cor-primaria)' }} />
        <p className="font-bold text-xs uppercase tracking-widest" style={{ color: 'var(--cor-texto-principal)' }}>Verificando credenciais...</p>
      </div>
    );
  }

  // ==========================================
  // ECRÃ 1: UTILIZADOR JÁ É PREMIUM (DASHBOARD IA)
  // ==========================================
  if (isPremium && analiseIa) {
    return (
      <div className="max-w-4xl mx-auto w-full pt-8 pb-24 px-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--cor-texto-principal)' }}>Seu Painel Premium</h1>
            <p className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Análise Literária com IA</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* BLOCO DA IA (Mapeando corretamente para o "analise" do JSON) */}
          <div className="p-6 sm:p-8 rounded-3xl border shadow-lg bg-gradient-to-br from-black/5 to-transparent dark:from-white/5" style={{ borderColor: 'var(--cor-primaria)' }}>
            <h2 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--cor-primaria)' }}>
              <BookOpenIcon className="w-5 h-5 stroke-[2.5]" />
              Sua Essência Literária
            </h2>
            <div className="text-sm leading-relaxed font-medium whitespace-pre-wrap opacity-90" style={{ color: 'var(--cor-texto-principal)' }}>
              {analiseIa.analise || "A IA ainda está processando o seu perfil. Continue lendo!"}
            </div>
          </div>

          {/* NOVO BLOCO: ESTATÍSTICAS (Aproveitando os dados que o Backend mandou) */}
          {analiseIa.estatisticas && (
            <div className="p-6 sm:p-8 rounded-3xl border shadow-lg" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2" style={{ color: 'var(--cor-texto-principal)' }}>
                <ChartBarIcon className="w-5 h-5 stroke-[2.5] text-yellow-500" />
                Raio-X da sua Estante
              </h2>
              
              {/* Contadores Principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--cor-texto-principal)' }}>{analiseIa.estatisticas.totalLivros || 0}</div>
                  <div className="text-[9px] uppercase tracking-widest font-bold opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Total na Estante</div>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--cor-texto-principal)' }}>{analiseIa.estatisticas.lidos || 0}</div>
                  <div className="text-[9px] uppercase tracking-widest font-bold opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Livros Lidos</div>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                  <div className="text-2xl font-black text-blue-500">{analiseIa.estatisticas.lendo || 0}</div>
                  <div className="text-[9px] uppercase tracking-widest font-bold opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Lendo Agora</div>
                </div>
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                  <div className="text-2xl font-black text-green-500">{analiseIa.estatisticas.quereler || 0}</div>
                  <div className="text-[9px] uppercase tracking-widest font-bold opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Quero Ler</div>
                </div>
              </div>

              {/* Tags de Autores e Temas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3" style={{ color: 'var(--cor-texto-secundario)' }}>Top Autores</h3>
                  <div className="flex flex-wrap gap-2">
                    {analiseIa.estatisticas.topAutores?.length > 0 ? analiseIa.estatisticas.topAutores.map((item: any, i: number) => (
                      <span key={i} className="text-[10px] font-bold px-3 py-1.5 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}>
                        {item.autor} <span className="opacity-40 ml-1">({item.quantidade})</span>
                      </span>
                    )) : <span className="text-xs opacity-40 italic">Sem dados suficientes</span>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3" style={{ color: 'var(--cor-texto-secundario)' }}>Gêneros Favoritos</h3>
                  <div className="flex flex-wrap gap-2">
                    {analiseIa.estatisticas.topTemas?.length > 0 ? analiseIa.estatisticas.topTemas.map((item: any, i: number) => (
                      <span key={i} className="text-[10px] font-bold px-3 py-1.5 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}>
                        {item.tema} <span className="opacity-40 ml-1">({item.quantidade})</span>
                      </span>
                    )) : <span className="text-xs opacity-40 italic">Sem dados suficientes</span>}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // ECRÃ 2: UTILIZADOR NÃO É PREMIUM (VITRINE)
  // ==========================================
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
              <div 
                key={idx} 
                className="p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-transparent to-black/[0.01] dark:to-white/[0.01]"
                style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border" style={{ backgroundColor: 'var(--cor-botao-primario)', borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-primaria)' }}>
                  <Icone className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold tracking-tight mb-2" style={{ color: 'var(--cor-texto-principal)' }}>
                  {item.titulo}
                </h3>
                <p className="text-xs font-medium leading-relaxed opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
                  {item.descricao}
                </p>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div 
            className="rounded-3xl border p-8 shadow-2xl relative overflow-hidden transition-all duration-300"
            style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-primaria)' }}
          >
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
              style={{ 
                backgroundColor: 'var(--cor-botao-primario)', 
                color: '#FFFFFF' 
              }}
            >
              {carregandoAssinatura ? (
                <div className="flex items-center justify-center gap-2">
                  <ArrowPathIcon className="animate-spin h-4 w-4 text-white stroke-[3]" />
                  <span>Processando...</span>
                </div>
              ) : (
                "Seja Premium Agora"
              )}
            </button>

            <p className="text-center text-[10px] font-bold opacity-40 mt-4 uppercase tracking-widest" style={{ color: 'var(--cor-texto-secundario)' }}>
              Pagamento 100% Seguro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
