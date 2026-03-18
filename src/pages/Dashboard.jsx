import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalRevenue: 0,
    lowStockProducts: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas del día
      const salesStats = await orderService.getSalesStats();
      const todayOrders = await orderService.getTodayOrders();
      const lowStockProducts = await productService.getLowStockProducts(10);
      
      setStats({
        todaySales: salesStats.totalRevenue,
        todayOrders: salesStats.totalOrders,
        totalRevenue: salesStats.totalRevenue,
        lowStockProducts
      });
      
      setRecentOrders(todayOrders.slice(0, 5));
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h1>
        <button className="btn btn-outline-primary" onClick={loadDashboardData}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stats-card success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Ventas Hoy</h6>
                  <h3 className="card-title mb-0">${stats.todaySales.toFixed(2)}</h3>
                </div>
                <div className="text-success">
                  <i className="bi bi-currency-dollar display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card stats-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Pedidos Hoy</h6>
                  <h3 className="card-title mb-0">{stats.todayOrders}</h3>
                </div>
                <div className="text-primary">
                  <i className="bi bi-cart-check display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card stats-card warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Productos Bajo Stock</h6>
                  <h3 className="card-title mb-0">{stats.lowStockProducts.length}</h3>
                </div>
                <div className="text-warning">
                  <i className="bi bi-exclamation-triangle display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card stats-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Promedio por Venta</h6>
                  <h3 className="card-title mb-0">
                    ${stats.todayOrders > 0 ? (stats.todaySales / stats.todayOrders).toFixed(2) : '0.00'}
                  </h3>
                </div>
                <div className="text-info">
                  <i className="bi bi-graph-up display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Pedidos recientes */}
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Pedidos Recientes
              </h5>
            </div>
            <div className="card-body">
              {recentOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Productos</th>
                        <th>Tipo</th>
                        <th>Total</th>
                        <th>Método Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td>
                            {new Date(order.createdAt.seconds * 1000).toLocaleTimeString()}
                          </td>
                          <td>
                            <small>
                              {order.products.map(p => p.name).join(', ')}
                            </small>
                          </td>
                          <td>
                            {order.type === 'online' ? (
                              <span className="badge bg-info">
                                <i className="bi bi-globe"></i>
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                <i className="bi bi-shop"></i>
                              </span>
                            )}
                          </td>
                          <td>
                            <strong>${order.total.toFixed(2)}</strong>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {order.paymentMethod}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-cart-x display-4 text-muted mb-3"></i>
                  <p className="text-muted">No hay pedidos hoy</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos con bajo stock */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Alertas de Stock
              </h5>
            </div>
            <div className="card-body">
              {stats.lowStockProducts.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.lowStockProducts.slice(0, 5).map(product => (
                    <div key={product.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <h6 className="mb-1">{product.name}</h6>
                        <small className="text-muted">Stock: {product.stock}</small>
                      </div>
                      <span className={`badge ${product.stock === 0 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {product.stock === 0 ? 'Agotado' : 'Bajo'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle display-4 text-success mb-3"></i>
                  <p className="text-muted">Stock en buen estado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;