import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, 
  Table, Form, Alert, Spinner, Badge,
  InputGroup, Modal
} from 'react-bootstrap';
import { 
  FaShoppingCart, FaTrash, FaPlus, FaMinus, 
  FaCreditCard, FaHome, FaPhone, FaUser
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Carrito = () => {
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [cargando, setCargando] = useState(true);
  const [datosEnvio, setDatosEnvio] = useState({
    direccion_envio: '',
    telefono: '',
    notas: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [procesandoPedido, setProcesandoPedido] = useState(false);
  
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      cargarCarrito();
    } else {
      setCargando(false);
    }
  }, [usuario]);

  const cargarCarrito = async () => {
    try {
      setCargando(true);
      const response = await axios.get('http://localhost:3001/api/carrito');
      setCarrito(response.data);
    } catch (error) {
      console.error('Error cargando carrito:', error);
    } finally {
      setCargando(false);
    }
  };

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    try {
      await axios.put(`http://localhost:3001/api/carrito/${productoId}`, {
        cantidad: nuevaCantidad
      });
      cargarCarrito();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error actualizando cantidad', 'error');
    }
  };

  const eliminarProducto = async (productoId) => {
    const resultado = await Swal.fire({
      title: '¿Eliminar producto?',
      text: '¿Estás seguro de eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/api/carrito/${productoId}`);
        cargarCarrito();
        Swal.fire('Eliminado', 'Producto eliminado del carrito', 'success');
      } catch (error) {
        Swal.fire('Error', 'Error eliminando producto', 'error');
      }
    }
  };

  const vaciarCarrito = async () => {
    const resultado = await Swal.fire({
      title: '¿Vaciar carrito?',
      text: '¿Estás seguro de vaciar todo el carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        await axios.delete('http://localhost:3001/api/carrito');
        setCarrito({ items: [], total: 0 });
        Swal.fire('Vacío', 'Carrito vaciado exitosamente', 'success');
      } catch (error) {
        Swal.fire('Error', 'Error vaciando carrito', 'error');
      }
    }
  };

  const crearPedido = async () => {
    if (!datosEnvio.direccion_envio.trim()) {
      Swal.fire('Error', 'La dirección de envío es requerida', 'error');
      return;
    }

    if (!datosEnvio.telefono.trim()) {
      Swal.fire('Error', 'El teléfono es requerido', 'error');
      return;
    }

    setProcesandoPedido(true);

    try {
      const response = await axios.post('http://localhost:3001/api/pedidos/crear', datosEnvio);
      
      Swal.fire({
        title: '¡Pedido creado!',
        html: `
          <div class="text-start">
            <p><strong>Pedido #${response.data.pedido.id}</strong></p>
            <p>Total: <strong>Bs. ${response.data.pedido.total}</strong></p>
            <p>Estado: <span class="badge bg-warning">Pendiente</span></p>
            <p class="mt-3">Te contactaremos para confirmar el envío.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Ver mis pedidos'
      }).then(() => {
        navigate('/mis-pedidos');
      });
      
      setShowModal(false);
      setDatosEnvio({ direccion_envio: '', telefono: '', notas: '' });
      
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error creando pedido', 'error');
    } finally {
      setProcesandoPedido(false);
    }
  };

  if (!usuario) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">
          <FaShoppingCart className="me-2" size={24} />
          <h4>Debes iniciar sesión para ver el carrito</h4>
          <p className="mt-3">
            <Button variant="primary" onClick={() => navigate('/login')}>
              Iniciar sesión
            </Button>
            <Button variant="outline-primary" className="ms-2" onClick={() => navigate('/register')}>
              Registrarse
            </Button>
          </p>
        </Alert>
      </Container>
    );
  }

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando carrito...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>
            <FaShoppingCart className="me-2" />
            Mi Carrito
          </h2>
          <p className="text-muted">
            Revisa y gestiona los productos en tu carrito
          </p>
        </Col>
        
        {carrito.items.length > 0 && (
          <Col xs="auto">
            <Button variant="outline-danger" onClick={vaciarCarrito}>
              <FaTrash className="me-2" />
              Vaciar carrito
            </Button>
          </Col>
        )}
      </Row>

      {carrito.items.length === 0 ? (
        <Card className="shadow">
          <Card.Body className="text-center py-5">
            <FaShoppingCart size={64} className="text-muted mb-3" />
            <h4>Tu carrito está vacío</h4>
            <p className="text-muted mb-4">
              Agrega productos de K-pop y J-pop a tu carrito
            </p>
            <Button variant="primary" onClick={() => navigate('/catalogo')}>
              Ver catálogo de productos
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            <Col lg={8}>
              <Card className="shadow mb-4">
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th>Subtotal</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carrito.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.imagen_url ? (
                                  <img 
                                    src={item.imagen_url} 
                                    alt={item.nombre}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px' }}
                                    className="rounded"
                                  />
                                ) : (
                                  <div 
                                    className="bg-light d-flex align-items-center justify-content-center rounded"
                                    style={{ width: '60px', height: '60px', marginRight: '15px' }}
                                  >
                                    <FaShoppingCart className="text-muted" />
                                  </div>
                                )}
                                <div>
                                  <strong>{item.nombre}</strong>
                                  <div className="small text-muted">
                                    <Badge bg={item.categoria === 'K-pop' ? 'primary' : 'success'}>
                                      {item.categoria}
                                    </Badge>
                                    <span className="ms-2">
                                      Stock: {item.stock}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong>Bs. {parseFloat(item.precio).toFixed(2)}</strong>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                                  disabled={item.cantidad <= 1}
                                >
                                  <FaMinus />
                                </Button>
                                
                                <Form.Control
                                  type="number"
                                  value={item.cantidad}
                                  onChange={(e) => {
                                    const nuevaCantidad = parseInt(e.target.value) || 1;
                                    if (nuevaCantidad >= 1 && nuevaCantidad <= item.stock) {
                                      actualizarCantidad(item.producto_id, nuevaCantidad);
                                    }
                                  }}
                                  min="1"
                                  max={item.stock}
                                  style={{ width: '70px', margin: '0 10px' }}
                                />
                                
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                                  disabled={item.cantidad >= item.stock}
                                >
                                  <FaPlus />
                                </Button>
                              </div>
                            </td>
                            <td>
                              <strong className="text-primary">
                                Bs. {(item.precio * item.cantidad).toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => eliminarProducto(item.producto_id)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
              
              <Card className="shadow">
                <Card.Body>
                  <h5>Información importante</h5>
                  <ul className="mt-3">
                    <li>Los precios incluyen todos los impuestos.</li>
                    <li>Envío gratuito en compras mayores a Bs. 300.</li>
                    <li>Tiempo de entrega estimado: 3-5 días hábiles.</li>
                    <li>Puedes modificar tu pedido antes de finalizar la compra.</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="shadow sticky-top" style={{ top: '20px' }}>
                <Card.Body>
                  <Card.Title className="mb-4">
                    <h4>Resumen del pedido</h4>
                  </Card.Title>
                  
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>Bs. {carrito.total.toFixed(2)}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-2">
                      <span>Envío:</span>
                      <span>
                        {carrito.total >= 300 ? (
                          <span className="text-success">Gratis</span>
                        ) : (
                          'Bs. 25.00'
                        )}
                      </span>
                    </div>
                    
                    <hr />
                    
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total:</span>
                      <span className="text-primary">
                        Bs. {(carrito.total + (carrito.total >= 300 ? 0 : 25)).toFixed(2)}
                      </span>
                    </div>
                    
                    {carrito.total >= 300 && (
                      <div className="mt-2">
                        <Badge bg="success">
                          ¡Envío gratis aplicado!
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-100 mb-3"
                    onClick={() => setShowModal(true)}
                  >
                    <FaCreditCard className="me-2" />
                    Proceder al pago
                  </Button>
                  
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => navigate('/catalogo')}
                  >
                    Seguir comprando
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>
                <FaCreditCard className="me-2" />
                Finalizar compra
              </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
              <h5 className="mb-4">Información de envío</h5>
              
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    Nombre completo
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={usuario.nombre}
                    disabled
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaHome className="me-2" />
                    Dirección de envío *
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={datosEnvio.direccion_envio}
                    onChange={(e) => setDatosEnvio({...datosEnvio, direccion_envio: e.target.value})}
                    placeholder="Calle, número, colonia, ciudad, código postal"
                    required
                  />
                  <Form.Text className="text-muted">
                    Asegúrate de que la dirección sea correcta
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaPhone className="me-2" />
                    Teléfono de contacto *
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    value={datosEnvio.telefono}
                    onChange={(e) => setDatosEnvio({...datosEnvio, telefono: e.target.value})}
                    placeholder="Ej: 7771234567"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Notas adicionales (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={datosEnvio.notas}
                    onChange={(e) => setDatosEnvio({...datosEnvio, notas: e.target.value})}
                    placeholder="Instrucciones especiales para la entrega"
                  />
                </Form.Group>
                
                <Card className="mb-4">
                  <Card.Body>
                    <h6>Resumen final</h6>
                    <div className="d-flex justify-content-between">
                      <span>Total productos:</span>
                      <span>{carrito.items.reduce((sum, item) => sum + item.cantidad, 0)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal:</span>
                      <span>Bs. {carrito.total.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Envío:</span>
                      <span>
                        {carrito.total >= 300 ? 'Gratis' : 'Bs. 25.00'}
                      </span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total a pagar:</span>
                      <span className="text-primary">
                        Bs. {(carrito.total + (carrito.total >= 300 ? 0 : 25)).toFixed(2)}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Form>
            </Modal.Body>
            
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              
              <Button 
                variant="primary" 
                onClick={crearPedido}
                disabled={procesandoPedido || !datosEnvio.direccion_envio || !datosEnvio.telefono}
              >
                {procesandoPedido ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar pedido'
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Carrito;