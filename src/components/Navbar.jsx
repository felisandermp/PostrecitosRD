import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount, openCart } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const cartCount = getCartCount();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid">
        <div className="d-flex align-items-center">
          <button 
            className="btn btn-outline-secondary d-lg-none me-3"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebar"
          >
            <i className="bi bi-list"></i>
          </button>
          <span className="navbar-text">
            Bienvenido, <strong>{user?.name || user?.email}</strong>
          </span>
        </div>

        <div className="d-flex align-items-center">
          {/* Botón del Carrito */}
          <button
            className="btn btn-outline-primary position-relative me-3"
            onClick={openCart}
            title="Ver carrito"
          >
            <i className="bi bi-cart3 fs-5"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartCount}
                <span className="visually-hidden">items en carrito</span>
              </span>
            )}
          </button>

          <span className="badge bg-primary me-3">
            {user?.role === 'admin' ? 'Administrador' : 'Empleado'}
          </span>
          
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-person-circle me-1"></i>
              {user?.name || 'Usuario'}
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text">
                  <small className="text-muted">{user?.email}</small>
                </span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;