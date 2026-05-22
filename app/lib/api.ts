// app/lib/api.ts

// Colocamos a URL oficial de volta para não depender do .env da equipe
const BASE_URL = "https://letrify.fly.dev/api";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    // Garante que o formato da URL fique correto
    const url = endpoint.startsWith("http") ? endpoint : `https://letrify.fly.dev/api${endpoint}`;
    
    // Injeta o token JWT automaticamente
    const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null;
    
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    return fetch(url, { ...options, headers });
};