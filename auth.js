import express from 'express';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';
import { auth } from './firebaseConfig.js';

const router = express.Router();

// Função para gerar um token JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Rota para criar um novo usuário
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        res.json({
            message: 'Usuário criado com sucesso!',
            userId: user.uid
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para login de usuário (agora retorna o token corretamente)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Gerar o token JWT
        const token = generateToken(user.uid);
        console.log("Token gerado:", token);  // Exibe o token no terminal

        // Retornar o token na resposta JSON
        res.json({
            message: 'Usuário logado com sucesso!',
            userId: user.uid,
            token: token  // O token agora será enviado corretamente
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
