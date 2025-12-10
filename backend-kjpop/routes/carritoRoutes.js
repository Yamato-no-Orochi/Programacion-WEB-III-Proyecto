import express from 'express';
import {
  obtenerCarritoUsuario,
  agregarProductoCarrito,
  actualizarCantidad,
  eliminarProductoCarrito,
  vaciarCarritoUsuario
} from '../controllers/carritoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verificarToken);
router.get('/', obtenerCarritoUsuario);
router.post('/agregar', agregarProductoCarrito);
router.put('/:productoId', actualizarCantidad);
router.delete('/:productoId', eliminarProductoCarrito);
router.delete('/', vaciarCarritoUsuario);

export default router;