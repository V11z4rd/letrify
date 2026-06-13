"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import ComentarioFilho from "./ComentarioFilho";
import MenuTresPontinhos from "../ui/MenuTresPontinhos";
import { BadgePremium } from "@/components/perfil/Premium";
import BotaoCurtir from "@/components/ui/BotaoCurtir";
import { 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon, 
  ArrowRightIcon,
  PaperAirplaneIcon
} from "@heroicons/react/24/outline";

interface UsuarioChat {
  id: number;
  nome: string;
  fotoPerfil: string;
  isPremium?: boolean;
}

interface MensagemChat {
  id: number;
  conteudo: string;
  dataPostagem: string;
  usuario: UsuarioChat;
  mensagemPaiId?: number | null;
  respostas: MensagemChat[];
  grupoId?: number | null;
  GrupoId?: number | null;
  grupo_id?: number | null;
  grupo?: { id: number } | number | null;
  totalCurtidas?: number;
  TotalCurtidas?: number;
  euCurti?: boolean;
  EuCurti?: boolean;
}

interface PostThreadProps {
  post: MensagemChat;
  meuId: number | null;
}

export default function PostThread({ post, meuId }: PostThreadProps) {
  const [expandido, setExpandido] = useState(false);
  
  const [conteudoResposta, setConteudoResposta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // --- ESTADOS ADICIONADOS PARA BUSCAR O NOME DO GRUPO EM TEMPO DE EXECUÇÃO ---
  const [nomeDoGrupoReal, setNomeDoGrupoReal] = useState<string>("Carregando clube...");
  const [fotoCapaGrupo, setFotoCapaGrupo] = useState<string | null>(null);

  const [usuarioIsPremium, setUsuarioIsPremium] = useState<boolean>(false);

  const isDonoDoPost = meuId === post.usuario.id;
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";
  
  const curtidasContagem = post.totalCurtidas ?? post.TotalCurtidas ?? 0;
  const usuarioCurtiu = post.euCurti ?? post.EuCurti ?? false;


  useEffect(() => {
    console.log(`👤 Usuário do post ${post.id}:`, post.usuario);
  }, [post]);

  // MAPEAMENTO INTELIGENTE: Captura o ID do grupo independentemente de como o backend o devolveu
  const idDoGrupo = useMemo(() => {
    if (!post) return null;
    
    // Testa todas as variações possíveis de retorno de chaves estrangeiras relacionais
    const rawId = post.grupoId || post.GrupoId || post.grupo_id;
    if (rawId) return Number(rawId);

    // Se o backend retornou o objeto do grupo inteiro populado ({ grupo: { id: 12 } })
    if (post.grupo && typeof post.grupo === 'object' && 'id' in post.grupo) {
      return Number(post.grupo.id);
    }
    
    if (typeof post.grupo === 'number') {
      return post.grupo;
    }

    return null;
  }, [post]);

  // 🔄 BUSCA DIRETA DO NOME BASEADO NO ID ADQUIRIDO (Sua sugestão perfeita)
  useEffect(() => {
    if (idDoGrupo) {
      const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;

      // Consome a rota da sua documentação: GET /api/grupos/{id}
      fetch(`${BASE_URL}/grupos/${idDoGrupo}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível achar o grupo");
        return res.json();
      })
      .then((grupoBuscado) => {
        // Alimenta os estados locais com o nome e foto reais que vieram do banco de dados
        setNomeDoGrupoReal(grupoBuscado.nome || "Clube de Leitura");
        setFotoCapaGrupo(grupoBuscado.fotoCapa || null);
      })
      .catch(() => {
        setNomeDoGrupoReal("Clube Privado ou Indisponível");
      });
    }
  }, [idDoGrupo, BASE_URL]);

  useEffect(() => {
    if (post.usuario?.id) {
      const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;

      fetch(`${BASE_URL}/usuario/${post.usuario.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((dadosApi) => {
        // 💡 Checa de forma inteligente se a string do nome possui a marcação "Premium"
        const temNomePremium = dadosApi?.nome && String(dadosApi.nome).toLowerCase().includes("premium");
        
        // Mapeamento em cascata resiliente a futuras atualizações estruturais do backend
        const premium = temNomePremium ||
                        dadosApi?.premium === true || 
                        dadosApi?.isPremium === true || 
                        dadosApi?.perfil?.premium === "1" || 
                        dadosApi?.perfil?.isPremium === true;
        
        setUsuarioIsPremium(!!premium);
      })
      .catch(() => {
        setUsuarioIsPremium(false);
      });
    }
  }, [post.usuario.id, BASE_URL]);

  const handleResponder = async () => {
    const textoLimpo = conteudoResposta.trim();
    if (textoLimpo.length === 0) return;
    if (textoLimpo.length > 150) {
      setErro("A resposta não pode ter mais de 150 caracteres.");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("letrify_token") : null;
      
      const respostaApi = await fetch(`${BASE_URL}/chat/enviar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ conteudo: textoLimpo, mensagemPaiId: post.id }) 
      });

      if (respostaApi.status === 429) {
        setErro("Aguarde um pouco antes de enviar outra resposta.");
        return;
      }

      if (!respostaApi.ok) {
        setErro("Falha ao enviar a resposta.");
        return;
      }

      setConteudoResposta("");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("atualizar_feed_global"));
      }

    } catch (err) {
      setErro("Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div 
      className="p-5 sm:p-6 rounded-3xl border shadow-md transition-all duration-300"
      style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      
      {/* CABEÇALHO DO POST PAI */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">

          {/* FOTO CLICÁVEL DO AVATAR */}
          <Link 
            href={`/perfil?id=${post.usuario.id}`} 
            className="w-11 h-11 rounded-xl border overflow-hidden flex-shrink-0 hover:opacity-80 transition-all shadow-sm"
            style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            {post.usuario?.fotoPerfil ? (
              <img src={post.usuario.fotoPerfil} alt={post.usuario.nome} className="w-full h-full object-cover" />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center font-black text-sm"
                style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)' }}
              >
                {post.usuario?.nome?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          
          {/* BLOCO INFORMATIVO DO USUÁRIO */}
          <div>
            <div className="flex items-center gap-1.5">
              <Link 
                href={`/perfil?id=${post.usuario.id}`} 
                className="font-black text-sm tracking-tight hover:underline"
                style={{ color: 'var(--cor-texto-principal)' }}
              >
                {post.usuario?.nome}
              </Link>

              {/* 💡 EXIBE O ÍCONE ALINHADO AO LADO DO NOME */}
              {usuarioIsPremium && (
                <div className="scale-80 origin-left flex items-center shrink-0">
                  <BadgePremium />
                </div>
              )}
            </div>
  
            <p className="text-[9px] uppercase tracking-wider font-bold opacity-40 mt-0.5" style={{ color: 'var(--cor-texto-principal)' }}>
              {new Date(post.dataPostagem).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <MenuTresPontinhos idPost={post.id} isDono={isDonoDoPost} />
      </div>
      
      {/* CORPO DO POST PAI */}
      <p 
        className="text-sm leading-relaxed font-medium mb-4 whitespace-pre-wrap"
        style={{ color: 'var(--cor-texto-principal)', opacity: 0.9 }}
      >
        {post.conteudo}
      </p>

      {/* BLOCO DE RECRUTAMENTO DE CLUBES (VISUAL PREMIUM) */}
      {idDoGrupo ? (
        <div 
          className="mb-5 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
          style={{ 
            backgroundColor: 'var(--cor-fundo-app)', 
            borderColor: 'rgba(59, 130, 246, 0.2)' 
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
            >
              <UserGroupIcon className="w-5 h-5 stroke-[2]" style={{ color: 'var(--cor-primaria)' }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--cor-primaria)' }}>Convite de Leitura</p>
              <p className="text-xs sm:text-sm font-bold opacity-80" style={{ color: 'var(--cor-texto-principal)' }}>Junte-se a este clube literário!</p>
              <p className="text-xs sm:text-sm font-black tracking-tight truncate mt-0.5" style={{ color: 'var(--cor-texto-principal)' }}>
                {nomeDoGrupoReal}
              </p>
            </div>
          </div>
          
          <Link 
            href={`/grupos/${idDoGrupo}`} 
            className="px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95"
            style={{ backgroundColor: 'var(--cor-destaque)', color: '#ffffff' }}
          >
            <span>Ver Clube</span>
            <ArrowRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>
      ) : null}

      <div className="flex items-center gap-3 mt-2">
        {/* ✅ BOTÃO DE CURTIR ACOPLADO COM TIPO GLOBAL */}
        <BotaoCurtir 
          mensagemId={post.id}
          curtidasIniciais={curtidasContagem}
          jaCurtidoInicial={usuarioCurtiu}
        />

        {/* SELETOR INDICADOR DE RESPOSTAS */}
        <button 
          onClick={() => setExpandido(!expandido)}
          className="text-[10px] uppercase tracking-widest font-black flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
          style={{ 
            backgroundColor: expandido ? 'var(--cor-fundo-sidebar)' : 'transparent',
            color: expandido ? 'var(--cor-primaria)' : 'var(--cor-texto-secundario)' 
          }}
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4 stroke-[2.5]" />
          <span>{post.respostas?.length || 0} respostas</span>
        </button>
      </div>

      {/* ÁREA EXPANDIDA */}
      {expandido && (
        <div 
          className="mt-5 ml-5 pl-5 border-l-2 relative transition-all animate-fade-in"
          style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          {/* INPUT DE RESPOSTA EXPANDIDO */}
          <div className="mb-5 relative">
            <div className="absolute -left-5 top-5 w-5 border-t-2" style={{ borderColor: 'var(--cor-fundo-sidebar)' }} />
            
            <div 
              className="border rounded-2xl p-3 flex flex-col gap-2"
              style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}
            >
              <textarea
                value={conteudoResposta}
                onChange={(e) => {
                  setConteudoResposta(e.target.value);
                  if (erro) setErro(null);
                }}
                placeholder={`Responder a ${post.usuario.nome}...`}
                className="w-full bg-transparent text-xs sm:text-sm resize-none outline-none font-medium h-14 placeholder:opacity-30"
                style={{ color: 'var(--cor-texto-principal)' }}
                maxLength={150}
                disabled={enviando}
              />
              
              {erro && <p className="text-red-500 text-[10px] font-bold px-1">{erro}</p>}
              
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-mono font-bold opacity-30" style={{ color: 'var(--cor-texto-principal)' }}>
                  {conteudoResposta.length}/150
                </span>
                
                <button
                  onClick={handleResponder}
                  disabled={conteudoResposta.trim().length === 0 || enviando}
                  className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-30 disabled:scale-100"
                  style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)' }}
                >
                  <PaperAirplaneIcon className="w-3 h-3 stroke-[2.5]" />
                  <span>{enviando ? "..." : "Enviar"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* COMENTÁRIOS FILHOS */}
          <div className="flex flex-col gap-4">
            {post.respostas && post.respostas.length > 0 ? (
              post.respostas.map((resposta) => (
                <div key={resposta.id} className="relative">
                  <div className="absolute -left-5 top-6 w-5 border-t-2" style={{ borderColor: 'var(--cor-fundo-sidebar)' }} />
                  <ComentarioFilho 
                    comentario={resposta} 
                    meuId={meuId} 
                    nomePai={post.usuario.nome} 
                  />
                </div>
              ))
            ) : (
              <p className="text-xs font-medium opacity-30 italic pl-1" style={{ color: 'var(--cor-texto-principal)' }}>
                Seja o primeiro a responder...
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}