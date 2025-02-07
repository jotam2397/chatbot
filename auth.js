// auth.js

import { Router } from 'express';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.js'; // Importação do arquivo de configuração
import jwt from 'jsonwebtoken';  // Importando o jsonwebtoken

const router = Router();

// Função para gerar o token JWT
const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });  // Expiração de 1 dia
    return token;
};

// Rota para criar um novo usuário
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        res.send(`Usuário criado com sucesso! ID: ${user.uid}`);
    } catch (error) {
        res.status(500).send(`Erro ao criar usuário: ${error.message}`);
    }
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Gerar o token JWT
        const token = generateToken(user.uid);

        // Enviar o token na resposta
        res.json({
            message: `Usuário logado com sucesso! ID: ${user.uid}`,
            token: token // Envia o token JWT aqui
        });
    } catch (error) {
        res.status(500).send(`Erro ao logar usuário: ${error.message}`);
    }
});

// Exportação padrão para o router
export default router;
