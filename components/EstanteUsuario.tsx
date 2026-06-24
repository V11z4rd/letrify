"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { authService } from "@/app/lib/authService";
import CardLivro, { LivroDados } from "@/components/CardLivro";

// Importações do Heroicons
import { 
  BookOpenIcon, 
  CheckCircleIcon, 
  BookmarkIcon, 
  Squares2X2Icon,
  ExclamationTriangleIcon,
  InboxIcon
} from "@heroicons/react/24/outline";

interface RespostaEstante {
  lendo: LivroDados[];
  lido: LivroDados[];
  queroLer: LivroDados[];
}

interface EstanteUsuarioProps {
  userId?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

export default function EstanteUsuario({ userId }: EstanteUsuarioProps) {
  const searchParams = useSearchParams();
  const [estante, setEstante] = useState<RespostaEstante>({ lendo: [], lido: [], queroLer: [] });
  const [filtroAtivo, setFiltroAtivo] = useState<"Todos" | "Lendo" | "Lido" | "Quero Ler">("Todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const isDonoDaEstante = !userId || userId === authService.getUserId();

  useEffect(() => {
    const filtroDaUrl = searchParams.get("filtro");
    if (filtroDaUrl === "Lendo") setFiltroAtivo("Lendo");
    else if (filtroDaUrl === "Lido") setFiltroAtivo("Lido");
    else if (filtroDaUrl === "Quero Ler") setFiltroAtivo("Quero Ler");
    else setFiltroAtivo("Todos");
  }, [searchParams]);

  // 1. ISOLAMOS A FUNÇÃO DE BUSCA E ENVOLVEMOS EM USECALLBACK PARA EVITAR LOOPS
  const buscarEstante = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const token = authService.getToken();
      const idFinal = userId || authService.getUserId();

      if (!idFinal) {
        console.error("Nenhum ID de usuário encontrado para buscar a estante.");
        return;
      }

      if (!token && !userId) {
        throw new Error("Você precisa estar logado para ver sua estante.");
      }

      const resposta = await fetch(`${BASE_URL}/usuario/${idFinal}/livros`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      if (!resposta.ok) {
        if (resposta.status === 403) throw new Error("Esta estante é privada.");
        throw new Error("Erro ao carregar estante");
      }

      const dados = await resposta.json();
      setEstante({
        lendo: dados.lendo || [],
        lido: dados.lido || [],
        queroLer: dados.queroLer || []
      });

    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }, [userId, BASE_URL]);

  // 2. O EFFECT APENAS CHAMA A FUNÇÃO QUANDO O USERID MUDA OU QUANDO MONTAR
  useEffect(() => {
    buscarEstante();
  }, [buscarEstante]);

  let livrosParaMostrar: LivroDados[] = [];
  if (filtroAtivo === "Todos") {
    const todosLivros = [...estante.lendo, ...estante.lido, ...estante.queroLer];
    livrosParaMostrar = todosLivros.filter((livro, index, self) =>
      index === self.findIndex((l) => l.id === livro.id)
    );
  } else if (filtroAtivo === "Lendo") {
    livrosParaMostrar = estante.lendo;
  } else if (filtroAtivo === "Lido") {
    livrosParaMostrar = estante.lido;
  } else if (filtroAtivo === "Quero Ler") {
    livrosParaMostrar = estante.queroLer;
  }

  const abas = [
    { id: "Todos", label: "Todos", icone: Squares2X2Icon },
    { id: "Lendo", label: "Lendo", icone: BookOpenIcon },
    { id: "Lido", label: "Lido", icone: CheckCircleIcon },
    { id: "Quero Ler", label: "Quero Ler", icone: BookmarkIcon },
  ];

  // Mantemos essa função caso o CardLivro ainda use a assinatura antiga por id
  const handleRemoverLivroDaTela = (livroId: number) => {
    buscarEstante(); // Ao invés de manipular o array, recarrega direto da API para garantir consistência
  };

  return (
    <div className="w-full animate-fade-in">
      
      {/* MENU DE FILTROS */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-8 border-b pb-4" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        {abas.map((aba) => {
          const isAtivo = filtroAtivo === aba.id;
          const IconeAba = aba.icone;

          return (
            <button
              key={aba.id}
              onClick={() => setFiltroAtivo(aba.id as any)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all ${
                isAtivo ? 'shadow-md scale-105' : 'opacity-60 hover:opacity-100 border border-transparent'
              }`}
              style={{
                backgroundColor: isAtivo ? 'var(--cor-botao-primario)' : 'transparent',
                color: isAtivo ? 'var(--cor-botao-texto)' : 'var(--cor-texto-principal)',
                borderColor: isAtivo ? 'transparent' : 'var(--cor-fundo-sidebar)'
              }}
            >
              <IconeAba className="w-4 h-4 stroke-[2.5]" />
              {aba.label}
            </button>
          );
        })}
      </div>

      {/* FEEDBACKS VISUAIS */}
      {carregando && (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-60 font-bold animate-pulse" style={{ color: 'var(--cor-primaria)' }}>
          <BookOpenIcon className="w-12 h-12 mb-4 animate-bounce" />
          <span>Tirando a poeira das prateleiras...</span>
        </div>
      )}

      {erro && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500 text-red-500 flex items-center justify-center gap-3 font-bold max-w-xl mx-auto">
          <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {!carregando && !erro && livrosParaMostrar.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 opacity-70 border-2 border-dashed rounded-2xl px-4" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
          <InboxIcon className="w-14 h-14 mb-4 opacity-50" style={{ color: 'var(--cor-texto-principal)' }} />
          <p className="font-bold text-xl mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Nenhum livro por aqui.</p>
          <p className="text-sm" style={{ color: 'var(--cor-texto-secundario)' }}>
            {filtroAtivo === "Todos" 
              ? isDonoDaEstante 
                ? "Você ainda não salvou nenhum livro. Vá explorar o catálogo!" 
                : "Este usuário ainda não adicionou livros."
              : isDonoDaEstante 
                ? `Você não tem livros marcados como "${filtroAtivo}".`
                : `Este usuário não tem livros marcados como "${filtroAtivo}".`}
          </p>
        </div>
      )}

      {/* A GRADE DE LIVROS */}
      {!carregando && !erro && livrosParaMostrar.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {livrosParaMostrar.map((livro) => (
             <div key={livro.id} className="h-full">
               <CardLivro 
                 livro={livro} 
                 variante="estante" 
                 onRemove={handleRemoverLivroDaTela} 
                 // 3. SE O SEU CARDLIVRO SUPORTAR, ADICIONE UM DISPARADOR DE UPDATE:
                 onUpdate={buscarEstante} 
               />
             </div>
          ))}
        </div>
      )}

    </div>
  );
}