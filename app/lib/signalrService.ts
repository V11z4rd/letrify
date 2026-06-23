import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public iniciarConexao(token: string): Promise<void> {
    // 💡 SEGURANÇA 1: Impede terminantemente execuções no lado do servidor (SSR)
    if (typeof window === "undefined") return Promise.resolve();

    // Se já estiver conectado ou conectando, evita duplicar e quebrar a negociação anterior
    if (this.connection) {
      if (this.connection.state === signalR.HubConnectionState.Connected || 
          this.connection.state === signalR.HubConnectionState.Connecting) {
        return Promise.resolve();
      }
    }

    // 💡 SEGURANÇA 2: Força WebSockets e desativa logs ruidosos de handshakes interrompidos
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://letrify.fly.dev/hubs/chat", {
        accessTokenFactory: () => token,
        // Força o transporte por WebSockets diretamente. Se falhar, tenta LongPolling de forma limpa
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false // Mantido false para o fallback funcionar no ambiente do Fly.io
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000]) // Intervalos de reconexão inteligentes
      .configureLogging(signalR.LogLevel.Warning) // Silencia os logs de "Information" e "Debug"
      .build();

    return this.connection.start().catch(err => {
      console.error("🚨 [SignalR] Erro fatal ao conectar:", err);
    });
  }

  public pararConexao() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  public async entrarSalaGrupo(grupoId: number) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke("entrarSalaGrupo", grupoId.toString());
      } catch (err) {
        // Fallback para PascalCase caso o C# esteja exigindo
        try {
          await this.connection.invoke("EntrarSalaGrupo", grupoId.toString());
        } catch (innerErr) {
          console.error("🚨 [SignalR] Erro ao entrar na sala:", innerErr);
        }
      }
    }
  }

  public async sairSalaGrupo(grupoId: number) {
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
      this.connection.off("ReceberMensagemGrupo");
      this.connection.off("receberMensagemGrupo");
      this.connection.on("ReceberMensagemGrupo", callback);
      this.connection.on("receberMensagemGrupo", callback);
    }
  }

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

  public onReceberMensagemDireta(callback: (mensagem: any) => void) {
    if (this.connection) {
      this.connection.off("ReceberMensagemDireta");
      this.connection.off("receberMensagemDireta");
      this.connection.on("ReceberMensagemDireta", callback);
      this.connection.on("receberMensagemDireta", callback);
    }
  }
}

export const signalRService = new SignalRService();