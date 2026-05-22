"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authService } from "@/app/lib/authService";
// Importações limpas e necessárias do Heroicons
import { 
  XMarkIcon, 
  UserPlusIcon, 
  ArrowPathIcon 
} from "@heroicons/react/24/outline";

interface UsuarioLista {
  id: number;
  nome: string;
  fotoPerfil: string;
}

interface ModalProps {
  tipoInicial: "Seguidores" | "Seguindo";
  perfilId: string;
  onClose: () => void;
}

export default function ModalConexoes({ tipoInicial, perfilId, onClose }: ModalProps) {
  const [abaAtiva, setAbaAtiva] = useState(tipoInicial);
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [carregando, setCarregando] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  useEffect(() => {
    const buscarLista = async () => {
      setCarregando(true);
      try {
        const token = authService.getToken();
        const rota = abaAtiva === "Seguidores" ? "seguidores" : "seguindo";
        
        // Corrigido para utilizar a variável dinâmica BASE_URL
        const res = await fetch(`${BASE_URL}/seguidores/${rota}/${perfilId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const dados = await res.json();
          setUsuarios(dados);
        }
      } catch (err) {
        console.error("Erro ao buscar conexões:", err);
      } finally {
        setCarregando(false);
      }
    };

    buscarLista();
  }, [abaAtiva, perfilId, BASE_URL]);

  return (
    // Backdrop adaptável e fluido
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      
      <div 
        className="w-full max-w-md h-[500px] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--cor-fundo-card)', 
          borderColor: 'var(--cor-fundo-sidebar)' 
        }}
      >
        
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <div className="flex gap-5 relative">
            {[
              { id: "Seguidores", label: "Seguidores" },
              { id: "Seguindo", label: "Seguindo" }
            ].map((aba) => {
              const ativa = abaAtiva === aba.id;
              return (
                <button 
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id as "Seguidores" | "Seguindo")}
                  className="text-xs font-black uppercase tracking-wider pb-1 relative transition-all duration-200"
                  style={{ color: ativa ? 'var(--cor-primaria)' : 'var(--cor-texto-secundario)', opacity: ativa ? 1 : 0.5 }}
                >
                  {aba.label}
                  {ativa && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full animate-fade-in" 
                      style={{ backgroundColor: 'var(--cor-primaria)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.05] opacity-60 hover:opacity-100"
          >
            <XMarkIcon className="w-4 h-4 stroke-[2.5]" style={{ color: 'var(--cor-texto-principal)' }} />
          </button>
        </div>

        {/* ÁREA DA LISTA */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {carregando ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 opacity-40 text-[10px] font-bold uppercase tracking-widest">
              <ArrowPathIcon className="w-5 h-5 animate-spin" style={{ color: 'var(--cor-primaria)' }} />
              <span>Buscando leitores...</span>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-2">
              <UserPlusIcon className="w-8 h-8 stroke-[1.5]" style={{ color: 'var(--cor-texto-principal)' }} />
              <p className="text-xs font-bold">Ninguém por aqui ainda.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {usuarios.map((user) => (
                <div key={user.id} className="flex items-center justify-between group p-1 rounded-xl transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                  
                  <Link 
                    href={`/perfil?id=${user.id}`} 
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    {/* AVATAR */}
                    <div 
                      className="w-9 h-9 rounded-full border overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{ 
                        backgroundColor: 'var(--cor-fundo-app)', 
                        borderColor: 'var(--cor-fundo-sidebar)' 
                      }}
                    >
                      {user.fotoPerfil ? (
                        <img src={user.fotoPerfil} alt={user.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center text-[11px] font-black"
                          style={{ backgroundColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-secundario)' }}
                        >
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* NOME DO USUÁRIO */}
                    <span 
                      className="text-xs font-bold transition-colors duration-200 truncate pr-2"
                      style={{ color: 'var(--cor-texto-principal)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--cor-primaria)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--cor-texto-principal)'}
                    >
                      {user.nome}
                    </span>
                  </Link>
                  
                  {/* BOTÃO VER PERFIL INTEGRADO AO GLOBALS */}
                  <Link
                    href={`/perfil?id=${user.id}`}
                    onClick={onClose}
                    className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-102 active:scale-98"
                    style={{ 
                      backgroundColor: 'var(--cor-fundo-sidebar)', 
                      borderColor: 'var(--cor-fundo-sidebar)',
                      color: 'var(--cor-texto-secundario)'
                    }}
                  >
                    Ver Perfil
                  </Link>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}