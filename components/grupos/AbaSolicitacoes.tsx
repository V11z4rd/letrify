"use client";

import { InboxArrowDownIcon, XMarkIcon, CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface Solicitacao {
  id: number;
  dataSolicitacao: string;
  usuario: {
    id: number;
    nome: string;
    fotoPerfil: string | null;
  };
}

interface AbaSolicitacoesProps {
  solicitacoes: Solicitacao[];
  processandoId: number | null;
  onResponder: (id: number, aceitar: boolean) => void;
}

export default function AbaSolicitacoes({ solicitacoes, processandoId, onResponder }: AbaSolicitacoesProps) {
  if (solicitacoes.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-2xl flex flex-col items-center justify-center gap-2" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <InboxArrowDownIcon className="w-6 h-6 opacity-20" style={{ color: 'var(--cor-texto-secundario)' }} />
        <p className="text-xs font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--cor-texto-secundario)' }}>Nenhuma entrada pendente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {solicitacoes.map((sol) => {
        const estaProcessandoEste = processandoId === sol.id;
        const nomeUsuario = sol.usuario?.nome || "Usuário Desconhecido";
        const fotoUsuario = sol.usuario?.fotoPerfil;
        const inicial = nomeUsuario.charAt(0).toUpperCase();

        return (
          <div 
            key={sol.id} 
            className="flex items-center justify-between p-4 rounded-2xl border transition-all"
            style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm border overflow-hidden shrink-0"
                style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)', borderColor: 'var(--cor-fundo-sidebar)' }}
              >
                {fotoUsuario ? (
                  <img src={fotoUsuario} alt={nomeUsuario} className="w-full h-full object-cover" />
                ) : (
                  inicial
                )}
              </div>
              <div>
                <p className="text-sm font-extrabold" style={{ color: 'var(--cor-texto-principal)' }}>{nomeUsuario}</p>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-wide" style={{ color: 'var(--cor-texto-secundario)' }}>Aguardando liberação</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {estaProcessandoEste ? (
                <div className="w-20 h-9 flex items-center justify-center">
                  <ArrowPathIcon className="w-4 h-4 animate-spin opacity-60" style={{ color: 'var(--cor-texto-principal)' }} />
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => onResponder(sol.id, false)} 
                    className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm active:scale-95"
                  >
                    <XMarkIcon className="w-4 h-4 stroke-[3]" />
                  </button>
                  <button 
                    onClick={() => onResponder(sol.id, true)} 
                    className="w-9 h-9 rounded-xl bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white flex items-center justify-center transition-colors shadow-sm active:scale-95"
                  >
                    <CheckIcon className="w-4 h-4 stroke-[3]" />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}