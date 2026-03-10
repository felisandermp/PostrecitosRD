import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const Sales = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      const productsData = await productService.getActiveProducts();
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        ));
      } else {
        alert('Stock insuficiente');
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price
        }]);
      } else {
        alert('Producto agotado');
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      alert('Stock insuficiente');
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const processOrder = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setProcessing(true);
    
    try {
      const { subtotal, tax, total } = calculateTotal();
      
      const orderData = {
        products: cart,
        subtotal,
        tax,
        total,
        paymentMethod,
        date: new Date()
      };

      await orderService.createOrder(orderData, user.uid);
      
      alert('Venta procesada exitosamente');
      clearCart();
      setPaymentMethod('efectivo');
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar la venta: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const { subtotal, tax, total } = calculateTotal();

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
          <i className="bi bi-cart-plus me-2"></i>
          Punto de Venta
        </h1>
      </div>

      <div className="row pos-container">
        {/* Productos */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="mb-0">Productos</h5>
                </div>
                <div className="col-md-6">
                  <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar productos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body product-grid">
              <div className="row">
                {filteredProducts.map(product => (
                  <div key={product.id} className="col-md-4 col-lg-3 mb-3">
                    <div 
                      className="card product-card h-100"
                      onClick={() => addToCart(product)}
                      style={{ cursor: product.stock > 0 ? 'pointer' : 'not-allowed' }}
                    >
                      <div className="card-body text-center">
                        <i className="bi bi-box display-4 text-primary mb-2"></i>
                        <h6 className="card-title">{product.name}</h6>
                        <p className="card-text text-muted small">{product.category}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <strong className="text-primary">${product.price.toFixed(2)}</strong>
                          <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-search display-4 text-muted mb-3"></i>
                  <p className="text-muted">No se encontraron productos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carrito */}
        <div className="col-md-4">
          <div className="cart-container">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-cart me-2"></i>
                  Carrito ({cart.length})
                </h5>
                {cart.length > 0 && (
                  <button className="btn btn-sm btn-outline-danger" onClick={clearCart}>
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="cart-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.productId} className="cart-item">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-1">{item.name}</h6>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="input-group" style={{ width: '120px' }}>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          className="form-control form-control-sm text-center"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                          min="0"
                        />
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <strong>${item.subtotal.toFixed(2)}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x display-4 text-muted mb-3"></i>
                  <p className="text-muted">Carrito vacío</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="p-3 border-top">
                  <div className="mb-3">
                    <label className="form-label">Método de Pago</label>
                    <select 
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                      <option value="transferencia">Transferencia</option>
                    </select>
                  </div>
                </div>

                <div className="cart-total">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>IVA (16%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                  
                  <button 
                    className="btn btn-light w-100"
                    onClick={processOrder}
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;