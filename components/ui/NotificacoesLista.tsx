'use client';

import React from 'react';
import { useNotificacoes } from '../../context/NotificacoesContext';
import { CheckCircleIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface NotificacoesListaProps {
    onClose: () => void;
}

export default function NotificacoesLista({ onClose }: NotificacoesListaProps) {
    const { notificacoes, loading, error, marcarComoLida, deletarNotificacao } = useNotificacoes();

    if (loading) return <div className="p-4 text-center text-gray-500">A carregar...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Erro: {error}</div>;
    if (notificacoes.length === 0) return <div className="p-4 text-center text-gray-500">Sem novas notificações.</div>;

    return (
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {notificacoes.map(notif => (
                <div key={notif.id} className={`flex items-center p-4 transition-colors ${!notif.lida ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-3 shrink-0" /> 
                    <div className="flex-grow">
                        <p className={`text-sm ${!notif.lida ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notif.conteudo}
                        </p>
                    </div>
                    <div className="flex items-center ml-4 shrink-0 gap-2">
                        {!notif.lida && (
                            <button onClick={() => marcarComoLida(notif.id)} className="text-gray-400 hover:text-green-600" title="Marcar como lida">
                                <CheckCircleIcon className="h-5 w-5" />
                            </button>
                        )}
                        <button onClick={() => deletarNotificacao(notif.id)} className="text-gray-400 hover:text-red-600" title="Excluir">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}