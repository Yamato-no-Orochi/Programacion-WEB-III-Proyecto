import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kjpop_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const verificarConexion = async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Conectado a MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
};
