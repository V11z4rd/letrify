"use client";
import { useState, useEffect } from "react";
import EditorPerfil from "./EditorPerfil";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { authService } from "@/app/lib/authService";
// Ícones indispensáveis do Heroicons para ações e metadados de perfil
import { 
  MapPinIcon, 
  PencilSquareIcon, 
  UserPlusIcon, 
  CheckIcon 
} from "@heroicons/react/24/outline";
import { BadgePremium } from "./Premium";

export function SkeletonCabecalho() {
  return (
    <div className="animate-pulse relative mb-8">
      <div className="h-56 w-full rounded-t-2xl bg-black/[0.06] dark:bg-white/[0.06]"></div>
      <div className="px-8 pb-8 rounded-b-2xl border-x border-b shadow-sm"
           style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start shrink-0 -mt-16 z-10">
            <div className="w-36 h-36 border-4 bg-black/[0.08] dark:bg-white/[0.08]"
                 style={{ borderColor: 'var(--cor-fundo-card)', borderRadius: '2rem' }}></div>
          </div>
          <div className="flex-1 mt-6 md:mt-4 flex flex-col gap-3">
            <div className="h-7 w-48 bg-black/[0.08] dark:bg-white/[0.08] rounded-xl"></div>
            <div className="h-4 w-full max-w-md bg-black/[0.04] dark:bg-white/[0.04] rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CabecalhoProps {
  nome: string;
  cidade: string;
  descricao: string;
  fotoPerfil: string;
  bannerUrl: string;
  isPremium: boolean;
  estatisticas: { seguindo: number; seguidores: number };
  isDonoDoPerfil: boolean;
  isSeguindoInicial?: boolean; 
  onFollowClick?: () => Promise<void>;
  onAbrirModal?: (tipo: "Seguidores" | "Seguindo") => void; 
  isEditorAbertoExterno: boolean;
  setIsEditorAbertoExterno: (aberto: boolean) => void;
}

export default function CabecalhoPerfil({
  nome: initialNome,
  cidade: initialCidade,
  descricao: initialDescricao,
  fotoPerfil: initialFoto,
  bannerUrl: initialBanner,
  estatisticas,
  isDonoDoPerfil,
  isSeguindoInicial = false,
  onFollowClick,
  onAbrirModal,
  isEditorAbertoExterno,
  setIsEditorAbertoExterno,
  isPremium = false
}: CabecalhoProps) {
  
  const [dadosPerfil, setDadosPerfil] = useState({
    nome: initialNome,
    cidade: initialCidade,
    descricao: initialDescricao,
    fotoPerfil: initialFoto,
    bannerUrl: initialBanner,
    isPremium: false
  });

  const [seguindo, setSeguindo] = useState(isSeguindoInicial);
  const [contSeguidores, setContSeguidores] = useState(estatisticas?.seguidores || 0);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

  useEffect(() => {
    setSeguindo(isSeguindoInicial);
    setContSeguidores(estatisticas?.seguidores || 0);
  }, [isSeguindoInicial, estatisticas?.seguidores]);

  useEffect(() => {
    setDadosPerfil(prev => ({
      ...prev,
      nome: initialNome,
      cidade: initialCidade,
      descricao: initialDescricao,
      fotoPerfil: initialFoto,
      bannerUrl: initialBanner,
      isPremium: isPremium // Garante que a atualização externa reflita aqui
    }));
  }, [initialNome, initialCidade, initialDescricao, initialFoto, initialBanner, isPremium]);

  const handleBotaoSeguir = async () => {
    if (!onFollowClick) return;

    const estadoAnteriorSeguindo = seguindo;
    const contadorAnterior = contSeguidores;

    setSeguindo(!estadoAnteriorSeguindo);
    setContSeguidores(estadoAnteriorSeguindo ? contadorAnterior - 1 : contadorAnterior + 1);

    try {
      await onFollowClick();
    } catch (erro) {
      setSeguindo(estadoAnteriorSeguindo);
      setContSeguidores(contadorAnterior);
      console.error("Erro ao processar ação de seguir:", erro);
    }
  };

  const handleSalvarDados = async (novosDados: any) => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Autenticação necessária.");
    
      const formData = new FormData();
      if (novosDados.nome) formData.append("nome", novosDados.nome);
      if (novosDados.cidade) formData.append("cidade", novosDados.cidade);
      if (novosDados.descricao) formData.append("descricao", novosDados.descricao);
      if (novosDados.fotoPerfil instanceof File) {
        formData.append("foto", novosDados.fotoPerfil);
      }

      // Corrigido para utilizar a variável dinâmica global BASE_URL
      const resposta = await fetch(`${BASE_URL}/usuario/editar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (resposta.ok) {
        setDadosPerfil(novosDados);
        setIsEditorAbertoExterno(false);
      } else {
        throw new Error("Erro na resposta do servidor.");
      }
    } catch (err) {
      console.error("Falha ao salvar dados cadastrais:", err);
    }
  };

  const inicial = dadosPerfil.nome ? dadosPerfil.nome.charAt(0).toUpperCase() : "U";

  return (
    <div className="animate-fade-in relative mb-8">
      {!isEditorAbertoExterno ? (
        <>
          {/* BANNER COM EMBLEMA VISUAL */}
          <div 
            className="h-56 w-full rounded-t-3xl bg-cover bg-center relative border-t border-x overflow-hidden"
            style={{ 
              backgroundImage: dadosPerfil.bannerUrl ? `url("${dadosPerfil.bannerUrl}")` : 'none',
              backgroundColor: 'var(--cor-fundo-sidebar)',
              borderColor: 'var(--cor-fundo-sidebar)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/[0.45] to-transparent"></div>
          </div>

          {/* CORPO DO PERFIL */}
          <div 
            className="px-8 pb-8 rounded-b-3xl shadow-sm border-x border-b relative transition-all duration-300"
            style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            <div className="flex flex-col md:flex-row gap-6">
          
              {/* AVATAR E METADADOS */}
              <div className="flex flex-col items-center md:items-start shrink-0 -mt-16 z-10">
                <div 
                  className="w-36 h-36 flex items-center justify-center text-5xl font-black shadow-2xl border-4 overflow-hidden relative transition-transform duration-300"
                  style={{ 
                    backgroundColor: 'var(--cor-primaria)', 
                    color: 'var(--cor-botao-texto)', 
                    borderColor: 'var(--cor-fundo-card)', 
                    borderRadius: '2.25rem' 
                  }}
                >
                  {dadosPerfil.fotoPerfil ? (
                    <img src={dadosPerfil.fotoPerfil} alt={dadosPerfil.nome} className="w-full h-full object-cover" />
                  ) : (
                    inicial
                  )}
                </div>
            
                {dadosPerfil.cidade && (
                  <div className="mt-3 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider opacity-70" style={{ color: 'var(--cor-texto-secundario)' }}>
                    <MapPinIcon className="w-4 h-4 stroke-[2]" style={{ color: 'var(--cor-primaria)' }} />
                    <span>{dadosPerfil.cidade}</span>
                  </div>
                )}
              </div>

              {/* CONTEÚDO PRINCIPAL */}
              <div className="flex-1 mt-4 md:mt-3.5 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-4">
                  <h1 className="text-3xl font-black tracking-tight flex items-center" style={{ color: 'var(--cor-texto-principal)' }}>
                    {dadosPerfil.nome}
                    {/* Se o objeto usuário vier com 'isPremium: true' */}
                    {dadosPerfil.isPremium && <BadgePremium />}
                  </h1>
              
                  {isDonoDoPerfil ? (
                    <button 
                      onClick={() => setIsEditorAbertoExterno(true)}
                      className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{ 
                        backgroundColor: 'var(--cor-botao-primario)', 
                        color: 'var(--cor-texto-principal)', 
                        borderColor: 'var(--cor-fundo-sidebar)' 
                      }}
                    >
                      <PencilSquareIcon className="w-4 h-4 stroke-[2]" />
                      <span>Editar Perfil</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleBotaoSeguir} 
                      className="px-7 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{ 
                        backgroundColor: seguindo ? 'var(--cor-fundo-sidebar)' : 'var(--cor-destaque)', 
                        color: seguindo ? 'var(--cor-texto-secundario)' : '#ffffff',
                        border: seguindo ? '1px solid var(--cor-fundo-sidebar)' : 'none'
                      }}
                    >
                      {seguindo ? (
                        <>
                          <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Seguindo</span>
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Seguir</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <div className="text-sm leading-relaxed max-w-2xl font-medium" style={{ color: 'var(--cor-texto-principal)', opacity: dadosPerfil.descricao ? 0.9 : 1 }}>
                    {dadosPerfil.descricao || <span className="italic opacity-40 font-normal">Este leitor ainda não adicionou uma biografia.</span>}
                  </div>

                  {/* CONTADORES SOCIAIS */}
                  <div className="flex gap-5 text-xs font-black uppercase tracking-wider shrink-0 pt-1">
                    <span 
                      onClick={() => onAbrirModal && onAbrirModal("Seguindo")}
                      className="cursor-pointer group flex items-center gap-1"
                    >
                      <strong className="text-sm" style={{ color: 'var(--cor-texto-principal)' }}>{estatisticas?.seguindo || 0}</strong> 
                      <span className="opacity-50 group-hover:opacity-100 group-hover:underline transition-opacity" style={{ color: 'var(--cor-texto-secundario)' }}>Seguindo</span>
                    </span>
                    
                    <span 
                      onClick={() => onAbrirModal && onAbrirModal("Seguidores")}
                      className="cursor-pointer group flex items-center gap-1"
                    >
                      <strong className="text-sm" style={{ color: 'var(--cor-texto-principal)' }}>{contSeguidores}</strong> 
                      <span className="opacity-50 group-hover:opacity-100 group-hover:underline transition-opacity" style={{ color: 'var(--cor-texto-secundario)' }}>Seguidores</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      ) : (
        <EditorPerfil 
          dadosIniciais={dadosPerfil} 
          onClose={() => setIsEditorAbertoExterno(false)} 
          onSave={handleSalvarDados}
        />
      )}
    </div>
  );
}