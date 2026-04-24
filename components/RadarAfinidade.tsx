import Link from "next/link";

// ➕ INCREMENTO 1: Nova interface para os temas/gêneros
export interface TopTema {
  tema: string;
  quantidade: number;
}

export interface UsuarioMatch {
  id: string | number;
  nome: string;
  cidade: string;
  fotoPerfil: string | null;
  // ➕ INCREMENTO 2: Adicionando os gêneros de forma opcional (?) para não quebrar nada
  topGeneros?: TopTema[]; 
}

interface RadarAfinidadeProps {
  usuario: UsuarioMatch;
}

export default function RadarAfinidade({ usuario }: RadarAfinidadeProps) {
  return (
    <div 
      className="p-6 rounded-2xl border flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-xl bg-card-limpo group flex-1"
      style={{ borderColor: 'var(--cor-fundo-sidebar)' }}
    >
      {/* FOTO DE PERFIL */}
      <div 
        className="w-24 h-24 rounded-full border-4 shadow-md bg-cover bg-center overflow-hidden mb-4"
        style={{ 
          borderColor: 'var(--cor-primaria)', 
          backgroundImage: usuario.fotoPerfil ? `url(${usuario.fotoPerfil})` : 'none',
          backgroundColor: 'var(--cor-fundo-sidebar)'
        }}
      >
        {!usuario.fotoPerfil && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl opacity-50">👤</span>
          </div>
        )}
      </div>

      {/* DADOS DO USUÁRIO */}
      <h3 className="font-black text-lg line-clamp-1 w-full" style={{ color: 'var(--cor-texto-principal)' }} title={usuario.nome}>
        {usuario.nome}
      </h3>
      
      <p className="text-sm mt-1 font-medium mb-4" style={{ color: 'var(--cor-texto-secundario)' }}>
        📍 {usuario.cidade || "Localização oculta"}
      </p>

      {/* ➕ INCREMENTO 3: O Pódio de Gêneros! */}
      {usuario.topGeneros && usuario.topGeneros.length > 0 && (
        <div className="w-full mb-6 flex flex-wrap justify-center gap-2">
          {usuario.topGeneros.slice(0, 3).map((item, index) => (
            <span 
              key={index} 
              className="text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide border"
              style={{ 
                backgroundColor: 'var(--cor-fundo-sidebar)', 
                color: 'var(--cor-texto-principal)',
                borderColor: 'var(--cor-primaria)' 
              }}
            >
              {item.tema}
            </span>
          ))}
        </div>
      )}

      {/* BOTÃO DE AÇÃO */}
      <Link 
        href={`/perfil?id=${usuario.id}`}
        className="w-full py-2 mt-auto rounded-lg font-bold text-sm transition-opacity opacity-90 group-hover:opacity-100 shadow flex items-center justify-center gap-2"
        style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
      >
        📖 Ver Perfil
      </Link>
    </div>
  );
}