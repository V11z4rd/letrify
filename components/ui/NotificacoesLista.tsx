'use client';

import React from 'react';
import { useNotificacoes } from '../../context/NotificacoesContext';
import { 
  CheckCircleIcon, 
  TrashIcon, 
  BellIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface NotificacoesListaProps {
    onClose: () => void;
}

export default function NotificacoesLista({ onClose }: NotificacoesListaProps) {
    const { notificacoes, loading, error, marcarComoLida, deletarNotificacao } = useNotificacoes();

    // 1. ESTADO DE CARREGAMENTO ADAPTADO AO TEMA
    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center opacity-60 font-medium animate-pulse">
                <ArrowPathIcon className="w-8 h-8 animate-spin mb-2" style={{ color: 'var(--cor-primaria, var(--cor-botao-primario))' }} />
                <span style={{ color: 'var(--cor-texto-principal)' }}>Carregando notificações...</span>
            </div>
        );
    }

    // 2. ESTADO DE ERRO INTEGRADO
    if (error) {
        return (
            <div className="p-6 flex flex-col items-center justify-center text-center gap-2 text-red-500">
                <ExclamationCircleIcon className="w-8 h-8 opacity-80" />
                <p className="text-sm font-semibold">Erro ao carregar: {error}</p>
            </div>
        );
    }

    // 3. ESTADO VAZIO COM HEROICONS
    if (notificacoes.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center opacity-50 gap-2">
                <BellIcon className="w-10 h-10" style={{ color: 'var(--cor-texto-secundario)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--cor-texto-principal)' }}>
                    Nenhuma notificação por aqui.
                </p>
            </div>
        );
    }

    return (
        <div 
            className="divide-y divide-[var(--cor-fundo-sidebar)] max-h-[400px] overflow-y-auto custom-scrollbar"
        >
            {notificacoes.map(notif => (
                <div 
                    key={notif.id} 
                    className={`flex items-start p-4 transition-all duration-200 gap-3 relative overflow-hidden ${
                        !notif.lida 
                            ? 'bg-[var(--cor-botao-primario)]/[0.04]' 
                            : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                    }`}
                >
                    {/* Indicador de Status (Lida vs Não lida) */}
                    <div className="mt-1 shrink-0 flex items-center justify-center w-5 h-5">
                        {!notif.lida ? (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--cor-destaque)' }}></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: 'var(--cor-destaque)' }}></span>
                            </span>
                        ) : (
                            <BellIcon className="h-4 w-4 opacity-40" style={{ color: 'var(--cor-texto-secundario)' }} />
                        )}
                    </div>

                    {/* Conteúdo da Notificação */}
                    <div className="flex-grow min-w-0 pr-2">
                        <p 
                            className={`text-sm leading-relaxed transition-colors break-words ${
                                !notif.lida ? 'font-bold' : 'font-medium opacity-80'
                            }`}
                            style={{ color: 'var(--cor-texto-principal)' }}
                        >
                            {notif.conteudo}
                        </p>
                    </div>

                    {/* Ações Laterais */}
                    <div className="flex items-center shrink-0 gap-1.5 self-center">
                        {!notif.lida && (
                            <button 
                                onClick={() => marcarComoLida(notif.id)} 
                                className="p-1 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-500/10 transition-all active:scale-90" 
                                title="Marcar como lida"
                            >
                                <CheckCircleIcon className="h-5 w-5 stroke-[2]" />
                            </button>
                        )}
                        <button 
                            onClick={() => deletarNotificacao(notif.id)} 
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-500/10 transition-all active:scale-90" 
                            title="Excluir"
                        >
                            <TrashIcon className="h-5 w-5 stroke-[2]" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}