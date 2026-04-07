import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { notificationService } from '../services/notificationService';

const SalesHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [stats, setStats] = useState(null);

  const ORDER_STATUSES = [
    { key: 'pendiente', label: 'Pendiente', color: 'warning' },
    { key: 'confirmado', label: 'Confirmado', color: 'info' },
    { key: 'en_preparacion', label: 'En Preparación', color: 'primary' },
    { key: 'listo', label: 'Listo para Entrega', color: 'success' },
    { key: 'entregado', label: 'Entregado', color: 'info' },
    { key: 'cerrado', label: 'Cerrado', color: 'secondary' },
    { key: 'cancelado', label: 'Cancelado', color: 'danger' }
  ];

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadOrdersByDate();
    }
  }, [dateRange]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getOrders();
      setOrders(ordersData);
      
      // Calcular estadísticas
      const salesStats = await orderService.getSalesStats();
      setStats(salesStats);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersByDate = async () => {
    try {
      setLoading(true);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Incluir todo el día final
      
      const ordersData = await orderService.getOrdersByDate(startDate, endDate);
      setOrders(ordersData);
      
      // Calcular estadísticas del período
      const salesStats = await orderService.getSalesStats(startDate, endDate);
      setStats(salesStats);
    } catch (error) {
      console.error('Error al cargar pedidos por fecha:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setDateRange({ startDate: '', endDate: '' });
    loadOrders();
  };

  const handleStatusChange = (orderId, newStatus) => {
    // Actualizar en customerOrders (vista cliente)
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const custIdx = customerOrders.findIndex(o => o.id === orderId);
    if (custIdx !== -1) {
      customerOrders[custIdx].status = newStatus;
      localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    }

    // Actualizar en orders (admin localStorage)
    const adminOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const adminIdx = adminOrders.findIndex(o => o.id === orderId);
    if (adminIdx !== -1) {
      adminOrders[adminIdx].status = newStatus;
      localStorage.setItem('orders', JSON.stringify(adminOrders));
    }

    // Actualizar en mockOrders (mockDB)
    const mockOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    const mockIdx = mockOrders.findIndex(o => o.id === orderId);
    if (mockIdx !== -1) {
      mockOrders[mockIdx].status = newStatus;
      localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    }

    // Actualizar estado local
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    // Enviar notificacion al cliente
    const order = customerOrders.find(o => o.id === orderId) || adminOrders.find(o => o.id === orderId);
    if (order) {
      notificationService.notifyStatusChange({ ...order, status: newStatus }, newStatus);
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Hora', 'Total', 'Método Pago', 'Productos'];
    const csvData = orders.map(order => [
      new Date(order.createdAt.seconds * 1000).toLocaleDateString(),
      new Date(order.createdAt.seconds * 1000).toLocaleTimeString(),
      order.total.toFixed(2),
      order.paymentMethod,
      order.products.map(p => `${p.name} (${p.quantity})`).join('; ')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-ventas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <i className="bi bi-clock-history me-2"></i>
          Historial de Ventas
        </h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success" onClick={exportToCSV}>
            <i className="bi bi-download me-2"></i>
            Exportar CSV
          </button>
          <button className="btn btn-outline-primary" onClick={loadOrders}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-control"
                id="startDate"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-control"
                id="endDate"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                <i className="bi bi-x-circle me-2"></i>
                Limpiar
              </button>
            </div>
            <div className="col-md-4">
              <div className="text-end">
                <small className="text-muted">
                  Mostrando {orders.length} ventas
                  {dateRange.startDate && dateRange.endDate && 
                    ` del ${dateRange.startDate} al ${dateRange.endDate}`
                  }
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card stats-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Total Ventas</h6>
                    <h3 className="card-title mb-0">{stats.totalOrders}</h3>
                  </div>
                  <div className="text-primary">
                    <i className="bi bi-cart-check display-6"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card stats-card success">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Ingresos</h6>
                    <h3 className="card-title mb-0">${stats.totalRevenue.toFixed(2)}</h3>
                  </div>
                  <div className="text-success">
                    <i className="bi bi-currency-dollar display-6"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card stats-card info">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Promedio</h6>
                    <h3 className="card-title mb-0">${stats.averageOrderValue.toFixed(2)}</h3>
                  </div>
                  <div className="text-info">
                    <i className="bi bi-graph-up display-6"></i>
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
                    <h6 className="card-subtitle mb-2 text-muted">Top Producto</h6>
                    <h6 className="card-title mb-0">
                      {stats.topProducts.length > 0 ? stats.topProducts[0].name : 'N/A'}
                    </h6>
                    <small className="text-muted">
                      {stats.topProducts.length > 0 ? `${stats.topProducts[0].quantity} vendidos` : ''}
                    </small>
                  </div>
                  <div className="text-warning">
                    <i className="bi bi-trophy display-6"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Historial de ventas */}
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Historial de Ventas
              </h5>
            </div>
            <div className="card-body">
              {orders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Fecha/Hora</th>
                        <th>Productos</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Pago</th>
                        <th>Total</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>
                            <div>
                              <strong>{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</strong>
                              <br />
                              <small className="text-muted">
                                {new Date(order.createdAt.seconds * 1000).toLocaleTimeString()}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              {order.products.slice(0, 2).map((product, index) => (
                                <div key={index}>
                                  <small>{product.name} x{product.quantity}</small>
                                </div>
                              ))}
                              {order.products.length > 2 && (
                                <small className="text-muted">
                                  +{order.products.length - 2} más...
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            {order.type === 'online' ? (
                              <span className="badge bg-info">
                                <i className="bi bi-globe me-1"></i>
                                Online
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                <i className="bi bi-shop me-1"></i>
                                Tienda
                              </span>
                            )}
                          </td>
                          <td>
                            {order.type === 'online' ? (
                              <select
                                className="form-select form-select-sm"
                                value={order.status || 'completado'}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                style={{ minWidth: '140px', fontSize: '12px' }}
                              >
                                {ORDER_STATUSES.map(s => (
                                  <option key={s.key} value={s.key}>{s.label}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="badge bg-success">Completado</span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td>
                            <strong className="text-success">${order.total.toFixed(2)}</strong>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => {
                                const details = order.products.map(p => 
                                  `${p.name} x${p.quantity} = $${p.subtotal.toFixed(2)}`
                                ).join('\n');
                                alert(`Detalles de la venta:\n\n${details}\n\nTotal: $${order.total.toFixed(2)}`);
                              }}
                              title="Ver detalles"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x display-4 text-muted mb-3"></i>
                  <p className="text-muted">No hay ventas registradas en este período</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-trophy me-2"></i>
                Productos Más Vendidos
              </h5>
            </div>
            <div className="card-body">
              {stats && stats.topProducts.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <div className="d-flex align-items-center">
                          <span className={`badge ${
                            index === 0 ? 'bg-warning' : 
                            index === 1 ? 'bg-secondary' : 
                            index === 2 ? 'bg-dark' : 'bg-light text-dark'
                          } me-2`}>
                            {index + 1}
                          </span>
                          <div>
                            <h6 className="mb-1">{product.name}</h6>
                            <small className="text-muted">
                              Ingresos: ${product.revenue.toFixed(2)}
                            </small>
                          </div>
                        </div>
                      </div>
                      <span className="badge bg-primary">
                        {product.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-graph-down display-4 text-muted mb-3"></i>
                  <p className="text-muted">No hay datos de productos</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;