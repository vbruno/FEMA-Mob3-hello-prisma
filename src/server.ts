import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const server = express()
const port = 3333

server.use(express.json())

server.get('/', async (req,res) => {
    const getAll = await prisma.user.findMany()

    res.json(getAll)

})

interface IRequest {
    name: string
    email: string
}

server.post('/', async (req,res) => {
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

server.listen(port, () => {
    console.log(`Server in running - http://localhost:${port} `);
    
})