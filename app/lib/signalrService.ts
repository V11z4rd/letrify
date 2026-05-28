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
      .configureLogging(signalR.LogLevel.Warning) // Evita poluir o console com erros de cancelamento normais
      .build();

    return this.connection.start()
      .then(() => {
        console.log("🔥 [SignalR] Conectado com sucesso ao Chat Global!");
      })
      .catch((erro) => {
        // Se for um erro de cancelamento por desmontagem do componente, silencia
        if (erro.toString().includes("stopped during negotiation")) {
          return;
        }
        console.error("🚨 [SignalR] Erro ao conectar:", erro);
        throw erro;
      });
  }

  public pararConexao() {
    if (this.connection) {
      // Verifica se está em um estado que permite parada estável
      if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
        this.connection.stop();
        console.log("🛑 [SignalR] Conexão encerrada de forma limpa.");
      }
      this.connection = null;
    }
  }

  public async entrarNoGrupo(grupoId: number) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke("entrarSalaGrupo", grupoId.toString());
        console.log(`📡 [SignalR] Entrou na sala do Grupo ${grupoId} (camelCase)`);
      } catch (err) {
        try {
          await this.connection.invoke("EntrarSalaGrupo", grupoId.toString());
          console.log(`📡 [SignalR] Entrou na sala do Grupo ${grupoId} (PascalCase)`);
        } catch (innerErr) {
          console.error("🚨 [SignalR] Falha total ao invocar entrada na sala:", innerErr);
        }
      }
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
}

export const signalRService = new SignalRService();