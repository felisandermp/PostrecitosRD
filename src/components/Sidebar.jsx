import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['admin', 'empleado'] },
    { path: '/admin/sales', icon: 'bi-cart-plus', label: 'Ventas', roles: ['admin', 'empleado'] },
    { path: '/admin/products', icon: 'bi-box-seam', label: 'Productos', roles: ['admin'] },
    { path: '/admin/inventory', icon: 'bi-clipboard-data', label: 'Inventario', roles: ['admin'] },
    { path: '/admin/invoices', icon: 'bi-receipt', label: 'Facturas', roles: ['admin', 'empleado'] },
    { path: '/admin/sales-history', icon: 'bi-clock-history', label: 'Historial', roles: ['admin', 'empleado'] }
  ];

  const userRole = isAdmin() ? 'admin' : 'empleado';

  return (
    <div className="sidebar position-fixed" style={{ width: '250px', zIndex: 1000 }}>
      <div className="p-3">
        <div className="text-center mb-4">
          <img 
            src="/logo.png" 
            alt="Postrecitos de Mamá" 
            className="mb-2"
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.3)',
              objectFit: 'cover',
              backgroundColor: '#fff',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          />
          <h5 className="text-white mb-0" style={{ fontWeight: '600', marginTop: '10px' }}>
            Postrecitos de Mamá
          </h5>
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