"use client";

import { useState, useEffect } from "react";
import { authService } from "@/app/lib/authService";
import { grupoService, GrupoResumo } from "@/app/lib/grupoService";

export default function BotaoCriarPost({ onPostCreated }: { onPostCreated?: () => void }) {
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);

  // --- LÓGICA DE RECRUTAMENTO ---
  const [isRecrutamento, setIsRecrutamento] = useState(false);
  const [grupos, setGrupos] = useState<GrupoResumo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>("");
  const [carregandoGrupos, setCarregandoGrupos] = useState(false);

  // Carrega a lista de grupos apenas se o utilizador quiser fazer um recrutamento
  useEffect(() => {
    if (isRecrutamento && grupos.length === 0) {
      setCarregandoGrupos(true);
      grupoService.listarTodos()
        .then(setGrupos)
        .catch(console.error)
        .finally(() => setCarregandoGrupos(false));
    }
  }, [isRecrutamento]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  const handlePublicar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim() || enviando) return;

    setEnviando(true);
    try {
      const token = authService.getToken();
      
      // Monta o payload base
      const payload: any = { conteudo: conteudo.trim() };
      
      // Se for recrutamento e tiver um grupo selecionado, anexa o ID
      if (isRecrutamento && grupoSelecionado) {
        payload.grupoId = Number(grupoSelecionado);
      }

      const resposta = await fetch(`https://letrify.fly.dev/api/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) throw new Error("Erro ao publicar.");

      // Limpa os estados após sucesso
      setConteudo("");
      setIsRecrutamento(false);
      setGrupoSelecionado("");
      
      if (onPostCreated) onPostCreated(); // Avisa a página do feed para recarregar
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-3xl p-5 sm:p-6 mb-8 shadow-sm">
      <form onSubmit={handlePublicar} className="flex flex-col gap-4">
        
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="O que está a ler ou a pensar hoje?"
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-lg resize-none outline-none min-h-[80px]"
          maxLength={500}
        />

        {/* ÁREA DO RECRUTAMENTO (Dropdown) */}
        {isRecrutamento && (
          <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 animate-fade-in flex flex-col gap-2">
            <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex justify-between">
              <span>Selecione o Clube para Divulgar</span>
              <button type="button" onClick={() => setIsRecrutamento(false)} className="text-zinc-500 hover:text-white">✕ Fechar</button>
            </label>
            
            {carregandoGrupos ? (
              <span className="text-sm text-zinc-500 italic">A carregar clubes...</span>
            ) : (
              <select 
                value={grupoSelecionado}
                onChange={(e) => setGrupoSelecionado(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-sm text-white rounded-lg p-2.5 outline-none focus:border-blue-500"
              >
                <option value="" disabled>-- Escolha um clube --</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.nome}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          {/* Botão de Toggle do Recrutamento */}
          <button 
            type="button" 
            onClick={() => setIsRecrutamento(!isRecrutamento)}
            className={`text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              isRecrutamento ? "bg-blue-500/20 text-blue-400" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            📚 Convidar para Clube
          </button>

          <button
            type="submit"
            disabled={enviando || !conteudo.trim() || (isRecrutamento && !grupoSelecionado)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-bold rounded-xl transition-all shadow-md"
          >
            {enviando ? "A enviar..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}