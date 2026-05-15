// app/estante/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import EstanteUsuario from "@/components/EstanteUsuario";

function ConteudoDaEstante() {
  const searchParams = useSearchParams();
  const idDaUrl = searchParams.get("id"); // Pega o ID da URL, se existir

  return (
    <div className="max-w-7xl mx-auto w-full pt-8 pb-20 relative animate-fade-in px-4">
      {/* Passa o ID pra frente. Se for null, o EstanteUsuario usa o do logado */}
      <EstanteUsuario userId={idDaUrl || undefined} /> 
    </div>
  );
}

export default function EstantePage() {
  // UseSearchParams precisa estar dentro de um Suspense no Next.js
  return (
    <Suspense fallback={<div className="p-8 text-center">📚 Carregando estante...</div>}>
      <ConteudoDaEstante />
    </Suspense>
  );
}