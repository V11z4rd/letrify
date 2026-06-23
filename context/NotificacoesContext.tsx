'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { Notificacao } from '../types/notificacao';
import { notificacoesApi } from '../app/lib/apiNotificacoes';

interface NotificacoesContextType {
    notificacoes: Notificacao[];
    totalNaoLidas: number;
    loading: boolean;
    error: string | null;
    fetchNotificacoes: (apenasNaoLidas?: boolean) => Promise<void>;
    marcarComoLida: (id: number) => Promise<void>;
    marcarTodasComoLidas: () => Promise<void>;
    deletarNotificacao: (id: number) => Promise<void>;
}

const NotificacoesContext = createContext<NotificacoesContextType | undefined>(undefined);

// Apontando para o Hub do SignalR na porta 5265
const SIGNALR_HUB_URL = 'https://letrify.fly.dev/hubs/notificacoes';

export const NotificacoesProvider = ({ children }: { children: ReactNode }) => {
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [totalNaoLidas, setTotalNaoLidas] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);

    const fetchNotificacoes = useCallback(async (apenasNaoLidas: boolean = false) => {
        setLoading(true);
        setError(null);
        try {
            const data = await notificacoesApi.listarNotificacoes(apenasNaoLidas);
            setNotificacoes(data.notificacoes);
            setTotalNaoLidas(data.totalNaoLidas);
        } catch (err) {
            console.error("Erro ao buscar notificações:", err);
            setError("Não foi possível carregar as notificações.");
        } finally {
            setLoading(false);
        }
    }, []);

    const marcarComoLida = useCallback(async (id: number) => {
        try {
            await notificacoesApi.marcarComoLida(id);
            setNotificacoes(prev => prev.map(n => (n.id === id ? { ...n, lida: true } : n)));
            setTotalNaoLidas(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Erro ao marcar como lida:", err);
        }
    }, []);

    const marcarTodasComoLidas = useCallback(async () => {
        try {
            await notificacoesApi.marcarTodasComoLidas();
            setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
            setTotalNaoLidas(0);
        } catch (err) {
            console.error("Erro ao marcar todas como lidas:", err);
        }
    }, []);

    const deletarNotificacao = useCallback(async (id: number) => {
        try {
            await notificacoesApi.deletarNotificacao(id);
            setNotificacoes(prev => prev.filter(n => n.id !== id));
            await fetchNotificacoes(true);
        } catch (err) {
            console.error("Erro ao deletar notificação:", err);
        }
    }, [fetchNotificacoes]);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : '';
        
        const newConnection = new HubConnectionBuilder()
            .withUrl(SIGNALR_HUB_URL, { accessTokenFactory: () => token || '' })
            .configureLogging(LogLevel.Warning) // Alterado para Warning para silenciar logs excessivos
            .build();

        setConnection(newConnection);

        return () => {
            // Como o React Strict Mode monta e desmonta rapidamente, 
            // este catch invisível absorve o erro de tentar parar uma conexão em andamento.
            newConnection.stop().catch(() => {});
        };
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('Conectado ao SignalR Hub.');
                    connection.on("ReceberNovaNotificacao", (notificacao: Notificacao) => {
                        setNotificacoes(prev => [notificacao, ...prev]);
                        if (!notificacao.lida) {
                            setTotalNaoLidas(prev => prev + 1);
                        }
                    });
                })
                .catch(e => console.error("Erro ao conectar ao SignalR:", e));
        }
    }, [connection]);

    useEffect(() => {
        fetchNotificacoes();
    }, [fetchNotificacoes]);

    return (
        <NotificacoesContext.Provider value={{
            notificacoes, totalNaoLidas, loading, error,
            fetchNotificacoes, marcarComoLida, marcarTodasComoLidas, deletarNotificacao
        }}>
            {children}
        </NotificacoesContext.Provider>
    );
};

export const useNotificacoes = () => {
    const context = useContext(NotificacoesContext);
    if (context === undefined) {
        throw new Error('useNotificacoes deve ser usado dentro de um NotificacoesProvider');
    }
    return context;
};