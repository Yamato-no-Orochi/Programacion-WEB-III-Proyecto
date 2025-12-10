import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, 
  Badge, Alert, Spinner, Form, ListGroup, 
  Tabs, Tab, Image, Breadcrumb
} from 'react-bootstrap';
import { 
  FaShoppingCart, FaHeart, FaStar, FaStarHalfAlt,
  FaTruck, FaShieldAlt, FaUndo, FaTag,
  FaPlus, FaMinus, FaShareAlt
} from 'react-icons/fa';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [productosRelacionados, setProductosRelacionados] = useState([]);

  useEffect(() => {
    cargarProducto();
  }, [id]);

  const cargarProducto = async () => {
    try {
      setCargando(true);
      const response = await axios.get(`http://localhost:3001/api/productos/${id}`);
      
      if (response.data.eliminado || !response.data.activo) {
        navigate('/catalogo');
        return;
      }
      
      setProducto(response.data);
      cargarProductosRelacionados(response.data.categoria, response.data.id);
    } catch (error) {
      console.error('Error cargando producto:', error);
      navigate('/catalogo');
    } finally {
      setCargando(false);
    }
  };

  const cargarProductosRelacionados = async (categoria, productoId) => {
    try {
      const response = await axios.get('http://localhost:3001/api/productos');
      const relacionados = response.data
        .filter(p => 
          p.categoria === categoria && 
          p.id !== productoId && 
          !p.eliminado && 
          p.activo
        )
        .slice(0, 4);
      setProductosRelacionados(relacionados);
    } catch (error) {
      console.error('Error cargando productos relacionados:', error);
    }
  };

  const agregarAlCarrito = async () => {
    if (!usuario) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar productos al carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Iniciar sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    if (cantidad > producto.stock) {
      Swal.fire('Error', `Stock insuficiente. Disponible: ${producto.stock}`, 'error');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/carrito/agregar', {
        productoId: producto.id,
        cantidad
      });
      
      Swal.fire({
        title: '¡Agregado!',
        text: 'Producto agregado al carrito',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.error || 'Error al agregar al carrito', 'error');
    }
  };

  const aumentarCantidad = () => {
    if (cantidad < producto.stock) {
      setCantidad(cantidad + 1);
    }
  };

  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando producto...</span>
        </Spinner>
      </Container>
    );
  }

  if (!producto) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Producto no encontrado o no disponible
        </Alert>
        <Button variant="primary" onClick={() => navigate('/catalogo')}>
          Volver al catálogo
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid>
      {}
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Inicio
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/catalogo' }}>
          Catálogo
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          {producto.nombre}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mt-4">
        {}
        <Col lg={5}>
          <Card className="shadow mb-4">
            <Card.Body className="text-center p-4">
              {producto.imagen_url ? (
                <Image
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  fluid
                  rounded
                  className="product-image-large"
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              ) : (
                <div 
                  className="bg-light d-flex align-items-center justify-content-center rounded"
                  style={{ height: '300px' }}
                >
                  <FaShoppingCart size={80} className="text-muted" />
                </div>
              )}
              
              <div className="mt-4">
                <Button 
                  variant="outline-secondary" 
                  className="me-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    Swal.fire('¡Copiado!', 'Enlace copiado al portapapeles', 'success');
                  }}
                >
                  <FaShareAlt className="me-2" />
                  Compartir
                </Button>
                
                <Button variant="outline-danger">
                  <FaHeart className="me-2" />
                  Favorito
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {}
          <Card className="shadow-sm">
            <Card.Body>
              <h6 className="mb-3">Beneficios</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="border-0">
                  <FaTruck className="text-primary me-2" />
                  <strong>Envío gratis</strong> en compras mayores a Bs. 300
                </ListGroup.Item>
                <ListGroup.Item className="border-0">
                  <FaShieldAlt className="text-success me-2" />
                  <strong>Producto original</strong> con garantía
                </ListGroup.Item>
                <ListGroup.Item className="border-0">
                  <FaUndo className="text-warning me-2" />
                  <strong>Devoluciones</strong> dentro de los 15 días
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {}
        <Col lg={7}>
          <Card className="shadow mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Badge bg={producto.categoria === 'K-pop' ? 'primary' : 'success'} className="mb-2">
                    {producto.categoria}
                  </Badge>
                  <h1 className="h3 mb-2">{producto.nombre}</h1>
                  
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-warning me-2">
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStar />
                      <FaStarHalfAlt />
                    </div>
                    <span className="text-muted">(4.5/5.0) • 128 reseñas</span>
                  </div>
                </div>
                
                <div className="text-end">
                  <div className="h2 text-primary mb-0">
                    Bs. {parseFloat(producto.precio).toFixed(2)}
                  </div>
                  {producto.stock <= 10 && producto.stock > 0 && (
                    <Badge bg="warning" className="mt-1">
                      ¡Últimas {producto.stock} unidades!
                    </Badge>
                  )}
                </div>
              </div>

              {}
              <div className="mb-4">
                {producto.stock > 0 ? (
                  <Badge bg="success" className="p-2">
                    <FaTag className="me-1" />
                    En stock: {producto.stock} unidades disponibles
                  </Badge>
                ) : (
                  <Badge bg="danger" className="p-2">
                    Agotado temporalmente
                  </Badge>
                )}
              </div>

              {}
              <div className="mb-4">
                <h5>Descripción</h5>
                <p className="text-muted">
                  {producto.descripcion || 'Descripción no disponible.'}
                </p>
              </div>

              {}
              <div className="border-top border-bottom py-4 mb-4">
                <Row className="align-items-center">
                  <Col md={4}>
                    <h6 className="mb-3">Cantidad</h6>
                    <div className="d-flex align-items-center">
                      <Button 
                        variant="outline-secondary" 
                        onClick={disminuirCantidad}
                        disabled={cantidad <= 1}
                      >
                        <FaMinus />
                      </Button>
                      
                      <Form.Control
                        type="number"
                        value={cantidad}
                        onChange={(e) => {
                          const valor = parseInt(e.target.value) || 1;
                          if (valor >= 1 && valor <= producto.stock) {
                            setCantidad(valor);
                          }
                        }}
                        min="1"
                        max={producto.stock}
                        style={{ width: '80px', margin: '0 10px' }}
                      />
                      
                      <Button 
                        variant="outline-secondary" 
                        onClick={aumentarCantidad}
                        disabled={cantidad >= producto.stock}
                      >
                        <FaPlus />
                      </Button>
                    </div>
                  </Col>
                  
                  <Col md={8}>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={agregarAlCarrito}
                        disabled={producto.stock === 0}
                      >
                        <FaShoppingCart className="me-2" />
                        {producto.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                      </Button>
                      
                      <Button 
                        variant="outline-primary" 
                        size="lg"
                        onClick={() => navigate('/carrito')}
                      >
                        Comprar ahora
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>

              {}
              <Tabs defaultActiveKey="detalles" className="mb-3">
                <Tab eventKey="detalles" title="Detalles">
                  <div className="p-3">
                    <h6>Especificaciones</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Categoría:</strong> {producto.categoria}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>SKU:</strong> KJPOP-{producto.id.toString().padStart(4, '0')}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Fecha de publicación:</strong>{' '}
                        {new Date(producto.creado_en).toLocaleDateString('es-ES')}
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                </Tab>
                
                <Tab eventKey="envio" title="Envío">
                  <div className="p-3">
                    <h6>Información de envío</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <FaTruck className="text-primary me-2" />
                        <strong>Costo de envío:</strong> Gratis en compras mayores a Bs. 300
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Tiempo de entrega:</strong> 3-5 días hábiles
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Zonas de cobertura:</strong> Todo el país
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Métodos de envío:</strong> Estafeta, DHL, Correos
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {}
      {productosRelacionados.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-4">Productos relacionados</h3>
          <Row xs={1} md={2} lg={4} className="g-4">
            {productosRelacionados.map((productoRel) => (
              <Col key={productoRel.id}>
                <Card className="h-100 shadow-sm product-card">
                  <div className="position-relative">
                    {productoRel.imagen_url ? (
                      <Card.Img 
                        variant="top" 
                        src={productoRel.imagen_url} 
                        alt={productoRel.nombre}
                        style={{ height: '180px', objectFit: 'cover' }}
                        onClick={() => navigate(`/producto/${productoRel.id}`)}
                        className="cursor-pointer"
                      />
                    ) : (
                      <div 
                        className="bg-light d-flex align-items-center justify-content-center cursor-pointer"
                        style={{ height: '180px' }}
                        onClick={() => navigate(`/producto/${productoRel.id}`)}
                      >
                        <FaShoppingCart size={40} className="text-muted" />
                      </div>
                    )}
                    
                    <Badge 
                      bg={productoRel.categoria === 'K-pop' ? 'primary' : 'success'}
                      className="position-absolute top-0 start-0 m-2"
                    >
                      {productoRel.categoria}
                    </Badge>
                  </div>
                  
                  <Card.Body>
                    <Card.Title 
                      className="h6 mb-2 cursor-pointer"
                      onClick={() => navigate(`/producto/${productoRel.id}`)}
                    >
                      {productoRel.nombre}
                    </Card.Title>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="text-primary mb-0">
                        Bs. {parseFloat(productoRel.precio).toFixed(2)}
                      </h5>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate(`/producto/${productoRel.id}`)}
                      >
                        Ver
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {}
      <Card className="mt-5 shadow">
        <Card.Body>
          <h4 className="mb-4">Reseñas de clientes</h4>
          
          <div className="row mb-4">
            <div className="col-md-4 text-center">
              <div className="display-4 text-warning mb-2">4.5</div>
              <div className="text-warning mb-2">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStarHalfAlt />
              </div>
              <p className="text-muted">Basado en 128 reseñas</p>
            </div>
            
            <div className="col-md-8">
              {[
                { estrellas: 5, porcentaje: 70 },
                { estrellas: 4, porcentaje: 20 },
                { estrellas: 3, porcentaje: 5 },
                { estrellas: 2, porcentaje: 3 },
                { estrellas: 1, porcentaje: 2 }
              ].map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <div className="me-2" style={{ width: '40px' }}>
                    {item.estrellas} <FaStar className="text-warning" />
                  </div>
                  <div className="progress flex-grow-1" style={{ height: '10px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: `${item.porcentaje}%` }}
                    ></div>
                  </div>
                  <div className="ms-2" style={{ width: '40px' }}>
                    {item.porcentaje}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-top pt-4">
            <h5>Últimas reseñas</h5>
            <div className="mt-3">
              <div className="d-flex mb-3">
                <div className="flex-shrink-0">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                    <FaUser size={20} />
                  </div>
                </div>
                <div className="ms-3 flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <strong>Carlos M.</strong>
                    <small className="text-muted">Hace 2 días</small>
                  </div>
                  <div className="text-warning mb-2">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <p>Excelente producto, llegó en perfectas condiciones. Muy recomendado.</p>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DetalleProducto;