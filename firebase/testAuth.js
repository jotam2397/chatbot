import { registerUser, loginUser, logoutUser } from './authService.js';

// Teste de registro de usuário
const testRegister = async () => {
  try {
    const email = 'teste@exemplo.com'; // Substitua por um e-mail válido
    const password = 'senha123'; // Escolha uma senha segura
    const user = await registerUser(email, password);
    console.log('Usuário registrado:', user);
  } catch (error) {
    console.error('Erro ao registrar:', error.message);
  }
};

testRegister();
