"use client";

// Importando o ícone de setinha do Heroicons
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface Opcao {
  valor: string; // Ex: "todos", "ninguem"
  rotulo: string; // Ex: "Qualquer pessoa", "Ninguém"
}

interface CaixaSelecaoProps {
  titulo: string;
  descricao?: string;
  opcoes: Opcao[];
  valorSelecionado: string;
  aoMudar: (novoValor: string) => void;
  desativado?: boolean;
}

export default function CaixaSelecao({
  titulo,
  descricao,
  opcoes,
  valorSelecionado,
  aoMudar,
  desativado = false
}: CaixaSelecaoProps) {
  return (
    <div 
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
        desativado ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
      }`}
      style={{ 
        backgroundColor: 'var(--cor-fundo-card)', 
        borderColor: 'var(--cor-fundo-sidebar)' 
      }}
    >
      {/* Lado Esquerdo: Textos */}
      <div className="flex-1 sm:pr-4">
        <h3 className="font-bold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>
          {titulo}
        </h3>
        {descricao && (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--cor-texto-secundario)' }}>
            {descricao}
          </p>
        )}
      </div>

      {/* Lado Direito: A Caixa de Seleção customizada */}
      <div className="shrink-0 w-full sm:w-auto relative">
        <select
          disabled={desativado}
          value={valorSelecionado}
          onChange={(e) => aoMudar(e.target.value)}
          /* 
            - appearance-none: Esconde a seta padrão feia do navegador 
            - pr-10: Garante que o texto longo não fique por baixo do ícone novo
          */
          className={`w-full sm:w-48 p-2 pr-10 rounded-lg border text-sm font-semibold outline-none appearance-none transition-all ${
            desativado 
              ? 'cursor-not-allowed' 
              : 'cursor-pointer focus:border-[var(--cor-primaria)] focus:ring-4 focus:ring-[var(--cor-primaria)]/10'
          }`}
          style={{
            backgroundColor: 'var(--cor-fundo-app)',
            color: 'var(--cor-texto-principal)',
            borderColor: 'var(--cor-fundo-sidebar)', // Borda neutra inicial para não competir visualmente
          }}
        >
          {opcoes.map((opcao) => (
            <option 
              key={opcao.valor} 
              value={opcao.valor}
              style={{
                backgroundColor: 'var(--cor-fundo-card)',
                color: 'var(--cor-texto-principal)'
              }}
            >
              {opcao.rotulo}
            </option>
          ))}
        </select>

        {/* Ícone customizado posicionado de forma absoluta por cima do select */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none opacity-60">
          <ChevronDownIcon className="w-4 h-4 stroke-[2.5]" style={{ color: 'var(--cor-texto-principal)' }} />
        </div>
      </div>
    </div>
  );
}