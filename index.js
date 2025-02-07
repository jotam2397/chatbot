import express from 'express';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';
import authRoutes from './auth.js';
import automationsRoutes from './automations.js';
import { auth } from './firebaseConfig.js';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se as variáveis de ambiente estão sendo carregadas corretamente
console.log('FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY);

const app = express();
const PORT = process.env.PORT || 10000;

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Verifica se o Firebase já foi inicializado
if (getApps().length === 0) {
    initializeApp(firebaseConfig);
    console.log('Firebase App Initialized');
} else {
    console.log('Firebase já estava inicializado');
    getApp();
}

const db = getFirestore();

// Middleware para interpretar JSON
app.use(express.json());

// Usar as rotas
app.use('/auth', authRoutes);
app.use('/automations', automationsRoutes);

// Função para gerar o token JWT
const generateToken = (userId) => {
    try {
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('Token gerado com sucesso:', token); // Verifique no terminal se o token é gerado corretamente
        return token;
    } catch (error) {
        console.error('Erro ao gerar o token:', error);
        throw new Error('Erro ao gerar o token');
    }
};

// Função para verificar o token JWT
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Middleware para verificar o token
const verifyTokenMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send('Token é necessário');
    }

    // Remover o prefixo 'Bearer ' caso exista
    const tokenWithoutBearer = token.replace('Bearer ', '');

    const decoded = verifyToken(tokenWithoutBearer);

    if (decoded) {
        req.user = decoded;  // Guardar as informações do usuário no objeto req
        next();  // Continuar com a execução da rota
    } else {
        return res.status(403).send('Token inválido ou expirado');
    }
};

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor está funcionando!');
});

// Rota para adicionar dados ao Firestore
app.get('/add-data', async (req, res) => {
    try {
        const docRef = await addDoc(collection(db, "testCollection"), {
            name: "ChatFlow Test",
            createdAt: new Date()
        });
        res.send(`Documento adicionado com ID: ${docRef.id}`);
    } catch (e) {
        res.status(500).send(`Erro ao adicionar documento: ${e}`);
    }
});

// Rota para criar um novo usuário
app.post('/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Gerar o token JWT após o cadastro
        const token = generateToken(user.uid);

        // Retornar a mensagem e o token
        res.json({
            message: `Usuário criado com sucesso! ID: ${user.uid}`,
            token: token
        });
    } catch (error) {
        res.status(500).send(`Erro ao criar usuário: ${error.message}`);
    }
});

// Rota para login de usuário (agora retorna o token)
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Gerar o token JWT
        const token = generateToken(user.uid);

        // Retornar o token na resposta
        res.json({
            message: `Usuário logado com sucesso! ID: ${user.uid}`,
            token: token  // Agora o token será enviado na resposta
        });
    } catch (error) {
        res.status(500).send(`Erro ao logar usuário: ${error.message}`);
    }
});

// Rota para criar uma nova automação
app.post('/automations/create', verifyTokenMiddleware, async (req, res) => {
    const { name, flow } = req.body;
    const userId = req.user.userId;  // Usar o userId do token

    if (!name || !flow) {
        return res.status(400).send('Faltando dados necessários');
    }

    try {
        // Adicionando a automação à coleção "automations"
        const docRef = await addDoc(collection(db, "automations"), {
            userId,
            name,
            flow,
            createdAt: new Date()
        });

        res.json({
            message: `Automação criada com sucesso! ID: ${docRef.id}`,
            automationId: docRef.id
        });
    } catch (error) {
        res.status(500).send(`Erro ao criar automação: ${error.message}`);
    }
});

// Rota protegida que requer autenticação
app.get('/protected', verifyTokenMiddleware, (req, res) => {
    res.send(`Acesso concedido! User ID: ${req.user.userId}`);
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
