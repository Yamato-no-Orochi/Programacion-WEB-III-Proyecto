import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  restaurarProducto
} from '../models/productoModel.js';

export const listarProductos = async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
};

export const obtenerProducto = async (req, res) => {
  try {
    const producto = await obtenerProductoPorId(req.params.id);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo producto' });
  }
};

export const agregarProducto = async (req, res) => {
  try {
    const producto = await crearProducto(req.body);
    res.status(201).json({
      mensaje: 'Producto creado exitosamente',
      producto
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creando producto' });
  }
};

export const actualizarProductoController = async (req, res) => {
  try {
    const producto = await actualizarProducto(req.params.id, req.body);
    
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json({
      mensaje: 'Producto actualizado exitosamente',
      producto
    });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando producto' });
  }
};

export const eliminarProductoController = async (req, res) => {
  try {
    await eliminarProducto(req.params.id);
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando producto' });
  }
};

export const restaurarProductoController = async (req, res) => {
  try {
    await restaurarProducto(req.params.id);
    res.json({ mensaje: 'Producto restaurado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error restaurando producto' });
  }
};