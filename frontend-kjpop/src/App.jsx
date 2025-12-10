import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Reports from './pages/Reports';
import Catalogo from './pages/Catalogo';
import Carrito from './pages/Carrito';
import MisPedidos from './pages/MisPedidos';
import DetalleProducto from './pages/DetalleProducto';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <Container className="mt-4">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/producto/:id" element={<DetalleProducto />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/products" element={
              <PrivateRoute roles={['admin', 'vendedor']}>
                <Products />
              </PrivateRoute>
            } />
            
            <Route path="/products/new" element={
              <PrivateRoute roles={['admin', 'vendedor']}>
                <ProductForm />
              </PrivateRoute>
            } />
            
            <Route path="/products/edit/:id" element={
              <PrivateRoute roles={['admin', 'vendedor']}>
                <ProductForm />
              </PrivateRoute>
            } />
            
            <Route path="/reports" element={
              <PrivateRoute roles={['admin']}>
                <Reports />
              </PrivateRoute>
            } />
            
            <Route path="/carrito" element={
              <PrivateRoute>
                <Carrito />
              </PrivateRoute>
            } />
            
            <Route path="/mis-pedidos" element={
              <PrivateRoute>
                <MisPedidos />
              </PrivateRoute>
            } />
            
            {}
            <Route path="*" element={<Navigate to="/catalogo" />} />
          </Routes>
        </Container>
      </div>
    </AuthProvider>
  );
}

export default App;