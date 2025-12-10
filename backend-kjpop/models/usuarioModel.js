import { db } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const crearUsuario = async (usuario) => {
  const { nombre, email, password, rol } = usuario;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const [result] = await db.query(
    'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, hashedPassword, rol || 'vendedor']
  );
  
  return result.insertId;
};

export const buscarUsuarioPorEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
    [email]
  );
  return rows[0];
};

export const buscarUsuarioPorId = async (id) => {
  const [rows] = await db.query(
    'SELECT id, nombre, email, rol FROM usuarios WHERE id = ? AND activo = 1',
    [id]
  );
  return rows[0];
};