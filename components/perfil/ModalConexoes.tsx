"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { authService } from "@/app/lib/authService";

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

  useEffect(() => {
    const buscarLista = async () => {
      setCarregando(true);
      try {
        const token = authService.getToken();
        const rota = abaAtiva === "Seguidores" ? "seguidores" : "seguindo";
        
        const res = await fetch(`https://letrify.fly.dev/api/seguidores/${rota}/${perfilId}`, {
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
  }, [abaAtiva, perfilId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 w-full max-w-md h-[500px] flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* CABEÇALHO DO MODAL */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex gap-4">
            <button 
              onClick={() => setAbaAtiva("Seguidores")}
              className={`text-sm font-bold transition-all ${abaAtiva === "Seguidores" ? "text-blue-500" : "opacity-40"}`}
            >
              Seguidores
            </button>
            <button 
              onClick={() => setAbaAtiva("Seguindo")}
              className={`text-sm font-bold transition-all ${abaAtiva === "Seguindo" ? "text-blue-500" : "opacity-40"}`}
            >
              Seguindo
            </button>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* LISTA (ESTILO INSTAGRAM) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {carregando ? (
            <div className="h-full flex items-center justify-center opacity-30 text-xs font-bold uppercase tracking-widest italic">
              Buscando leitores...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <span className="text-4xl mb-2">🍃</span>
              <p className="text-xs font-bold">Ninguém por aqui ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usuarios.map((user) => (
                <div key={user.id} className="flex items-center justify-between group">
                  <Link 
                    href={`/perfil?id=${user.id}`} 
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 overflow-hidden flex-shrink-0">
                      {user.fotoPerfil ? (
                        <img src={user.fotoPerfil} alt={user.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-xs">
                          {user.nome.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">
                      {user.nome}
                    </span>
                  </Link>
                  
                  {/* Botão lateral opcional */}
                  <button className="text-[10px] font-black uppercase tracking-tighter px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                    Ver Perfil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}