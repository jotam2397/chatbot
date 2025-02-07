import { Router } from 'express';
import { db } from './firebaseConfig.js'; // Importando a configuração do Firebase
import { collection, addDoc } from 'firebase/firestore';
import { verifyTokenMiddleware } from './index.js'; // Importando o middleware de verificação de token

const router = Router();

// Rota para criar uma automação (agora protegida por token)
router.post('/create', verifyTokenMiddleware, async (req, res) => {
    const { name, steps } = req.body;

    if (!name || !steps) {
        return res.status(400).send('Faltando dados necessários');
    }

    try {
        // Adicionando automação no Firestore
        const docRef = await addDoc(collection(db, 'automations'), {
            name,
            steps,
            createdAt: new Date(),
            userId: req.user.userId // Associando a automação ao usuário autenticado
        });

        res.json({
            message: `Automação criada com sucesso! ID: ${docRef.id}`,
            automationId: docRef.id
        });
    } catch (error) {
        res.status(500).send(`Erro ao criar automação: ${error.message}`);
    }
});

// Exportando o router para ser usado no app principal
export default router;
