import {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidadCarrito,
  eliminarDelCarrito,
  vaciarCarrito
} from '../models/carritoModel.js';

export const obtenerCarritoUsuario = async (req, res) => {
  try {
    const carrito = await obtenerCarrito(req.usuario.id);
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo carrito' });
  }
};

export const agregarProductoCarrito = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;
    
    if (!productoId) {
      return res.status(400).json({ error: 'ID de producto requerido' });
    }
    
    const [producto] = await req.db.query(
      'SELECT id, stock FROM productos WHERE id = ? AND eliminado = 0 AND activo = 1',
      [productoId]
    );
    
    if (!producto[0]) {
      return res.status(404).json({ error: 'Producto no disponible' });
    }
    
    const cantidadSolicitada = cantidad || 1;
    const [enCarrito] = await req.db.query(
      'SELECT cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?',
      [req.usuario.id, productoId]
    );
    
    const cantidadActual = enCarrito[0]?.cantidad || 0;
    const nuevoTotal = cantidadActual + cantidadSolicitada;
    
    if (nuevoTotal > producto[0].stock) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Disponible: ${producto[0].stock}` 
      });
    }
    
    const carrito = await agregarAlCarrito(req.usuario.id, productoId, cantidadSolicitada);
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: 'Error agregando al carrito' });
  }
};

export const actualizarCantidad = async (req, res) => {
  try {
    const { productoId } = req.params;
    const { cantidad } = req.body;
    
    if (cantidad === undefined) {
      return res.status(400).json({ error: 'Cantidad requerida' });
    }
    
    if (cantidad > 0) {
      const [producto] = await req.db.query(
        'SELECT stock FROM productos WHERE id = ?',
        [productoId]
      );
      
      if (producto[0].stock < cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente. Disponible: ${producto[0].stock}` 
        });
      }
    }
    
    const carrito = await actualizarCantidadCarrito(req.usuario.id, productoId, cantidad);
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando carrito' });
  }
};

export const eliminarProductoCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const carrito = await eliminarDelCarrito(req.usuario.id, productoId);
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando del carrito' });
  }
};

export const vaciarCarritoUsuario = async (req, res) => {
  try {
    const carrito = await vaciarCarrito(req.usuario.id);
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ error: 'Error vaciando carrito' });
  }
};