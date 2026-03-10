import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['admin', 'empleado'] },
    { path: '/sales', icon: 'bi-cart-plus', label: 'Ventas', roles: ['admin', 'empleado'] },
    { path: '/products', icon: 'bi-box-seam', label: 'Productos', roles: ['admin'] },
    { path: '/inventory', icon: 'bi-clipboard-data', label: 'Inventario', roles: ['admin'] },
    { path: '/invoices', icon: 'bi-receipt', label: 'Facturas', roles: ['admin', 'empleado'] },
    { path: '/sales-history', icon: 'bi-clock-history', label: 'Historial', roles: ['admin', 'empleado'] }
  ];

  const userRole = isAdmin() ? 'admin' : 'empleado';

  return (
    <div className="sidebar position-fixed" style={{ width: '250px', zIndex: 1000 }}>
      <div className="p-3">
        <div className="text-center mb-4">
          <h4 className="text-white mb-0">
            <i className="bi bi-shop me-2"></i>
            Bakery POS
          </h4>
          <small className="text-white-50">Sistema de Repostería</small>
        </div>
        
        <nav className="nav flex-column">
          {menuItems
            .filter(item => item.roles.includes(userRole))
            .map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <i className={item.icon}></i>
                {item.label}
              </NavLink>
            ))
          }
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;