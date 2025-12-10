import express from 'express';
const reporteController = require('../controllers/reporteController');
const { authenticate } = require('../middlewares/authMiddleware');
router.use(authenticate);
router.get('/productos', reporteController.generarReporteProductos);
router.get('/ventas', reporteController.generarReporteVentas);

module.exports = router;
import {
  generarReporteProductos,
  generarReporteVentas
} from '../controllers/reporteController.js';
import { verificarToken, esVendedorOAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verificarToken);
router.use(esVendedorOAdmin);
router.get('/productos', generarReporteProductos);
router.get('/ventas', generarReporteVentas);

export default router;