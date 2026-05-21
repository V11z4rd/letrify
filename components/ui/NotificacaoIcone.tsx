'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotificacoes } from '../../context/NotificacoesContext';
import { BellIcon } from '@heroicons/react/24/outline';
import NotificacoesLista from './NotificacoesLista';

export default function NotificacaoIcone() {
    const { totalNaoLidas, fetchNotificacoes, marcarTodasComoLidas } = useNotificacoes();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    // 1. Criamos a nossa "antena" para monitorar os cliques
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleIconClick = () => {
        setDropdownOpen(!dropdownOpen);
        if (!dropdownOpen) fetchNotificacoes(false); 
    };

    // 2. O hook mágico que ouve os cliques na tela inteira
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Se o dropdown está aberto, existe uma referência, e o clique FOI FORA dela
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        // Só ligamos a antena se o balão estiver aberto para economizar memória
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Limpeza de boas práticas: desliga a antena se o componente sumir
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        // 3. Colamos a antena (ref) na div principal que engloba o botão e a lista
        <div ref={dropdownRef} className="relative flex items-center justify-center w-full">
            <button onClick={handleIconClick} className="relative p-2 rounded-full hover:opacity-70 transition-opacity transform hover:-translate-y-1 duration-200">
                <BellIcon className="h-7 w-7" style={{ color: 'var(--cor-destaque)' }} />
                {totalNaoLidas > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold text-white bg-red-600 rounded-full border-2 border-white" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                        {totalNaoLidas > 99 ? '99+' : totalNaoLidas}
                    </span>
                )}
            </button>

            {dropdownOpen && (
                <div className="absolute left-full top-0 ml-4 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Notificações</h3>
                        {totalNaoLidas > 0 && (
                            <button onClick={marcarTodasComoLidas} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                Ler todas
                            </button>
                        )}
                    </div>
                    <NotificacoesLista onClose={() => setDropdownOpen(false)} />
                </div>
            )}
        </div>
    );
}