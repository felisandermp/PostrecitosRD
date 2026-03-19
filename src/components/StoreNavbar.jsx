import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const StoreNavbar = () => {
  const { getCartCount, openCart } = useCart();
  const cartCount = getCartCount();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/store">
          <img 
            src="/logo.png" 
            alt="Postrecitos de Mamá" 
            style={{ 
              width: '50px', 
              height: '50px', 
              objectFit: 'cover',
              borderRadius: '50%',
              marginRight: '12px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span className="fw-bold" style={{ color: '#8B4513' }}>
            Postrecitos de Mamá
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#storeNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="storeNavbar">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link" to="/store/orders">
                <i className="bi bi-receipt me-1"></i>
                Mis Pedidos
              </Link>
            </li>
            <li className="nav-item ms-3">
              <button
                className="btn btn-primary position-relative"
                onClick={openCart}
              >
                <i className="bi bi-cart3 fs-5"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default StoreNavbar;
