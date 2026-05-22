"use client";

interface InterruptorProps {
  titulo: string;
  descricao?: string;
  ativo: boolean;
  aoAlternar: () => void;
  desativado?: boolean;
}

export default function Interruptor({
  titulo,
  descricao,
  ativo,
  aoAlternar,
  desativado = false
}: InterruptorProps) {
  return (
    <div 
      onClick={!desativado ? aoAlternar : undefined}
      className={`flex items-center justify-between p-5 rounded-xl border transition-all gap-4 group ${
        desativado 
          ? 'opacity-40 grayscale select-none' 
          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
      }`}
      style={{ 
        backgroundColor: 'var(--cor-fundo-card)', 
        borderColor: 'var(--cor-fundo-sidebar)',
        cursor: desativado ? 'not-allowed' : 'pointer'
      }}
    >
      {/* Lado Esquerdo: Textos */}
      <div className="flex flex-col flex-1 pr-2 pointer-events-none">
        <h3 className="font-bold text-sm transition-colors" style={{ color: 'var(--cor-texto-principal)' }}>
          {titulo}
        </h3>
        {descricao && (
          <p className="text-xs mt-1 leading-relaxed max-w-xl transition-colors" style={{ color: 'var(--cor-texto-secundario)' }}>
            {descricao}
          </p>
        )}
      </div>

      {/* Lado Direito: O Botão visual */}
      <button
        type="button"
        role="switch"
        aria-checked={ativo}
        disabled={desativado}
        onClick={(e) => {
          // Previne bolhas de cliques duplicados na div pai
          e.stopPropagation();
          if (!desativado) aoAlternar();
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-offset-zinc-900 ${
          desativado ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${
          ativo && !desativado 
            ? '' 
            : desativado 
              ? 'bg-gray-300 dark:bg-zinc-700' 
              : 'bg-gray-400 dark:bg-zinc-600'
        }`}
        style={{
          backgroundColor: ativo && !desativado ? 'var(--cor-botao-primario)' : undefined
        }}
      >
        <span className="sr-only">Alternar {titulo}</span>
        
        {/* A bolinha interna - Ajustada para Centralização Perfeita */}
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
            ativo ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}