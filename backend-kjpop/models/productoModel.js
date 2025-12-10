import { db } from '../config/db.js';

export const obtenerProductos = async () => {
  const [rows] = await db.query(
    'SELECT * FROM productos WHERE eliminado = 0 ORDER BY creado_en DESC'
  );
  return rows;
};
export const obtenerProductoPorId = async (id) => {
  const [rows] = await db.query(
    'SELECT * FROM productos WHERE id = ? AND eliminado = 0',
    [id]
  );
  return rows[0];
};
export const crearProducto = async (producto) => {
  const { nombre, categoria, precio, stock, descripcion, imagen_url } = producto;
  
  const [result] = await db.query(
    `INSERT INTO productos (nombre, categoria, precio, stock, descripcion, imagen_url) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, categoria, precio, stock, descripcion, imagen_url || null]
  );
  
  return { id: result.insertId, ...producto };
};
export const actualizarProducto = async (id, producto) => {
  const { nombre, categoria, precio, stock, descripcion, imagen_url } = producto;
  
  await db.query(
    `UPDATE productos 
     SET nombre = ?, categoria = ?, precio = ?, stock = ?, descripcion = ?, imagen_url = ?
     WHERE id = ? AND eliminado = 0`,
    [nombre, categoria, precio, stock, descripcion, imagen_url, id]
  );
  
  return { id, ...producto };
};

export const eliminarProducto = async (id) => {
  await db.query(
    'UPDATE productos SET eliminado = 1 WHERE id = ?',
    [id]
  );
  return id;
};
export const restaurarProducto = async (id) => {
  await db.query(
    'UPDATE productos SET eliminado = 0 WHERE id = ?',
    [id]
  );
  return id;
};