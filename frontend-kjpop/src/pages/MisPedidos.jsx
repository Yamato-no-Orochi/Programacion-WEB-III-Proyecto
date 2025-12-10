import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, 
  Badge, Button, Alert, Spinner, Accordion
} from 'react-bootstrap';
import { 
  FaBox, FaTruck, FaCheckCircle, FaClock, 
  FaTimesCircle, FaEye, FaPrint, FaShoppingBag
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      cargarPedidos();
    }
  }, [usuario]);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const response = await axios.get('http://localhost:3001/api/pedidos/mis-pedidos');
      setPedidos(response.data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      Swal.fire('Error', 'No se pudieron cargar los pedidos', 'error');
    } finally {
      setCargando(false);
    }
  };

  const verDetallePedido = async (pedidoId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/pedidos/${pedidoId}`);
      setPedidoSeleccionado(response.data);
    } catch (error) {
      Swal.fire('Error', 'Error cargando detalle del pedido', 'error');
    }
  };

  const getEstadoIcono = (estado) => {
    switch(estado) {
      case 'pendiente':
        return <FaClock className="text-warning" />;
      case 'procesando':
        return <FaBox className="text-info" />;
      case 'enviado':
        return <FaTruck className="text-primary" />;
      case 'entregado':
        return <FaCheckCircle className="text-success" />;
      case 'cancelado':
        return <FaTimesCircle className="text-danger" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente':
        return 'warning';
      case 'procesando':
        return 'info';
      case 'enviado':
        return 'primary';
      case 'entregado':
        return 'success';
      case 'cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generarRecibo = (pedido) => {
    const contenido = `
      <html>
        <head>
          <title>Recibo Pedido #${pedido.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>K-JPop Store</h1>
            <h2>Recibo de Pedido</h2>
          </div>
          
          <div class="info">
            <p><strong>Pedido #:</strong> ${pedido.id}</p>
            <p><strong>Fecha:</strong> ${formatearFecha(pedido.creado_en)}</p>
            <p><strong>Estado:</strong> ${pedido.estado}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${pedido.items?.map(item => `
                <tr>
                  <td>${item.nombre}</td>
                  <td>${item.cantidad}</td>
                  <td>Bs. ${parseFloat(item.precio_unitario).toFixed(2)}</td>
                  <td>Bs. ${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p><strong>Total:</strong> Bs. ${parseFloat(pedido.total).toFixed(2)}</p>
          </div>
          
          <div class="footer">
            <p>Gracias por tu compra en K-JPop Store</p>
            <p>Contacto: contacto@kjpopstore.com</p>
          </div>
        </body>
      </html>
    `;
    const ventana = window.open('', '_blank');
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.print();
  };

  if (!usuario) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">
          <FaShoppingBag className="me-2" size={24} />
          <h4>Debes iniciar sesión para ver tus pedidos</h4>
          <Button 
            variant="primary" 
            className="mt-3"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </Button>
        </Alert>
      </Container>
    );
  }

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando pedidos...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>
            <FaShoppingBag className="me-2" />
            Mis Pedidos
          </h2>
          <p className="text-muted">
            Historial y seguimiento de tus compras
          </p>
        </Col>
        
        <Col xs="auto">
          <Button variant="outline-primary" onClick={() => navigate('/catalogo')}>
            Seguir comprando
          </Button>
        </Col>
      </Row>

      {pedidos.length === 0 ? (
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <FaBox size={64} className="text-muted mb-3" />
            <h4>No tienes pedidos aún</h4>
            <p className="text-muted mb-4">
              Realiza tu primera compra en nuestra tienda
            </p>
            <Button variant="primary" onClick={() => navigate('/catalogo')}>
              Ver catálogo
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            <Col lg={pedidoSeleccionado ? 7 : 12}>
              <Card className="shadow">
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Pedido #</th>
                          <th>Fecha</th>
                          <th>Total</th>
                          <th>Estado</th>
                          <th>Productos</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidos.map((pedido) => (
                          <tr key={pedido.id}>
                            <td>
                              <strong>#{pedido.id}</strong>
                            </td>
                            <td>
                              {formatearFecha(pedido.creado_en)}
                            </td>
                            <td>
                              <strong>Bs. {parseFloat(pedido.total).toFixed(2)}</strong>
                            </td>
                            <td>
                              <Badge bg={getEstadoColor(pedido.estado)}>
                                {getEstadoIcono(pedido.estado)}
                                <span className="ms-2">{pedido.estado}</span>
                              </Badge>
                            </td>
                            <td>
                              {pedido.total_productos || 0} items
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => verDetallePedido(pedido.id)}
                                  title="Ver detalles"
                                >
                                  <FaEye />
                                </Button>
                                
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => {
                                    axios.get(`http://localhost:3001/api/pedidos/${pedido.id}`)
                                      .then(response => {
                                        generarRecibo(response.data);
                                      });
                                  }}
                                  title="Imprimir recibo"
                                >
                                  <FaPrint />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            {pedidoSeleccionado && (
              <Col lg={5}>
                <Card className="shadow sticky-top" style={{ top: '20px' }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <Card.Title>
                        <h4>Pedido #{pedidoSeleccionado.id}</h4>
                      </Card.Title>
                      <Button 
                        variant="link" 
                        className="text-muted"
                        onClick={() => setPedidoSeleccionado(null)}
                      >
                        Cerrar
                      </Button>
                    </div>
                    
                    <div className="mb-4">
                      <h6>Información del pedido</h6>
                      <div className="small">
                        <p><strong>Fecha:</strong> {formatearFecha(pedidoSeleccionado.creado_en)}</p>
                        <p>
                          <strong>Estado:</strong>{' '}
                          <Badge bg={getEstadoColor(pedidoSeleccionado.estado)}>
                            {pedidoSeleccionado.estado}
                          </Badge>
                        </p>
                        <p><strong>Dirección:</strong> {pedidoSeleccionado.direccion_envio}</p>
                        <p><strong>Teléfono:</strong> {pedidoSeleccionado.telefono}</p>
                        {pedidoSeleccionado.notas && (
                          <p><strong>Notas:</strong> {pedidoSeleccionado.notas}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h6>Productos</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Cantidad</th>
                              <th>Precio</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedidoSeleccionado.items?.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {item.imagen_url && (
                                      <img 
                                        src={item.imagen_url} 
                                        alt={item.nombre}
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                                        className="rounded"
                                      />
                                    )}
                                    <span>{item.nombre}</span>
                                  </div>
                                </td>
                                <td>{item.cantidad}</td>
                                <td>Bs. {parseFloat(item.precio_unitario).toFixed(2)}</td>
                                <td>Bs. {parseFloat(item.subtotal).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="border-top pt-3">
                      <div className="d-flex justify-content-between">
                        <strong>Total:</strong>
                        <strong className="text-primary fs-5">
                          Bs. {parseFloat(pedidoSeleccionado.total).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline-primary" 
                        className="w-100"
                        onClick={() => generarRecibo(pedidoSeleccionado)}
                      >
                        <FaPrint className="me-2" />
                        Imprimir recibo
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
          
          {}
          <Card className="mt-4 shadow-sm">
            <Card.Body>
              <h5 className="mb-4">¿Qué significan los estados?</h5>
              <Row>
                <Col md={3} className="text-center">
                  <FaClock size={30} className="text-warning mb-2" />
                  <h6>Pendiente</h6>
                  <p className="small text-muted">
                    Tu pedido está siendo revisado
                  </p>
                </Col>
                
                <Col md={3} className="text-center">
                  <FaBox size={30} className="text-info mb-2" />
                  <h6>Procesando</h6>
                  <p className="small text-muted">
                    Preparando tu pedido para envío
                  </p>
                </Col>
                
                <Col md={3} className="text-center">
                  <FaTruck size={30} className="text-primary mb-2" />
                  <h6>Enviado</h6>
                  <p className="small text-muted">
                    Tu pedido está en camino
                  </p>
                </Col>
                
                <Col md={3} className="text-center">
                  <FaCheckCircle size={30} className="text-success mb-2" />
                  <h6>Entregado</h6>
                  <p className="small text-muted">
                    Pedido recibido satisfactoriamente
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default MisPedidos;