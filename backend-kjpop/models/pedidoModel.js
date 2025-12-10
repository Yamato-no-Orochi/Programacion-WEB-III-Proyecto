import { db } from '../config/db.js';

export const crearPedido = async (usuarioId, datosPedido) => {
  const { direccion_envio, telefono, notas, items } = datosPedido;
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const [resultPedido] = await connection.query(
      `INSERT INTO pedidos (usuario_id, total, direccion_envio, telefono, notas) 
       VALUES (?, ?, ?, ?, ?)`,
      [usuarioId, total, direccion_envio, telefono, notas]
    );
    
    const pedidoId = resultPedido.insertId;
    
    for (const item of items) {
      await connection.query(
        `INSERT INTO detalles_pedido 
         (pedido_id, producto_id, cantidad, precio_unitario, subtotal) 
         VALUES (?, ?, ?, ?, ?)`,
        [pedidoId, item.producto_id, item.cantidad, item.precio, item.precio * item.cantidad]
      );
      
      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }
    
    for (const item of items) {
      await connection.query(
        `INSERT INTO ventas (producto_id, usuario_id, cantidad, total, pedido_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [item.producto_id, usuarioId, item.cantidad, item.precio * item.cantidad, pedidoId]
      );
    }
    
    await connection.query(
      'DELETE FROM carrito WHERE usuario_id = ?',
      [usuarioId]
    );
    await connection.commit();
    const [pedidoCompleto] = await db.query(`
      SELECT p.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'producto_id', dp.producto_id,
                 'nombre', pr.nombre,
                 'cantidad', dp.cantidad,
                 'precio_unitario', dp.precio_unitario,
                 'subtotal', dp.subtotal
               )
             ) as items
      FROM pedidos p
      JOIN detalles_pedido dp ON p.id = dp.pedido_id
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE p.id = ?
      GROUP BY p.id
    `, [pedidoId]);
    
    return pedidoCompleto[0];
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const obtenerPedidosUsuario = async (usuarioId) => {
  const [pedidos] = await db.query(`
    SELECT p.*, 
           COUNT(dp.id) as total_items,
           SUM(dp.cantidad) as total_productos
    FROM pedidos p
    LEFT JOIN detalles_pedido dp ON p.id = dp.pedido_id
    WHERE p.usuario_id = ?
    GROUP BY p.id
    ORDER BY p.creado_en DESC
  `, [usuarioId]);
  
  return pedidos;
};
export const obtenerDetallesPedido = async (pedidoId, usuarioId = null) => {
  let query = `
    SELECT p.*, 
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'producto_id', dp.producto_id,
               'nombre', pr.nombre,
               'imagen_url', pr.imagen_url,
               'cantidad', dp.cantidad,
               'precio_unitario', dp.precio_unitario,
               'subtotal', dp.subtotal
             )
           ) as items
    FROM pedidos p
    JOIN detalles_pedido dp ON p.id = dp.pedido_id
    JOIN productos pr ON dp.producto_id = pr.id
    WHERE p.id = ?
  `;
  const params = [pedidoId];
  if (usuarioId) {
    query += ' AND p.usuario_id = ?';
    params.push(usuarioId);
  }
  
  query += ' GROUP BY p.id';
  
  const [pedidos] = await db.query(query, params);
  if (pedidos.length === 0) {
    return null;
  }
  const pedido = {
    ...pedidos[0],
    items: JSON.parse(pedidos[0].items)
  };
  return pedido;
};

export const obtenerTodosPedidos = async () => {
  const [pedidos] = await db.query(`
    SELECT p.*, 
           u.nombre as usuario_nombre,
           u.email as usuario_email,
           COUNT(dp.id) as total_items,
           SUM(dp.cantidad) as total_productos
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN detalles_pedido dp ON p.id = dp.pedido_id
    GROUP BY p.id
    ORDER BY p.creado_en DESC
  `);
  
  return pedidos;
};

export const actualizarEstadoPedido = async (pedidoId, estado) => {
  await db.query(
    'UPDATE pedidos SET estado = ? WHERE id = ?',
    [estado, pedidoId]
  );
  
  return obtenerDetallesPedido(pedidoId);
};