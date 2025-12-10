import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    
    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      });
      const { token, usuario } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUsuario(usuario);
      return { exito: true };
    } catch (error) {
      return { 
        exito: false, 
        error: error.response?.data?.error || 'Error en el login' 
      };
    }
  };

  const registro = async (datosUsuario) => {
    try {
      await axios.post('http://localhost:3001/api/auth/registro', datosUsuario);
      return { exito: true };
    } catch (error) {
      return { 
        exito: false, 
        error: error.response?.data?.error || 'Error en el registro' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete axios.defaults.headers.common['Authorization'];
    setUsuario(null);
    window.location.href = '/login';
  };

  const value = {
    usuario,
    cargando,
    login,
    registro,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};