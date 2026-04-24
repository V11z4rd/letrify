import Link from "next/link";

export interface TopTema {
  tema: string;
  quantidade: number;
}

export interface UsuarioMatch {
  id: string | number;
  nome: string;
  cidade: string;
  fotoPerfil: string | null;
  topGeneros?: TopTema[]; 
}

interface RadarAfinidadeProps {
  usuario: UsuarioMatch;
}

export default function RadarAfinidade({ usuario }: RadarAfinidadeProps) {
  // 🕵️ A NOSSA ARMADILHA PARA VER OS DADOS:
  // Aperte F12 no navegador, vá na aba "Console" e veja o que aparece aqui!
  console.log(`Dados do leitor ${usuario.nome}:`, usuario);

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

      {/* O Pódio de Gêneros */}
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

      {/* ➕ RESTAURAÇÃO: Área de Botões (Gráfico + Perfil) */}
      <div className="flex gap-2 w-full mt-auto">
        {/* BOTÃO DO GRÁFICO DE TEIA */}
        <button 
          className="p-2 rounded-lg border font-bold text-sm transition-all hover:opacity-80 shadow flex items-center justify-center"
          title="Ver Gráfico de Afinidade"
          style={{ borderColor: 'var(--cor-primaria)', backgroundColor: 'transparent', color: 'var(--cor-texto-principal)' }}
          onClick={() => alert(`Aqui abre o gráfico de teia do ${usuario.nome}!`)} // Substitua pela sua função de abrir o modal
        >
          🕸️
        </button>

        {/* BOTÃO DE VER PERFIL */}
        <Link 
          href={`/perfil?id=${usuario.id}`}
          className="flex-1 py-2 rounded-lg font-bold text-sm transition-opacity opacity-90 group-hover:opacity-100 shadow flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--cor-botao-primario)', color: 'var(--cor-botao-texto)' }}
        >
          📖 Ver Perfil
        </Link>
      </div>

    </div>
  );
}