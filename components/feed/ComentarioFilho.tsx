"use client";

// Chamaremos o mesmo menu de opções!
import MenuTresPontinhos from "../ui/MenuTresPontinhos";

interface UsuarioChat {
  id: number;
  nome: string;
  fotoPerfil: string;
}

interface MensagemChat {
  id: number;
  conteudo: string;
  dataPostagem: string;
  usuario: UsuarioChat;
}

interface ComentarioFilhoProps {
  comentario: MensagemChat;
  meuId: number | null;
  nomePai: string;
}

export default function ComentarioFilho({ comentario, meuId, nomePai }: ComentarioFilhoProps) {
  const isDonoDoComentario = meuId === comentario.usuario.id;

  return (
    <div className="bg-zinc-800/20 border border-white/5 rounded-2xl p-4 relative transition-colors hover:bg-zinc-800/40">
      
      {/* CABEÇALHO DO COMENTÁRIO */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          
          {/* Avatar Menor */}
          <div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 overflow-hidden flex-shrink-0">
            {comentario.usuario?.fotoPerfil ? (
              <img src={comentario.usuario.fotoPerfil} alt={comentario.usuario.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-purple-600 text-white">
                {comentario.usuario?.nome?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div>
            <p className="font-bold text-xs text-zinc-200 flex items-center flex-wrap gap-1">
              {comentario.usuario?.nome}
              {/* Contexto: respondendo @fulano */}
              <span className="text-[10px] font-normal text-zinc-500">
                respondendo <span className="text-zinc-400">@{nomePai}</span>
              </span>
            </p>
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
              {new Date(comentario.dataPostagem).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        {/* 3 Pontinhos do Filho */}
        <MenuTresPontinhos idPost={comentario.id} isDono={isDonoDoComentario} />
      </div>

      {/* CORPO DO COMENTÁRIO */}
      {/* A margem esquerda (ml-10) alinha o texto perfeitamente com o nome, escapando de ficar embaixo do avatar */}
      <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap ml-10">
        {comentario.conteudo}
      </p>
      
    </div>
  );
}