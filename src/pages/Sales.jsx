import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const Sales = () => {
  const { addToCart, openCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleAddToCart = (product) => {
    try {
      addToCart(product, 1);
      // Mostrar notificación de éxito
      const toast = document.createElement('div');
      toast.className = 'position-fixed top-0 end-0 p-3';
      toast.style.zIndex = '9999';
      toast.innerHTML = `
        <div class="toast show" role="alert">
          <div class="toast-header bg-success text-white">
            <i class="bi bi-check-circle me-2"></i>
            <strong class="me-auto">Agregado al carrito</strong>
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.parentElement.remove()"></button>
          </div>
          <div class="toast-body">
            ${product.name} agregado correctamente
          </div>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      alert(error.message);
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
          <i className="bi bi-cart-plus me-2"></i>
          Punto de Venta
        </h1>
        <button className="btn btn-primary" onClick={openCart}>
          <i className="bi bi-cart3 me-2"></i>
          Ver Carrito
        </button>
      </div>

      <div className="row">
        {/* Productos */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="mb-0">Productos Disponibles</h5>
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
            <div className="card-body">
              <div className="row">
                {filteredProducts.map(product => (
                  <div key={product.id} className="col-md-3 col-lg-2 mb-3">
                    <div 
                      className="card product-card h-100"
                      onClick={() => product.stock > 0 && handleAddToCart(product)}
                      style={{ cursor: product.stock > 0 ? 'pointer' : 'not-allowed', opacity: product.stock > 0 ? 1 : 0.6 }}
                    >
                      {product.image && (
                        <img 
                          src={product.image} 
                          className="card-img-top" 
                          alt={product.name}
                          style={{ height: '150px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      <div 
                        className="text-center py-4" 
                        style={{ 
                          display: product.image ? 'none' : 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '150px',
                          backgroundColor: '#f8f9fa'
                        }}
                      >
                        <i className="bi bi-box display-4 text-primary"></i>
                      </div>
                      <div className="card-body">
                        <h6 className="card-title mb-1">{product.name}</h6>
                        <p className="card-text text-muted small mb-2">{product.category}</p>
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
      </div>
    </div>
  );
};

export default Sales;