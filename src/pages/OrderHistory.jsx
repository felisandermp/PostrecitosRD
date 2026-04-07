import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      setOrders([...allOrders].reverse());
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pendiente: { color: 'warning', text: 'Pendiente', icon: 'bi-clock' },
      confirmado: { color: 'info', text: 'Confirmado', icon: 'bi-check-circle' },
      en_preparacion: { color: 'primary', text: 'En Preparación', icon: 'bi-fire' },
      listo: { color: 'success', text: 'Listo', icon: 'bi-box-seam' },
      entregado: { color: 'info', text: 'Entregado', icon: 'bi-truck' },
      cerrado: { color: 'secondary', text: 'Cerrado', icon: 'bi-house-check' },
      cancelado: { color: 'danger', text: 'Cancelado', icon: 'bi-x-circle' }
    };
    return map[status] || { color: 'secondary', text: status, icon: 'bi-question' };
  };

  const updateStatus = (orderId, newStatus) => {
    // customerOrders
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const custIdx = customerOrders.findIndex(o => o.id === orderId);
    if (custIdx !== -1) {
      customerOrders[custIdx].status = newStatus;
      if (newStatus === 'entregado') customerOrders[custIdx].deliveredAt = new Date().toISOString();
      localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    }

    // orders
    const adminOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const adminIdx = adminOrders.findIndex(o => o.id === orderId);
    if (adminIdx !== -1) {
      adminOrders[adminIdx].status = newStatus;
      if (newStatus === 'entregado') adminOrders[adminIdx].deliveredAt = new Date().toISOString();
      localStorage.setItem('orders', JSON.stringify(adminOrders));
    }

    // mockOrders
    const mockOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    const mockIdx = mockOrders.findIndex(o => o.id === orderId);
    if (mockIdx !== -1) {
      mockOrders[mockIdx].status = newStatus;
      if (newStatus === 'entregado') mockOrders[mockIdx].deliveredAt = new Date().toISOString();
      localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    }

    loadOrders();

    // Enviar notificacion al cliente
    const order = customerOrders.find(o => o.id === orderId) || adminOrders.find(o => o.id === orderId);
    if (order) {
      notificationService.notifyStatusChange(order, newStatus);
    }
  };

  const filteredOrders = filter === 'todos'
    ? orders
    : filter === 'activos'
      ? orders.filter(o => o.status !== 'cerrado' && o.status !== 'cancelado')
      : orders.filter(o => o.status === filter);

  const activeCount = orders.filter(o => o.status !== 'cerrado' && o.status !== 'cancelado').length;
  const deliveredCount = orders.filter(o => o.status === 'cerrado').length;

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
          <i className="bi bi-truck me-2"></i>
          Pedidos Online
        </h1>
        <button className="btn btn-outline-primary" onClick={loadOrders}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card stats-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total Pedidos</h6>
                  <h3 className="card-title mb-0">{orders.length}</h3>
                </div>
                <div className="text-primary"><i className="bi bi-bag display-6"></i></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card stats-card warning">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Activos</h6>
                  <h3 className="card-title mb-0">{activeCount}</h3>
                </div>
                <div className="text-warning"><i className="bi bi-hourglass-split display-6"></i></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card stats-card success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Cerrados</h6>
                  <h3 className="card-title mb-0">{deliveredCount}</h3>
                </div>
                <div className="text-success"><i className="bi bi-check-circle display-6"></i></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body py-2">
          <div className="d-flex gap-2 flex-wrap">
            {[
              { key: 'todos', label: 'Todos', icon: 'bi-list' },
              { key: 'activos', label: 'Activos', icon: 'bi-hourglass' },
              { key: 'pendiente', label: 'Pendientes', icon: 'bi-clock' },
              { key: 'confirmado', label: 'Confirmados', icon: 'bi-check-circle' },
              { key: 'en_preparacion', label: 'En Preparación', icon: 'bi-fire' },
              { key: 'listo', label: 'Listos', icon: 'bi-box-seam' },
              { key: 'entregado', label: 'Entregados', icon: 'bi-truck' },
              { key: 'cerrado', label: 'Cerrados', icon: 'bi-house-check' },
              { key: 'cancelado', label: 'Cancelados', icon: 'bi-x-circle' }
            ].map(f => (
              <button
                key={f.key}
                className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter(f.key)}
              >
                <i className={`bi ${f.icon} me-1`}></i>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            {filter === 'todos' ? 'Todos los Pedidos' : `Pedidos: ${filter}`}
            <span className="badge bg-secondary ms-2">{filteredOrders.length}</span>
          </h5>
        </div>
        <div className="card-body">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-4 text-muted mb-3"></i>
              <p className="text-muted">No hay pedidos en esta categoría</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <tr key={order.id}>
                        <td>
                          <strong>#{order.id}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(order.date).toLocaleDateString('es-DO', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </small>
                        </td>
                        <td>
                          <div>
                            <strong>{order.customer?.name || 'Sin nombre'}</strong>
                            {order.customer?.phone && (
                              <><br /><small className="text-muted"><i className="bi bi-telephone me-1"></i>{order.customer.phone}</small></>
                            )}
                          </div>
                        </td>
                        <td>
                          {order.products.slice(0, 2).map((p, i) => (
                            <div key={i}><small>{p.quantity}x {p.name}</small></div>
                          ))}
                          {order.products.length > 2 && (
                            <small className="text-muted">+{order.products.length - 2} mas...</small>
                          )}
                        </td>
                        <td><strong className="text-success">${order.total.toFixed(2)}</strong></td>
                        <td>
                          <span className={`badge bg-${badge.color}`}>
                            <i className={`bi ${badge.icon} me-1`}></i>
                            {badge.text}
                          </span>
                          {order.deliveredAt && (
                            <><br /><small className="text-muted">{new Date(order.deliveredAt).toLocaleDateString()}</small></>
                          )}
                        </td>
                        <td>
                          {order.status !== 'cerrado' && order.status !== 'cancelado' ? (
                            <select
                              className="form-select form-select-sm"
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value)}
                              style={{ minWidth: '130px', fontSize: '12px' }}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="confirmado">Confirmado</option>
                              <option value="en_preparacion">En Preparación</option>
                              <option value="listo">Listo</option>
                              <option value="entregado">Entregado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          ) : (
                            <span className="text-muted small">
                              {order.status === 'cerrado' ? 'Confirmado por cliente' : 'Finalizado'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
