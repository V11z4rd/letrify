import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

const API_BASE_URL = `${BASE_URL}/grupos`;

// ----------------------------------------------------------------------
// 1. INTERFACES (Tipagem de Dados)
// ----------------------------------------------------------------------

export interface GrupoResumo {
  id: number;
  nome: string;
  descricao: string;
  fotoCapa: string | null;
  status: "Aberto" | "Fechado" | string;
  membrosCount?: number; 
  // Mapeamentos necessários para validação de regras de negócio da API no Front-end:
  usuarioCriadorId?: number | string; 
  jaESocio?: boolean;
}

export interface MembroGrupo {
  id: number;
  nome: string;
  fotoPerfil: string | null;
  role: "Lider" | "Admin" | "Membro";
}

export interface GrupoDetalhe extends GrupoResumo {
  membros: MembroGrupo[];
}

// ----------------------------------------------------------------------
// 2. FUNÇÕES AUXILIARES
// ----------------------------------------------------------------------

// Ajuda a montar os cabeçalhos dinamicamente (com ou sem token, JSON ou FormData)
const montarHeaders = (requerToken = false, isFormData = false): HeadersInit => {
  const headers: Record<string, string> = {};
  
  // O fetch cria o boundary do multipart/form-data automaticamente se não forçarmos o Content-Type
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (requerToken) {
    const token = authService.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// ----------------------------------------------------------------------
// 3. O SERVIÇO PRINCIPAL
// ----------------------------------------------------------------------

export const grupoService = {
  /**
   * Traz a lista de grupos para a "Vitrine" (Passa token opcional se disponível para mapear o 'jaESocio')
   */
  listarTodos: async (): Promise<GrupoResumo[]> => {
    // Passamos true no token para que o back-end saiba quem está listando e injete as flags relacionais (como jaESocio)
    const resposta = await fetch(API_BASE_URL, { 
      headers: montarHeaders(true) 
    });
    if (!resposta.ok) throw new Error("Falha ao carregar os grupos.");
    return resposta.json();
  },

  /**
   * Traz os detalhes de um grupo e a lista de membros
   */
  buscarPorId: async (id: string | number): Promise<GrupoDetalhe> => {
    const resposta = await fetch(`${API_BASE_URL}/${id}`, { 
      headers: montarHeaders(true) 
    });
    if (!resposta.ok) throw new Error("Falha ao carregar os detalhes do grupo.");
    return resposta.json();
  },

  /**
   * Cria um grupo novo. Usa FormData porque envia foto de capa. (Requer token)
   */
  criar: async (formData: FormData): Promise<GrupoDetalhe> => {
    const resposta = await fetch(API_BASE_URL, {
      method: "POST",
      headers: montarHeaders(true, true), // Token = sim, FormData = sim
      body: formData,
    });
    if (!resposta.ok) throw new Error("Erro ao criar o clube de leitura.");
    return resposta.json();
  },

  /**
   * Entra no grupo (Aberto) ou envia solicitação (Fechado). (Requer token)
   */
  entrar: async (id: string | number) => {
    const resposta = await fetch(`${API_BASE_URL}/${id}/entrar`, {
      method: "POST",
      headers: montarHeaders(true),
    });
    if (!resposta.ok) {
      const erro = await resposta.text();
      throw new Error(erro || "Não foi possível entrar no grupo.");
    }
    return resposta; 
  },

  /**
   * Sai do grupo. (Requer token)
   */
  sair: async (id: string | number) => {
    const resposta = await fetch(`${API_BASE_URL}/${id}/sair`, {
      method: "POST",
      headers: montarHeaders(true),
    });
    if (!resposta.ok) throw new Error("Erro ao tentar sair do grupo.");
    return resposta;
  }
};