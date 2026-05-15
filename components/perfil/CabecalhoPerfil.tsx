"use client";
import { useState, useEffect } from "react";
import EditorPerfil from "./EditorPerfil";
import { authService } from "@/app/lib/authService";

export function SkeletonCabecalho() {
  return (
    <div className="animate-pulse relative mb-8">
      <div className="h-56 w-full rounded-t-2xl bg-black/10 dark:bg-white/10"></div>
      <div className="px-8 pb-8 rounded-b-2xl shadow-sm border-x border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start shrink-0 -mt-16 z-10">
            <div className="w-36 h-36 border-4 border-zinc-900 bg-black/15 rounded-full"></div>
          </div>
          <div className="flex-1 mt-4 md:mt-2 flex flex-col justify-between">
            <div className="h-8 w-48 bg-black/15 dark:bg-white/15 rounded-md"></div>
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
  estatisticas: { seguindo: number; seguidores: number };
  isDonoDoPerfil: boolean;
  // --- NOVAS PROPS ---
  isSeguindoInicial?: boolean; 
  onFollowClick?: () => Promise<void>; 
  onAbrirModal?: (tipo: "Seguidores" | "Seguindo") => void; 
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
  onAbrirModal
}: CabecalhoProps) {
  
  // Estados do Editor de Perfil
  const [dadosPerfil, setDadosPerfil] = useState({
    nome: initialNome,
    cidade: initialCidade,
    descricao: initialDescricao,
    fotoPerfil: initialFoto,
    bannerUrl: initialBanner
  });
  const [isEditorAberto, setIsEditorAberto] = useState(false);

  // --- ESTADOS DA OPTIMISTIC UI ---
  const [seguindo, setSeguindo] = useState(isSeguindoInicial);
  const [contSeguidores, setContSeguidores] = useState(estatisticas?.seguidores || 0);

  // Se as props mudarem (ex: usuário navegou para outro perfil), atualiza os estados
  useEffect(() => {
    setSeguindo(isSeguindoInicial);
    setContSeguidores(estatisticas?.seguidores || 0);
  }, [isSeguindoInicial, estatisticas?.seguidores]);

  // A MÁGICA DA INTERFACE OTIMISTA
  const handleBotaoSeguir = async () => {
    if (!onFollowClick) return;

    // Guarda o estado anterior caso a API falhe
    const estadoAnteriorSeguindo = seguindo;
    const contadorAnterior = contSeguidores;

    // Muda a tela na mesma hora (Instantâneo para o usuário)
    setSeguindo(!estadoAnteriorSeguindo);
    setContSeguidores(estadoAnteriorSeguindo ? contadorAnterior - 1 : contadorAnterior + 1);

    try {
      await onFollowClick(); // Chama a função lá da page.tsx que bate na API
    } catch (erro) {
      // Deu ruim na API C#? A gente reverte como se nada tivesse acontecido
      setSeguindo(estadoAnteriorSeguindo);
      setContSeguidores(contadorAnterior);
    }
  };

  const handleSalvarDados = async (novosDados: any) => {
    // ... mantido o mesmo código do seu Editor ...
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Você precisa estar logado para editar o perfil.");
    
      const formData = new FormData();
      if (novosDados.nome) formData.append("nome", novosDados.nome);
      if (novosDados.cidade) formData.append("cidade", novosDados.cidade);
      if (novosDados.descricao) formData.append("descricao", novosDados.descricao);
      if (novosDados.fotoPerfil instanceof File) {
        formData.append("foto", novosDados.fotoPerfil);
      }

      const resposta = await fetch("https://letrify.fly.dev/api/usuario/editar", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (resposta.ok) {
        setDadosPerfil(novosDados);
        setIsEditorAberto(false);
        alert("Perfil atualizado! ✨");
      } else {
        throw new Error("Erro ao atualizar perfil.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const inicial = dadosPerfil.nome ? dadosPerfil.nome.charAt(0).toUpperCase() : "U";

  return (
    <div className="animate-fade-in relative mb-8">
      
      {/* BANNER */}
      <div 
        className="h-56 w-full rounded-t-2xl bg-cover bg-center relative"
        style={{ backgroundImage: `url("${dadosPerfil.bannerUrl}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-2xl"></div>
      </div>

      {/* CORPO DO PERFIL */}
      <div 
        className="px-8 pb-8 rounded-b-2xl shadow-sm border-x border-b relative"
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* AVATAR E LOCALIZAÇÃO */}
          <div className="flex flex-col items-center md:items-start shrink-0 -mt-16 z-10">
            <div 
              className="w-36 h-36 flex items-center justify-center text-5xl font-bold shadow-xl border-4 object-cover overflow-hidden"
              style={{ 
                backgroundColor: 'var(--cor-primaria)', 
                color: 'var(--cor-botao-texto)', 
                borderColor: 'var(--cor-fundo-card)', 
                borderRadius: '2rem' 
              }}
            >
              {dadosPerfil.fotoPerfil ? (
                <img src={dadosPerfil.fotoPerfil} alt={dadosPerfil.nome} className="w-full h-full object-cover" />
              ) : (
                inicial
              )}
            </div>
            
            {dadosPerfil.cidade && (
              <div className="mt-3 flex items-center gap-1 font-semibold text-sm" style={{ color: 'var(--cor-texto-secundario)' }}>
                📍 {dadosPerfil.cidade}
              </div>
            )}
          </div>

          {/* INFOS E BOTÕES */}
          <div className="flex-1 mt-4 md:mt-2 flex flex-col justify-between">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>
                {dadosPerfil.nome}
              </h1>
              
              {isDonoDoPerfil ? (
                <button 
                  onClick={() => setIsEditorAberto(true)}
                  className="px-5 py-2 text-sm font-bold rounded-xl shadow transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)', border: '2px solid var(--cor-destaque)' }}
                >
                  Editar Perfil
                </button>
              ) : (
                <button 
                  onClick={handleBotaoSeguir} 
                  className={`px-8 py-2 text-sm font-bold rounded-xl shadow transition-all hover:scale-105 active:scale-95 ${
                    seguindo ? "bg-zinc-800 text-white border border-white/10" : "bg-blue-600 text-white"
                  }`}
                >
                  {seguindo ? "Seguindo" : "Seguir"}
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="text-sm leading-relaxed max-w-2xl flex-1" style={{ color: 'var(--cor-texto-principal)' }}>
                {dadosPerfil.descricao || <span className="italic opacity-60">Este usuário ainda não escreveu uma biografia.</span>}
              </div>

              {/* CONEXÕES COM CLIQUES PARA O MODAL */}
              <div className="flex gap-4 text-sm font-semibold shrink-0 mb-1">
                <span 
                  onClick={() => onAbrirModal && onAbrirModal("Seguindo")}
                  className="cursor-pointer hover:underline decoration-2" 
                  style={{ textDecorationColor: 'var(--cor-primaria)' }}
                >
                  <strong style={{ color: 'var(--cor-texto-principal)' }}>{estatisticas?.seguindo || 0}</strong> <span style={{ color: 'var(--cor-texto-secundario)' }}>Seguindo</span>
                </span>
                
                <span 
                  onClick={() => onAbrirModal && onAbrirModal("Seguidores")}
                  className="cursor-pointer hover:underline decoration-2" 
                  style={{ textDecorationColor: 'var(--cor-primaria)' }}
                >
                  <strong style={{ color: 'var(--cor-texto-principal)' }}>{contSeguidores}</strong> <span style={{ color: 'var(--cor-texto-secundario)' }}>Seguidores</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditorAberto && (
        <EditorPerfil 
          dadosIniciais={dadosPerfil} 
          onClose={() => setIsEditorAberto(false)} 
          onSave={handleSalvarDados}
        />
      )}
    </div>
  );
}