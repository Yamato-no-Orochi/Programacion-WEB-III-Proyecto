import {
  crearPedido,
  obtenerPedidosUsuario,
  obtenerDetallesPedido,
  obtenerTodosPedidos,
  actualizarEstadoPedido
} from '../models/pedidoModel.js';
import { obtenerCarrito } from '../models/carritoModel.js';

export const crearNuevoPedido = async (req, res) => {
  try {
    const { direccion_envio, telefono, notas } = req.body;
    
    const carrito = await obtenerCarrito(req.usuario.id);
    
    if (carrito.items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    
    for (const item of carrito.items) {
      if (item.cantidad > item.stock) {
        return res.status(400).json({ 
          error: `Stock insuficiente para: ${item.nombre}. Disponible: ${item.stock}` 
        });
      }
    }
  
    const datosPedido = {
      direccion_envio,
      telefono,
      notas,
      items: carrito.items.map(item => ({
        producto_id: item.producto_id,
        precio: item.precio,
        cantidad: item.cantidad
      }))
    };
    
    const pedido = await crearPedido(req.usuario.id, datosPedido);
    
    res.status(201).json({
      mensaje: 'Pedido creado exitosamente',
      pedido
    });
  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({ error: 'Error creando pedido' });
  }
};

export const obtenerMisPedidos = async (req, res) => {
  try {
    const pedidos = await obtenerPedidosUsuario(req.usuario.id);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo pedidos' });
  }
};

export const obtenerDetallePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await obtenerDetallesPedido(id, req.usuario.id);
    
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo detalle del pedido' });
  }
};

export const obtenerTodosLosPedidos = async (req, res) => {
  try {

    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const pedidos = await obtenerTodosPedidos();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo pedidos' });
  }
};

export const actualizarEstado = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const { id } = req.params;
    const { estado } = req.body;
    
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    
    const pedido = await actualizarEstadoPedido(id, estado);
    
    res.json({
      mensaje: 'Estado actualizado exitosamente',
      pedido
    });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando estado' });
  }
};