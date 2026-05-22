// app/estante/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import EstanteUsuario from "@/components/EstanteUsuario";
import { BookOpenIcon } from "@heroicons/react/24/outline";

function ConteudoDaEstante() {
  const searchParams = useSearchParams();
  const idDaUrl = searchParams.get("id");

  return (
    <div className="max-w-7xl mx-auto w-full pt-8 pb-20 relative px-4">
      <EstanteUsuario userId={idDaUrl || undefined} /> 
    </div>
  );
}

export default function EstantePage() {
  return (
    <Suspense fallback={
      <div className="p-16 flex flex-col items-center justify-center text-center opacity-50 font-bold animate-pulse">
        <BookOpenIcon className="w-10 h-10 mb-3" style={{ color: 'var(--cor-primaria)' }} />
        <p style={{ color: 'var(--cor-texto-principal)' }}>Carregando estante...</p>
      </div>
    }>
      <ConteudoDaEstante />
    </Suspense>
  );
}