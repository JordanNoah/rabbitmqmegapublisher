import { Router } from "express"
import path from "path"

export class AppRoutes {
    static get routes(): Router {
        const router = Router()
        
        router.get('/', (req,res) => {
            res.sendFile(path.join(__dirname,'./public/index.html'))
        })
        return router
    }
}