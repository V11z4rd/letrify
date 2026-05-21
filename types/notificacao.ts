export interface Notificacao {
    id: number;
    usuarioId: number;
    tipo: 'Match' | 'Seguidor' | 'Mencao' | string;
    conteudo: string;
    lida: boolean;
    dataCriacao: string;
}