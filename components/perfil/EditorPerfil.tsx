"use client";
import { useState, useRef, useEffect } from "react";
// Ícones indispensáveis do Heroicons para ações de mídia e carregamento
import { 
  CameraIcon, 
  PhotoIcon, 
  ArrowPathIcon 
} from "@heroicons/react/24/outline";

interface EditorPerfilProps {
  dadosIniciais: any;
  onClose: () => void;
  onSave: (novosDados: any) => void;
}

export default function EditorPerfil({ dadosIniciais, onClose, onSave }: EditorPerfilProps) {
  const [formData, setFormData] = useState(dadosIniciais);
  
  // Estados locais para gerenciar strings de preview seguras
  const [previewPerfil, setPreviewPerfil] = useState("");
  const [previewBanner, setPreviewBanner] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Gerenciador seguro de previews para evitar vazamento de memória (Memory Leak)
  useEffect(() => {
    let urlPerfil = "";
    let urlBanner = "";

    if (formData.fotoPerfil instanceof File) {
      urlPerfil = URL.createObjectURL(formData.fotoPerfil);
      setPreviewPerfil(urlPerfil);
    } else {
      setPreviewPerfil(formData.fotoPerfil || "");
    }

    if (formData.bannerUrl instanceof File) {
      urlBanner = URL.createObjectURL(formData.bannerUrl);
      setPreviewBanner(urlBanner);
    } else {
      setPreviewBanner(formData.bannerUrl || "");
    }

    // Função de limpeza (cleanup) limpa a memória ao desmontar ou alterar arquivos
    return () => {
      if (urlPerfil) URL.revokeObjectURL(urlPerfil);
      if (urlBanner) URL.revokeObjectURL(urlBanner);
    };
  }, [formData.fotoPerfil, formData.bannerUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const arquivo = e.target.files[0];
      setFormData((prev: any) => ({ ...prev, [field]: arquivo }));
    }
  };

  // Classe utilitária para inputs padronizados com o Letrify
  const inputClass = "w-full p-3 text-sm rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border outline-none transition-all font-semibold focus:border-[var(--cor-destaque)] focus:ring-4 focus:ring-[var(--cor-destaque)]/10";

  return (
    <div 
      className="w-full animate-fade-in border rounded-3xl overflow-hidden" 
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      
      {/* SEÇÃO DO BANNER EDITÁVEL */}
      <div 
        className="relative h-44 group cursor-pointer overflow-hidden flex items-center justify-center transition-all" 
        style={{ backgroundColor: 'var(--cor-fundo-app)' }}
        onClick={() => bannerInputRef.current?.click()}
      >
        {previewBanner ? (
          <img 
            src={previewBanner} 
            className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-all duration-300 group-hover:scale-102" 
            alt="Banner"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-20" style={{ color: 'var(--cor-texto-principal)' }}>
            <PhotoIcon className="w-8 h-8 stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Sem imagem de capa</span>
          </div>
        )}

        {/* Overlay elegante e translúcido */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
          <span className="bg-white text-black dark:bg-black dark:text-white px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl">
            Alterar Capa
          </span>
        </div>
        <input 
          type="file" 
          ref={bannerInputRef} 
          hidden 
          accept="image/*" 
          onChange={(e) => handleFileChange(e, 'bannerUrl')} 
        />
      </div>

      <div className="px-6 pb-6">
        
        {/* AVATAR E CAMPOS SUPERIORES */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
          <div 
            className="relative -mt-14 inline-block group cursor-pointer shrink-0 mx-auto sm:mx-0" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div 
              className="w-28 h-28 flex items-center justify-center shadow-xl border-4 overflow-hidden relative"
              style={{ 
                backgroundColor: 'var(--cor-fundo-app)', 
                borderColor: 'var(--cor-fundo-card)', 
                borderRadius: '1.75rem' 
              }}
            >
              {previewPerfil ? (
                <img 
                  src={previewPerfil} 
                  className="w-full h-full object-cover group-hover:opacity-40 transition-opacity duration-200" 
                  alt="Perfil" 
                />
              ) : (
                <div className="opacity-30" style={{ color: 'var(--cor-texto-principal)' }}>
                  <CameraIcon className="w-7 h-7 stroke-[1.8]" />
                </div>
              )}

              {/* Hover da Foto de Perfil */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[2px]">
                <span className="text-white text-[9px] font-black uppercase tracking-wider">Trocar</span>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'fotoPerfil')} 
            />
          </div>

          {/* Campo de URL Otimizado */}
          <div className="flex-1 pb-1 w-full">
            <label className="text-[9px] font-black uppercase opacity-40 px-1 mb-1 block" style={{ color: 'var(--cor-texto-principal)' }}>
              Ou link direto para a capa
            </label>
            <input 
              type="text"
              name="bannerUrl"
              value={formData.bannerUrl instanceof File ? "Arquivo local selecionado" : formData.bannerUrl}
              onChange={handleChange}
              disabled={formData.bannerUrl instanceof File}
              placeholder="https://exemplo.com/sua-capa.jpg"
              className={`${inputClass} ${formData.bannerUrl instanceof File ? 'opacity-50 cursor-not-allowed select-none' : ''}`}
              style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
            />
          </div>
        </div>

        {/* FORMULÁRIO PRINCIPAL */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase opacity-40 mb-1 block px-1" style={{ color: 'var(--cor-texto-principal)' }}>Nome</label>
            <input 
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Como quer ser chamado?"
              className={inputClass}
              style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase opacity-40 mb-1 block px-1" style={{ color: 'var(--cor-texto-principal)' }}>Cidade / Localização</label>
            <input 
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Ex: Porto, Portugal ou São Paulo, SP"
              className={inputClass}
              style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase opacity-40 mb-1 block px-1" style={{ color: 'var(--cor-texto-principal)' }}>Biografia / Descrição</label>
            <textarea 
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Compartilhe suas preferências literárias..."
              className={`${inputClass} h-24 resize-none`}
              style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
            />
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="mt-6 pt-5 border-t flex justify-end items-center gap-3" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <button 
            onClick={onClose}
            className="px-5 py-2 font-bold opacity-60 hover:opacity-100 transition-all text-xs uppercase tracking-wider"
            style={{ color: 'var(--cor-texto-principal)' }}
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="px-7 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              backgroundColor: 'var(--cor-destaque)', 
              color: 'white' // Mantém fixo branco para contrastar bem com a cor viva de destaque
            }}
          >
            Confirmar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}