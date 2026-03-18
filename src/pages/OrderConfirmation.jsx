import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/store');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg">
            <div className="card-body text-center p-5">
              <div className="mb-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '80px' }}></i>
              </div>
              
              <h2 className="mb-3">¡Pedido Realizado!</h2>
              <p className="text-muted mb-4">
                Gracias por tu compra. Hemos recibido tu pedido y te contactaremos pronto.
              </p>

              <div className="alert alert-info">
                <strong>Número de Pedido:</strong> #{order.id}
              </div>

              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Resumen del Pedido</h5>
                </div>
                <div className="card-body text-start">
                  <div className="mb-3">
                    <strong>Cliente:</strong> {order.customer.name}<br />
                    <strong>Teléfono:</strong> {order.customer.phone}<br />
                    {order.customer.email && (
                      <><strong>Email:</strong> {order.customer.email}<br /></>
                    )}
                    {order.customer.address && (
                      <><strong>Dirección:</strong> {order.customer.address}<br /></>
                    )}
                  </div>

                  <hr />

                  <div className="mb-3">
                    <strong>Productos:</strong>
                    <ul className="list-unstyled mt-2">
                      {order.products.map((item, index) => (
                        <li key={index} className="mb-1">
                          {item.quantity}x {item.name} - ${item.subtotal.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <hr />

                  <div className="d-flex justify-content-between mb-1">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>IVA (16%):</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong className="text-primary">${order.total.toFixed(2)}</strong>
                  </div>

                  <div className="mt-3">
                    <strong>Método de Pago:</strong> {order.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2">
                <Link to="/store" className="btn btn-primary btn-lg">
                  <i className="bi bi-shop me-2"></i>
                  Seguir Comprando
                </Link>
                <Link to="/store/orders" className="btn btn-outline-secondary">
                  <i className="bi bi-receipt me-2"></i>
                  Ver Mis Pedidos
                </Link>
              </div>

              <div className="mt-4 text-muted small">
                <p className="mb-1">
                  <i className="bi bi-telephone me-2"></i>
                  ¿Preguntas? Llámanos: (809) 753-5382
                </p>
                <p className="mb-0">
                  <i className="bi bi-envelope me-2"></i>
                  admin@postrecitos.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
