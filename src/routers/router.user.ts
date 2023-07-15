import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { EnsureAuthenticateUser } from "../middlewares/EnsureAuthenticateUser";
import { sign } from "jsonwebtoken";

const userRoute = Router();

const prisma = new PrismaClient();

interface IRequestBody {
  name: string;
  email: string;
  password: string;
}

userRoute.get('/', (req,res) => {
  res.json({msg:'Acessou a rota'})
} )

// Busca por todo os usuários
userRoute.get("/getall", EnsureAuthenticateUser, async (req, res) => {
  const getAll = await prisma.user.findMany();

  res.json(getAll);
});

// Busca por ID
userRoute.get("/:id", EnsureAuthenticateUser, async (req, res) => {
  const { id } = req.params;

  const getById = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  res.json(getById);
});

// Busca por nome ou email
userRoute.get("/", EnsureAuthenticateUser, async (req, res) => {
  const { nome, email } = req.query;

  const getSearch = await prisma.user.findMany({
    where: {
      OR: [
        {
          email: {
            contains: String(email),
          },
          name: {
            contains: String(nome),
          },
        },
      ],
    },
  });

  res.json(getSearch);
});

// Registrar um usuário
userRoute.post("/register", async (req, res) => {
  const { name, email, password }: IRequestBody = req.body;

  const userExist = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (userExist)
    return res.status(404).json({ error: true, message: "Usuário já existe" });

  const createUser = await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  res.json(createUser);
});

// Autentica Usuário
userRoute.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;

  const userExist = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!userExist)
    return res
      .status(404)
      .json({ error: true, message: "Email ou Senha invalida" });

  if (userExist.password !== password)
    return res
      .status(404)
      .json({ error: true, message: "Email ou Senha invalida" });

  const token = sign({ email: userExist.email }, "ChaveSecreta", {
    subject: userExist.id,
    expiresIn: "1d",
  });

  res.json(token)
});

// Atualizar informação do usuário
userRoute.put("/:id", EnsureAuthenticateUser, async (req, res) => {
  const { name, email, password }: IRequestBody = req.body;
  const { id } = req.params;

  const userExist = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  if (!userExist)
    return res.status(400).json({ error: true, message: "Usuário não existe" });

  let newInfo: IRequestBody = { name: "", email: "", password: "" };

  name === undefined || name === userExist.name
    ? (newInfo.name = userExist.name!)
    : (newInfo.name = name);

  email === undefined || email === userExist.email
    ? (newInfo.email = userExist.email!)
    : (newInfo.email = email);

  password === undefined || password === userExist.password
    ? (newInfo.password = userExist.password!)
    : (newInfo.password = password);

  const updateUser = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name: newInfo.name,
      email: newInfo.email,
      password: newInfo.password,
    },
  });

  res.json(updateUser);
});

// Deletar Usuário
userRoute.delete("/:id", EnsureAuthenticateUser, async (req, res) => {
  const { id } = req.params;

  const userExist = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  if (!userExist)
    return res.status(400).json({ error: true, message: "Usuário não existe" });

  const deleteUser = await prisma.user.delete({
    where: {
      id,
    },
  });

  res.json(deleteUser);
});

export { userRoute };
