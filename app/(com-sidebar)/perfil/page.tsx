"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";

// Componentes
import CabecalhoPerfil, { SkeletonCabecalho } from "@/components/perfil/CabecalhoPerfil";
import ResumoLateral from "@/components/perfil/ResumoLateral";
import VitrineDestaques from "@/components/perfil/VitrineDestaques";
import AbasDestaque from "@/components/perfil/AbasDestaques";

// Libs e Services
import { mapearPerfilDaApi } from "@/app/lib/usuarioService";
import { authService } from "@/app/lib/authService";
import ModalConexoes from "@/components/perfil/ModalConexoes";

const fetcherUsuarioDaApi = async (url: string) => {
  try {
    const token = authService.getToken();
    const cabecalhos: HeadersInit = { "Content-Type": "application/json" };

    if (token) cabecalhos["Authorization"] = `Bearer ${token}`;

    const resposta = await fetch(`https://letrify.fly.dev${url}`, {
      method: "GET",
      headers: cabecalhos,
    });

    if (!resposta.ok) throw new Error(`Erro na API: ${resposta.status}`);

    return await resposta.json();
  } catch (erro) {
    console.warn("Aviso do Front: Falha ao buscar dados do usuário.", erro);
    return null;
  }
};

function ConteudoDoPerfil() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idDaUrl = searchParams.get("id");
  const isPreview = searchParams.get("preview") === "visitante";

  const [meuId, setMeuId] = useState<string | null>(null);
  const [carregandoId, setCarregandoId] = useState(true);

  const [isSeguindo, setIsSeguindo] = useState(false);
  const [abaModalAberta, setAbaModalAberta] = useState<"Seguidores" | "Seguindo" | null>(null);

  useEffect(() => {
    const idNoCofre = authService.getUserId();
    if (idNoCofre) {
      setMeuId(idNoCofre);
    } else if (!idDaUrl) {
      router.push("/login");
    }
    setCarregandoId(false);
  }, [idDaUrl, router]);

  const idParaBuscar = idDaUrl || meuId;
  const isDonoDoPerfil = (idParaBuscar === meuId) && !isPreview;

  const { data: usuarioApi, error, isLoading, mutate } = useSWR(
    idParaBuscar ? `/api/usuario/informacoes/${idParaBuscar}` : null,
    fetcherUsuarioDaApi
  );

  useEffect(() => {
    // Só faz sentido gastar internet com isso se NÃO for o seu próprio perfil
    if (!isDonoDoPerfil && meuId && idParaBuscar) {
      const verificarSeJaSigo = async () => {
        try {
          const token = authService.getToken();
          // Puxa a MINHA lista de quem eu sigo
          const res = await fetch(`https://letrify.fly.dev/api/seguidores/seguindo`, {
            headers: { "Authorization": `Bearer ${token}` }
          });

          if (res.ok) {
            const quemEuSigo = await res.json();
            // Procura na lista se o ID do perfil que estou visitando está lá dentro.
            // Usamos Number() para garantir que não dê bug de "1" !== 1
            const jaSigo = quemEuSigo.some((user: any) => Number(user.id) === Number(idParaBuscar));
            setIsSeguindo(jaSigo);
          }
        } catch (err) {
          console.error("Erro na verificação de follow:", err);
        }
      };
      verificarSeJaSigo();
    }
  }, [isDonoDoPerfil, meuId, idParaBuscar]);

  const handleFollowToggle = async () => {
    const token = authService.getToken();
    const resposta = await fetch(`https://letrify.fly.dev/api/seguidores/seguir/${idParaBuscar}`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!resposta.ok) {
      throw new Error("Falha ao seguir na API");
    }

    // Atualiza o nosso estado local da gambiarra
    setIsSeguindo(!isSeguindo);
    // Atualiza o SWR silenciosamente para arrumar o número de seguidores
    mutate();
  };

  if (carregandoId) return <div className="p-8 text-center opacity-50">🔐 Validando sessão...</div>;
  if (error) return <div className="text-red-500 p-8 text-center font-bold">Erro crítico ao carregar perfil! 🚨</div>;

  if (isLoading || (idParaBuscar && !usuarioApi)) return (
    <div className="max-w-7xl mx-auto w-full pt-4"><SkeletonCabecalho /></div>
  );

  const perfilMapeado = mapearPerfilDaApi(usuarioApi);
  if (!perfilMapeado) return <div className="p-8 text-center">Perfil não encontrado.</div>;

  if (isDonoDoPerfil) {
    const dadosSalvos = typeof window !== "undefined" ? localStorage.getItem("letrify-privacidade") : null;
    if (dadosSalvos) {
      const preferencias = JSON.parse(dadosSalvos);
      perfilMapeado.isPrivado = preferencias.contaPrivada;
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full pt-4 pb-20 relative px-4">

      {isPreview && (
        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-4 bg-red-500 text-white px-5 py-2 rounded-full shadow-lg">
            <span className="text-sm font-bold animate-pulse">🔴 Modo Visitante</span>
            <Link href="/privacidade" className="text-xs bg-black/20 hover:bg-black/40 px-3 py-1 rounded-full transition-colors font-bold">
              Sair
            </Link>
          </div>
        </div>
      )}

      <CabecalhoPerfil
        nome={perfilMapeado.nome}
        cidade={perfilMapeado.cidade}
        descricao={perfilMapeado.descricao}
        fotoPerfil={perfilMapeado.fotoPerfil}
        bannerUrl={perfilMapeado.bannerUrl}
        estatisticas={perfilMapeado.estatisticas}
        isDonoDoPerfil={isDonoDoPerfil}

        isSeguindoInicial={isSeguindo}
        onFollowClick={handleFollowToggle}
        onAbrirModal={setAbaModalAberta}
      />

      {perfilMapeado.isPrivado && !isDonoDoPerfil ? (
        <div className="mt-8 flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-white/10 bg-zinc-900/50">
          <span className="text-5xl mb-4">🔒</span>
          <h3 className="font-bold text-xl mb-1">Esta conta é privada</h3>
          <p className="text-sm text-center opacity-60">Siga este usuário para ver suas atividades literárias.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-8">
            {/* O Novo Componente Limpo */}
            <AbasDestaque perfil={perfilMapeado} />

            <VitrineDestaques userId={idParaBuscar as string} />
          </div>

          <div className="md:col-span-1">
            <ResumoLateral
              estante={perfilMapeado.estanteResumo}
              totalGrupos={perfilMapeado.grupos}
              totalGuias={perfilMapeado.guias}
              userIdParaLink={idDaUrl}
            />
          </div>
        </div>
      )}

      {abaModalAberta && (
        <ModalConexoes
          tipoInicial={abaModalAberta}
          perfilId={idParaBuscar as string}
          onClose={() => setAbaModalAberta(null)}
        />
      )}

    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto w-full pt-4"><SkeletonCabecalho /></div>}>
      <ConteudoDoPerfil />
    </Suspense>
  );
}