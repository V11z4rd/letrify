'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotificacoes } from '../../context/NotificacoesContext';
import { BellIcon as BellOutline } from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';
import NotificacoesLista from './NotificacoesLista';

export default function NotificacaoIcone() {
    const { totalNaoLidas, fetchNotificacoes, marcarTodasComoLidas } = useNotificacoes();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleIconClick = () => {
        setDropdownOpen(!dropdownOpen);
        if (!dropdownOpen) fetchNotificacoes(false); 
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        <div ref={dropdownRef} className="relative flex items-center justify-center">
            {/* ÍCONE DO SINO */}
            <button 
                onClick={handleIconClick} 
                className="relative p-1.5 rounded-full transition-transform active:scale-90 group"
                aria-label="Notificações"
            >
                {dropdownOpen ? (
                    <BellSolid className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300" style={{ color: 'var(--cor-destaque)' }} />
                ) : (
                    <BellOutline className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300 group-hover:opacity-80" />
                )}
                
                {totalNaoLidas > 0 && (
                    <span 
                        className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 animate-pulse"
                        style={{ 
                            backgroundColor: 'var(--cor-destaque)', 
                            borderColor: 'var(--cor-fundo-sidebar)' // Borda com a cor do fundo para dar efeito de "corte"
                        }}
                    />
                )}
            </button>

            {/* PAINEL DE NOTIFICAÇÕES (HÍBRIDO: MOBILE FULLSCREEN / DESKTOP FLUTUANTE) */}
            {dropdownOpen && (
                <>
                    {/* BACKDROP MOBILE: Fundo escurecido atrás do painel (Opcional, mas dá um toque premium) */}
                    <div 
                        className="fixed inset-0 z-40 bg-black/10 dark:bg-black/40 md:hidden animate-fade-in" 
                        onClick={() => setDropdownOpen(false)}
                    />

                    <div 
                        className="
                            fixed top-14 bottom-16 left-0 right-0 w-full z-50 flex flex-col overflow-hidden animate-fade-in shadow-2xl border-t
                            md:absolute md:top-0 md:bottom-auto md:left-full md:right-auto md:ml-6 md:w-80 md:max-h-[80vh] md:rounded-3xl md:border
                        "
                        style={{ 
                            backgroundColor: 'var(--cor-fundo-card)', 
                            borderColor: 'var(--cor-fundo-sidebar)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)'
                        }}
                    >
                        {/* CABEÇALHO DO PAINEL (Fixo no topo) */}
                        <div 
                            className="p-4 border-b flex justify-between items-center shrink-0"
                            style={{ 
                                backgroundColor: 'var(--cor-fundo-app)', 
                                borderColor: 'var(--cor-fundo-sidebar)' 
                            }}
                        >
                            <h3 
                                className="text-xs font-bold uppercase tracking-wider opacity-80"
                                style={{ color: 'var(--cor-texto-principal)' }}
                            >
                                Notificações
                            </h3>
                            {totalNaoLidas > 0 && (
                                <button 
                                    onClick={marcarTodasComoLidas} 
                                    className="text-[10px] uppercase tracking-widest font-black transition-all hover:opacity-80 active:scale-95 px-3 py-1.5 rounded-lg bg-[var(--cor-botao-primario)]/10"
                                    style={{ color: 'var(--cor-botao-primario)' }}
                                >
                                    Ler todas
                                </button>
                            )}
                        </div>
                        
                        {/* ÁREA COM SCROLL INTERNO (A magia acontece aqui) */}
                        <div className="flex-1 overflow-y-auto hide-scrollbar pb-2">
                            <NotificacoesLista onClose={() => setDropdownOpen(false)} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}