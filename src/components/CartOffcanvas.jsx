import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { useNavigate } from 'react-router-dom';

const CartOffcanvas = () => {
  const { cart, showCart, closeCart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [processing, setProcessing] = useState(false);

  const { subtotal, tax, total } = getCartTotal();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setProcessing(true);
    
    try {
      const orderData = {
        products: cart,
        subtotal,
        tax,
        total,
        paymentMethod,
        date: new Date()
      };

      await orderService.createOrder(orderData, user.uid);
      
      alert('¡Venta procesada exitosamente!');
      clearCart();
      closeCart();
      
      // Opcional: redirigir a facturas
      // navigate('/invoices');
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar la venta: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Offcanvas del Carrito */}
      <div 
        className={`offcanvas offcanvas-end ${showCart ? 'show' : ''}`} 
        tabIndex="-1" 
        style={{ 
          visibility: showCart ? 'visible' : 'hidden',
          width: '450px',
          maxWidth: '90vw'
        }}
      >
        <div className="offcanvas-header" style={{ background: 'linear-gradient(135deg, #8B4513, #D2691E)', color: 'white' }}>
          <h5 className="offcanvas-title">
            <i className="bi bi-cart3 me-2"></i>
            Mi Carrito ({cart.length})
          </h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={closeCart}
          ></button>
        </div>
        
        <div className="offcanvas-body p-0 d-flex flex-column">
          {cart.length > 0 ? (
            <>
              {/* Items del carrito */}
              <div className="flex-grow-1 overflow-auto p-3">
                {cart.map(item => (
                  <div key={item.productId} className="card mb-3 shadow-sm">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-start">
                        {/* Imagen del producto */}
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="rounded me-3"
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {/* Información del producto */}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">{item.name}</h6>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.productId)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            {/* Control de cantidad */}
                            <div className="input-group" style={{ width: '120px' }}>
                              <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <input 
                                type="number" 
                                className="form-control form-control-sm text-center"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  if (val >= 0) updateQuantity(item.productId, val);
                                }}
                                min="0"
                                max={item.stock}
                              />
                              <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                            
                            {/* Precio */}
                            <div className="text-end">
                              <small className="text-muted d-block">${item.price.toFixed(2)} c/u</small>
                              <strong className="text-primary">${item.subtotal.toFixed(2)}</strong>
                            </div>
                          </div>
                          
                          {/* Stock disponible */}
                          <small className="text-muted">
                            <i className="bi bi-box me-1"></i>
                            Stock: {item.stock}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen y checkout */}
              <div className="border-top p-3" style={{ backgroundColor: '#f8f9fa' }}>
                {/* Método de pago */}
                <div className="mb-3">
                  <label className="form-label small fw-bold">Método de Pago</label>
                  <select 
                    className="form-select form-select-sm"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta</option>
                    <option value="transferencia">🏦 Transferencia</option>
                  </select>
                </div>

                {/* Totales */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">IVA (16%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong className="text-primary fs-5">${total.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-primary"
                    onClick={handleCheckout}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Procesar Venta
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      if (window.confirm('¿Vaciar el carrito?')) {
                        clearCart();
                      }
                    }}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
              <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
              <h5 className="text-muted mb-2">Tu carrito está vacío</h5>
              <p className="text-muted text-center small">
                Ve a la sección de <strong>Ventas</strong> para agregar productos
              </p>
              <button 
                className="btn btn-primary mt-3"
                onClick={() => {
                  closeCart();
                  navigate('/admin/sales');
                }}
              >
                <i className="bi bi-shop me-2"></i>
                Ir a Ventas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {showCart && (
        <div 
          className="offcanvas-backdrop fade show" 
          onClick={closeCart}
          style={{ zIndex: 1040 }}
        ></div>
      )}
    </>
  );
};

export default CartOffcanvas;