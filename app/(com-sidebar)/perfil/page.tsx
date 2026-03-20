"use client";

import { useState, useEffect } from "react"; // Adicione useEffect e useState
import { useSearchParams, useRouter } from "next/navigation"; // Adicione useRouter
import Link from "next/link";
import useSWR from "swr";
import CabecalhoPerfil, { SkeletonCabecalho } from "@/components/CabecalhoPerfil";
import ResumoLateral from "@/components/ResumoLateral";
import { mapearPerfilDaApi } from "@/app/lib/usuarioService";
import { authService } from "@/app/lib/authService";

const fetcherUsuarioDaApi = async (url: string) => {
  try {
    // Aponta para a sua API real hospedada!
    const resposta = await fetch(`https://letrify.fly.dev${url}`);
    
    if (!resposta.ok) {
      throw new Error(`Erro na API: ${resposta.status}`);
    }
    
    const dados = await resposta.json();
    
    // Deixei este console.log para você ver a mágica acontecendo no F12 (Aba Console)
    console.log("📦 Dados recebidos da API Letrify:", dados);
    
    return dados;
  } catch (erro) {
    console.warn("Aviso do Front: A API falhou. Carregando dados zerados.", erro);
    return {}; 
  }
};

export default function PerfilPage() {
  const router = useRouter(); // Instancie o router
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "visitante";

  const [meuId, setMeuId] = useState<string | null>(null);
  const [carregandoId, setCarregandoId] = useState(true);

  useEffect(() => {
    // Se for preview, a gente não precisa buscar ID de dono
    if (isPreview) {
      setCarregandoId(false);
      return;
    }
  const idNoCofre = authService.getUserId();
    
    if (idNoCofre) {
      setMeuId(idNoCofre);
    } else {
      // Se não tem ID nem token, chuta pro login!
      console.warn("Usuário não logado tentou acessar perfil. Redirecionando.");
      router.push("/login");
    }
    setCarregandoId(false);
  }, [isPreview, router]);

  const idParaBuscar = isPreview ? "1" : meuId;
  const isDonoDoPerfil = !isPreview;

  // ----------------------------------------------------------------------
  // O CÉREBRO BUSCANDO OS DADOS (SWR)
  // ----------------------------------------------------------------------
  const { data: usuarioApi, error, isLoading } = useSWR(
    idParaBuscar ? `/api/usuario/${idParaBuscar}` : null, 
    fetcherUsuarioDaApi
  );

  // ----------------------------------------------------------------------
  // 3. CONTROLE DE TELA (Loading e Erro)
  // ----------------------------------------------------------------------
  if (carregandoId) return <div className="p-8 text-center opacity-50">🔐 Validando sessão...</div>;
  if (error) return <div className="text-red-500 p-8 text-center font-bold">Erro crítico de conexão com o servidor! 🚨</div>;
  
  // Enquanto o SWR está "pensando", mostramos o esqueleto perfeito
  if (isLoading || (idParaBuscar && !usuarioApi)) return (
    <div className="max-w-7xl mx-auto w-full pt-4"><SkeletonCabecalho /></div>
  );

  const perfilMapeado = mapearPerfilDaApi(usuarioApi);
  if (!perfilMapeado) return <div className="p-8 text-center">Perfil não encontrado.</div>;


  // ----------------------------------------------------------------------
  // 5. RENDERIZAÇÃO (Plugando o cabo no Componente Burro)
  // ----------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto w-full pt-4 pb-20 relative">

      {/* AVISO E BOTÃO DE SAÍDA DO PREVIEW */}
      {isPreview && (
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-4 bg-red-500 text-white px-5 py-2 rounded-full shadow-lg">
            <span className="text-sm font-bold animate-pulse">🔴 Modo Visitante Ativo</span>
            <Link 
              href="/privacidade" 
              className="text-xs bg-black/20 hover:bg-black/40 px-3 py-1 rounded-full transition-colors font-bold"
            >
              Voltar para Privacidade
            </Link>
          </div>
        </div>
      )}

      {/* O CABEÇALHO BURRO RECEBENDO OS DADOS PROCESSADOS */}
      <CabecalhoPerfil 
        nome={perfilMapeado.nome}
        cidade={perfilMapeado.cidade}
        descricao={perfilMapeado.descricao}
        fotoPerfil={perfilMapeado.fotoPerfil}
        bannerUrl={perfilMapeado.bannerUrl}
        estatisticas={perfilMapeado.estatisticas}
        isDonoDoPerfil={isDonoDoPerfil}
      />

      {/* SETOR 3: VERIFICA SE A API DISSE QUE É PRIVADO */}
      {perfilMapeado.isPrivado && !isDonoDoPerfil ? (
        <div className="mt-8 flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
          <span className="text-5xl mb-4">🔒</span>
          <h3 className="font-bold text-xl mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Esta conta é privada</h3>
          <p className="text-sm text-center" style={{ color: 'var(--cor-texto-secundario)' }}>
            Você não tem permissão para ver as conexões, a estante ou as resenhas de {perfilMapeado.nome}.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LADO ESQUERDO (2/3 do espaço) - Futuras Abas e Vitrines */}
          <div className="md:col-span-2 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center opacity-50" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
            <span className="text-3xl mb-3">🛠️</span>
            <p className="font-bold text-lg" style={{ color: 'var(--cor-texto-principal)' }}>Área das Abas e Vitrines</p>
            <p className="text-sm" style={{ color: 'var(--cor-texto-secundario)' }}>(Próxima etapa da construção)</p>
          </div>

          {/* LADO DIREITO (1/3 do espaço) - O Resumo Lateral */}
          <div className="md:col-span-1">
            <ResumoLateral 
              estante={perfilMapeado.estanteResumo} 
              totalGrupos={perfilMapeado.grupos} 
              totalGuias={perfilMapeado.guias} 
            />
          </div>

        </div>
      )}

    </div>
  );
}