import express from 'express'
import { PrismaClient } from '@prisma/client'
import { EnsureAuthenticateUser } from './middlewares/EnsureAuthenticateUser'

const prisma = new PrismaClient()

const server = express()
const port = 3333

server.use(express.json())

server.use( (req, res, next) => {
    console.log(
        `[${new Date().getTime()}] - ${req.headers["x-forwarded-for"] || req.socket.remoteAddress} - ${req.method} - ${req.originalUrl}`
    )
    next()
})

server.get('/', async (req,res) => {
    const getAll = await prisma.user.findMany()

    res.json(getAll)

})

interface IRequest {
    name: string
    email: string
}

server.post('/', EnsureAuthenticateUser, async (req,res) => {
   const { name , email}:IRequest = req.body

   const userExist = await prisma.user.findFirst({
    where:{
        email
    }
   })
   
   if(userExist) return res.status(404).json({error: true, message: "Usuário já existe"})

   const createUser = await prisma.user.create({
        data: {
            name,
            email
        }
    })
   
    res.json(createUser)

})

server.put('/:id', async (req,res) => {
   const { name , email}:IRequest = req.body
   const { id } = req.params

    const userExist = await prisma.user.findFirst({
    where:{
        id
    }
   })
   
   if(!userExist) return res.status(400).json({error: true, message: "Usuário não existe"})

   const updateUser = await prisma.user.update({
        where:{
            id
        },
        data: {
            name,
            email
        },
        select: {
            name: true,
            email: true,
            post: true
        }
    })
   
    res.json(updateUser)

})


server.delete('/:id', async (req,res) => {
   const { id } = req.params

    const userExist = await prisma.user.findFirst({
    where:{
        id
    }
   })
   
   if(!userExist) return res.status(400).json({error: true, message: "Usuário não existe"})

   const deleteUser = await prisma.user.delete({
        where:{
            id
        },
    })
   
    res.json(deleteUser)

})



server.use((req, res, next) => {
    res.status(404).json({message: "Erro ao acessar a rota!"})
})

server.listen(port, () => {
    console.log(`Server in running - http://localhost:${port} `);
    
})