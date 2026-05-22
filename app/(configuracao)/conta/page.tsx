"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/authService";
import { 
  ArrowLeftStartOnRectangleIcon, 
  ShieldExclamationIcon, 
  UserMinusIcon,
  LockClosedIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function ContaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  const handleExcluirConta = async () => {
    const confirmar = window.confirm("Tem certeza absoluta? Esta ação apagará permanentemente a sua estante, resenhas e foto de perfil.");
    if (!confirmar) return;

    setCarregando(true);
    setErro("");

    try {
      const token = authService.getToken();
      if (!token) throw new Error("Você não está autenticado. Faça login novamente.");

      const resposta = await fetch(`https://letrify.fly.dev/api/usuario/deletar`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível excluir a conta. Tente novamente.");
      }

      authService.logout();
      router.push("/cadastro");

    } catch (err: any) {
      setErro(err.message);
      setCarregando(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-10 max-w-4xl mx-auto pt-6 px-4 pb-20">
      
      {/* CABEÇALHO DA PÁGINA */}
      <div>
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--cor-texto-principal)' }}>Minha Conta</h1>
        <p className="text-xs sm:text-sm font-medium opacity-60" style={{ color: 'var(--cor-texto-secundario)' }}>
          Gerencie as suas credenciais de acesso e o status da sua conta no Letrify.
        </p>
      </div>

      {erro && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-fade-in">
          <ShieldExclamationIcon className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>{erro}</span>
        </div>
      )}

      {/* BLOCO 1: DADOS DE ACESSO */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
          <LockClosedIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Dados de Acesso</span>
        </h2>
        
        <div className="p-6 rounded-2xl border flex flex-col gap-4 transition-all" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
          <p className="text-xs sm:text-sm font-medium opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>
            A alteração de e-mail e senha com criptografia ponta a ponta estará disponível na próxima atualização do ecossistema.
          </p>
        </div>
      </section>

      {/* BLOCO 2: SESSÃO */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--cor-primaria)' }}>
          <ArrowLeftStartOnRectangleIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Sessão Ativa</span>
        </h2>
        
        {/* Ajustado de flex direto para flex-col sm:flex-row para não quebrar no mobile */}
        <div className="p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all" style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm" style={{ color: 'var(--cor-texto-principal)' }}>Encerrar Sessão</span>
            <span className="text-xs font-medium opacity-50" style={{ color: 'var(--cor-texto-secundario)' }}>Desconecta a sua conta atual com segurança deste navegador.</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider border transition-all duration-200 active:scale-95 hover:bg-black/5 dark:hover:bg-white/5 text-center"
            style={{ color: 'var(--cor-texto-principal)', borderColor: 'var(--cor-fundo-sidebar)' }}
          >
            Sair da Conta
          </button>
        </div>
      </section>

      {/* BLOCO 3: ZONA DE PERIGO */}
      <section className="space-y-4 mt-12 pt-8 border-t border-dashed" style={{ borderColor: 'var(--cor-fundo-sidebar)' }}>
        <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-red-500">
          <ShieldExclamationIcon className="w-4 h-4 stroke-[2.5]" />
          <span>Zona de Perigo</span>
        </h2>
        
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.02] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-red-500/30">
          <div className="flex flex-col max-w-lg">
            <span className="font-extrabold text-sm text-red-500">Excluir conta permanentemente</span>
            <span className="text-xs font-medium opacity-60 mt-1" style={{ color: 'var(--cor-texto-secundario)' }}>
              Ao prosseguir, você perderá acesso imediato a todos os seus dados armazenados, livros favoritados, estatísticas e resenhas críticas. Esta ação não poderá ser desfeita.
            </span>
          </div>
          
          {/* Botão com loader integrado para evitar cliques duplos durante o processamento */}
          <button 
            onClick={handleExcluirConta}
            disabled={carregando}
            className="w-full md:w-auto min-w-[140px] h-10 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-red-500 text-white transition-all duration-200 active:scale-95 hover:bg-red-600 disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            {carregando ? (
              <ArrowPathIcon className="w-3.5 h-3.5 animate-spin stroke-[3]" />
            ) : (
              <>
                <UserMinusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Excluir Conta</span>
              </>
            )}
          </button>
        </div>
      </section>

    </div>
  );
}