import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.js'; // Certifique-se de que o caminho está correto

// Função para criar um usuário
async function createUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuário criado com sucesso:', userCredential.user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
  }
}

// Função para fazer login de um usuário
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuário autenticado com sucesso:', userCredential.user);
  } catch (error) {
    console.error('Erro ao autenticar:', error.message);
  }
}

async function testAuth() {
  const email = 'novoemail@test.com';  // Substitua por um e-mail fictício para o teste
  const password = 'senha123';  // Substitua pela senha desejada

  // Teste a criação do usuário
  await createUser(email, password);

  // Teste o login com as mesmas credenciais
  await loginUser(email, password);
}

testAuth();
