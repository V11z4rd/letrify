import { authService } from "./authService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev/api";

export interface MetaLeitura {
    id: number;
    tipo: "Paginas" | "Minutos" | "Livros";
    valorAlvo: number;
    periodicidade: "Diaria" | "Semanal" | "Mensal";
    dataCriacao: string;
    checkInHoje: boolean;
}

export interface StreakGlobal {
    streakAtual: number;
    maiorStreak: number;
    ultimoCheckIn: string | null;
    congelamentosDisponiveis: number;
}

export const metasService = {
    // 1. Criar uma nova meta (substitui a antiga automaticamente no back-end)
    criarMeta: async (tipo: string, periodicidade: string, valorAlvo: number): Promise<void> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/metasleitura`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tipo, periodicidade, valorAlvo })
        });
        if (!res.ok) {
            const erroApi = await res.json().catch(() => ({}));
            throw new Error(erroApi.erro || "Não foi possível criar a meta de leitura.");
        }
    },

    // 2. Listar metas ativas do usuário logado
    listarMetasAtivas: async (): Promise<MetaLeitura[]> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/metasleitura`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erro ao carregar suas metas ativas.");
        return res.json();
    },

    // 3. Fazer check-in de leitura (Progresso)
    fazerCheckIn: async (metaId: number, valorRegistrado: number): Promise<any> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/metasleitura/${metaId}/checkin`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ valorRegistrado })
        });
        if (!res.ok) {
            const erroApi = await res.json().catch(() => ({}));
            throw new Error(erroApi.erro || "Erro ao registrar leitura. Já fez check-in hoje?");
        }
        return res.json();
    },

    // 4. Consultar a ofensiva global (Streak)
    consultarStreak: async (): Promise<StreakGlobal> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/metasleitura/streak`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erro ao carregar seus dados de ofensiva.");
        return res.json();
    },

    // 5. Consultar histórico dos últimos 30 dias (para montar gráficos no futuro)
    consultarHistorico: async (metaId: number): Promise<any[]> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/metasleitura/${metaId}/historico`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erro ao carregar o histórico desta meta.");
        return res.json();
    },

    // 6. Desativar meta (Soft delete)
    desativarMeta: async (metaId: number): Promise<void> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/metasleitura/${metaId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erro ao desativar a meta.");
    }
};