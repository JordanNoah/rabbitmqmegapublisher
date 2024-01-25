import SocketIo from 'socket.io';

export class io {
    public static async connect(app:any) {
        const io: SocketIo.Server = new SocketIo.Server(app)
        io.on('connection',(socket) => {
            console.log(`Socket connected: ${socket.id}`);
        })
        return io;
    }
}