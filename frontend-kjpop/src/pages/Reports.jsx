import { useState } from 'react';
import { 
  Card, Button, Container, Row, Col, 
  Form, Alert, Spinner 
} from 'react-bootstrap';
import { FaFilePdf, FaDownload, FaChartBar } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const [tipoReporte, setTipoReporte] = useState('productos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [generando, setGenerando] = useState(false);
  
  const { usuario } = useAuth();

  const generarReporte = async () => {
    if (!usuario || usuario.rol !== 'admin') {
      Swal.fire('Acceso denegado', 'Solo administradores pueden generar reportes', 'warning');
      return;
    }
    
    setGenerando(true);
    
    try {
      let url = 'http://localhost:3001/api/reportes/productos';
      
      if (tipoReporte === 'ventas') {
        const params = new URLSearchParams();
        if (fechaInicio) params.append('fechaInicio', fechaInicio);
        if (fechaFin) params.append('fechaFin', fechaFin);
        url = `http://localhost:3001/api/reportes/ventas?${params.toString()}`;
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${tipoReporte}_kjpop.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      Swal.fire('¡Éxito!', 'Reporte generado correctamente', 'success');
    } catch (error) {
      console.error('Error generando reporte:', error);
      Swal.fire('Error', 'No se pudo generar el reporte', 'error');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>
            <FaChartBar className="me-2" />
            Reportes PDF
          </h2>
          <p className="text-muted">Genera reportes en formato PDF</p>
        </Col>
      </Row>

      {usuario?.rol !== 'admin' && (
        <Alert variant="warning" className="mb-4">
          <FaFilePdf className="me-2" />
          Solo usuarios con rol de administrador pueden generar reportes.
        </Alert>
      )}

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="mb-4">
                <h4>Configurar Reporte</h4>
              </Card.Title>
              
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label>Tipo de Reporte</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="reporte-productos"
                      label="Reporte de Productos"
                      checked={tipoReporte === 'productos'}
                      onChange={() => setTipoReporte('productos')}
                    />
                    <Form.Check
                      type="radio"
                      id="reporte-ventas"
                      label="Reporte de Ventas"
                      checked={tipoReporte === 'ventas'}
                      onChange={() => setTipoReporte('ventas')}
                    />
                  </div>
                </Form.Group>
                
                {tipoReporte === 'ventas' && (
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Fecha Inicio</Form.Label>
                        <Form.Control
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Fecha Fin</Form.Label>
                        <Form.Control
                          type="date"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
                
                <div className="text-center mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={generarReporte}
                    disabled={generando || usuario?.rol !== 'admin'}
                  >
                    {generando ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <FaDownload className="me-2" />
                        Generar Reporte PDF
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <Card className="mt-4 shadow-sm">
            <Card.Body>
              <Card.Title>Información del Reporte</Card.Title>
              <ul className="mt-3">
                <li>
                  <strong>Reporte de Productos:</strong> Lista todos los productos activos con precios y stock.
                </li>
                <li>
                  <strong>Reporte de Ventas:</strong> Muestra todas las ventas realizadas en un período específico.
                </li>
                <li>Los reportes se descargan automáticamente en formato PDF.</li>
                <li>Requiere permisos de administrador.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;