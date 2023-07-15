import express from 'express'

import { EnsureAuthenticateUser } from './middlewares/EnsureAuthenticateUser'



const server = express()
const port = 3333

server.use(express.json())

// Interceptador de roda 
server.use( (req, res, next) => {
    console.log(
        `[${new Date().getTime()}] - ${req.headers["x-forwarded-for"] || req.socket.remoteAddress} - ${req.method} - ${req.originalUrl}`
    )
    next()
})


server.use((req, res, next) => {
    res.status(404).json({message: "Erro ao acessar a rota!"})
})

server.listen(port, () => {
    console.log(`Server in running - http://localhost:${port} `);
    
})