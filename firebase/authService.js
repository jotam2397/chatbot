import firebase from '../firebaseConfig.js';

// Função para registrar um novo usuário
export const registerUser = async (email, password) => {
  try {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    console.log('Usuário registrado com sucesso:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.message);
    throw error;
  }
};

// Função para login do usuário
export const loginUser = async (email, password) => {
  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    console.log('Usuário logado com sucesso:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Erro ao fazer login:', error.message);
    throw error;
  }
};

// Função para logout
export const logoutUser = async () => {
  try {
    await firebase.auth().signOut();
    console.log('Usuário deslogado com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer logout:', error.message);
    throw error;
  }
};
