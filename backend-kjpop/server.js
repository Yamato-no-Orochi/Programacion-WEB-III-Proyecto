import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { verificarConexion } from './config/db.js';
import { db } from './config/db.js';


// Importar rutas
import authRoutes from './routes/authRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';
// Agregar estos imports junto con los otros
import carritoRoutes from './routes/carritoRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';

// Configurar dotenv
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use((req, res, next) => {
  req.db = db;
  next();
});
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de K-JPop Store',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      productos: '/api/productos',
      reportes: '/api/reportes'
    }
  });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/reportes', reporteRoutes);
// Agregar estas rutas después de las otras
app.use('/api/carrito', carritoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend ejecutándose en: http://localhost:${PORT}`);
  await verificarConexion();
});