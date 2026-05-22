"use client";

import { useState } from "react";
import { 
  CheckIcon, 
  SparklesIcon, 
  BookOpenIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import { authService } from "@/app/lib/authService"; // Importado para garantir a captura do ID do usuário

export default function PremiumPage() {
  const [carregando, setCarregando] = useState(false);
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const lidarComAssinatura = async () => {
    setCarregando(true);
    
    try {
      // 1. Pegar o Token do usuário de forma segura
      const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null;
      
      // 2. Pegar o ID do usuário usando o service como fallback seguro
      const usuarioId = 
        (typeof window !== 'undefined' ? localStorage.getItem('letrify_user_id') : null) || 
        authService.getUserId();
      
      if (!token || !usuarioId) {
        alert("Você precisa estar logado para assinar o Letrify Pro.");
        setCarregando(false);
        return;
      }

      // Requisição para a rota correta da sua especificação da API
      const resposta = await fetch(`${BASE_URL}/usuario/premium/${usuarioId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        // CORREÇÃO: "ativar" em português para bater com o seu backend
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
      setCarregando(false);
    }
  };

  const diferenciais = [
    {
      icone: ChartBarIcon,
      titulo: "Gráficos de Teia Completos",
      descricao: "Desbloqueie análises profundas sobre os seus hábitos de leitura, autores favoritos e distribuição detalhada de gêneros literários."
    },
    {
      icone: BookOpenIcon,
      titulo: "Estante Sem Limites",
      descricao: "Adicione quantos livros quiser nas suas seções de 'Lidos', 'Lendo' e 'Quero Ler' sem restrições de armazenamento."
    },
    {
      icone: UserGroupIcon,
      titulo: "Comunidades e Guias",
      descricao: "Crie ou participe de clubes de leitura, compartilhe guias literários exclusivos e interaja com círculos fechados de leitores."
    },
    {
      icone: ShieldCheckIcon,
      titulo: "Navegação Sem Anúncios",
      descricao: "Uma experiência totalmente limpa, focada e imersiva nas suas estatísticas e resumos, livre de interrupções."
    }
  ];

  const vantagensPlano = [
    "Acesso ilimitado aos gráficos de Radar (Teia)",
    "Metas de leitura anuais personalizadas",
    "Selos exclusivos de assinante no perfil",
    "Exportação de dados de leitura em PDF/CSV",
    "Suporte prioritário da equipe Letrify"
  ];

  return (
    <div className="min-h-screen w-full py-12 px-4 md:px-8 max-w-6xl mx-auto flex flex-col justify-center animate-fade-in">
      
      {/* CABEÇALHO */}
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

      {/* GRID DE CONTEÚDO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* CARDS DE BENEFÍCIOS (ESQUERDA) */}
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

        {/* CARD DE ASSINATURA / PREÇO (DIREITA) */}
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

            {/* LISTA DE VANTAGENS */}
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

            {/* BOTÃO DE AÇÃO */}
            <button
              onClick={lidarComAssinatura}
              disabled={carregando}
              className="w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
              style={{ 
                backgroundColor: 'var(--cor-botao-primario)', 
                color: '#FFFFFF' 
              }}
            >
              {carregando ? (
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

            <p className="text-center text-[10px] font-bold opacity-40 mt-4 uppercase tracking-widest" style={{ color: 'var(--cor-texto-secundario)' }}>
              Pagamento 100% Seguro
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}