// app/lib/signalrService.ts
import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public iniciarConexao(token: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://letrify.fly.dev/hubs/chat", {
        accessTokenFactory: () => token 
      })
      .withAutomaticReconnect() 
      .build();

    return this.connection.start()
      .then(() => {
        console.log("🔥 [SignalR] Conectado com sucesso ao Chat Global!");
      })
      .catch((erro) => {
        console.error("🚨 [SignalR] Erro ao conectar:", erro);
        throw erro;
      });
  }

  public pararConexao() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      console.log("🛑 [SignalR] Conexão encerrada.");
    }
  }

  public async entrarNoGrupo(grupoId: number) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        // 💡 CORREÇÃO 1: Tentamos invocar em camelCase (padrão do SignalR .NET Core)
        await this.connection.invoke("entrarSalaGrupo", grupoId.toString());
        console.log(`📡 [SignalR] Entrou na sala do Grupo ${grupoId} (camelCase)`);
      } catch (err) {
        try {
          // Fallback caso o seu Back-end tenha desativado o mapeamento padrão e use PascalCase
          await this.connection.invoke("EntrarSalaGrupo", grupoId.toString());
          console.log(`📡 [SignalR] Entrou na sala do Grupo ${grupoId} (PascalCase)`);
        } catch (innerErr) {
          console.error("🚨 [SignalR] Falha total ao invocar entrada na sala:", innerErr);
        }
      }
    } else {
      console.warn("⚠️ [SignalR] Tentativa de entrar no grupo sem uma conexão ativa.");
    }
  }

  public async sairDoGrupo(grupoId: number) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke("sairSalaGrupo", grupoId.toString());
      } catch (err) {
        try {
          await this.connection.invoke("SairSalaGrupo", grupoId.toString());
        } catch (innerErr) {
          console.error("🚨 [SignalR] Erro ao sair da sala:", innerErr);
        }
      }
    }
  }

  public onReceberMensagemGrupo(callback: (mensagem: any) => void) {
    if (this.connection) {
      // 💡 CORREÇÃO 2: Ouvimos tanto o formato PascalCase quanto camelCase
      // para garantir que a mensagem seja capturada não importa como o Back-end envie
      this.connection.off("ReceberMensagemGrupo");
      this.connection.off("receberMensagemGrupo");

      this.connection.on("ReceberMensagemGrupo", (msg) => {
        console.log("📥 [SignalR] Mensagem recebida (PascalCase):", msg);
        callback(msg);
      });

      this.connection.on("receberMensagemGrupo", (msg) => {
        console.log("📥 [SignalR] Mensagem recebida (camelCase):", msg);
        callback(msg);
      });
    }
  }

  // --- OUTROS OUVINTES ---
  public onReceberNovaMensagem(callback: (mensagem: any) => void) {
    if (this.connection) {
      this.connection.off("ReceberNovaMensagem"); 
      this.connection.off("receberNovaMensagem"); 
      this.connection.on("ReceberNovaMensagem", callback);
      this.connection.on("receberNovaMensagem", callback);
    }
  }

  public onMensagemDeletada(callback: (idDeletado: number) => void) {
    if (this.connection) {
      this.connection.off("MensagemDeletada");
      this.connection.off("mensagemDeletada");
      this.connection.on("MensagemDeletada", callback);
      this.connection.on("mensagemDeletada", callback);
    }
  }
}

export const signalRService = new SignalRService();