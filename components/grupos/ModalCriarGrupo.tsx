"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { grupoService } from "@/app/lib/grupoService";

interface ModalCriarGrupoProps {
  onClose: () => void;
}

export default function ModalCriarGrupo({ onClose }: ModalCriarGrupoProps) {
  const router = useRouter();
  
  // Estados do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<"Aberto" | "Fechado">("Aberto");
  const [fotoCapa, setFotoCapa] = useState<File | null>(null);
  const [previewCapa, setPreviewCapa] = useState<string | null>(null);
  
  // Estados de controlo
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Referência para o input de ficheiro oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lida com a seleção da imagem e cria um preview instantâneo
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const ficheiro = e.target.files[0];
      setFotoCapa(ficheiro);
      setPreviewCapa(URL.createObjectURL(ficheiro));
    }
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (nome.trim().length < 3) {
      setErro("O nome do clube deve ter pelo menos 3 caracteres.");
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const formData = new FormData();
      formData.append("nome", nome.trim());
      formData.append("descricao", descricao.trim());
      formData.append("status", status);
      
      if (fotoCapa) {
        // O Back-end costuma esperar "foto" ou "fotoCapa", 
        // ajustamos para "fotoCapa" assumindo o nome da propriedade no C#
        formData.append("fotoCapa", fotoCapa); 
      }

      // Chama o nosso serviço
      const novoGrupo = await grupoService.criar(formData);

      // Sucesso! Redireciona o líder para a sala recém-criada
      router.push(`/grupos/${novoGrupo.id}`);
      
    } catch (err: any) {
      setErro(err.message || "Erro ao criar o clube. Tente novamente.");
      setCarregando(false); // Só desliga o loading se der erro, pois se der sucesso a página vai mudar
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* BOTÃO FECHAR */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-white/10 text-white rounded-full transition-colors z-10 font-bold"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[85vh]">
          
          {/* ÁREA DE CAPA (UPLOAD) */}
          <div 
            className="h-40 w-full bg-zinc-800 relative cursor-pointer group border-b border-white/5 flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewCapa ? (
              <img src={previewCapa} alt="Preview da Capa" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-3xl mb-2">📷</span>
                <span className="text-xs font-bold uppercase tracking-widest">Adicionar Capa</span>
              </div>
            )}
            
            {/* Overlay Escuro no Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              {previewCapa && <span className="text-white font-bold opacity-0 group-hover:opacity-100">Mudar Capa</span>}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFotoChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* CORPO DO FORMULÁRIO */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-5">
            
            <div className="text-center mb-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Novo Clube</h2>
              <p className="text-sm text-zinc-400">Qual será a próxima grande leitura?</p>
            </div>

            {erro && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-pulse">
                {erro}
              </div>
            )}

            {/* NOME DO CLUBE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Nome do Clube <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Amantes de Fantasia Épica"
                className="w-full bg-zinc-800/50 border border-white/5 rounded-xl p-3.5 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                maxLength={50}
                required
              />
            </div>

            {/* DESCRIÇÃO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Descrição</label>
              <textarea 
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Sobre o que vamos ler e debater?"
                className="w-full h-24 bg-zinc-800/50 border border-white/5 rounded-xl p-3.5 text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none"
                maxLength={200}
              />
            </div>

            {/* STATUS DO GRUPO (TOGGLE) */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Privacidade do Clube</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("Aberto")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    status === "Aberto" 
                      ? "bg-green-500/10 border-green-500 text-green-400" 
                      : "bg-zinc-800/50 border-white/5 text-zinc-500 hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-xl">🔓</span>
                  <span className="text-xs font-bold">Aberto</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setStatus("Fechado")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    status === "Fechado" 
                      ? "bg-orange-500/10 border-orange-500 text-orange-400" 
                      : "bg-zinc-800/50 border-white/5 text-zinc-500 hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-xl">🔒</span>
                  <span className="text-xs font-bold">Fechado</span>
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 text-center mt-1">
                {status === "Aberto" ? "Qualquer leitor pode entrar instantaneamente." : "Novos membros precisam de aprovação para entrar."}
              </p>
            </div>
            
          </div>

          {/* RODAPÉ / SUBMIT */}
          <div className="p-4 border-t border-white/5 bg-zinc-900 flex justify-end">
            <button
              type="submit"
              disabled={carregando || nome.trim().length < 3}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              {carregando ? "A fundar clube..." : "Fundar Clube"}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}