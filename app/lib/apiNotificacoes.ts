import axios from 'axios';

// Apontando para a porta correta do seu backend C#
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Captura o token de forma segura no Next.js
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('letrify_token'); 
    }
    return null;
};

// Injeta o token em todas as requisições
api.interceptors.request.use(config => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const notificacoesApi = {
    async listarNotificacoes(apenasNaoLidas: boolean = false) {
        const response = await api.get(`/notificacoes?apenasNaoLidas=${apenasNaoLidas}`);
        return response.data;
    },
    async marcarComoLida(id: number) {
        await api.put(`/notificacoes/${id}/lida`);
    },
    async marcarTodasComoLidas() {
        await api.put(`/notificacoes/marcar-todas-lidas`);
    },
    async deletarNotificacao(id: number) {
        await api.delete(`/notificacoes/${id}`);
    },
};