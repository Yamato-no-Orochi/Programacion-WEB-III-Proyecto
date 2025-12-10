import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !roles.includes(usuario.rol)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;