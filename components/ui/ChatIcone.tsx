'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChatBubbleLeftEllipsisIcon as ChatOutline } from '@heroicons/react/24/outline';
import { ChatBubbleLeftEllipsisIcon as ChatSolid } from '@heroicons/react/24/solid';
import { dmService } from '@/app/lib/dmService';
import { signalRService } from '@/app/lib/signalrService';
import { authService } from '@/app/lib/authService';

export default function ChatIcone() {
    const pathname = usePathname();
    const [totalNaoLidas, setTotalNaoLidas] = useState(0);

    // Verifica se já estamos na página de mensagens
    const isAtivo = pathname.startsWith('/mensagens');

    useEffect(() => {
        const carregarContagem = async () => {
            try {
                const conversas = await dmService.listarConversas();
                // Soma todas as mensagens não lidas de todas as conversas
                const naoLidas = conversas.reduce((acc, chat) => acc + (chat.naoLidas || 0), 0);
                setTotalNaoLidas(naoLidas);
            } catch (error) {
                console.error("Erro ao carregar contagem de DMs", error);
            }
        };

        const token = authService.getToken();
        if (token) {
            signalRService.iniciarConexao(token).catch(console.error);
        }

        carregarContagem();

        // Escuta o SignalR em tempo real para incrementar o contador
        signalRService.onReceberMensagemDireta(() => {
            // Se o utilizador não estiver na página de mensagens, incrementa o badge
            if (!window.location.pathname.startsWith('/mensagens')) {
                setTotalNaoLidas(prev => prev + 1);
            }
        });
    }, []);

    return (
        <Link 
            href="/mensagens" 
            className="relative p-1.5 rounded-full transition-transform active:scale-90 group flex items-center justify-center"
            title="Mensagens Diretas"
        >
            {isAtivo ? (
                <ChatSolid className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300" style={{ color: 'var(--cor-destaque)' }} />
            ) : (
                <ChatOutline className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300 md:group-hover:opacity-80" />
            )}
            
            {/* BADGE DE NÃO LIDAS */}
            {totalNaoLidas > 0 && (
                <span 
                    className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 flex items-center justify-center text-[8px] font-black"
                    style={{ 
                        backgroundColor: 'var(--cor-destaque)', 
                        borderColor: 'var(--cor-fundo-sidebar)',
                        color: 'white'
                    }}
                >
                    {/* Limita o número a 9+ para não estourar o layout da bolinha */}
                    {totalNaoLidas > 9 ? '9+' : totalNaoLidas}
                </span>
            )}
        </Link>
    );
}