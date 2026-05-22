"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Interruptor from "@/components/Interruptor";
import CaixaSelecao from "@/components/CaixaSelecao";
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  LockClosedIcon, 
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

const OPCOES_INTERACAO = [
  { valor: "todos", rotulo: "Qualquer pessoa" },
  { valor: "seguidores", rotulo: "Apenas Seguidores" },
  { valor: "ninguem", rotulo: "Ninguém" }
];

export default function PrivacidadePage() {
  const [carregando, setCarregando] = useState(true);
  
  const [contaPrivada, setContaPrivada] = useState(false);
  const [ocultarBuscas, setOcultarBuscas] = useState(false);
  const [mostrarEstante, setMostrarEstante] = useState(true);
  const [mostrarResenhas, setMostrarResenhas] = useState(true);
  const [mostrarConexoes, setMostrarConexoes] = useState(true);
  const [quemPodeMensagem, setQuemPodeMensagem] = useState("todos");
  const [quemPodeGrupo, setQuemPodeGrupo] = useState("seguidores");

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("letrify-privacidade");
    if (dadosSalvos) {
      const p = JSON.parse(dadosSalvos);
      setContaPrivada(p.contaPrivada ?? false);
      setOcultarBuscas(p.ocultarBuscas ?? false);
      setMostrarEstante(p.mostrarEstante ?? true);
      setMostrarResenhas(p.mostrarResenhas ?? true);
      setMostrarConexoes(p.mostrarConexoes ?? true);
      setQuemPodeMensagem(p.quemPodeMensagem ?? "todos");
      setQuemPodeGrupo(p.quemPodeGrupo ?? "seguidores");
    }
    setCarregando(false);
  }, []);

  const salvarPreferencia = (chave: string, valor: any) => {
    const novasPreferencias = {
      contaPrivada, ocultarBuscas, mostrarEstante, mostrarResenhas, 
      mostrarConexoes, quemPodeMensagem, quemPodeGrupo,
      [chave]: valor 
    };
    
    localStorage.setItem("letrify-privacidade", JSON.stringify(novasPreferencias));
    
    if (chave === 'contaPrivada') setContaPrivada(valor);
    if (chave === 'ocultarBuscas') setOcultarBuscas(valor);
    if (chave === 'mostrarEstante') setMostrarEstante(valor);
    if (chave === 'mostrarResenhas') setMostrarResenhas(valor);
    if (chave === 'mostrarConexoes') setMostrarConexoes(valor);
    if (chave === 'quemPodeMensagem') setQuemPodeMensagem(valor);
    if (chave === 'quemPodeGrupo') setQuemPodeGrupo(valor);
  };

  if (carregando) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-32 text-xs font-black uppercase tracking-widest gap-3 animate-pulse"
        style={{ color: 'var(--cor-texto-secundario)' }}
      >
        <ArrowPathIcon className="w-6 h-6 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
        <span>Sincronizando suas chaves de segurança...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-6 px-4 pb-32 animate-fade-in space-y-10">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--cor-texto-principal)' }}>Privacidade</h1>
        <p className="text-xs sm:text-sm font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
          Controle quem pode ver o seu perfil e interagir com você no Letrify.
        </p>
      </div>

      {/* BLOCO 1: VISIBILIDADE GLOBAL */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
          <ShieldCheckIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Visibilidade Global</span>
        </h2>
        
        <div className="space-y-3">
          <Interruptor 
            titulo="Conta Privada"
            descricao="Apenas os seguidores aprovados poderão ver as suas resenhas, guias e estante."
            ativo={contaPrivada}
            aoAlternar={() => salvarPreferencia('contaPrivada', !contaPrivada)}
          />

          <Interruptor 
            titulo="Ocultar das buscas"
            descricao="O seu perfil não aparecerá quando outros utilizadores pesquisarem pelo seu nome."
            ativo={ocultarBuscas}
            aoAlternar={() => salvarPreferencia('ocultarBuscas', !ocultarBuscas)}
          />
        </div>
      </section>

      {/* BLOCO 2: DETALHES DO PERFIL COM OVERLAY SEGURO */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
          <LockClosedIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Componentes do Perfil</span>
        </h2>
        
        <div className="relative flex flex-col gap-3 w-full">
          {contaPrivada && (
            <div 
              className="absolute inset-x-0 -top-2 -bottom-2 z-10 flex flex-col items-center justify-center rounded-2xl backdrop-blur-[3px] border border-dashed transition-all p-4 text-center" 
              style={{ 
                backgroundColor: 'rgba(var(--cor-fundo-app-rgb, 245, 241, 232), 0.75)', 
                borderColor: 'var(--cor-fundo-sidebar)',
                cursor: 'not-allowed'
              }}
            >
              <div 
                className="p-5 rounded-2xl border max-w-sm shadow-xl animate-scale-up flex flex-col items-center gap-3"
                style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500">
                  <LockClosedIcon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-extrabold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>Sua estante já está blindada</span>
                  <span className="text-xs font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
                    Como a sua conta global é privada, o detalhamento individual foi desativado por segurança.
                  </span>
                </div>
              </div>
            </div>
          )}

          <Interruptor 
            titulo="Mostrar Estante de Livros"
            descricao="Permite que qualquer pessoa veja os livros que leu ou quer ler."
            ativo={mostrarEstante}
            aoAlternar={() => salvarPreferencia('mostrarEstante', !mostrarEstante)}
            desativado={contaPrivada} 
          />
          <Interruptor 
            titulo="Mostrar Resenhas e Guias"
            descricao="Exibe as avaliações e guias que fez aos livros."
            ativo={mostrarResenhas}
            aoAlternar={() => salvarPreferencia('mostrarResenhas', !mostrarResenhas)}
            desativado={contaPrivada}
          />
          <Interruptor 
            titulo="Mostrar Seguidores/Seguindo"
            descricao="Exibe os números e a lista das tuas ligações."
            ativo={mostrarConexoes}
            aoAlternar={() => salvarPreferencia('mostrarConexoes', !mostrarConexoes)}
            desativado={contaPrivada}
          />
        </div>
      </section>

      {/* BLOCO 3: INTERAÇÕES E CONTATO */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
          <ChatBubbleLeftRightIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Interações e Contato</span>
        </h2>
        
        <div className="space-y-3">
          <CaixaSelecao 
            titulo="Quem pode enviar Mensagens Diretas?"
            descricao="Defina quem pode iniciar uma conversa privada consigo."
            opcoes={OPCOES_INTERACAO}
            valorSelecionado={quemPodeMensagem}
            aoMudar={(valor) => salvarPreferencia('quemPodeMensagem', valor)}
          />

          <CaixaSelecao 
            titulo="Quem pode te convidar para Grupos/Clubes?"
            descricao="Defina quem pode enviar convites para comunidades."
            opcoes={OPCOES_INTERACAO}
            valorSelecionado={quemPodeGrupo}
            aoMudar={(valor) => salvarPreferencia('quemPodeGrupo', valor)}
          />
        </div>
      </section>
    
      {/* BOTÃO FLUTUANTE DE VISITANTE */}
      <Link 
        href="/perfil?preview=visitante"
        className="fixed bottom-6 right-6 z-50 px-5 h-12 rounded-full font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        style={{ backgroundColor: 'var(--cor-destaque)', color: '#ffffff' }}
      >
        <EyeIcon className="w-4 h-4 stroke-[2.5]" />
        <span>Ver como Visitante</span>
      </Link>

    </div>
  );
}