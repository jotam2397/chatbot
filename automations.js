// automations.js

import { Router } from 'express';
import { db } from './firebaseConfig.js'; // Importando a configuração do Firebase
import { collection, addDoc } from 'firebase/firestore';

const router = Router();

// Rota para criar uma automação
router.post('/create', async (req, res) => {
    const { name, steps } = req.body;

    try {
        // Adicionando automação no Firestore
        const docRef = await addDoc(collection(db, 'automations'), {
            name,
            steps,
            createdAt: new Date(),
        });
        res.send(`Automação criada com sucesso! ID: ${docRef.id}`);
    } catch (error) {
        res.status(500).send(`Erro ao criar automação: ${error.message}`);
    }
});

// Exportando o router para ser usado no app principal
export default router;
