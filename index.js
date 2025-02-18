import express from 'express';
import { initializeApp, getApp, getApps } from 'firebase/app'; 
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import jwt from 'jsonwebtoken';  // Importando o jsonwebtoken
import authRoutes from './auth.js'; 
import { auth } from './firebaseConfig.js'; 

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10001;

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
    console.log('Firebase App Initialized');  // Linha adicionada
} else {
    console.log('Firebase já estava inicializado'); // Alteração feita aqui
    getApp(); 
}

const db = getFirestore();

// Middleware para interpretar o corpo da requisição como JSON
app.use(express.json());  

// Usar as rotas de autenticação
app.use('/auth', authRoutes);

// Função para gerar o token JWT
const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

// Função para verificar o token JWT
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;  // Retorna os dados do token, como o userId
    } catch (error) {
        return null;  // Caso o token seja inválido ou expirado
    }
};

// Rota simples para testar
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
    const { email, password } = req.body; // Pegando o email e senha do corpo da requisição
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        res.send(`Usuário criado com sucesso! ID: ${user.uid}`);
    } catch (error) {
        res.status(500).send(`Erro ao criar usuário: ${error.message}`);
    }
});

// Rota para login de usuário
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body; // Pegando o email e senha do corpo da requisição
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Gerar o token JWT
        const token = generateToken(user.uid);

        // Enviar o token na resposta
        res.json({
            message: `Usuário logado com sucesso! ID: ${user.uid}`,
            token: token
        });
    } catch (error) {
        res.status(500).send(`Erro ao logar usuário: ${error.message}`);
    }
});

// Rota protegida que requer autenticação
app.get('/protected', (req, res) => {
    const token = req.headers['authorization']; // Pegando o token do cabeçalho Authorization
    
    if (!token) {
        return res.status(403).send('Token é necessário');
    }

    const decoded = verifyToken(token);
    
    if (decoded) {
        res.send(`Acesso concedido! User ID: ${decoded.userId}`);
    } else {
        res.status(403).send('Token inválido ou expirado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
