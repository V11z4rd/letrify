"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  PencilIcon, 
  CameraIcon, 
  PlusIcon, 
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  BookOpenIcon,
  TrophyIcon,
  SparklesIcon,
  CheckIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// Importa o mapeador que você usa na tela de perfil para manter a consistência dos dados
import { mapearPerfilDaApi } from "@/app/lib/usuarioService";

function extrairDadosDoToken(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function EditarPerfilPage() {
  const router = useRouter();
  
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState("Carregando...");
  const [cidade, setCidade] = useState("");
  const [idade, setIdade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState("");
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);

  const [bannerUrl, setBannerUrl] = useState("https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [tokenSessao, setTokenSessao] = useState("");

  const BASE_URL = "https://letrify.fly.dev/api";

  // 1. CARREGAMENTO INICIAL: Busca os dados existentes para não iniciar com inputs vazios
  useEffect(() => {
    const token = localStorage.getItem("letrify_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setTokenSessao(token);
      const dadosDoToken = extrairDadosDoToken(token);
      const chaveId = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
      const usuarioId = dadosDoToken?.[chaveId]; 

      if (usuarioId) {
        // Buscamos primeiro na rota de informações que é a mais completa do seu perfil
        fetch(`${BASE_URL}/usuario/informacoes/${usuarioId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(dadosBrutos => {
            if (dadosBrutos) {
              // Passa pelo mapeador oficial do projeto para normalizar a estrutura
              const dadosMapeados = mapearPerfilDaApi(dadosBrutos);
              if (dadosMapeados) {
                setNome(dadosMapeados.nome || "Leitor Letrify");
                setCidade(dadosMapeados.cidade || "");
                setDescricao(dadosMapeados.descricao || "");
                setFotoPerfilUrl(dadosMapeados.fotoPerfil || "");
                setIdade(dadosBrutos.idade || dadosBrutos.perfil?.idade || "");
              }
            }
          })
          .catch(console.error)
          .finally(() => setCarregando(false));
      } else {
        setCarregando(false);
      }
    } catch (error) {
      setCarregando(false);
    }
  }, [router, BASE_URL]);

  const handleMudancaFoto = (e: React.ChangeEvent<HTMLInputElement>, tipo: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (tipo === "avatar") {
        setFotoPerfilUrl(imageUrl);
        setFotoArquivo(file);
      } else {
        setBannerUrl(imageUrl);
      }
    }
  };

  // 2. ENVIO DO FORMULÁRIO: Envia as alterações via multipart/form-data
  const handleSalvarPerfil = async () => {
    setSalvando(true);
    try {
      const formData = new FormData();
      
      // Só envia a cidade se existir e não for apenas espaços
      if (cidade && cidade.trim() !== "") {
        formData.append("cidade", cidade.trim());
      }
      
      // Validação Crítica da Idade (Garante que só envia se for um número válido)
      const idadeNumero = parseInt(idade, 10);
      if (!isNaN(idadeNumero) && idadeNumero > 0) {
        formData.append("idade", idadeNumero.toString());
      }

      // Só envia a descrição se existir
      if (descricao && descricao.trim() !== "") {
        formData.append("descricao", descricao.trim());
      }

      if (fotoArquivo) {
        formData.append("foto", fotoArquivo);
      }

      const resposta = await fetch(`${BASE_URL}/usuario/editar`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${tokenSessao}`
        },
        body: formData
      });

      if (resposta.ok) {
        router.push("/perfil");
      } else {
        // Agora, se o servidor recusar, capturamos o erro e o apresentamos!
        const erroMsg = await resposta.text();
        alert(`Erro ao salvar: ${erroMsg || resposta.statusText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div 
        className="p-12 text-center text-xs font-black uppercase tracking-widest flex flex-col items-center justify-center min-h-[60vh] gap-3"
        style={{ color: 'var(--cor-texto-secundario)' }}
      >
        <ArrowPathIcon className="w-6 h-6 animate-spin text-[var(--cor-primaria)]" />
        <span>Montando seu estúdio literário...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 pb-24 animate-fade-in relative">
      
      {/* HEADER FLUTUANTE DE CONTROLE */}
      <div 
        className="sticky top-4 z-40 flex justify-between items-center p-4 rounded-2xl shadow-xl border mb-8 backdrop-blur-lg transition-all"
        style={{ 
          backgroundColor: 'rgba(var(--cor-fundo-card-rgb, 255, 255, 255), 0.85)', 
          borderColor: 'var(--cor-fundo-sidebar)' 
        }}
      >
        <div>
          <h2 className="font-black text-base tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>Editar Perfil</h2>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Personalize sua identidade</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => router.push('/perfil')} 
            className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-all"
            style={{ color: 'var(--cor-texto-secundario)' }}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSalvarPerfil}
            disabled={salvando}
            className="px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:scale-100"
            style={{ backgroundColor: 'var(--cor-destaque)', color: '#ffffff' }}
          >
            <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
            <span>{salvando ? "Salvando..." : "Salvar"}</span>
          </button>
        </div>
      </div>

      {/* CONTAINER DO CARD PRINCIPAL */}
      <div 
        className="rounded-3xl shadow-lg border mb-8 overflow-hidden relative" 
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        
        {/* Banner Editável Interativo */}
        <div className="h-44 sm:h-52 w-full relative group cursor-pointer overflow-hidden" onClick={() => bannerInputRef.current?.click()}>
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url("${bannerUrl}")` }}></div>
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest">
              <PencilIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Trocar Capa</span>
            </div>
          </div>
          <input type="file" hidden ref={bannerInputRef} accept="image/*" onChange={(e) => handleMudancaFoto(e, "banner")} />
        </div>

        {/* Informações de Perfil e Inputs */}
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-14 sm:-mt-16 mb-6">
            
            {/* Avatar Editável Redondo Premium */}
            <div className="relative group cursor-pointer z-10 shrink-0" onClick={() => fotoInputRef.current?.click()}>
              <div 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-4xl font-black shadow-2xl border-4 overflow-hidden" 
                style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-botao-texto)', borderColor: 'var(--cor-fundo-card)' }}
              >
                {fotoPerfilUrl ? (
                  <img src={fotoPerfilUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  nome.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-4 border-transparent">
                <CameraIcon className="w-6 h-6 text-white stroke-[2]" />
              </div>
              <input type="file" hidden ref={fotoInputRef} accept="image/*" onChange={(e) => handleMudancaFoto(e, "avatar")} />
            </div>
            
            {/* Bloco de Nome e Inputs de Texto */}
            <div className="w-full space-y-3 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>{nome}</h1>
              
              <div className="flex gap-3 max-w-xl">
                {/* Localização */}
                <div className="relative flex-1">
                  <MapPinIcon className="w-4 h-4 absolute left-3 top-3 opacity-40" style={{ color: 'var(--cor-texto-principal)' }} />
                  <input 
                    type="text" 
                    value={cidade} 
                    onChange={(e) => setCidade(e.target.value)} 
                    placeholder="Cidade (Ex: Porto, PT)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold rounded-xl border outline-none transition-all focus:border-[var(--cor-destaque)]"
                    style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
                  />
                </div>

                {/* Idade */}
                <div className="relative w-24 sm:w-28">
                  <CalendarIcon className="w-4 h-4 absolute left-2.5 top-3 opacity-40" style={{ color: 'var(--cor-texto-principal)' }} />
                  <input 
                    type="number" 
                    value={idade} 
                    onChange={(e) => setIdade(e.target.value)} 
                    placeholder="Idade"
                    className="w-full pl-8 pr-2 py-2.5 text-xs text-center font-bold rounded-xl border outline-none transition-all focus:border-[var(--cor-destaque)]"
                    style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Biografia / Sobre Mim */}
          <div className="mt-4">
            <label className="text-[10px] uppercase tracking-widest font-black mb-1.5 flex items-center gap-1" style={{ color: 'var(--cor-primaria)' }}>
              <UserIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Sobre mim (Bio)</span>
            </label>
            <textarea 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Conte à comunidade quais são seus gêneros literários favoritos e o que você gosta de ler..."
              className="w-full p-4 text-xs sm:text-sm rounded-2xl border outline-none h-28 font-medium transition-all focus:border-[var(--cor-destaque)] placeholder:opacity-30"
              style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
              maxLength={300}
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO: VITRINES */}
      <h2 className="text-base font-black uppercase tracking-wider mb-4 mt-8" style={{ color: 'var(--cor-texto-principal)' }}>Minhas Vitrines (Destaques)</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => setModalAberto(true)}
          className="w-full h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02] group"
          style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
        >
          <div className="w-8 h-8 rounded-xl border flex items-center justify-center mb-1 group-hover:scale-105 transition-transform" style={{ borderColor: 'var(--cor-primaria)', backgroundColor: 'rgba(var(--cor-primaria-rgb), 0.1)' }}>
            <PlusIcon className="w-4 h-4 stroke-[3]" style={{ color: 'var(--cor-primaria)' }} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--cor-texto-secundario)' }}>Adicionar Nova Vitrine</span>
        </button>
      </div>

      {/* MODAL MODERNO DE SELEÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div 
            className="w-full max-w-md rounded-3xl shadow-2xl p-6 relative border"
            style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            <button 
              onClick={() => setModalAberto(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors opacity-50 hover:opacity-100"
              style={{ color: 'var(--cor-texto-principal)' }}
            >
              <XMarkIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
            
            <h3 className="text-xl font-black tracking-tight mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Escolha o Destaque</h3>
            <p className="text-xs font-medium opacity-50 mb-6" style={{ color: 'var(--cor-texto-secundario)' }}>Qual bloco de conteúdo deseja expor em seu perfil?</p>

            <div className="space-y-2.5">
              <button className="w-full text-left p-3.5 rounded-2xl border flex items-start gap-3 hover:scale-[1.01] transition-transform group" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                <BookOpenIcon className="w-5 h-5 stroke-[2] mt-0.5 group-hover:text-[var(--cor-primaria)]" style={{ color: 'var(--cor-texto-secundario)' }} />
                <div>
                  <div className="font-extrabold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>Leitura Atual</div>
                  <div className="text-[11px] font-medium opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Exibe o livro que você lê no momento com barra de progresso.</div>
                </div>
              </button>

              <button className="w-full text-left p-3.5 rounded-2xl border flex items-start gap-3 hover:scale-[1.01] transition-transform group" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                <TrophyIcon className="w-5 h-5 stroke-[2] mt-0.5 group-hover:text-[var(--cor-primaria)]" style={{ color: 'var(--cor-texto-secundario)' }} />
                <div>
                  <div className="font-extrabold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>Livro Favorito</div>
                  <div className="text-[11px] font-medium opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Destaca aquela obra 5 estrelas inesquecível no topo.</div>
                </div>
              </button>

              <button className="w-full text-left p-3.5 rounded-2xl border flex items-start gap-3 hover:scale-[1.01] transition-transform group" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                <SparklesIcon className="w-5 h-5 stroke-[2] mt-0.5 group-hover:text-[var(--cor-primaria)]" style={{ color: 'var(--cor-texto-secundario)' }} />
                <div>
                  <div className="font-extrabold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>Top 3 por Gênero</div>
                  <div className="text-[11px] font-medium opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Monte pódios personalizados de Fantasia, Romance ou Terror.</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}