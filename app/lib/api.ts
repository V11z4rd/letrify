// app/lib/api.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://letrify.fly.dev";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    // Garante que o formato da URL fique correto
    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
    
    // Aqui você pode até centralizar a lógica de injetar o token JWT automaticamente!
    const token = typeof window !== 'undefined' ? localStorage.getItem('letrify_token') : null;
    
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    return fetch(url, { ...options, headers });
};