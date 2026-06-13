"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { grupoService, GrupoDetalhe } from "@/app/lib/grupoService";
import { authService } from "@/app/lib/authService";
import FeedInterno from "@/components/grupos/FeedInterno";
import ChatGrupo from "@/components/grupos/ChatGrupo";
import PainelAdminGrupo from "@/components/grupos/PainelAdminGrupo";
import EditorGrupo from "@/components/grupos/EditorGrupo";
import BotaoPostTop from "@/components/ui/BotaoPostTop";
import BotaoFlutuanteCriarPost from "@/components/ui/BotaoFlutuanteCriarPost";
import { 
  PencilSquareIcon, 
  ArrowPathIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  PlusIcon,
  ArrowLeftIcon // 👈 Importado o ícone de voltar
} from "@heroicons/react/24/outline";

export default function SalaGrupoPage() {
    const { id } = useParams();
    const router = useRouter();

    const [grupo, setGrupo] = useState<GrupoDetalhe | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [meuId, setMeuId] = useState<number | null>(null);
    const [processandoAcao, setProcessandoAcao] = useState(false);

    const [isEditando, setIsEditando] = useState(false);
    const [abaAtiva, setAbaAtiva] = useState<"feed" | "chat" | "membros" | string>("feed");

    // 💡 Monitora novos posts específicos deste clube vindos do SignalR
    const [novosPostsDisponiveis, setNovosPostsDisponiveis] = useState(false);

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

    const carregarDetalhesGrupo = async () => {
        if (!id) return;
        setCarregando(true);
        setErro(null);
        try {
            const dados = await grupoService.buscarPorId(id as string);
            setGrupo(dados);
        } catch (err: any) {
            setErro(err.message || "Não foi possível carregar as informações do clube.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        const idNoCofre = authService.getUserId();
        if (idNoCofre) setMeuId(Number(idNoCofre));
        carregarDetalhesGrupo();
    }, [id]);

    const handleEntrarNoGrupo = async () => {
        if (!grupo || processandoAcao) return;
        setProcessandoAcao(true);
        try {
            await grupoService.entrar(grupo.id);
            alert(grupo.status === "Aberto" ? "Bem-vindo ao clube! 🎉" : "Solicitação enviada com sucesso! O Líder foi notificado. ⏳");
            carregarDetalhesGrupo();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessandoAcao(false);
        }
    };

    const handleSairDoGrupo = async () => {
        if (!grupo || processandoAcao) return;
        
        const membroNoMomento = grupo.membros?.find((m) => m.id === meuId);

        if (membroNoMomento?.role === "Lider") {
            alert("Como Líder do clube, você não pode sair dele. Se deseja encerrar as atividades, use a opção de exclusão total no painel.");
            return;
        }

        if (!confirm("Tem a certeza que deseja sair deste clube?")) return;
        
        setProcessandoAcao(true);
        try {
            const resposta = await grupoService.sair(grupo.id);
            if (resposta.ok) {
                alert("Você saiu do clube com sucesso.");
                router.push("/grupos");
            } else {
                throw new Error("O servidor rejeitou o pedido para sair do grupo.");
            }
        } catch (err: any) {
            console.error("Erro na rota de desassociação:", err);
            alert(err.message || "Erro ao tentar sair do grupo.");
        } finally {
            setProcessandoAcao(false);
        }
    };

    const handleSalvarDadosGrupo = async (novosDados: any) => {
        try {
            const token = authService.getToken();
            const formData = new FormData();
            
            formData.append("nome", novosDados.nome ? novosDados.nome.trim() : "");
            
            if (novosDados.descricao) {
                formData.append("descricao", novosDados.descricao.trim());
            }

            if (novosDados.status) {
                formData.append("status", novosDados.status); 
            }
            
            if (novosDados.fotoCapa instanceof File) {
                formData.append("foto", novosDados.fotoCapa); 
            }

            console.log("Enviando Status:", novosDados.status);

            const resposta = await fetch(`${BASE_URL}/grupos/${grupo?.id}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (resposta.ok) {
                alert("Clube atualizado com sucesso! 🎉");
                setIsEditando(false);
                carregarDetalhesGrupo();
            } else {
                const erroApi = await resposta.json().catch(() => ({}));
                throw new Error(erroApi.erro || `Erro ${resposta.status}: Servidor rejeitou a atualização.`);
            }
        } catch (err: any) {
            console.error("Falha ao salvar dados cadastrais do grupo:", err);
            alert(err.message || "Erro ao atualizar o grupo.");
        }
    };

    // Callback para disparar a atualização de lista do FeedInterno por eventos do Window
    const recarregarFeedDoClube = () => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("atualizar_feed_interno"));
        }
    };

    if (carregando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]" style={{ color: 'var(--cor-texto-secundario)' }}>
                <ArrowPathIcon className="w-8 h-8 animate-spin mb-3" style={{ color: 'var(--cor-primaria)' }} />
                <p className="font-black text-xs tracking-widest uppercase">A abrir a sala do clube...</p>
            </div>
        );
    }

    if (erro || !grupo) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center font-bold text-xs">
                {erro || "Clube do livro não encontrado."}
            </div>
        );
    }

    const membroAtual = grupo.membros?.find((m) => m.id === meuId);
    const isMembro = !!membroAtual;
    const isAdminOuLider = membroAtual?.role === "Lider" || membroAtual?.role === "Admin";
    const isLider = membroAtual?.role === "Lider";

    return (
        <div className="max-w-7xl mx-auto w-full pb-24 px-4 sm:px-6 animate-fade-in relative">

            {/* 👇 NOVA BARRA SUPERIOR FIXA (STICKY) COM BOTÃO DE VOLTAR 👇 */}
            {!isEditando && (
                <div 
                    className="sticky top-0 z-40 bg-[var(--cor-fundo-app)]/95 backdrop-blur-xl border-b py-3 sm:py-4 mb-6 flex items-center gap-4 transition-all"
                    style={{ borderColor: 'var(--cor-fundo-sidebar)', margin: '0 -16px', paddingLeft: '16px', paddingRight: '16px' }}
                >
                    <button 
                        onClick={() => router.back()}
                        className="p-2 sm:p-2.5 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 shrink-0"
                        style={{ borderColor: 'var(--cor-fundo-sidebar)', color: 'var(--cor-texto-principal)' }}
                        aria-label="Voltar"
                    >
                        <ArrowLeftIcon className="w-5 h-5 stroke-[2.5]" />
                    </button>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-base sm:text-lg font-black tracking-tight truncate" style={{ color: 'var(--cor-texto-principal)' }}>
                            {grupo.nome}
                        </h1>
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1" style={{ color: 'var(--cor-texto-secundario)' }}>
                            <UserGroupIcon className="w-3 h-3" />
                            {grupo.membros?.length || 0} membros
                        </span>
                    </div>
                </div>
            )}

            {/* BANNER E HEADER DO CLUBE */}
            {!isEditando && (
                <div 
                    className="w-full rounded-3xl border overflow-hidden relative shadow-sm transition-all mb-8"
                    style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
                >
                    <div 
                        className="h-48 sm:h-56 w-full bg-cover bg-center relative"
                        style={{ 
                            backgroundImage: grupo.fotoCapa ? `url("${grupo.fotoCapa}")` : 'none',
                            backgroundColor: 'var(--cor-fundo-sidebar)'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.55] via-black/[0.15] to-transparent"></div>
                    </div>

                    <div className="px-6 sm:px-8 pb-6 pt-5 relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-1.5 w-full">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border" style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-destaque)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                                    {grupo.status}
                                </span>
                            </div>
                            {/* Nome repetido propositalmente como "Hero Title" - padrão de design estilo Twitter */}
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight truncate w-full" style={{ color: 'var(--cor-texto-principal)' }}>
                                {grupo.nome}
                            </h1>
                            <p className="text-xs sm:text-sm max-w-2xl leading-relaxed font-medium opacity-80" style={{ color: 'var(--cor-texto-secundario)' }}>
                                {grupo.descricao || <span className="italic opacity-40">Sem diretrizes informadas para este clube.</span>}
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                            {isLider && (
                                <button 
                                  onClick={() => setIsEditando(true)}
                                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                                  style={{ 
                                    backgroundColor: 'var(--cor-fundo-app)', 
                                    color: 'var(--cor-texto-principal)', 
                                    borderColor: 'var(--cor-fundo-sidebar)' 
                                  }}
                                >
                                    <PencilSquareIcon className="w-4 h-4 stroke-[2.5]" />
                                    <span>Editar Clube</span>
                                </button>
                            )}

                            {isMembro ? (
                                membroAtual?.role !== "Lider" && (
                                    <button 
                                        onClick={handleSairDoGrupo} 
                                        disabled={processandoAcao} 
                                        className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
                                        style={{ 
                                            backgroundColor: 'transparent', 
                                            color: 'var(--cor-texto-secundario)',
                                            borderColor: 'var(--cor-fundo-sidebar)'
                                        }}
                                    >
                                        {processandoAcao ? (
                                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ArrowRightOnRectangleIcon className="w-4 h-4 stroke-[2.5]" />
                                        )}
                                        <span>Sair do Clube</span>
                                    </button>
                                )
                            ) : (
                                <button 
                                    onClick={handleEntrarNoGrupo} 
                                    disabled={processandoAcao} 
                                    className="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
                                    style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
                                >
                                    {processandoAcao ? (
                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <PlusIcon className="w-4 h-4 stroke-[3]" />
                                    )}
                                    <span>{grupo.status === "Aberto" ? "Participar" : "Solicitar Vaga"}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO CONTEÚDO RESTRITO / VISUALIZADOR DE ABAS */}
            {!isMembro ? (
                <div 
                    className="mt-4 flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed text-center animate-fade-in"
                    style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
                >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border shadow-sm" style={{ backgroundColor: 'var(--cor-fundo-app)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                        <LockClosedIcon className="w-5 h-5" style={{ color: 'var(--cor-destaque)' }} />
                    </div>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Conteúdo Restrito</h3>
                    <p className="text-xs font-medium opacity-60 max-w-md leading-relaxed" style={{ color: 'var(--cor-texto-secundario)' }}>
                        {grupo.status === "Aberto" ? "Faça parte deste clube para liberar o feed de discussões e o chat dos leitores." : "Este clube é privado. Envie uma solicitação para poder acessar o feed."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {!isEditando ? (
                        <>
                            {/* 👇 AS ABAS AGORA TAMBÉM SÃO STICKY E DESCEM COM O FEED 👇 */}
                            <div 
                                className="flex gap-6 border-b sticky top-[68px] sm:top-[76px] z-30 bg-[var(--cor-fundo-app)]/95 backdrop-blur-md pt-2 transition-all" 
                                style={{ borderColor: 'var(--cor-fundo-sidebar)', margin: '0 -16px', paddingLeft: '16px', paddingRight: '16px' }}
                            >
                                {[
                                    { id: "feed", label: "Feed", icon: <DocumentTextIcon className="w-4 h-4 stroke-[2.5]" />, visivel: true },
                                    { id: "chat", label: "Chat", icon: <ChatBubbleLeftRightIcon className="w-4 h-4 stroke-[2.5]" />, visivel: true },
                                    { id: "membros", label: "Moderação", icon: <ShieldCheckIcon className="w-4 h-4 stroke-[2.5]" />, visivel: isAdminOuLider }
                                ].filter(aba => aba.visivel).map((aba) => (
                                    <button
                                        key={aba.id}
                                        onClick={() => setAbaAtiva(aba.id)}
                                        className="pb-3 text-xs uppercase tracking-widest font-black transition-all border-b-2 -mb-[1px] flex items-center gap-1.5"
                                        style={{ 
                                            borderColor: abaAtiva === aba.id ? 'var(--cor-destaque)' : 'transparent',
                                            color: abaAtiva === aba.id ? 'var(--cor-texto-principal)' : 'var(--cor-texto-secundario)',
                                            opacity: abaAtiva === aba.id ? 1 : 0.5
                                        }}
                                    >
                                        {aba.icon}
                                        <span>{aba.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[400px] mt-2">
                                {abaAtiva === "feed" && <FeedInterno grupoId={grupo.id} />}
                                {abaAtiva === "chat" && <ChatGrupo grupoId={grupo.id} />}
                                {abaAtiva === "membros" && isAdminOuLider && (
                                    <PainelAdminGrupo 
                                        grupoId={Number(grupo.id)} 
                                        onMembroMudou={carregarDetalhesGrupo}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        /* MODO EDIÇÃO ATIVO */
                        <div className="max-w-3xl mx-auto w-full transition-all duration-300">
                            <EditorGrupo 
                                dadosIniciais={{
                                    nome: grupo.nome,
                                    descricao: grupo.descricao || "",
                                    status: grupo.status || "Aberto",
                                    fotoCapa: grupo.fotoCapa || ""
                                }}
                                onClose={() => setIsEditando(false)}
                                onSave={handleSalvarDadosGrupo}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* 🚀 HUB DE ELEMENTOS FLUTUANTES COORDENADOS (Apenas visível se for membro e estiver na aba de feed) */}
            {isMembro && abaAtiva === "feed" && !isEditando && (
                <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50 pointer-events-none">
                    
                    {/* 1. Botão de subir (Renderiza acima por causa da ordem do flex-col) */}
                    <div className="pointer-events-auto">
                        <BotaoPostTop
                            temNovosPosts={novosPostsDisponiveis} 
                            onLimparAlerta={() => setNovosPostsDisponiveis(false)} 
                        />
                    </div>

                    {/* 2. Botão Flutuante de Criar Post Interno no Clube */}
                    <div className="pointer-events-auto">
                        <BotaoFlutuanteCriarPost onPostCreated={recarregarFeedDoClube} grupoId={grupo.id} />
                    </div>

                </div>
            )}
        </div>
    );
}