"use client";

import { 
  BookOpenIcon, 
  KeyIcon, 
  ShieldCheckIcon, 
  QuestionMarkCircleIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

// Mapeamento para renderizar ícones específicos para cada tipo de dúvida
const itensAjuda = [
  {
    titulo: "Como adicionar livros?",
    descricao: "Descubra como vasculhar o acervo da Open Library e catalogar suas leituras.",
    icone: BookOpenIcon
  },
  {
    titulo: "Esqueci minha senha",
    descricao: "Instruções passo a passo para recuperar o acesso à sua conta Letrify.",
    icone: KeyIcon
  },
  {
    titulo: "Privacidade dos dados",
    descricao: "Entenda como protegemos suas informações e seu histórico literário.",
    icone: ShieldCheckIcon
  }
];

export default function AjudaPage() {
  return (
    <div className="max-w-4xl mx-auto pt-6 px-4 pb-24 animate-fade-in">
      
      {/* CABEÇALHO DA CENTRAL */}
      <div className="mb-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border animate-pulse" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
          <QuestionMarkCircleIcon className="w-6 h-6 stroke-[2.5]" style={{ color: 'var(--cor-primaria)' }} />
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: 'var(--cor-texto-principal)' }}>
          Central de Ajuda
        </h1>
        <p className="text-xs sm:text-sm font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
          Precisa de uma mãozinha com o Letrify? Escolha um tópico ou explore as diretrizes.
        </p>
      </div>

      {/* GRADE DE TÓPICOS (FAQ) */}
      <div className="grid gap-4 max-w-2xl mx-auto">
        {itensAjuda.map((item, idx) => {
          const IconeComponente = item.icone;
          return (
            <div 
              key={idx}
              className="p-4 rounded-2xl border flex items-start gap-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer group"
              style={{ 
                backgroundColor: 'var(--cor-fundo-card)', 
                borderColor: 'var(--cor-fundo-sidebar)' 
              }}
            >
              {/* Container do Ícone Ilustrativo */}
              <div 
                className="p-2.5 rounded-xl border shrink-0 transition-colors group-hover:border-[var(--cor-destaque)]"
                style={{ 
                  backgroundColor: 'var(--cor-fundo-app)', 
                  borderColor: 'var(--cor-fundo-sidebar)' 
                }}
              >
                <IconeComponente className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--cor-texto-principal)' }} />
              </div>

              {/* Textos Informativos */}
              <div className="flex-1 min-w-0 pt-0.5">
                <span 
                  className="block font-extrabold text-sm mb-0.5 transition-colors group-hover:text-[var(--cor-destaque)]" 
                  style={{ color: 'var(--cor-texto-principal)' }}
                >
                  {item.titulo}
                </span>
                <p className="text-xs font-medium opacity-50 line-clamp-2 sm:line-clamp-none" style={{ color: 'var(--cor-texto-secundario)' }}>
                  {item.descricao}
                </p>
              </div>

              {/* Indicador de Clique */}
              <div className="self-center opacity-0 group-hover:opacity-40 transition-opacity pl-2">
                <ChevronRightIcon className="w-4 h-4 stroke-[3]" style={{ color: 'var(--cor-texto-principal)' }} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}