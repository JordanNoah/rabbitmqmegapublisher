import express, { Router } from 'express'
import http from 'http'
import { SocketManager } from '../infrastructure/socket/io'

interface Options {
    port?: number
    routes: Router
}

var app = express()
const server = http.createServer(app)

var socketManager = new SocketManager(server)

export class Server {
    private readonly port: number
    private readonly routes: Router

    constructor(options: Options) {
        const { port = 3000, routes } = options
        this.port = port
        this.routes = routes
    }

    async start() {
        app.use(express.json())
        app.use(this.routes)
        app.use('/static/javascript',express.static("src/presentation/public/javascript"))
        app.use('/static/css',express.static("src/presentation/public/css"))

        server.listen(this.port, async () => {
            console.log(`Server running on PORT *:${this.port}`)
        })
    }
}


export {socketManager}