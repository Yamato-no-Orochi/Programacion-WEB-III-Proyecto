import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. Token requerido.' 
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado.' 
    });
  }
};

export const esAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso restringido. Se requiere rol de administrador.' 
    });
  }
  next();
};

export const esVendedorOAdmin = (req, res, next) => {
  if (!['admin', 'vendedor'].includes(req.usuario.rol)) {
    return res.status(403).json({ 
      error: 'Acceso restringido.' 
    });
  }
  next();
};