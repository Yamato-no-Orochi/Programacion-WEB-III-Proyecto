import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, FaUser, FaSignOutAlt, FaChartBar, 
  FaHome, FaBox, FaShoppingBag 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const CustomNavbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [carritoCount, setCarritoCount] = useState(0);

  useEffect(() => {
    if (usuario) {
      cargarCarritoCount();
    }
  }, [usuario]);

  const cargarCarritoCount = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/carrito');
      const totalItems = response.data.items.reduce((sum, item) => sum + item.cantidad, 0);
      setCarritoCount(totalItems);
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRolTexto = (rol) => {
    switch(rol) {
      case 'admin': return 'Administrador';
      case 'vendedor': return 'Vendedor';
      case 'cliente': return 'Cliente';
      default: return 'Usuario';
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <FaShoppingCart className="me-2" />
          K-JPop Store
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/catalogo">
              <FaHome className="me-1" />
              Catálogo
            </Nav.Link>
            
            {usuario && (
              <>
                <Nav.Link as={Link} to="/">
                  <FaChartBar className="me-1" />
                  Dashboard
                </Nav.Link>
                
                {['admin', 'vendedor'].includes(usuario.rol) && (
                  <>
                    <Nav.Link as={Link} to="/products">
                      <FaBox className="me-1" />
                      Productos
                    </Nav.Link>
                    
                    {usuario.rol === 'admin' && (
                      <Nav.Link as={Link} to="/reports">
                        Reportes
                      </Nav.Link>
                    )}
                  </>
                )}
                
                <Nav.Link as={Link} to="/mis-pedidos">
                  <FaShoppingBag className="me-1" />
                  Mis Pedidos
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {usuario ? (
              <>
                <Nav.Link as={Link} to="/carrito" className="position-relative me-3">
                  <FaShoppingCart size={20} />
                  {carritoCount > 0 && (
                    <Badge 
                      pill 
                      bg="danger" 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.6rem' }}
                    >
                      {carritoCount > 9 ? '9+' : carritoCount}
                    </Badge>
                  )}
                </Nav.Link>
                
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-light" id="dropdown-user">
                    <FaUser className="me-2" />
                    {usuario.nombre.split(' ')[0]}
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu>
                    <Dropdown.Header>
                      <div className="small">{usuario.email}</div>
                      <div>
                        <Badge bg={usuario.rol === 'admin' ? 'danger' : 'primary'}>
                          {getRolTexto(usuario.rol)}
                        </Badge>
                      </div>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/">
                      Mi perfil
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/mis-pedidos">
                      Mis pedidos
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/carrito">
                      Mi carrito
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" />
                      Cerrar Sesión
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-light" className="me-2">
                  Iniciar Sesión
                </Button>
                <Button as={Link} to="/register" variant="primary">
                  Registrarse
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;