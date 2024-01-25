import { io } from "./infrastructure/socket/io"
import { AppRoutes } from "./presentation/routes"
import { Server } from "./presentation/server"

(()=>{
    main()
})()

async function main() {
    const socket = await io.connect('')
    new Server({routes:AppRoutes.routes,socket: socket}).start()
}