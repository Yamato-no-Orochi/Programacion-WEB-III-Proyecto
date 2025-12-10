import { body, validationResult } from 'express-validator';

const validarFortalezaPassword = (password) => {
  let fortaleza = 'débil';
  
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
    fortaleza = 'fuerte';
  } else if (password.length >= 6) {
    fortaleza = 'intermedio';
  }
  return fortaleza;
};

export const validarRegistro = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3 }).withMessage('Mínimo 3 caracteres'),
  
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido'),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
    .custom((password) => {
      const fortaleza = validarFortalezaPassword(password);
      if (fortaleza === 'débil') {
        throw new Error('Contraseña muy débil. Use mayúsculas, números y símbolos');
      }
      return true;
    }),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];
export const validarLogin = [
  body('email')
    .notEmpty().withMessage('Email requerido')
    .isEmail().withMessage('Email inválido'),
  
  body('password')
    .notEmpty().withMessage('Contraseña requerida'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];
export const validarProducto = [
  body('nombre')
    .notEmpty().withMessage('Nombre del producto requerido')
    .isLength({ min: 3 }).withMessage('Mínimo 3 caracteres'),
  
  body('categoria')
    .notEmpty().withMessage('Categoría requerida')
    .isIn(['K-pop', 'J-pop', 'Merchandise', 'Álbum']).withMessage('Categoría inválida'),
  
  body('precio')
    .notEmpty().withMessage('Precio requerido')
    .isFloat({ min: 0.01 }).withMessage('Precio debe ser mayor a 0'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock no puede ser negativo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  }
];