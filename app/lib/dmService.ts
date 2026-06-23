import { authService } from "./authService";

const BASE_URL = "https://letrify.fly.dev/api";

export interface ConversaResumo {
    conversaId: number;
    outroUsuario: {
        id: number;
        nome: string;
        fotoPerfil: string;
    };
    ultimaMensagem: string;
    dataUltimaMensagem: string;
    naoLidas: number;
}

export interface MensagemDireta {
    id: number;
    remetenteId: number;
    destinatarioId: number;
    conteudo: string;
    dataEnvio: string;
    lida: boolean;
}

export const dmService = {
    // 1. Listar a tela inicial de chats
    listarConversas: async (): Promise<ConversaResumo[]> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/mensagensdiretas`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Não foi possível carregar as conversas.");
        return res.json();
    },

    // 2. Abrir um chat específico e marcar como lido automaticamente
    buscarHistorico: async (conversaId: number, pagina = 1, tamanhoPagina = 50): Promise<MensagemDireta[]> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/mensagensdiretas/${conversaId}?pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Não foi possível carregar o histórico desta conversa.");
        return res.json();
    },

    // 3. Enviar uma nova mensagem
    enviarMensagem: async (destinatarioId: number, conteudo: string): Promise<any> => {
        const token = authService.getToken();
        const res = await fetch(`${BASE_URL}/mensagensdiretas/enviar`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ destinatarioId, conteudo })
        });

        if (!res.ok) {
            // Captura o erro 400 (ex: falta de mutual follow) para mostrarmos no Front
            const erroApi = await res.json().catch(() => ({}));
            throw new Error(erroApi.erro || "Não foi possível enviar a mensagem. Verifique se vocês se seguem mutuamente.");
        }
        
        return res.json();
    }
};