import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebaseConfig'; // Importando a configuração do Firebase
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'; // Importando funções de autenticação

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Bem-vindo, {user.displayName}</h1>
          <button onClick={handleLogout}>Sair</button>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      ) : (
        <div>
          <h1>Por favor, faça login para continuar</h1>
          <button onClick={handleLogin}>Entrar com Google</button>
        </div>
      )}
    </div>
  );
}

export default App;
