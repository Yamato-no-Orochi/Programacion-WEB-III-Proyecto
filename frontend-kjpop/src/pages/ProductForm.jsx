import { useState, useEffect } from 'react';
import { 
  Form, Button, Card, Container, Row, Col, 
  Alert, Spinner, FloatingLabel 
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const esEdicion = !!id;
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'K-pop',
    precio: '',
    stock: '',
    descripcion: '',
    imagen_url: ''
  });
  
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [cargandoForm, setCargandoForm] = useState(esEdicion);

  useEffect(() => {
    if (esEdicion) {
      cargarProducto();
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/productos/${id}`);
      setFormData(response.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudo cargar el producto', 'error');
      navigate('/products');
    } finally {
      setCargandoForm(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    }
    
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor a 0';
    }
    
    if (formData.stock && parseInt(formData.stock) < 0) {
      nuevosErrores.stock = 'El stock no puede ser negativo';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setCargando(true);
    
    try {
      const datosEnviar = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0
      };
      
      if (esEdicion) {
        await axios.put(`http://localhost:3001/api/productos/${id}`, datosEnviar);
        Swal.fire('¡Actualizado!', 'Producto actualizado exitosamente', 'success');
      } else {
        await axios.post('http://localhost:3001/api/productos', datosEnviar);
        Swal.fire('¡Creado!', 'Producto creado exitosamente', 'success');
      }
      
      navigate('/products');
    } catch (error) {
      const mensajeError = error.response?.data?.error || 'Error al guardar producto';
      Swal.fire('Error', mensajeError, 'error');
    } finally {
      setCargando(false);
    }
  };

  if (cargandoForm) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="mb-4">
                <h3>{esEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              </Card.Title>
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Producto *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Álbum BTS - Love Yourself"
                        isInvalid={!!errores.nombre}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errores.nombre}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoría *</Form.Label>
                      <Form.Select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                      >
                        <option value="K-pop">K-pop</option>
                        <option value="J-pop">J-pop</option>
                        <option value="Merchandise">Merchandise</option>
                        <option value="Álbum">Álbum</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio (Bs.) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        isInvalid={!!errores.precio}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errores.precio}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        isInvalid={!!errores.stock}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errores.stock}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <FloatingLabel label="Descripción">
                    <Form.Control
                      as="textarea"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Descripción del producto"
                      style={{ height: '100px' }}
                    />
                  </FloatingLabel>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>URL de la imagen (opcional)</Form.Label>
                  <Form.Control
                    type="url"
                    name="imagen_url"
                    value={formData.imagen_url}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/products')}
                    disabled={cargando}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      esEdicion ? 'Actualizar Producto' : 'Crear Producto'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <Alert variant="info" className="mt-3">
            <small>
              * Campos requeridos. <br />
              Los precios deben ser mayores a 0 y el stock no puede ser negativo.
            </small>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductForm;