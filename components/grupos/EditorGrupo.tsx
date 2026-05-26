"use client";

import { useState, useRef, useEffect } from "react";
import { 
  PencilIcon, 
  CameraIcon, 
  XMarkIcon,
  CheckIcon,
  ArrowPathIcon,
  UserGroupIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

interface EditorGrupoProps {
  dadosIniciais: {
    nome: string;
    descricao: string;
    fotoCapa: string | File;
  };
  onClose: () => void;
  onSave: (novosDados: any) => Promise<void>;
}

export default function EditorGrupo({ dadosIniciais, onClose, onSave }: EditorGrupoProps) {
  const [formData, setFormData] = useState(dadosIniciais);
  const [previewCapa, setPreviewCapa] = useState("");
  const [salvando, setSalvando] = useState(false);
  
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let urlCapa = "";

    if (formData.fotoCapa instanceof File) {
      urlCapa = URL.createObjectURL(formData.fotoCapa);
      setPreviewCapa(urlCapa);
    } else {
      setPreviewCapa(formData.fotoCapa || "");
    }

    return () => {
      if (urlCapa) URL.revokeObjectURL(urlCapa);
    };
  }, [formData.fotoCapa]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev: any) => ({ ...prev, fotoCapa: e.target.files![0] }));
    }
  };

  const handleConfirmar = async () => {
    setSalvando(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="animate-fade-in relative w-full">
      
      {/* HEADER FLUTUANTE DE CONTROLE ADAPTADO */}
      <div 
        className="sticky top-4 z-40 flex justify-between items-center p-4 rounded-2xl shadow-md border mb-8 backdrop-blur-md transition-all"
        style={{ 
          backgroundColor: 'var(--cor-fundo-card)', 
          borderColor: 'var(--cor-fundo-sidebar)' 
        }}
      >
        <div>
          <h2 className="font-black text-sm sm:text-base tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>Editar Clube</h2>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>Gerencie as diretrizes do grupo</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose} 
            disabled={salvando}
            className="px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:bg-red-500/10 hover:text-red-500"
            style={{ color: 'var(--cor-texto-secundario)' }}
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirmar}
            disabled={salvando || !formData.nome.trim()}
            className="px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--cor-destaque)', color: '#ffffff' }}
          >
            {salvando ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
            )}
            <span>{salvando ? "Salvando..." : "Salvar"}</span>
          </button>
        </div>
      </div>

      {/* CONTAINER DO CARD PRINCIPAL */}
      <div 
        className="rounded-3xl shadow-sm border mb-8 overflow-hidden relative transition-all" 
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        
        {/* Banner Editável Interativo Adaptativo */}
        <div 
          className="h-44 sm:h-52 w-full relative group cursor-pointer overflow-hidden border-b transition-all" 
          onClick={() => bannerInputRef.current?.click()}
          style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          {previewCapa ? (
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]" style={{ backgroundImage: `url("${previewCapa}")` }}></div>
          ) : (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center font-black text-xs uppercase tracking-widest gap-2 opacity-60 transition-colors"
              style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-secundario)' }}
            >
              <CameraIcon className="w-6 h-6 stroke-[2]" />
              <span>Sem capa definida</span>
            </div>
          )}
          
          {/* Camada Hover de feedback de upload */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest shadow-md">
              <PencilIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Trocar Banner do Clube</span>
            </div>
          </div>
          <input type="file" hidden ref={bannerInputRef} accept="image/*" onChange={handleFileChange} />
        </div>

        {/* Formulário Interno Expandido */}
        <div className="px-6 sm:px-8 pb-8 pt-6 relative space-y-5">
          
          {/* Grid contendo o Nome e o Input de URL Alternativo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Input Nome do Clube */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                <UserGroupIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Nome do Clube</span>
              </label>
              <input 
                type="text" 
                name="nome"
                value={formData.nome} 
                onChange={handleChange} 
                placeholder="Ex: Titãs da Literatura"
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl border outline-none transition-all focus:ring-1 focus:ring-[var(--cor-destaque)]"
                style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
              />
            </div>

            {/* Input Link Direto da Capa */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
                <CameraIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Link Direto da Capa (Opcional)</span>
              </label>
              <input 
                type="text"
                name="fotoCapa"
                value={formData.fotoCapa instanceof File ? "📁 Arquivo de imagem local selecionado" : formData.fotoCapa}
                onChange={handleChange}
                disabled={formData.fotoCapa instanceof File}
                placeholder="https://exemplo.com/sua-capa.jpg"
                className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl border outline-none transition-all focus:ring-1 focus:ring-[var(--cor-destaque)] ${formData.fotoCapa instanceof File ? 'opacity-50 cursor-not-allowed select-none italic' : ''}`}
                style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
              />
            </div>

          </div>

          {/* Input Biografia / Regras / Cronogramas */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
              <DocumentTextIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Diretrizes e Descrição do Clube</span>
            </label>
            <textarea 
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descreva aqui o cronograma de leituras do mês, links de reuniões e regras básicas de convivência do clube..."
              className="w-full p-4 text-xs sm:text-sm rounded-2xl border outline-none h-36 font-medium transition-all focus:ring-1 focus:ring-[var(--cor-destaque)] placeholder:opacity-40 resize-none leading-relaxed"
              style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}