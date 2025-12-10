import express from 'express';
import {
  crearNuevoPedido,
  obtenerMisPedidos,
  obtenerDetallePedido,
  obtenerTodosLosPedidos,
  actualizarEstado
} from '../controllers/pedidoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verificarToken);
router.post('/crear', crearNuevoPedido);
router.get('/mis-pedidos', obtenerMisPedidos);
router.get('/:id', obtenerDetallePedido);
router.get('/', obtenerTodosLosPedidos);
router.put('/:id/estado', actualizarEstado);

export default router;