"use client";

import { useState, useEffect } from "react";
import { 
  PaintBrushIcon,
  CheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const paletasDeCores = [
  { 
    id: 0, 
    nome: "Clássico Verde", 
    corFundo: "#F5F1E8", 
    corPrimaria: "#2F855A" 
  },
  { 
    id: 1, 
    nome: "Aura Laranja", 
    corFundo: "#FFFaf0", 
    corPrimaria: "#DD6B20" 
  },
  { 
    id: 2, 
    nome: "Modo Escuro", 
    corFundo: "#121212", 
    corPrimaria: "#805AD5" 
  }
];

export default function PersonalizacaoPage() {
  const [temaAtivo, setTemaAtivo] = useState(0);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("letrify_theme");
    if (temaSalvo) {
      try {
        const { paleta } = JSON.parse(temaSalvo);
        setTemaAtivo(paleta);
      } catch (e) {
        console.error("Erro ao ler cache do tema", e);
      }
    }
  }, []);

  const handleMudarTema = (id: number) => {
    setTemaAtivo(id);
    const isEscuro = id === 2;

    document.documentElement.setAttribute("data-theme-palette", String(id));
    if (isEscuro) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    localStorage.setItem("letrify_theme", JSON.stringify({
      paleta: id,
      escura: isEscuro
    }));

    setSalvando(true);
    setTimeout(() => setSalvando(false), 800);
  };

  return (
    <div className="max-w-4xl mx-auto pt-6 px-4 pb-24 animate-fade-in space-y-10">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div>
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--cor-texto-principal)' }}>Personalização</h1>
        <p className="text-xs sm:text-sm font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
          Ajuste a aparência do Letrify para combinar com o seu estilo de leitura.
        </p>
      </div>

      {/* BLOCO DE PALETA DE CORES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between min-h-[24px]">
          <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
            <PaintBrushIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Paleta de Cores</span>
          </h2>
          
          {salvando && (
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider animate-pulse" style={{ color: 'var(--cor-primaria)' }}>
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin stroke-[2.5]" />
              <span>Aplicando...</span>
            </div>
          )}
        </div>
        
        <div 
          className="p-6 sm:p-8 rounded-2xl border transition-all duration-300"
          style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          {/* Ajustado o gap para ser responsivo (gap-6 no mobile / gap-10 no sm) */}
          <div className="flex flex-wrap gap-6 sm:gap-10 items-center justify-center sm:justify-start">
            {paletasDeCores.map((paleta) => {
              const isAtivo = temaAtivo === paleta.id;

              return (
                <div key={paleta.id} className="flex flex-col items-center gap-3 shrink-0">
                  
                  {/* O Círculo Colorido (Botão) */}
                  <button
                    onClick={() => handleMudarTema(paleta.id)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-md transition-all duration-300 overflow-hidden relative border active:scale-95 flex items-center justify-center ${
                      isAtivo 
                        ? 'scale-105 shadow-xl' 
                        : 'hover:scale-105 hover:shadow-lg opacity-80 hover:opacity-100'
                    }`}
                    style={{ 
                      borderColor: isAtivo ? paleta.corPrimaria : 'var(--cor-fundo-sidebar)',
                      boxShadow: isAtivo ? `0 0 0 4px var(--cor-fundo-app), 0 0 0 7px ${paleta.corPrimaria}` : ''
                    }}
                    aria-label={`Selecionar tema ${paleta.nome}`}
                  >
                    {/* Metade Esquerda (Cor de Fundo) */}
                    <div className="absolute inset-y-0 left-0 w-1/2" style={{ backgroundColor: paleta.corFundo }}></div>
                    
                    {/* Metade Direita (Cor Primária) */}
                    <div className="absolute inset-y-0 right-0 w-1/2" style={{ backgroundColor: paleta.corPrimaria }}></div>
                    
                    {/* Detalhe central vítreo com o CheckIcon se ativo */}
                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-inner flex items-center justify-center">
                      {isAtivo && (
                        <CheckIcon className="w-4 h-4 text-white drop-shadow-md stroke-[3] animate-scale-up" />
                      )}
                    </div>
                  </button>
                  
                  {/* Nome do Tema */}
                  <span 
                    className="text-xs font-black uppercase tracking-wider transition-colors mt-1" 
                    style={{ color: isAtivo ? 'var(--cor-primaria)' : 'var(--cor-texto-secundario)' }}
                  >
                    {paleta.nome}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}