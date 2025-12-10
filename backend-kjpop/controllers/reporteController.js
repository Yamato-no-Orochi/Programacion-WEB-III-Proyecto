import PDFDocument from 'pdfkit';
import { db } from '../config/db.js';

export const generarReporteProductos = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const [usuario] = await db.query(
      'SELECT rol FROM usuarios WHERE id = ?',
      [req.userId]
    );
    
    if (!usuario.length || usuario[0].rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    
    const [productos] = await db.query(
      'SELECT * FROM productos WHERE eliminado = 0 ORDER BY categoria, nombre'
    );
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_productos,
        SUM(stock) as total_stock,
        SUM(precio * stock) as valor_inventario
      FROM productos 
      WHERE eliminado = 0
    `);
    
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_productos_${Date.now()}.pdf`);
    doc.pipe(res);
    doc.fontSize(25).text('K-JPop Store - Reporte de Productos', {
      align: 'center',
      underline: true
    });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Generado por: ${req.userEmail || 'Administrador'}`, { align: 'left' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: 'right' });
    doc.moveDown(2);
    doc.fontSize(16).text('ESTADÍSTICAS', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total de productos: ${stats[0]?.total_productos || 0}`);
    doc.text(`Total en stock: ${stats[0]?.total_stock || 0}`);
    doc.text(`Valor del inventario: Bs. ${(stats[0]?.valor_inventario || 0).toFixed(2)}`);
    doc.moveDown(2);
    doc.fontSize(16).text('LISTA DE PRODUCTOS', { underline: true });
    doc.moveDown();
    let yPos = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('ID', 50, yPos);
    doc.text('Nombre', 100, yPos);
    doc.text('Categoría', 250, yPos);
    doc.text('Precio', 350, yPos);
    doc.text('Stock', 420, yPos);
    doc.moveDown();
    doc.font('Helvetica');
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown();
    productos.forEach((producto) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }
      doc.text(producto.id.toString(), 50, doc.y);
      doc.text(producto.nombre.substring(0, 30), 100, doc.y);
      doc.text(producto.categoria, 250, doc.y);
      doc.text(`Bs. ${producto.precio.toFixed(2)}`, 350, doc.y);
      doc.text(producto.stock.toString(), 420, doc.y)
      doc.moveDown();
    });
    
    doc.addPage();
    doc.fontSize(12).text('--- FIN DEL REPORTE ---', {
      align: 'center'
    });
    doc.end();
  } catch (error) {
    console.error('Error generando PDF de productos:', error);
    res.status(500).json({ error: 'Error generando reporte PDF' });
  }
};
export const generarReporteVentas = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    const [usuario] = await db.query(
      'SELECT rol, email FROM usuarios WHERE id = ?',
      [req.userId]
    );
    
    if (!usuario.length || usuario[0].rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    
    const { fechaInicio, fechaFin } = req.query;
    
    let query = `
      SELECT v.*, 
             p.nombre as producto_nombre, 
             p.precio as precio_unitario,
             u.nombre as cliente_nombre,
             u.email as cliente_email
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (fechaInicio) {
      query += ' AND DATE(v.fecha_venta) >= ?';
      params.push(fechaInicio);
    }
    
    if (fechaFin) {
      query += ' AND DATE(v.fecha_venta) <= ?';
      params.push(fechaFin);
    }
    
    query += ' ORDER BY v.fecha_venta DESC';
    
    const [ventas] = await db.query(query, params);
    const totalVentas = ventas.reduce((sum, venta) => sum + (venta.total || venta.cantidad * venta.precio_unitario), 0);
    const totalProductosVendidos = ventas.reduce((sum, venta) => sum + venta.cantidad, 0);
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${Date.now()}.pdf`);
    
    doc.pipe(res);
    doc.fontSize(25).text('K-JPop Store - Reporte de Ventas', { 
      align: 'center',
      underline: true 
    });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Generado por: ${usuario[0].email}`, { align: 'left' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();
    
    if (fechaInicio || fechaFin) {
      doc.fontSize(12).text(`Período: ${fechaInicio || 'Inicio'} al ${fechaFin || 'Hoy'}`);
    }
    
    doc.moveDown();
    doc.fontSize(14).text('RESUMEN DEL PERÍODO', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Total de ventas: ${ventas.length}`);
    doc.text(`Total de productos vendidos: ${totalProductosVendidos}`);
    doc.text(`Ingreso total: Bs. ${totalVentas.toFixed(2)}`);
    doc.moveDown(2);
    doc.fontSize(14).text('DETALLE DE VENTAS', { underline: true });
    doc.moveDown();
    
    if (ventas.length === 0) {
      doc.fontSize(12).text('No hay ventas registradas en este período.', {
        align: 'center'
      });
    } else {
      const startY = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('ID', 50, startY);
      doc.text('Producto', 80, startY);
      doc.text('Cliente', 200, startY);
      doc.text('Cant.', 320, startY);
      doc.text('Total', 380, startY);
      doc.text('Fecha', 450, startY);
      doc.moveDown();
      doc.font('Helvetica');
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // Datos de ventas
      ventas.forEach((venta) => {
        if (doc.y > 700) {
          doc.addPage();
          doc.y = 50;
        }
        const fecha = new Date(venta.fecha_venta || venta.fecha);
        const total = venta.total || (venta.cantidad * venta.precio_unitario);
        
        doc.fontSize(9);
        doc.text(venta.id.toString(), 50, doc.y);
        doc.text(venta.producto_nombre.substring(0, 25), 80, doc.y);
        doc.text(venta.cliente_nombre.substring(0, 20), 200, doc.y);
        doc.text(venta.cantidad.toString(), 320, doc.y);
        doc.text(`Bs. ${total.toFixed(2)}`, 380, doc.y);
        doc.text(fecha.toLocaleDateString(), 450, doc.y);
        doc.moveDown(0.8);
      });
    }
    doc.addPage();
    doc.fontSize(10).text('Este reporte fue generado automáticamente por el sistema K-JPop Store.', {
      align: 'center'
    });
    doc.text('© ' + new Date().getFullYear() + ' K-JPop Store. Todos los derechos reservados.', {
      align: 'center'
    });
    
    doc.end();
    
  } catch (error) {
    console.error('Error generando reporte de ventas:', error);
    res.status(500).json({ 
      error: 'Error generando reporte de ventas',
      detalle: error.message 
    });
  }
};