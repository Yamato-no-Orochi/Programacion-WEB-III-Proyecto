import { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [fortaleza, setFortaleza] = useState(0);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const { registro } = useAuth();
  const navigate = useNavigate();

  const calcularFortaleza = (password) => {
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[!@#$%^&*]/.test(password)) score += 25;
    return score;
  };

  const getFortalezaTexto = (score) => {
    if (score < 50) return 'Débil';
    if (score < 75) return 'Intermedia';
    return 'Fuerte';
  };

  const getVariant = (score) => {
    if (score < 50) return 'danger';
    if (score < 75) return 'warning';
    return 'success';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setFortaleza(calcularFortaleza(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (fortaleza < 50) {
      setError('La contraseña es muy débil. Use mayúsculas, números y símbolos');
      return;
    }
    
    setCargando(true);
    
    try {
      const resultado = await registro({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password
      });
      
      if (resultado.exito) {
        Swal.fire({
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          icon: 'success',
          confirmButtonText: 'Iniciar Sesión'
        }).then(() => {
          navigate('/login');
        });
      } else {
        setError(resultado.error);
      }
    } catch (error) {
      setError('Error al registrar usuario');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                <h3>Crear Cuenta</h3>
              </Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre Completo</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <div className="mt-2">
                    <small>Fortaleza: {getFortalezaTexto(fortaleza)}</small>
                    <ProgressBar 
                      now={fortaleza} 
                      variant={getVariant(fortaleza)}
                      className="mt-1"
                    />
                  </div>
                  <Form.Text className="text-muted">
                    Mínimo 8 caracteres con mayúsculas, números y símbolos
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </Form.Group>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={cargando}
                >
                  {cargando ? 'Registrando...' : 'Registrarse'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <small>
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Inicia sesión aquí
                  </Link>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;