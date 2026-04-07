import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';

const CustomerCartOffcanvas = () => {
  const { cart, showCart, closeCart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState({
    name: '', phone: '', email: '', address: '', notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [processing, setProcessing] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const { subtotal, tax, total } = getCartTotal();

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { alert('El carrito esta vacio'); return; }
    if (!customerInfo.name || !customerInfo.phone) { alert('Por favor completa tu nombre y telefono'); return; }

    setProcessing(true);
    try {
      const products = JSON.parse(localStorage.getItem('mockProducts') || '[]');
      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (!product) throw new Error('Producto ' + item.name + ' no encontrado');
        if (product.stock < item.quantity) throw new Error('Stock insuficiente para ' + item.name);
      }

      const orderData = { customer: customerInfo, products: cart, subtotal, tax, total, paymentMethod, date: new Date(), status: 'pendiente' };
      const customerOrders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
      const newOrder = { id: Date.now().toString(), ...orderData, type: 'online' };
      customerOrders.push(newOrder);
      localStorage.setItem('customerOrders', JSON.stringify(customerOrders));

      const adminOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const now = new Date();
      const timestamp = { seconds: Math.floor(now.getTime() / 1000), nanoseconds: (now.getTime() % 1000) * 1000000 };

      const adminOrder = {
        id: newOrder.id, date: new Date().toISOString(),
        products: cart.map(item => ({ productId: item.productId, name: item.name, price: item.price, quantity: item.quantity, subtotal: item.subtotal })),
        subtotal, tax, total, paymentMethod, userId: 'online-customer', status: 'pendiente',
        customerInfo, type: 'online', createdAt: timestamp, updatedAt: timestamp
      };
      adminOrders.push(adminOrder);
      localStorage.setItem('orders', JSON.stringify(adminOrders));

      for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (product) { product.stock -= item.quantity; product.updatedAt = new Date(); }
      }
      localStorage.setItem('mockProducts', JSON.stringify(products));

      const inventoryMovements = JSON.parse(localStorage.getItem('mockInventoryMovements') || '[]');
      for (const item of cart) {
        inventoryMovements.push({
          id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11),
          productId: item.productId, type: 'salida', quantity: item.quantity,
          userId: 'online-customer', reason: 'Venta Online - Pedido: ' + newOrder.id,
          date: timestamp, createdAt: timestamp
        });
      }
      localStorage.setItem('mockInventoryMovements', JSON.stringify(inventoryMovements));

      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const newInvoice = {
        id: newOrder.id, invoiceNumber: 'INV-' + Date.now(), orderId: newOrder.id, date: timestamp,
        customer: { name: customerInfo.name, phone: customerInfo.phone, email: customerInfo.email || 'N/A', address: customerInfo.address || 'N/A' },
        products: cart.map(item => ({ name: item.name, quantity: item.quantity, price: item.price, subtotal: item.subtotal })),
        subtotal, tax, total, paymentMethod, status: 'pendiente', type: 'online', userId: 'online-customer', createdAt: timestamp
      };
      invoices.push(newInvoice);
      localStorage.setItem('invoices', JSON.stringify(invoices));

      // Notificar al negocio (email + push notification)
      notificationService.notifyNewOrderToAdmin(newOrder, cart, customerInfo, total, paymentMethod);

      clearCart();
      closeCart();
      setShowCheckoutForm(false);
      setCustomerInfo({ name: '', phone: '', email: '', address: '', notes: '' });
      navigate('/store/order-confirmation', { state: { order: newOrder } });

    } catch (error) {
      console.error('Error al procesar pedido:', error);
      alert('Error al procesar el pedido: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className={`offcanvas offcanvas-end ${showCart ? 'show' : ''}`} tabIndex="-1"
        style={{ visibility: showCart ? 'visible' : 'hidden', width: '450px', maxWidth: '90vw' }}>
        <div className="offcanvas-header" style={{ background: 'linear-gradient(135deg, #8B4513, #D2691E)', color: 'white' }}>
          <h5 className="offcanvas-title"><i className="bi bi-cart3 me-2"></i>Mi Carrito ({cart.length})</h5>
          <button type="button" className="btn-close btn-close-white" onClick={closeCart}></button>
        </div>
        <div className="offcanvas-body p-0 d-flex flex-column">
          {cart.length > 0 ? (
            <>
              {!showCheckoutForm ? (
                <>
                  <div className="flex-grow-1 overflow-auto p-3">
                    {cart.map(item => (
                      <div key={item.productId} className="card mb-3 shadow-sm">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-start">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="rounded me-3"
                                style={{ width: '60px', height: '60px', objectFit: 'cover', flexShrink: 0 }}
                                onError={(e) => e.target.style.display = 'none'} />
                            )}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="mb-0">{item.name}</h6>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.productId)}>
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="input-group" style={{ width: '120px' }}>
                                  <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                                    <i className="bi bi-dash"></i>
                                  </button>
                                  <input type="number" className="form-control form-control-sm text-center" value={item.quantity}
                                    onChange={(e) => { const val = parseInt(e.target.value) || 0; if (val >= 0) updateQuantity(item.productId, val); }}
                                    min="0" max={item.stock} />
                                  <button className="btn btn-outline-secondary btn-sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    disabled={item.quantity >= item.stock}>
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                                <div className="text-end">
                                  <small className="text-muted d-block">${item.price.toFixed(2)} c/u</small>
                                  <strong className="text-primary">${item.subtotal.toFixed(2)}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-top p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1"><span className="text-muted">Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                      <div className="d-flex justify-content-between mb-1"><span className="text-muted">IVA (16%):</span><span>${tax.toFixed(2)}</span></div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between"><strong>Total:</strong><strong className="text-primary fs-5">${total.toFixed(2)}</strong></div>
                    </div>
                    <div className="d-grid gap-2">
                      <button className="btn btn-primary btn-lg" onClick={() => setShowCheckoutForm(true)}>
                        <i className="bi bi-check-circle me-2"></i>Realizar Pedido
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => { if (window.confirm('Vaciar el carrito?')) clearCart(); }}>
                        <i className="bi bi-trash me-2"></i>Vaciar Carrito
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-grow-1 overflow-auto p-3">
                    <button className="btn btn-link text-decoration-none mb-3 p-0" onClick={() => setShowCheckoutForm(false)}>
                      <i className="bi bi-arrow-left me-2"></i>Volver al carrito
                    </button>
                    <h6 className="mb-3">Datos de Entrega</h6>
                    <form onSubmit={handleCheckout}>
                      <div className="mb-3">
                        <label className="form-label">Nombre Completo *</label>
                        <input type="text" className="form-control" value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Telefono *</label>
                        <input type="tel" className="form-control" value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={customerInfo.email}
                          onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Direccion de Entrega</label>
                        <textarea className="form-control" rows="2" value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Metodo de Pago</label>
                        <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                          <option value="efectivo">Efectivo</option>
                          <option value="tarjeta">Tarjeta</option>
                          <option value="transferencia">Transferencia</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Notas Adicionales</label>
                        <textarea className="form-control" rows="2" value={customerInfo.notes}
                          onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                          placeholder="Instrucciones especiales, alergias, etc."></textarea>
                      </div>
                    </form>
                  </div>
                  <div className="border-top p-3" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total a Pagar:</strong>
                      <strong className="text-primary fs-5">${total.toFixed(2)}</strong>
                    </div>
                    <button className="btn btn-primary btn-lg w-100" onClick={handleCheckout} disabled={processing}>
                      {processing ? (<><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</>)
                        : (<><i className="bi bi-check-circle me-2"></i>Confirmar Pedido</>)}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
              <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
              <h5 className="text-muted mb-2">Tu carrito esta vacio</h5>
              <p className="text-muted text-center small">Explora nuestros deliciosos postres</p>
              <button className="btn btn-primary mt-3" onClick={() => { closeCart(); navigate('/store'); }}>
                <i className="bi bi-shop me-2"></i>Ver Productos
              </button>
            </div>
          )}
        </div>
      </div>
      {showCart && <div className="offcanvas-backdrop fade show" onClick={closeCart} style={{ zIndex: 1040 }}></div>}
    </>
  );
};

export default CustomerCartOffcanvas;
