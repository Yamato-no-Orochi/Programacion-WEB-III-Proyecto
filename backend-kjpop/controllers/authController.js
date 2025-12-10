import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { crearUsuario, buscarUsuarioPorEmail } from '../models/usuarioModel.js';

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    
    const usuarioExistente = await buscarUsuarioPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    const usuarioId = await crearUsuario({
      nombre,
      email,
      password,
      rol: 'vendedor' 
    });
    
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuarioId
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const usuario = await buscarUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }
    
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const { password: _, ...usuarioSinPassword } = usuario;
    
    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: usuarioSinPassword
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = req.usuario;
    res.json({ usuario });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
};