import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connectionChat: signalR.HubConnection | null = null;
  private connectionDM: signalR.HubConnection | null = null;

  // ==========================================
  // 🗣️ CONEXÃO 1: GRUPOS E FEED (/hubs/chat)
  // ==========================================
  
  // 👇 COMPATIBILIDADE: Mantém o nome antigo para não quebrar o Feed e outros componentes
  public iniciarConexao(token: string): Promise<void> {
    return this.iniciarConexaoChat(token);
  }

  public iniciarConexaoChat(token: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();

    if (this.connectionChat) {
      if (this.connectionChat.state === signalR.HubConnectionState.Connected || 
          this.connectionChat.state === signalR.HubConnectionState.Connecting) {
        return Promise.resolve();
      }
    }

    this.connectionChat = new signalR.HubConnectionBuilder()
      .withUrl("https://letrify.fly.dev/hubs/chat", {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false 
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    return this.connectionChat.start().catch(err => {
      console.error("🚨 [SignalR-Chat] Erro fatal ao conectar:", err);
    });
  }

  public pararConexao() {
    if (this.connectionChat) {
      this.connectionChat.stop();
      this.connectionChat = null;
    }
    if (this.connectionDM) {
      this.connectionDM.stop();
      this.connectionDM = null;
    }
  }

  public async entrarSalaGrupo(grupoId: number) {
    if (this.connectionChat && this.connectionChat.state === signalR.HubConnectionState.Connected) {
      try { await this.connectionChat.invoke("entrarSalaGrupo", grupoId.toString()); } 
      catch (err) {
        try { await this.connectionChat.invoke("EntrarSalaGrupo", grupoId.toString()); } 
        catch (innerErr) { console.error("🚨 [SignalR] Erro ao entrar na sala:", innerErr); }
      }
    }
  }

  public async sairSalaGrupo(grupoId: number) {
    if (this.connectionChat && this.connectionChat.state === signalR.HubConnectionState.Connected) {
      try { await this.connectionChat.invoke("sairSalaGrupo", grupoId.toString()); } 
      catch (err) {
        try { await this.connectionChat.invoke("SairSalaGrupo", grupoId.toString()); } 
        catch (innerErr) { console.error("🚨 [SignalR] Erro ao sair da sala:", innerErr); }
      }
    }
  }

  public onReceberMensagemGrupo(callback: (mensagem: any) => void) {
    if (this.connectionChat) {
      this.connectionChat.off("ReceberMensagemGrupo");
      this.connectionChat.off("receberMensagemGrupo");
      this.connectionChat.on("ReceberMensagemGrupo", callback);
      this.connectionChat.on("receberMensagemGrupo", callback);
    }
  }

  public onReceberNovaMensagem(callback: (mensagem: any) => void) {
    if (this.connectionChat) {
      this.connectionChat.off("ReceberNovaMensagem"); 
      this.connectionChat.off("receberNovaMensagem"); 
      this.connectionChat.on("ReceberNovaMensagem", callback);
      this.connectionChat.on("receberNovaMensagem", callback);
    }
  }

  public onMensagemDeletada(callback: (idDeletado: number) => void) {
    if (this.connectionChat) {
      this.connectionChat.off("MensagemDeletada");
      this.connectionChat.off("mensagemDeletada");
      this.connectionChat.on("MensagemDeletada", callback);
      this.connectionChat.on("mensagemDeletada", callback);
    }
  }

  // ==========================================
  // ✉️ CONEXÃO 2: MENSAGENS DIRETAS (/hubs/dm)
  // ==========================================
  
  public iniciarConexaoDM(token: string): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();

    if (this.connectionDM) {
      if (this.connectionDM.state === signalR.HubConnectionState.Connected || 
          this.connectionDM.state === signalR.HubConnectionState.Connecting) {
        return Promise.resolve();
      }
    }

    this.connectionDM = new signalR.HubConnectionBuilder()
      .withUrl("https://letrify.fly.dev/hubs/dm", {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        skipNegotiation: false
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    return this.connectionDM.start().catch(err => {
      console.error("🚨 [SignalR-DM] Erro fatal ao conectar:", err);
    });
  }

  public onReceberMensagemDireta(callback: (mensagem: any) => void) {
    if (this.connectionDM) {
      this.connectionDM.off("ReceberMensagemDireta");
      this.connectionDM.off("receberMensagemDireta");
      this.connectionDM.on("ReceberMensagemDireta", callback);
      this.connectionDM.on("receberMensagemDireta", callback);
    }
  }
}

export const signalRService = new SignalRService();