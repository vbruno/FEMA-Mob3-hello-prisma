import express from 'express'

import { router } from './routers'

const server = express()
const port = 3333

server.use(express.json())

// Interceptador de rota 
server.use( (req, res, next) => {
    console.log(
        `[${new Date().getTime()}] - ${req.headers["x-forwarded-for"] || req.socket.remoteAddress} - ${req.method} - ${req.originalUrl}`
    )
    next()
})

server.use(router)


server.use((req, res, next) => {
    res.status(404).json({message: "Erro ao acessar a rota!"})
})

server.listen(port, () => {
    console.log(`Server in running - http://localhost:${port} `);
    
})