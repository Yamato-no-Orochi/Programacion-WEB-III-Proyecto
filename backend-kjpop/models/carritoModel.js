import { db } from '../config/db.js';

export const obtenerCarrito = async (usuarioId) => {
  const [rows] = await db.query(`
    SELECT c.*, p.nombre, p.precio, p.imagen_url, p.stock
    FROM carrito c
    JOIN productos p ON c.producto_id = p.id
    WHERE c.usuario_id = ? AND p.eliminado = 0 AND p.activo = 1
    ORDER BY c.agregado_en DESC
  `, [usuarioId]);
  const items = rows.map(item => ({
    ...item,
    subtotal: item.precio * item.cantidad
  }));

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { items, total };
};

export const agregarAlCarrito = async (usuarioId, productoId, cantidad = 1) => {
  const [existente] = await db.query(
    'SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?',
    [usuarioId, productoId]
  );
  if (existente.length > 0) {
    await db.query(
      'UPDATE carrito SET cantidad = cantidad + ? WHERE usuario_id = ? AND producto_id = ?',
      [cantidad, usuarioId, productoId]
    );
  } else {
    await db.query(
      'INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)',
      [usuarioId, productoId, cantidad]
    );
  }
  return obtenerCarrito(usuarioId);
};
export const actualizarCantidadCarrito = async (usuarioId, productoId, cantidad) => {
  if (cantidad <= 0) {
    await db.query(
      'DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ?',
      [usuarioId, productoId]
    );
  } else {
    await db.query(
      'UPDATE carrito SET cantidad = ? WHERE usuario_id = ? AND producto_id = ?',
      [cantidad, usuarioId, productoId]
    );
  }
  return obtenerCarrito(usuarioId);
};
export const eliminarDelCarrito = async (usuarioId, productoId) => {
  await db.query(
    'DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ?',
    [usuarioId, productoId]
  );
  return obtenerCarrito(usuarioId);
};
export const vaciarCarrito = async (usuarioId) => {
  await db.query(
    'DELETE FROM carrito WHERE usuario_id = ?',
    [usuarioId]
  );
  return { items: [], total: 0 };
};