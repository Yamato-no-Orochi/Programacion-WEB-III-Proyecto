import { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (!captcha) {
      setError('Por favor completa el CAPTCHA');
      setCargando(false);
      return;
    }

    try {
      const resultado = await login(email, password);
      
      if (resultado.exito) {
        Swal.fire({
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión exitosamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/');
      } else {
        setError(resultado.error);
      }
    } catch (error) {
      setError('Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="text-center mb-4">
                <h3>Iniciar Sesión</h3>
              </Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </Form.Group>
                
                <div className="mb-3">
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Clave de prueba
                    onChange={(value) => setCaptcha(value)}
                  />
                </div>
                
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={cargando}
                >
                  {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <small>
                  ¿No tienes cuenta?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Regístrate aquí
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

export default Login;