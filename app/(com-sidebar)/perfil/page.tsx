"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import CabecalhoPerfil, { SkeletonCabecalho } from "@/components/CabecalhoPerfil";
import ResumoLateral from "@/components/ResumoLateral";
import { mapearPerfilDaApi } from "@/app/lib/usuarioService";
import { authService } from "@/app/lib/authService";

const fetcherUsuarioDaApi = async (url: string) => {
  try {
    const resposta = await fetch(`https://letrify.fly.dev${url}`);
    if (!resposta.ok) {
      throw new Error(`Erro na API: ${resposta.status}`);
    }
    const dados = await resposta.json();
    console.log("📦 Dados recebidos da API Letrify:", dados);
    return dados;
  } catch (erro) {
    console.warn("Aviso do Front: A API falhou. Carregando dados zerados.", erro);
    return null; // Retornando null para facilitar o bloqueio de tela de erro
  }
};

export default function PerfilPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. O LEITOR DE URL
  const idDaUrl = searchParams.get("id"); // Ex: ?id=15 (Vindo do Match)
  const isPreview = searchParams.get("preview") === "visitante";

  const [meuId, setMeuId] = useState<string | null>(null);
  const [carregandoId, setCarregandoId] = useState(true);

  useEffect(() => {
    const idNoCofre = authService.getUserId();
    
    if (idNoCofre) {
      setMeuId(idNoCofre);
    } else if (!idDaUrl) {
      // Se não tem ID próprio, nem ID na URL, não tem o que fazer aqui
      console.warn("Usuário não logado tentou acessar perfil. Redirecionando.");
      router.push("/login");
    }
    setCarregandoId(false);
  }, [idDaUrl, router]);

  // 2. A MATEMÁTICA DO CAMALEÃO
  // Se tem ID na URL, busca ele. Se não, busca o seu próprio.
  const idParaBuscar = idDaUrl || meuId;
  
  // Você só é o dono da página se o ID buscado for o seu E você não estiver "testando" o modo visitante
  const isDonoDoPerfil = (idParaBuscar === meuId) && !isPreview;

  const { data: usuarioApi, error, isLoading } = useSWR(
    idParaBuscar ? `/api/usuario/${idParaBuscar}` : null, 
    fetcherUsuarioDaApi
  );

  if (carregandoId) return <div className="p-8 text-center opacity-50">🔐 Validando sessão...</div>;
  if (error) return <div className="text-red-500 p-8 text-center font-bold">Erro crítico de conexão com o servidor! 🚨</div>;
  
  if (isLoading || (idParaBuscar && !usuarioApi)) return (
    <div className="max-w-7xl mx-auto w-full pt-4"><SkeletonCabecalho /></div>
  );

  const perfilMapeado = mapearPerfilDaApi(usuarioApi);
  
  // Barreira anti-TypeScript: Garante que perfilMapeado existe daqui pra baixo!
  if (!perfilMapeado) return <div className="p-8 text-center">Perfil não encontrado.</div>;

  // ----------------------------------------------------------------------
  // 💉 INJEÇÃO DA PRIVACIDADE FALSA (O Truque do Front-end)
  // Como a API não tem esse campo, nós injetamos o valor do localStorage
  // Mas atenção: só fazemos isso se o perfil que estamos vendo é o NOSSO 
  // (para não aplicar a nossa privacidade no perfil dos outros!)
  // ----------------------------------------------------------------------
  if (idParaBuscar === meuId) {
    const dadosSalvos = typeof window !== "undefined" ? localStorage.getItem("letrify-privacidade") : null;
    if (dadosSalvos) {
      const preferencias = JSON.parse(dadosSalvos);
      // Força o objeto da API a ter o valor do nosso "banco falso"
      perfilMapeado.isPrivado = preferencias.contaPrivada; 
    }
  }

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

      {/* O CABEÇALHO BURRO (com fallbacks "||" para o TypeScript não reclamar) */}
      <CabecalhoPerfil 
        nome={perfilMapeado.nome || "Usuário"}
        cidade={perfilMapeado.cidade || ""}
        descricao={perfilMapeado.descricao || ""}
        fotoPerfil={perfilMapeado.fotoPerfil || ""}
        bannerUrl={perfilMapeado.bannerUrl || ""}
        estatisticas={perfilMapeado.estatisticas}
        isDonoDoPerfil={isDonoDoPerfil}
      />

      {/* SETOR 3: VERIFICA SE A API DISSE QUE É PRIVADO E NÃO É VOCÊ MESMO */}
      {perfilMapeado.isPrivado && !isDonoDoPerfil ? (
        <div className="mt-8 flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
          <span className="text-5xl mb-4">🔒</span>
          <h3 className="font-bold text-xl mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Esta conta é privada</h3>
          <p className="text-sm text-center" style={{ color: 'var(--cor-texto-secundario)' }}>
            Você não tem permissão para ver as conexões, a estante ou as resenhas de {perfilMapeado.nome || "este usuário"}.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LADO ESQUERDO: O SEU PLACEHOLDER INTACTO! */}
          <div className="md:col-span-2 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center opacity-50" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
            <span className="text-3xl mb-3">🛠️</span>
            <p className="font-bold text-lg" style={{ color: 'var(--cor-texto-principal)' }}>Área das Abas e Vitrines</p>
            <p className="text-sm" style={{ color: 'var(--cor-texto-secundario)' }}>(Próxima etapa da construção)</p>
          </div>

          {/* LADO DIREITO: O Resumo Lateral */}
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