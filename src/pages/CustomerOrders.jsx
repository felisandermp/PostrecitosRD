import { useState, useEffect } from 'react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      setOrders(savedOrders.reverse()); // Más recientes primero
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendiente: 'bg-warning text-dark',
      confirmado: 'bg-info',
      en_preparacion: 'bg-primary',
      listo: 'bg-success',
      entregado: 'bg-secondary',
      cancelado: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusText = (status) => {
    const texts = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      en_preparacion: 'En Preparación',
      listo: 'Listo para Entrega',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return texts[status] || status;
  };

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
      ) : (
        <div className="row">
          {orders.map(order => (
            <div key={order.id} className="col-md-6 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span>
                    <strong>Pedido #{order.id}</strong>
                  </span>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <small className="text-muted">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(order.date).toLocaleDateString('es-DO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>

                  <div className="mb-3">
                    <strong className="d-block mb-2">Productos:</strong>
                    <ul className="list-unstyled">
                      {order.products.map((item, index) => (
                        <li key={index} className="mb-1 small">
                          <i className="bi bi-dot"></i>
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Total:</span>
                    <strong className="text-primary fs-5">${order.total.toFixed(2)}</strong>
                  </div>

                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="bi bi-credit-card me-1"></i>
                      {order.paymentMethod}
                    </small>
                  </div>

                  {order.customer.address && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="bi bi-geo-alt me-1"></i>
                        {order.customer.address}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
