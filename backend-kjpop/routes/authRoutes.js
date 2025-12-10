import express from 'express';
import { registrarUsuario, loginUsuario, obtenerPerfil } from '../controllers/authController.js';
import { validarRegistro, validarLogin } from '../middlewares/validators.js';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { validarCaptcha } from '../middlewares/captchaMiddleware.js';

const router = express.Router();

router.post('/registro', validarRegistro, registrarUsuario);
router.post('/login', validarLogin,  loginUsuario);
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;