"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { grupoService, GrupoDetalhe } from "@/app/lib/grupoService";
import { authService } from "@/app/lib/authService";
import FeedInterno from "@/components/grupos/FeedInterno";
import ChatGrupo from "@/components/grupos/ChatGrupo";
import PainelAdminGrupo from "@/components/grupos/PainelAdminGrupo";
import EditorGrupo from "@/components/grupos/EditorGrupo";
import { PencilSquareIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

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
        
        // Validação estrita alinhada com a API: Líder não pode sair por esta rota
        if (membroAtual?.role === "Lider") {
            alert("Como Líder do clube, você não pode sair dele. Se deseja encerrar as atividades, use a opção de exclusão total no painel.");
            return;
        }

        if (!confirm("Tem a certeza que deseja sair deste clube?")) return;
        
        setProcessandoAcao(true);
        try {
            await grupoService.sair(String(grupo.id));
            alert("Você saiu do clube.");
            router.push("/grupos");
        } catch (err: any) {
            alert(err.message);
            setProcessandoAcao(false);
        }
    };

    const handleSalvarDadosGrupo = async (novosDados: any) => {
        try {
            const token = authService.getToken();
            let corpoRequisicao: any;
            let cabeçalhos: Record<string, string> = { "Authorization": `Bearer ${token}` };

            // Se for um FormData (enviado pelo EditorGrupo adaptado com arquivo File local)
            if (novosDados instanceof FormData) {
                corpoRequisicao = novosDados;
                // Deixa o browser definir o Content-Type correto com o boundary do multipart
            } else {
                // Caso contrário, normaliza em JSON limpo atendendo à API corporativa
                cabeçalhos["Content-Type"] = "application/json";
                corpoRequisicao = JSON.stringify({
                    nome: novosDados.nome,
                    descricao: novosDados.descricao,
                    fotoCapa: novosDados.fotoCapa
                });
            }

            // PUT /api/grupos/{id}
            const resposta = await fetch(`${BASE_URL}/grupos/${grupo?.id}`, {
                method: "PUT",
                headers: cabeçalhos,
                body: corpoRequisicao
            });

            if (!resposta.ok) throw new Error("Erro na resposta do servidor ao atualizar parâmetros.");

            alert("Clube atualizado com sucesso! 🎉");
            setIsEditando(false);
            carregarDetalhesGrupo();
        } catch (err: any) {
            console.error("Falha ao salvar dados cadastrais do grupo:", err);
            alert(err.message || "Erro ao atualizar as informações do grupo.");
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

    // Mapeamento preciso de papéis baseado no retorno de membros da API
    const membroAtual = grupo.membros?.find((m) => m.id === meuId);
    const isMembro = !!membroAtual;
    const isAdminOuLider = membroAtual?.role === "Lider" || membroAtual?.role === "Admin";

    return (
        <div className="max-w-7xl mx-auto w-full pt-4 pb-24 px-4 animate-fade-in">

            {/* BANNER E HEADER DO CLUBE */}
            {!isEditando && (
                <div 
                    className="w-full rounded-3xl border overflow-hidden relative shadow-sm transition-all mb-8"
                    style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
                >
                    <div 
                        className="h-56 w-full bg-cover bg-center relative"
                        style={{ 
                            backgroundImage: grupo.fotoCapa ? `url("${grupo.fotoCapa}")` : 'none',
                            backgroundColor: 'var(--cor-fundo-sidebar)'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/[0.55] via-black/[0.15] to-transparent"></div>
                    </div>

                    <div className="px-6 sm:px-8 pb-6 pt-5 relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border" style={{ backgroundColor: 'var(--cor-fundo-app)', color: 'var(--cor-destaque)', borderColor: 'var(--cor-fundo-sidebar)' }}>
                                    {grupo.status}
                                </span>
                                <span className="text-[11px] font-bold opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
                                    👥 {grupo.membros?.length || 0} membros
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--cor-texto-principal)' }}>
                                {grupo.nome}
                            </h1>
                            <p className="text-xs sm:text-sm max-w-2xl leading-relaxed font-medium opacity-80" style={{ color: 'var(--cor-texto-secundario)' }}>
                                {grupo.descricao || <span className="italic opacity-40">Sem diretrizes informadas para este clube.</span>}
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                            {isAdminOuLider && (
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
                                // Não renderiza botão de "Sair" se o usuário logado for o próprio Líder (evita quebra de regra de negócio)
                                membroAtual?.role !== "Lider" && (
                                    <button 
                                        onClick={handleSairDoGrupo} 
                                        disabled={processandoAcao} 
                                        className="px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-40"
                                        style={{ 
                                            backgroundColor: 'transparent', 
                                            color: 'var(--cor-texto-secundario)',
                                            borderColor: 'var(--cor-fundo-sidebar)'
                                        }}
                                    >
                                        Sair do Clube
                                    </button>
                                )
                            ) : (
                                <button 
                                    onClick={handleEntrarNoGrupo} 
                                    disabled={processandoAcao} 
                                    className="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
                                    style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
                                >
                                    {processandoAcao ? "A processar..." : grupo.status === "Aberto" ? "Participar" : "Solicitar Vaga"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* SEÇÃO CONTEÚDO RESTREITO / VISUALIZADOR DE ABAS */}
            {!isMembro ? (
                <div 
                    className="mt-4 flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed text-center"
                    style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
                >
                    <span className="text-4xl mb-3 select-none">🔒</span>
                    <h3 className="font-black text-lg mb-1" style={{ color: 'var(--cor-texto-principal)' }}>Conteúdo Restrito</h3>
                    <p className="text-xs font-medium opacity-60 max-w-md" style={{ color: 'var(--cor-texto-secundario)' }}>
                        {grupo.status === "Aberto" ? "Faça parte deste clube para liberar o feed de discussões e o chat dos leitores." : "Este clube é privado. Envie uma solicitação para poder acessar o feed."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {!isEditando ? (
                        <>
                            {/* NAVEGAÇÃO ENTRE ABAS */}
                            <div className="flex gap-6 border-b" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
                                {[
                                    { id: "feed", label: "📌 Feed", visivel: true },
                                    { id: "chat", label: "💬 Chat", visivel: true },
                                    // Alinhado com a API: Só o Líder/Admin pode ver ou interagir com o painel de moderação
                                    { id: "membros", label: "🛡️ Moderação", visivel: isAdminOuLider }
                                ].filter(aba => aba.visivel).map((aba) => (
                                    <button
                                        key={aba.id}
                                        onClick={() => setAbaAtiva(aba.id)}
                                        className="pb-3 text-xs uppercase tracking-widest font-black transition-all border-b-2 -mb-[1px]"
                                        style={{ 
                                            borderColor: abaAtiva === aba.id ? 'var(--cor-destaque)' : 'transparent',
                                            color: abaAtiva === aba.id ? 'var(--cor-texto-principal)' : 'var(--cor-texto-secundario)',
                                            opacity: abaAtiva === aba.id ? 1 : 0.5
                                        }}
                                    >
                                        {aba.label}
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[400px] mt-4">
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
                                    fotoCapa: grupo.fotoCapa || ""
                                }}
                                onClose={() => setIsEditando(false)}
                                onSave={handleSalvarDadosGrupo}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}