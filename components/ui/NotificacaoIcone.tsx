'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotificacoes } from '../../context/NotificacoesContext';
// Importamos o ícone de linha (Outline) e o ícone preenchido (Solid)
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
            {/* Botão do Ícone */}
            <button 
                onClick={handleIconClick} 
                className="relative p-2 rounded-xl transition-all duration-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:scale-95"
                title="Notificações"
            >
                {/* Renderização Condicional: Se estiver aberto mostra o Solid, se não mostra o Outline */}
                {dropdownOpen ? (
                    <BellSolid 
                        className="h-6 w-6 scale-105 transition-transform" 
                        style={{ color: 'var(--cor-botao-primario)' }} // Usa a cor principal para destacar que está ativo
                    />
                ) : (
                    <BellOutline 
                        className="h-6 w-6 transition-transform" 
                        style={{ color: 'var(--cor-texto-principal)' }} 
                    />
                )}
                
                {/* Badge de Contagem */}
                {totalNaoLidas > 0 && (
                    <span 
                        className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white rounded-full border-2 animate-fade-in" 
                        style={{ 
                            backgroundColor: 'var(--cor-destaque)',
                            borderColor: 'var(--cor-fundo-card)'
                        }}
                    >
                        {totalNaoLidas > 99 ? '99+' : totalNaoLidas}
                    </span>
                )}
            </button>

            {/* Balão Dropdown */}
            {dropdownOpen && (
                <div 
                    className="absolute top-full mt-2 w-72 sm:w-80 rounded-xl shadow-2xl z-50 border overflow-hidden animate-fade-in left-0"
                    style={{ 
                        backgroundColor: 'var(--cor-fundo-card)',
                        borderColor: 'var(--cor-fundo-sidebar)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    <div 
                        className="p-4 border-b flex justify-between items-center"
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
                                className="text-xs font-bold transition-all hover:opacity-80 active:scale-95 px-2 py-1 rounded-md bg-[var(--cor-botao-primario)]/10"
                                style={{ color: 'var(--cor-botao-primario)' }}
                            >
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