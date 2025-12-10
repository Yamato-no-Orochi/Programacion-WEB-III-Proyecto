import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, 
  Form, InputGroup, Badge, Alert, Spinner 
} from 'react-bootstrap';
import { FaSearch, FaShoppingCart, FaHeart, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [filtros, setFiltros] = useState({
    categoria: '',
    precioMin: '',
    precioMax: '',
    orden: 'recientes'
  });
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await axios.get('http://localhost:3001/api/productos');
      const productosActivos = response.data.filter(
        p => p.activo && !p.eliminado
      );
      setProductos(productosActivos);
    } catch (error) {
      console.error('Error cargando catálogo:', error);
    } finally {
      setCargando(false);
    }
  };

  const agregarAlCarrito = async (productoId) => {
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

    try {
      await axios.post('http://localhost:3001/api/carrito/agregar', {
        productoId,
        cantidad: 1
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

  const productosFiltrados = productos
    .filter(producto => {
      if (busqueda && !producto.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }
      
      if (filtros.categoria && producto.categoria !== filtros.categoria) {
        return false;
      }
      
      if (filtros.precioMin && producto.precio < parseFloat(filtros.precioMin)) {
        return false;
      }
      
      if (filtros.precioMax && producto.precio > parseFloat(filtros.precioMax)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch(filtros.orden) {
        case 'precio-asc':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        case 'nombre-asc':
          return a.nombre.localeCompare(b.nombre);
        case 'recientes':
        default:
          return new Date(b.creado_en) - new Date(a.creado_en);
      }
    });

  const ProductCard = ({ producto }) => (
    <Card className="h-100 product-card shadow-sm">
      <div className="position-relative">
        {producto.imagen_url ? (
          <Card.Img 
            variant="top" 
            src={producto.imagen_url} 
            alt={producto.nombre}
            style={{ height: '200px', objectFit: 'cover' }}
          />
        ) : (
          <div 
            className="bg-light d-flex align-items-center justify-content-center" 
            style={{ height: '200px' }}
          >
            <FaShoppingCart size={50} className="text-muted" />
          </div>
        )}
        
        <Badge 
          bg={producto.categoria === 'K-pop' ? 'primary' : 'success'}
          className="position-absolute top-0 start-0 m-2"
        >
          {producto.categoria}
        </Badge>
        
        {producto.stock < 10 && (
          <Badge bg="warning" className="position-absolute top-0 end-0 m-2">
            ¡Últimas unidades!
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6 mb-2">{producto.nombre}</Card.Title>
        
        <Card.Text className="text-muted small flex-grow-1">
          {producto.descripcion?.substring(0, 80)}
          {producto.descripcion?.length > 80 && '...'}
        </Card.Text>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="text-primary mb-0">
                Bs. {parseFloat(producto.precio).toFixed(2)}
              </h5>
              <small className="text-muted">
                Stock: {producto.stock} unidades
              </small>
            </div>
            
            <div className="text-warning">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar className="text-muted" />
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => agregarAlCarrito(producto.id)}
              disabled={producto.stock === 0}
            >
              <FaShoppingCart className="me-2" />
              {producto.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
            </Button>
            
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => navigate(`/producto/${producto.id}`)}
            >
              Ver detalles
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando catálogo...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      {}
      <div className="bg-primary text-white rounded p-5 mb-4">
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="display-5 fw-bold">K-JPop Store</h1>
            <p className="lead">
              Los mejores productos de K-pop y J-pop. 
              Álbumes, mercancía oficial y coleccionables.
            </p>
          </Col>
          <Col md={4} className="text-end">
            <Button 
              variant="light" 
              size="lg"
              onClick={() => navigate('/carrito')}
            >
              <FaShoppingCart className="me-2" />
              Ver mi carrito
            </Button>
          </Col>
        </Row>
      </div>

      {}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={2}>
              <Form.Select
                value={filtros.categoria}
                onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
              >
                <option value="">Todas las categorías</option>
                <option value="K-pop">K-pop</option>
                <option value="J-pop">J-pop</option>
                <option value="Merchandise">Merchandise</option>
                <option value="Álbum">Álbum</option>
              </Form.Select>
            </Col>
            
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Precio mínimo"
                value={filtros.precioMin}
                onChange={(e) => setFiltros({...filtros, precioMin: e.target.value})}
                min="0"
              />
            </Col>
            
            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Precio máximo"
                value={filtros.precioMax}
                onChange={(e) => setFiltros({...filtros, precioMax: e.target.value})}
                min="0"
              />
            </Col>
            
            <Col md={2}>
              <Form.Select
                value={filtros.orden}
                onChange={(e) => setFiltros({...filtros, orden: e.target.value})}
              >
                <option value="recientes">Más recientes</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre-asc">Nombre: A-Z</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Resultados */}
      <div className="mb-3">
        <h4>Productos disponibles</h4>
        <p className="text-muted">
          {productosFiltrados.length} productos encontrados
        </p>
      </div>

      {productosFiltrados.length === 0 ? (
        <Alert variant="info">
          <FaSearch className="me-2" />
          No se encontraron productos con los filtros aplicados.
          <Button 
            variant="link" 
            className="ms-2"
            onClick={() => {
              setFiltros({
                categoria: '',
                precioMin: '',
                precioMax: '',
                orden: 'recientes'
              });
              setBusqueda('');
            }}
          >
            Limpiar filtros
          </Button>
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={4} className="g-4">
          {productosFiltrados.map((producto) => (
            <Col key={producto.id}>
              <ProductCard producto={producto} />
            </Col>
          ))}
        </Row>
      )}

      {/* Categorías destacadas */}
      <div className="mt-5">
        <h4 className="mb-4">Categorías destacadas</h4>
        <Row className="g-3">
          <Col md={3}>
            <Card className="text-center border-primary border-2 hover-shadow">
              <Card.Body>
                <h5>K-pop</h5>
                <p className="text-muted small">
                  Álbumes y mercancía de tus grupos favoritos
                </p>
                <Badge bg="primary" pill>
                  {productos.filter(p => p.categoria === 'K-pop').length} productos
                </Badge>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="text-center border-success border-2 hover-shadow">
              <Card.Body>
                <h5>J-pop</h5>
                <p className="text-muted small">
                  Música y productos de artistas japoneses
                </p>
                <Badge bg="success" pill>
                  {productos.filter(p => p.categoria === 'J-pop').length} productos
                </Badge>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="text-center border-warning border-2 hover-shadow">
              <Card.Body>
                <h5>Merchandise</h5>
                <p className="text-muted small">
                  Playeras, llaveros, posters y más
                </p>
                <Badge bg="warning" pill>
                  {productos.filter(p => p.categoria === 'Merchandise').length} productos
                </Badge>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="text-center border-info border-2 hover-shadow">
              <Card.Body>
                <h5>Álbumes</h5>
                <p className="text-muted small">
                  CD y ediciones especiales
                </p>
                <Badge bg="info" pill>
                  {productos.filter(p => p.categoria === 'Álbum').length} productos
                </Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Catalogo;