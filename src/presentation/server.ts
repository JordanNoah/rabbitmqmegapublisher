import express, { Router } from 'express'
import http from 'http'

interface Options {
    port?: number
    routes: Router
}

export class Server {
    public readonly app = express()
    private readonly port: number
    private readonly routes: Router

    constructor(options: Options) {
        const { port = 3000, routes } = options
        this.port = port
        this.routes = routes
    }

    async start() {
        this.app.use(express.json())
        this.app.use(this.routes)
        this.app.use('/static/javascript',express.static("src/presentation/public/javascript"))
        this.app.use('/static/css',express.static("src/presentation/public/css"))

        const server = http.createServer(this.app)

        server.listen(this.port, async () => {
            console.log(`Server running on PORT *:${this.port}`)
        })
    }
}
