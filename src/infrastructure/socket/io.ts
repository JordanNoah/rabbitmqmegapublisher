import { Server, Socket } from 'socket.io';

export class SocketManager {
  private io: Server;

  constructor(server: any) {
    this.io = new Server(server);
    this.setupSocketEvents();
  }

  private setupSocketEvents() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Usuario conectado:', socket.id);
    });
  }

  public emit(eventName: string, data: any) {
    this.io.emit(eventName, data);
  }
}