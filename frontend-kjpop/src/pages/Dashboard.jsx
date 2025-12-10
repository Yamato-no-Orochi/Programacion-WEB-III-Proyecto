import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, 
  ProgressBar, Alert 
} from 'react-bootstrap';
import { 
  FaShoppingCart, FaBox, FaUsers, FaChartLine,
  FaArrowUp, FaArrowDown, FaEye
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    totalProductos: 0,
    totalStock: 0,
    valorInventario: 0,
    productosBajoStock: 0,
    ultimosProductos: []
  });
  
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try { 
      const [productosResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/productos')
      ]);
      
      const productos = productosResponse.data.filter(p => !p.eliminado);
      const totalProductos = productos.length;
      const totalStock = productos.reduce((sum, p) => sum + (p.stock || 0), 0);
      const valorInventario = productos.reduce((sum, p) => sum + (p.precio * (p.stock || 0)), 0);
      const productosBajoStock = productos.filter(p => p.stock < 10).length;
      const ultimosProductos = productos.slice(0, 5);
      
      setEstadisticas({
        totalProductos,
        totalStock,
        valorInventario,
        productosBajoStock,
        ultimosProductos
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setCargando(false);
    }
  };

  const MetricCard = ({ title, value, icon, variant, change }) => (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className="mb-0">{value}</h3>
            {change && (
              <small className={`d-flex align-items-center ${change > 0 ? 'text-success' : 'text-danger'}`}>
                {change > 0 ? <FaArrowUp /> : <FaArrowDown />}
                {Math.abs(change)}%
              </small>
            )}
          </div>
          <div className={`icon-circle bg-${variant} text-white`}>
            {icon}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      {}
      <Row className="mb-4">
        <Col>
          <h2>Bienvenido, {usuario?.nombre}!</h2>
          <p className="text-muted">
            Panel de control de K-JPop Store
            {usuario?.rol === 'admin' && ' (Administrador)'}
          </p>
        </Col>
      </Row>

      {/* Métricas */}
      <Row className="mb-4">
        <Col md={3}>
          <MetricCard
            title="Total Productos"
            value={estadisticas.totalProductos}
            icon={<FaBox size={20} />}
            variant="primary"
            change={5}
          />
        </Col>
        
        <Col md={3}>
          <MetricCard
            title="Stock Total"
            value={estadisticas.totalStock}
            icon={<FaShoppingCart size={20} />}
            variant="success"
            change={12}
          />
        </Col>
        
        <Col md={3}>
          <MetricCard
            title="Valor Inventario"
            value={`Bs. ${estadisticas.valorInventario.toFixed(2)}`}
            icon={<FaChartLine size={20} />}
            variant="info"
            change={8}
          />
        </Col>
        
        <Col md={3}>
          <MetricCard
            title="Bajo Stock"
            value={estadisticas.productosBajoStock}
            icon={<FaUsers size={20} />}
            variant="warning"
            change={-2}
          />
        </Col>
      </Row>

      {}
      {estadisticas.productosBajoStock > 0 && (
        <Alert variant="warning" className="mb-4">
          <FaEye className="me-2" />
          <strong>Alerta:</strong> Tienes {estadisticas.productosBajoStock} productos con stock bajo (menos de 10 unidades).
          <Link to="/products" className="alert-link ms-2">
            Ver productos
          </Link>
        </Alert>
      )}

      {}
      <Row>
        <Col lg={8}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="d-flex justify-content-between align-items-center">
                <span>Últimos Productos</span>
                <Link to="/products">
                  <Button variant="outline-primary" size="sm">
                    Ver todos
                  </Button>
                </Link>
              </Card.Title>
              
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadisticas.ultimosProductos.map((producto) => (
                      <tr key={producto.id}>
                        <td>
                          <div>
                            <strong>{producto.nombre}</strong>
                            {producto.descripcion && (
                              <small className="d-block text-muted">
                                {producto.descripcion.substring(0, 40)}...
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${producto.categoria === 'K-pop' ? 'primary' : 'success'}`}>
                            {producto.categoria}
                          </span>
                        </td>
                        <td>Bs. {parseFloat(producto.precio).toFixed(2)}</td>
                        <td>
                          <div>
                            {producto.stock} unidades
                            {producto.stock < 10 && (
                              <ProgressBar 
                                now={(producto.stock / 10) * 100} 
                                variant="warning" 
                                className="mt-1"
                              />
                            )}
                          </div>
                        </td>
                        <td>
                          {producto.activo ? (
                            <span className="badge bg-success">Activo</span>
                          ) : (
                            <span className="badge bg-secondary">Inactivo</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {}
          <Card className="shadow mb-4">
            <Card.Body>
              <Card.Title>Acciones Rápidas</Card.Title>
              <div className="d-grid gap-2 mt-3">
                <Button as={Link} to="/products/new" variant="primary">
                  <FaBox className="me-2" />
                  Nuevo Producto
                </Button>
                
                {usuario?.rol === 'admin' && (
                  <Button as={Link} to="/reports" variant="outline-success">
                    <FaChartLine className="me-2" />
                    Generar Reportes
                  </Button>
                )}
                
                <Button as={Link} to="/products" variant="outline-info">
                  <FaEye className="me-2" />
                  Ver Productos
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {}
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Resumen</Card.Title>
              <ul className="list-unstyled mt-3">
                <li className="mb-2">
                  <small className="text-muted">Productos activos:</small>
                  <div className="fw-bold">{estadisticas.totalProductos}</div>
                </li>
                <li className="mb-2">
                  <small className="text-muted">Valor total del inventario:</small>
                  <div className="fw-bold">Bs. {estadisticas.valorInventario.toFixed(2)}</div>
                </li>
                <li className="mb-2">
                  <small className="text-muted">Productos por categoría:</small>
                  <div className="small">
                    <div className="d-flex justify-content-between">
                      <span>K-pop</span>
                      <span>
                        {estadisticas.ultimosProductos.filter(p => p.categoria === 'K-pop').length}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>J-pop</span>
                      <span>
                        {estadisticas.ultimosProductos.filter(p => p.categoria === 'J-pop').length}
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;