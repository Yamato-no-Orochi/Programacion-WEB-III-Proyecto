import { useState, useEffect } from 'react';
import { 
  Table, Button, Container, Row, Col, 
  Card, Badge, Form, InputGroup, Alert 
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [mostrarEliminados, setMostrarEliminados] = useState(false);
  
  const { usuario } = useAuth();

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const response = await axios.get('http://localhost:3001/api/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleEliminar = async (id, nombre) => {
    const resultado = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de eliminar "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (resultado.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/api/productos/${id}`);
        Swal.fire('Eliminado', 'Producto eliminado exitosamente', 'success');
        cargarProductos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
      }
    }
  };

  const handleRestaurar = async (id) => {
    try {
      await axios.patch(`http://localhost:3001/api/productos/${id}/restaurar`);
      Swal.fire('Restaurado', 'Producto restaurado exitosamente', 'success');
      cargarProductos();
    } catch (error) {
      Swal.fire('Error', 'No se pudo restaurar el producto', 'error');
    }
  };

  const productosFiltrados = productos.filter(producto => {
    const coincideNombre = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !categoriaFiltro || producto.categoria === categoriaFiltro;
    const coincideEstado = mostrarEliminados ? producto.eliminado : !producto.eliminado;
    
    return coincideNombre && coincideCategoria && coincideEstado;
  });

  const getCategoriaColor = (categoria) => {
    switch(categoria) {
      case 'K-pop': return 'primary';
      case 'J-pop': return 'success';
      case 'Merchandise': return 'warning';
      case 'Álbum': return 'info';
      default: return 'secondary';
    }
  };

  if (cargando) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Productos</h2>
          <p className="text-muted">Administra los productos de la tienda</p>
        </Col>
        <Col xs="auto">
          {usuario && ['admin', 'vendedor'].includes(usuario.rol) && (
            <Button as={Link} to="/products/new" variant="primary">
              <FaPlus className="me-2" />
              Nuevo Producto
            </Button>
          )}
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Select
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  <option value="K-pop">K-pop</option>
                  <option value="J-pop">J-pop</option>
                  <option value="Merchandise">Merchandise</option>
                  <option value="Álbum">Álbum</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Check
                type="switch"
                id="mostrar-eliminados"
                label="Mostrar eliminados"
                checked={mostrarEliminados}
                onChange={(e) => setMostrarEliminados(e.target.checked)}
              />
            </Col>
            
            <Col md={2} className="text-end">
              <small className="text-muted">
                {productosFiltrados.length} productos encontrados
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {}
      <Card className="shadow">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <Alert variant="info">
                      No se encontraron productos
                    </Alert>
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((producto) => (
                  <tr key={producto.id} className={producto.eliminado ? 'table-danger' : ''}>
                    <td>{producto.id}</td>
                    <td>
                      <div>
                        <strong>{producto.nombre}</strong>
                        {producto.descripcion && (
                          <small className="d-block text-muted">
                            {producto.descripcion.substring(0, 50)}...
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getCategoriaColor(producto.categoria)}>
                        {producto.categoria}
                      </Badge>
                    </td>
                    <td>
                      <strong>Bs. {parseFloat(producto.precio).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={producto.stock < 10 ? 'text-danger fw-bold' : ''}>
                        {producto.stock} unidades
                      </span>
                    </td>
                    <td>
                      {producto.eliminado ? (
                        <Badge bg="danger">Eliminado</Badge>
                      ) : producto.activo ? (
                        <Badge bg="success">Activo</Badge>
                      ) : (
                        <Badge bg="warning">Inactivo</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {producto.eliminado ? (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleRestaurar(producto.id)}
                            title="Restaurar"
                          >
                            <FaEye />
                          </Button>
                        ) : (
                          <>
                            <Button
                              as={Link}
                              to={`/products/edit/${producto.id}`}
                              variant="outline-primary"
                              size="sm"
                              title="Editar"
                            >
                              <FaEdit />
                            </Button>
                            
                            {usuario && usuario.rol === 'admin' && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleEliminar(producto.id, producto.nombre)}
                                title="Eliminar"
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Products;