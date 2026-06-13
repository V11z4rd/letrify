"use client";

import { useState } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import BotaoCriarPost from "../feed/BotaoCriarPost";

interface BotaoFlutuanteCriarPostProps {
  onPostCreated?: () => void;
  grupoId?: string | number;
}

export default function BotaoFlutuanteCriarPost({ onPostCreated, grupoId }: BotaoFlutuanteCriarPostProps) {
  const [modalAberto, setModalAberto] = useState(false);

  const fecharModal = () => setModalAberto(false);

  const tratarSucessoPost = () => {
    fecharModal();
    if (onPostCreated) onPostCreated();
  };

  return (
    <>
      {/* 🚀 BOTÃO FLUTUANTE (Fixo no canto inferior direito) */}
      <button
        onClick={() => setModalAberto(true)}
        aria-label="Criar nova publicação"
        className="p-3.5 rounded-full border shadow-xl transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center group"
        style={{
          backgroundColor: "var(--cor-destaque)",
          borderColor: "var(--cor-destaque)",
        }}
      >
        <PlusIcon className="w-6 h-6 stroke-[2.5] text-white transition-transform duration-200 group-hover:rotate-90" />
      </button>

      {/* 🏙️ OVERLAY MODAL (Aparece ao clicar no botão) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" onClick={fecharModal}>
          <div 
            className="w-full max-w-xl rounded-3xl p-2 relative shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()} // Impede o fechamento ao clicar dentro do editor
          >
            {/* Botão de Fechar o Modal no canto superior direito */}
            <button
              onClick={fecharModal}
              className="absolute top-6 right-6 p-2 rounded-full opacity-60 hover:opacity-100 transition-opacity z-50"
              style={{ color: "var(--cor-texto-principal)" }}
            >
              <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Reutilização total da sua estrutura e lógica de criação original */}
            <div className="pt-4">
              <BotaoCriarPost onPostCreated={tratarSucessoPost} grupoIdContexto={grupoId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}