// app/lib/signalrService.ts
import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  // Inicia a conexão passando o token de autenticação
  public iniciarConexao(token: string) {
    // Se já existe uma conexão ativa, não fazemos nada para evitar duplicação
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://letrify.fly.dev/hubs/chat", {
        // O SignalR precisa do token para passar pelo [Authorize] do Back-end
        accessTokenFactory: () => token 
      })
      // withAutomaticReconnect é vida: se a internet cair e voltar, ele reconecta sozinho
      .withAutomaticReconnect() 
      .build();

    this.connection.start()
      .then(() => console.log("🔥 [SignalR] Conectado com sucesso ao Chat Global!"))
      .catch((erro) => console.error("🚨 [SignalR] Erro ao conectar:", erro));
  }

  // Desliga a conexão (útil para quando o usuário fizer logout)
  public pararConexao() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      console.log("🛑 [SignalR] Conexão encerrada.");
    }
  }

  // --- REGISTRO DE OUVINTES (LISTENERS) ---

  public onReceberNovaMensagem(callback: (mensagem: any) => void) {
    if (this.connection) {
      // Remove o ouvinte anterior para não ficar executando duas vezes
      this.connection.off("ReceberNovaMensagem"); 
      this.connection.on("ReceberNovaMensagem", callback);
    }
  }

  public onMensagemDeletada(callback: (idDeletado: number) => void) {
    if (this.connection) {
      this.connection.off("MensagemDeletada");
      this.connection.on("MensagemDeletada", callback);
    }
  }
}

// Exportamos uma única instância para o app inteiro usar
export const signalRService = new SignalRService();