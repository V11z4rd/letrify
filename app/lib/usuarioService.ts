// usuarioService.tsx

const BANNER_PADRAO = "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop";

export function mapearPerfilDaApi(dadosApi: any) {
  console.log("🕵️ MAPEADOR - O que recebi da API:", dadosApi);

  if (!dadosApi) {
    console.log("🕵️ MAPEADOR - dadosApi veio vazio! Abortando.");
    return null;
  }

  const { perfil, estatisticas, favorito } = dadosApi;

  const extrairQuantidade = (lista: any[], nomeSituacao: string) => {
    if (!Array.isArray(lista)) return 0;
    const item = lista.find((s) => s.situacao === nomeSituacao);
    return item ? item.quantidade : 0;
  };

  const perfilMapeado = {
    // 1. Dados Básicos do Perfil
    nome: perfil?.nome || "Usuário",
    fotoPerfil: perfil?.foto || "",
    bannerUrl: BANNER_PADRAO, 
    
    // 💡 CORREÇÃO AQUI: Agora busca de forma segura tanto em "perfil" quanto na raiz (caso mude)
    cidade: perfil?.cidade || dadosApi.cidade || "", 
    descricao: perfil?.descricao || perfil?.bio || dadosApi.descricao || "",
    
    isPremium: dadosApi.isPremium === true || perfil?.premium === "1" || perfil?.isPremium === true,

    // 2. Estatísticas do Cabeçalho
    estatisticas: {
      seguidores: perfil?.seguidores || 0,
      seguindo: perfil?.seguindo || 0,
    },

    // 3. Estante
    estanteResumo: {
      lidos: extrairQuantidade(estatisticas?.situacoes, 'Lido'),
      lendo: extrairQuantidade(estatisticas?.situacoes, 'Lendo'),
      queroLer: extrairQuantidade(estatisticas?.situacoes, 'Quero Ler'),
    },

    // 4. Vitrines
    topAutores: Array.isArray(estatisticas?.topAutores) 
      ? estatisticas.topAutores.map((a: any) => ({ nome: a.autor, valor: a.quantidade }))
      : [],

    topTemas: Array.isArray(estatisticas?.topTemas)
      ? estatisticas.topTemas.map((t: any) => ({ nome: t.tema, valor: t.quantidade }))
      : [],

    // 5. Livro Favorito
    favorito: favorito ? {
      titulo: favorito.titulo,
      autor: favorito.autor
    } : null,

    totalDeLivros: estatisticas?.totalDeLivros || 0,
    grupos: dadosApi.grupos || 0,
    guias: dadosApi.guias || 0,
    isPrivado: dadosApi.isPrivado || false
  };

  console.log("🕵️ MAPEADOR - O que vou entregar para a Tela:", perfilMapeado);

  return perfilMapeado;
}