import express from 'express';
import {
  listarProductos,
  obtenerProducto,
  agregarProducto,
  actualizarProductoController,
  eliminarProductoController,
  restaurarProductoController
} from '../controllers/productoController.js';
import { validarProducto } from '../middlewares/validators.js';
import { verificarToken, esVendedorOAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', listarProductos); 
router.get('/:id', obtenerProducto); 
router.post('/', verificarToken, esVendedorOAdmin, validarProducto, agregarProducto);
router.put('/:id', verificarToken, esVendedorOAdmin, validarProducto, actualizarProductoController);
router.delete('/:id', verificarToken, esVendedorOAdmin, eliminarProductoController);
router.patch('/:id/restaurar', verificarToken, esVendedorOAdmin, restaurarProductoController);

export default router;