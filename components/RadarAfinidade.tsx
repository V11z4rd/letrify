"use client";

import { useState } from "react";
import { authService } from "@/app/lib/authService";

export default function RadarAfinidade() {
  const [matches, setMatches] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const acionarRadar = async () => {
    setCarregando(true);
    setErro("");
    setBuscaRealizada(true);

    try {
      // 1. Puxa a chave do cofre
      const token = authService.getToken();
      if (!token) {
        throw new Error("Você precisa estar logado para encontrar conexões.");
      }

      // 2. Dispara o POST para a IA do Back-end
      const resposta = await fetch("https://letrify.fly.dev/api/match", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
        // Nota: Assumindo que não precisa de 'body' porque o token já diz quem é o usuário.
        // Se a API exigir algum JSON no body, me avise!
      });

      if (!resposta.ok) {
        throw new Error("Ocorreu um erro ao mapear a sua afinidade literária.");
      }

      const dados = await resposta.json();
      setMatches(dados);

    } catch (err: any) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto py-10 px-4 animate-fade-in">
      
      {/* O PAINEL DE CONTROLE DO RADAR */}
      <div 
        className="w-full text-center p-10 rounded-2xl border shadow-lg mb-10 transition-all"
        style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
      >
        <span className="text-6xl mb-4 block">✨📚✨</span>
        <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--cor-texto-principal)' }}>
          Conexões Literárias
        </h2>
        <p className="max-w-xl mx-auto mb-8 text-sm" style={{ color: 'var(--cor-texto-secundario)' }}>
          Nossa inteligência artificial analisa a sua estante e cruza os dados com milhares de leitores para encontrar as 5 pessoas com o gosto mais parecido com o seu.
        </p>

        <button
          onClick={acionarRadar}
          disabled={carregando}
          className="px-8 py-4 rounded-full font-extrabold text-lg shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 mx-auto"
          style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
        >
          {carregando ? (
            <span className="animate-pulse">Calculando Afinidades (Qdrant)... ⚙️</span>
          ) : (
            "Encontrar Minha Alma Gêmea Literária 🔎"
          )}
        </button>
      </div>

      {/* ÁREA DE RESULTADOS */}
      <div className="w-full">
        {erro && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500 text-red-500 text-center font-bold">
            {erro}
          </div>
        )}

        {!carregando && !erro && buscaRealizada && matches.length === 0 && (
          <div className="text-center p-8 opacity-70">
            <span className="text-4xl block mb-2">🏜️</span>
            <p className="font-bold" style={{ color: 'var(--cor-texto-principal)' }}>Nenhum match encontrado ainda.</p>
            <p className="text-sm" style={{ color: 'var(--cor-texto-secundario)' }}>Adicione mais livros à sua estante para a nossa IA ter mais dados!</p>
          </div>
        )}

        {!carregando && matches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {matches.map((usuario, index) => (
              <div 
                key={usuario.id || index}
                className="flex flex-col items-center text-center p-6 rounded-2xl border transition-transform hover:-translate-y-2 hover:shadow-xl relative overflow-hidden"
                style={{ backgroundColor: 'var(--cor-fundo-card)', borderColor: 'var(--cor-fundo-sidebar)' }}
              >
                {/* O selo de Top Match no primeiro resultado */}
                {index === 0 && (
                  <div className="absolute top-0 w-full py-1 text-xs font-black uppercase tracking-widest shadow-sm" style={{ backgroundColor: 'var(--cor-primaria)', color: 'var(--cor-fundo-app)' }}>
                    🔥 Maior Afinidade
                  </div>
                )}

                {/* Foto do Usuário (Se não tiver, usa as iniciais ou um emoji) */}
                <div 
                  className={`w-24 h-24 rounded-full mb-4 shadow-md bg-cover bg-center ${index === 0 ? 'mt-6' : ''}`}
                  style={{ 
                    backgroundImage: `url(${usuario.fotoPerfil || 'https://i.pravatar.cc/150?u=' + usuario.id})`,
                    backgroundColor: 'var(--cor-fundo-sidebar)' 
                  }}
                />
                
                <h3 className="font-bold text-xl line-clamp-1" style={{ color: 'var(--cor-texto-principal)' }}>
                  {usuario.nome || "Leitor Anônimo"}
                </h3>
                
                <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--cor-texto-secundario)' }}>
                  {usuario.descricao || "Sem bio por enquanto."}
                </p>

                <button 
                  className="mt-6 w-full py-2 rounded-lg font-bold text-sm transition-opacity hover:opacity-80 border"
                  style={{ color: 'var(--cor-primaria)', borderColor: 'var(--cor-primaria)' }}
                >
                  Ver Perfil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}