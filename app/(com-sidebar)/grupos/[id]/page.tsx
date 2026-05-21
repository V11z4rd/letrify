"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { grupoService, GrupoDetalhe } from "@/app/lib/grupoService";
import { authService } from "@/app/lib/authService";
import FeedInterno from "@/components/grupos/FeedInterno";
import ChatGrupo from "@/components/grupos/ChatGrupo";
import PainelAdminGrupo from "@/components/grupos/PainelAdminGrupo";

export default function SalaGrupoPage() {
    const { id } = useParams();
    const router = useRouter();

    // Estados de dados e controlo
    const [grupo, setGrupo] = useState<GrupoDetalhe | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [meuId, setMeuId] = useState<number | null>(null);
    const [processandoAcao, setProcessandoAcao] = useState(false);

    // Controlo das abas internas (para membros)
    const [abaAtiva, setAbaAtiva] = useState<"feed" | "chat" | "membros" | "admin">("feed");

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
        // Captura o ID do utilizador logado para validar permissões
        const idNoCofre = authService.getUserId();
        if (idNoCofre) {
            setMeuId(Number(idNoCofre));
        }
        carregarDetalhesGrupo();
    }, [id]);

    // Lógica para entrar no grupo
    const handleEntrarNoGrupo = async () => {
        if (!grupo || processandoAcao) return;
        setProcessandoAcao(true);
        try {
            await grupoService.entrar(grupo.id);
            alert(grupo.status === "Aberto" ? "Bem-vindo ao clube! 🎉" : "Solicitação enviada com sucesso! ⏳");
            carregarDetalhesGrupo(); // Recarrega os dados para atualizar a lista de membros
        } catch (err: any) {
            alert(err.message);
        } finally {
            setProcessandoAcao(false);
        }
    };

    // Lógica para sair do grupo
    const handleSairDoGrupo = async () => {
        if (!grupo || !confirm("Tem a certeza que deseja sair deste clube?") || processandoAcao) return;
        setProcessandoAcao(true);
        try {
            await grupoService.sair(grupo.id);
            alert("Saiu do clube.");
            router.push("/grupos"); // Redireciona de volta para a vitrine
        } catch (err: any) {
            alert(err.message);
            setProcessandoAcao(false);
        }
    };

    if (carregando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-50">
                <span className="text-4xl animate-pulse mb-4">📖</span>
                <p className="font-bold text-sm tracking-widest uppercase">A abrir a sala do clube...</p>
            </div>
        );
    }

    if (erro || !grupo) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center font-bold">
                {erro || "Clube do livro não encontrado."}
            </div>
        );
    }

    // Descobre o papel do utilizador atual dentro do grupo (se existir)
    const membroAtual = grupo.membros?.find((m) => m.id === meuId);
    const isMembro = !!membroAtual;
    const isAdminOuLider = membroAtual?.role === "Lider" || membroAtual?.role === "Admin";

    return (
        <div className="max-w-7xl mx-auto w-full pt-4 pb-24 px-4 animate-fade-in">

            {/* BANNER DO GRUPO */}
            <div className="h-64 w-full rounded-2xl bg-zinc-800 border border-white/5 overflow-hidden relative shadow-xl">
                {grupo.fotoCapa ? (
                    <img src={grupo.fotoCapa} alt={grupo.nome} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-zinc-900"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>

                {/* INFORMAÇÕES DO TOPO */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${grupo.status === "Aberto" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                }`}>
                                {grupo.status}
                            </span>
                            <span className="text-xs text-zinc-400 font-bold">👥 {grupo.membros?.length || 0} membros</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">{grupo.nome}</h1>
                        <p className="text-zinc-300 text-sm max-w-2xl mt-2 leading-relaxed">{grupo.descricao || "Sem descrição disponível para este clube."}</p>
                    </div>

                    {/* BOTÃO DE AÇÃO PRINCIPAL */}
                    {isMembro ? (
                        <button
                            onClick={handleSairDoGrupo}
                            disabled={processandoAcao}
                            className="px-5 py-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-zinc-400 border border-white/5 text-xs font-bold rounded-xl transition-all"
                        >
                            Sair do Clube
                        </button>
                    ) : (
                        <button
                            onClick={handleEntrarNoGrupo}
                            disabled={processandoAcao}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {processandoAcao ? "A processar..." : grupo.status === "Aberto" ? "Participar no Clube" : "Solicitar Participação"}
                        </button>
                    )}
                </div>
            </div>

            {/* TELA DE BLOQUEIO PARA NÃO MEMBROS */}
            {!isMembro ? (
                <div className="mt-8 flex flex-col items-center justify-center p-16 rounded-2xl border-2 border-dashed border-white/5 bg-zinc-900/30 text-center">
                    <span className="text-5xl mb-4">🔒</span>
                    <h3 className="font-black text-xl text-zinc-200 mb-2">Conteúdo Restrito</h3>
                    <p className="text-sm text-zinc-400 max-w-md">
                        {grupo.status === "Aberto"
                            ? "Este clube é público, mas precisa de se juntar aos membros para participar nas discussões e aceder ao chat interativo."
                            : "Este clube é privado. Envie uma solicitação de participação e aguarde a aprovação dos administradores para entrar."}
                    </p>
                </div>
            ) : (
                /* CONTEÚDO EXCLUSIVO PARA MEMBROS */
                <div className="mt-8 grid grid-cols-1 gap-6">

                    {/* MENU DE ABAS DO CLUBE */}
                    <div className="flex gap-6 border-b border-white/5">
                        {["feed", "chat", "membros", ...(isAdminOuLider ? ["admin"] : [])].map((aba) => (
                            <button
                                key={aba}
                                onClick={() => setAbaAtiva(aba as any)}
                                className={`pb-3 text-xs uppercase tracking-widest font-black transition-all border-b-2 ${abaAtiva === aba ? "border-blue-500 text-blue-500" : "border-transparent opacity-40 hover:opacity-100"
                                    }`}
                            >
                                {aba === "feed" ? "📌 Feed do Livro" : aba === "chat" ? "💬 Chat ao Vivo" : aba === "membros" ? "👥 Membros" : "⚙️ Gestão"}
                            </button>
                        ))}
                    </div>

                    {/* PALCO DAS ABAS INTERNAS */}
                    <div className="min-h-[400px]">
                        {abaAtiva === "feed" && (
                            <FeedInterno grupoId={grupo.id} />
                        )}

                        {abaAtiva === "chat" && (
                            <ChatGrupo grupoId={grupo.id} />
                        )}

                        {abaAtiva === "membros" && (
                            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400 mb-4">Leitores no Clube</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {grupo.membros?.map((membro) => (
                                        <div key={membro.id} className="flex items-center gap-3 bg-zinc-900/80 p-3 rounded-xl border border-white/5">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-xs">
                                                {membro.fotoPerfil ? <img src={membro.fotoPerfil} alt={membro.nome} className="w-full h-full object-cover" /> : membro.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-200 line-clamp-1">{membro.nome}</p>
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${membro.role === "Lider" ? "text-red-400" : membro.role === "Admin" ? "text-orange-400" : "text-zinc-500"
                                                    }`}>{membro.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {abaAtiva === "admin" && isAdminOuLider && (
                            <PainelAdminGrupo grupoId={grupo.id} />
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}