// auth.js

import { Router } from 'express';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.js'; // Importação do arquivo de configuração

const router = Router();

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
        res.send(`Usuário logado com sucesso! ID: ${user.uid}`);
    } catch (error) {
        res.status(500).send(`Erro ao logar usuário: ${error.message}`);
    }
});

// Exportação padrão para o router
export default router;
