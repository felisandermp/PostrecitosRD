import { useState, useEffect } from 'react';

const ORDER_STEPS = [
  { key: 'pendiente', label: 'Pendiente', icon: 'bi-clock' },
  { key: 'confirmado', label: 'Confirmado', icon: 'bi-check-circle' },
  { key: 'en_preparacion', label: 'En Preparación', icon: 'bi-fire' },
  { key: 'listo', label: 'Listo', icon: 'bi-box-seam' },
  { key: 'entregado', label: 'Entregado', icon: 'bi-truck' },
  { key: 'cerrado', label: 'Cerrado', icon: 'bi-house-check' }
];

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [tab, setTab] = useState('activos');

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      setOrders([...savedOrders].reverse());
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelivery = (orderId) => {
    const newStatus = 'cerrado';

    // Actualizar customerOrders
    const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const custIdx = customerOrders.findIndex(o => o.id === orderId);
    if (custIdx !== -1) {
      customerOrders[custIdx].status = newStatus;
      customerOrders[custIdx].closedAt = new Date().toISOString();
      localStorage.setItem('customerOrders', JSON.stringify(customerOrders));
    }

    // Actualizar orders (admin)
    const adminOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const adminIdx = adminOrders.findIndex(o => o.id === orderId);
    if (adminIdx !== -1) {
      adminOrders[adminIdx].status = newStatus;
      adminOrders[adminIdx].closedAt = new Date().toISOString();
      localStorage.setItem('orders', JSON.stringify(adminOrders));
    }

    // Actualizar mockOrders
    const mockOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    const mockIdx = mockOrders.findIndex(o => o.id === orderId);
    if (mockIdx !== -1) {
      mockOrders[mockIdx].status = newStatus;
      mockOrders[mockIdx].closedAt = new Date().toISOString();
      localStorage.setItem('mockOrders', JSON.stringify(mockOrders));
    }

    setConfirmingId(null);
    loadOrders();
  };

  const getStepIndex = (status) => {
    if (status === 'cancelado') return -1;
    const idx = ORDER_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: '#f0ad4e',
      confirmado: '#5bc0de',
      en_preparacion: '#0d6efd',
      listo: '#198754',
      entregado: '#17a2b8',
      cerrado: '#6c757d',
      cancelado: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const activeOrders = orders.filter(o => o.status !== 'cerrado' && o.status !== 'cancelado');
  const historyOrders = orders.filter(o => o.status === 'cerrado' || o.status === 'cancelado');

  const displayOrders = tab === 'activos' ? activeOrders : historyOrders;

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">
        <i className="bi bi-receipt me-2"></i>
        Mis Pedidos
      </h2>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'activos' ? 'active' : ''}`}
            onClick={() => setTab('activos')}
          >
            <i className="bi bi-bag me-1"></i>
            Activos
            {activeOrders.length > 0 && (
              <span className="badge bg-primary ms-2">{activeOrders.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'historial' ? 'active' : ''}`}
            onClick={() => setTab('historial')}
          >
            <i className="bi bi-clock-history me-1"></i>
            Historial
            {historyOrders.length > 0 && (
              <span className="badge bg-secondary ms-2">{historyOrders.length}</span>
            )}
          </button>
        </li>
      </ul>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox display-1 text-muted mb-3"></i>
          <h4 className="text-muted">No tienes pedidos aún</h4>
          <p className="text-muted">Realiza tu primer pedido en nuestra tienda</p>
          <a href="/store" className="btn btn-primary mt-3">
            <i className="bi bi-shop me-2"></i>
            Ir a la Tienda
          </a>
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className={`bi ${tab === 'activos' ? 'bi-check-circle' : 'bi-clock-history'} display-1 text-muted mb-3`}></i>
          <h5 className="text-muted">
            {tab === 'activos' ? 'No tienes pedidos activos' : 'No tienes pedidos en el historial'}
          </h5>
        </div>
      ) : (
        <div className="row">
          {displayOrders.map(order => {
            const currentStep = getStepIndex(order.status);
            const isCancelled = order.status === 'cancelado';
            const isClosed = order.status === 'cerrado';
            const isDelivered = order.status === 'entregado';
            const statusColor = getStatusColor(order.status);

            return (
              <div key={order.id} className="col-12 mb-4">
                <div className="card shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: statusColor, borderColor: statusColor }}>
                    <span className="text-white">
                      <strong>Pedido #{order.id}</strong>
                    </span>
                    <span className="badge bg-light text-dark">
                      {isCancelled ? 'Cancelado' : ORDER_STEPS[currentStep]?.label || order.status}
                    </span>
                  </div>
                  <div className="card-body">
                    {/* Barra de progreso */}
                    {!isCancelled ? (
                      (() => {
                        const total = ORDER_STEPS.length;
                        const stepWidth = 100 / total;
                        const lineStart = stepWidth / 2;
                        const lineEnd = 100 - stepWidth / 2;
                        const lineTotal = lineEnd - lineStart;
                        const progressPct = currentStep > 0 ? (currentStep / (total - 1)) * lineTotal : 0;
                        return (
                      <div className="mb-4 px-2">
                        <div className="d-flex justify-content-between position-relative" style={{ marginBottom: '8px' }}>
                          {/* Linea gris de fondo */}
                          <div style={{
                            position: 'absolute', top: '18px',
                            left: `${lineStart}%`, right: `${stepWidth / 2}%`,
                            height: '4px', backgroundColor: '#e9ecef', borderRadius: '2px', zIndex: 0
                          }}></div>
                          {/* Linea de progreso */}
                          <div style={{
                            position: 'absolute', top: '18px',
                            left: `${lineStart}%`,
                            width: `${progressPct}%`,
                            height: '4px', backgroundColor: statusColor, borderRadius: '2px',
                            zIndex: 1, transition: 'width 0.5s ease'
                          }}></div>
                          {ORDER_STEPS.map((step, idx) => (
                            <div key={step.key} className="text-center" style={{ zIndex: 2, flex: '1' }}>
                              <div className="d-flex align-items-center justify-content-center mx-auto rounded-circle"
                                style={{
                                  width: '40px', height: '40px',
                                  backgroundColor: idx <= currentStep ? statusColor : '#e9ecef',
                                  color: idx <= currentStep ? '#fff' : '#adb5bd',
                                  transition: 'all 0.3s ease',
                                  border: idx === currentStep ? '3px solid ' + statusColor : 'none',
                                  boxShadow: idx === currentStep ? '0 0 0 4px ' + statusColor + '33' : 'none'
                                }}>
                                <i className={`bi ${step.icon}`} style={{ fontSize: '16px' }}></i>
                              </div>
                              <small className="d-block mt-1" style={{
                                fontSize: '11px',
                                fontWeight: idx === currentStep ? '700' : '400',
                                color: idx <= currentStep ? statusColor : '#adb5bd'
                              }}>{step.label}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                        );
                      })()
                    ) : (
                      <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                        <i className="bi bi-x-circle-fill me-2 fs-5"></i>
                        <span>Este pedido ha sido cancelado</span>
                      </div>
                    )}

                    {/* Boton confirmar entrega */}
                    {isDelivered && (
                      <div className="mb-3">
                        {confirmingId === order.id ? (
                          <div className="alert alert-success border-2 mb-0">
                            <div className="d-flex align-items-center mb-2">
                              <i className="bi bi-question-circle-fill me-2 fs-5"></i>
                              <strong>¿Confirmas que recibiste tu pedido?</strong>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => confirmDelivery(order.id)}
                              >
                                <i className="bi bi-check-lg me-1"></i>
                                Sí, lo recibí
                              </button>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setConfirmingId(null)}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="btn btn-success w-100"
                            onClick={() => setConfirmingId(order.id)}
                          >
                            <i className="bi bi-check-circle me-2"></i>
                            Confirmar Entrega
                          </button>
                        )}
                      </div>
                    )}

                    {/* Info cerrado */}
                    {isClosed && order.closedAt && (
                      <div className="alert alert-light border mb-3 d-flex align-items-center">
                        <i className="bi bi-check-circle-fill text-success me-2 fs-5"></i>
                        <div>
                          <strong>Entrega confirmada - Pedido cerrado</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(order.closedAt).toLocaleDateString('es-DO', {
                              year: 'numeric', month: 'long', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </small>
                        </div>
                      </div>
                    )}

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          {new Date(order.date).toLocaleDateString('es-DO', {
                            year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </small>
                        <div className="mt-2">
                          <strong className="d-block mb-2">Productos:</strong>
                          <ul className="list-unstyled mb-0">
                            {order.products.map((item, index) => (
                              <li key={index} className="mb-1 small">
                                <i className="bi bi-dot"></i>
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Total:</span>
                          <strong className="text-primary fs-5">${order.total.toFixed(2)}</strong>
                        </div>
                        <div>
                          <small className="text-muted">
                            <i className="bi bi-credit-card me-1"></i>
                            {order.paymentMethod}
                          </small>
                        </div>
                        {order.customer?.address && (
                          <div className="mt-1">
                            <small className="text-muted">
                              <i className="bi bi-geo-alt me-1"></i>
                              {order.customer.address}
                            </small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
