"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";
import { grupoService, GrupoResumo } from "@/app/lib/grupoService";
// Ícones do Heroicons para transformar a experiência do editor de posts
import { 
  UserGroupIcon, 
  PaperAirplaneIcon, 
  XMarkIcon 
} from "@heroicons/react/24/outline";

export default function BotaoCriarPost({ onPostCreated }: { onPostCreated?: () => void }) {
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // --- LÓGICA DE RECRUTAMENTO ---
  const [isRecrutamento, setIsRecrutamento] = useState(false);
  const [grupos, setGrupos] = useState<GrupoResumo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>("");
  const [carregandoGrupos, setCarregandoGrupos] = useState(false);

  useEffect(() => {
    if (isRecrutamento && grupos.length === 0) {
      setCarregandoGrupos(true);
      grupoService.listarTodos()
        .then(setGrupos)
        .catch(console.error)
        .finally(() => setCarregandoGrupos(false));
    }
  }, [isRecrutamento, grupos.length]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim() || enviando) return;

    setEnviando(true);
    try {
      const token = authService.getToken();
      
      const payload: any = { conteudo: conteudo.trim() };
      
      if (isRecrutamento && grupoSelecionado && Number(grupoSelecionado) > 0) {
        payload.grupoId = Number(grupoSelecionado);
      } else {
        payload.grupoId = null; // Garante que o C# receba nulo em posts comuns
      }

      // Corrigido para utilizar a variável dinâmica global BASE_URL
      const resposta = await fetch(`${BASE_URL}/chat/enviar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        throw new Error(`Erro na API Letrify (Status: ${resposta.status})`);
      }

      setConteudo("");
      setIsRecrutamento(false);
      setGrupoSelecionado("");
      
      if (onPostCreated) onPostCreated();
      
    } catch (err: any) {
      console.error("Falha ao enviar publicação:", err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div 
      className="rounded-3xl border p-5 sm:p-6 mb-8 shadow-md transition-all duration-300"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      <form onSubmit={handlePublicar} className="flex flex-col gap-4">
        
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="O que está a ler ou a pensar hoje?"
          className="w-full bg-transparent text-base sm:text-lg resize-none outline-none min-h-[90px] font-medium placeholder:opacity-40"
          style={{ color: 'var(--cor-texto-principal)' }}
          maxLength={500}
        />

        {/* ÁREA DO RECRUTAMENTO (Dropdown Adaptável) */}
        {isRecrutamento && (
          <div 
            className="border rounded-2xl p-4 animate-fade-in flex flex-col gap-3 transition-all"
            style={{ 
              backgroundColor: 'var(--cor-fundo-app)', 
              borderColor: 'var(--cor-fundo-sidebar)' 
            }}
          >
            <label className="text-[10px] uppercase tracking-widest font-black flex justify-between items-center" style={{ color: 'var(--cor-primaria)' }}>
              <span>Vincular Clube de Leitura</span>
              <button 
                type="button" 
                onClick={() => { setIsRecrutamento(false); setGrupoSelecionado(""); }} 
                className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--cor-texto-principal)' }}
              >
                <XMarkIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Fechar</span>
              </button>
            </label>
            
            {carregandoGrupos ? (
              <span className="text-xs font-medium opacity-50 italic" style={{ color: 'var(--cor-texto-principal)' }}>
                Buscando seus clubes ativos...
              </span>
            ) : (
              <select 
                value={grupoSelecionado}
                onChange={(e) => setGrupoSelecionado(e.target.value)}
                className="w-full text-xs font-bold rounded-xl p-3 outline-none border cursor-pointer transition-all"
                style={{ 
                  backgroundColor: 'var(--cor-fundo-card)', 
                  borderColor: 'var(--cor-fundo-sidebar)',
                  color: 'var(--cor-texto-principal)'
                }}
              >
                <option value="" disabled style={{ backgroundColor: 'var(--cor-fundo-card)' }}>-- Escolha um clube da lista --</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id} style={{ backgroundColor: 'var(--cor-fundo-card)' }}>{g.nome}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          
          {/* Botão de Toggle do Clube — Cores Corrigidas */}
          <button 
            type="button" 
            onClick={() => setIsRecrutamento(!isRecrutamento)}
            className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95"
            style={{ 
              backgroundColor: isRecrutamento ? 'rgba(var(--cor-primaria-rgb, 59, 130, 246), 0.15)' : 'var(--cor-fundo-app)', 
              color: isRecrutamento ? 'var(--cor-primaria)' : 'var(--cor-texto-principal)', // Força cor escura/legível no tema claro
              opacity: isRecrutamento ? 1 : 0.7
            }}
          >
            <UserGroupIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Divulgar Clube</span>
          </button>

          {/* Botão Publicar — Lógica Dinâmica de Estados */}
          <button
            type="submit"
            disabled={enviando || !conteudo.trim() || (isRecrutamento && !grupoSelecionado)}
            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
            style={{ 
              // Se estiver bloqueado, fica cinza sutil. Se ativo, ganha a cor de destaque do Letrify
              backgroundColor: (!conteudo.trim() || enviando) ? 'var(--cor-fundo-sidebar)' : 'var(--cor-destaque)', 
              
              // Se estiver bloqueado, o texto fica opaco. Se ativo, fica BRANCO sólido para contrastar
              color: (!conteudo.trim() || enviando) ? 'var(--cor-texto-secundario)' : '#ffffff',
              
              opacity: (!conteudo.trim() || enviando) ? 0.5 : 1
            }}
          >
            <PaperAirplaneIcon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{enviando ? "Enviando" : "Publicar"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}