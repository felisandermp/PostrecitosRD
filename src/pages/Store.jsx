import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

const Store = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      const productsData = await productService.getActiveProducts();
      setProducts(productsData);
      
      // Extraer categorías únicas
      const uniqueCategories = ['Todos', ...new Set(productsData.map(p => p.category))];
      setCategories(uniqueCategories);
      
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product, quantity = 1) => {
    try {
      addToCart(product, quantity);
      showToast(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${product.name} agregado al carrito`, 'success');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
      <div class="toast show" role="alert">
        <div class="toast-header bg-${type} text-white">
          <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
          <strong class="me-auto">${type === 'success' ? 'Éxito' : 'Aviso'}</strong>
          <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.parentElement.remove()"></button>
        </div>
        <div class="toast-body">${message}</div>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="store-page">
      {/* Hero Section */}
      <div className="hero-section text-center py-5" style={{
        background: 'linear-gradient(135deg, #8B4513, #D2691E)',
        color: 'white'
      }}>
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">
            <i className="bi bi-shop me-3"></i>
            Postrecitos de Mamá
          </h1>
          <p className="lead mb-4">Los mejores postres artesanales, hechos con amor</p>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="search-box bg-white rounded-pill p-2 shadow">
                <i className="bi bi-search text-muted ms-3"></i>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Buscar postres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ display: 'inline-block', width: 'calc(100% - 50px)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Filtros de Categoría */}
        <div className="mb-4">
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {categories.map(category => (
              <button
                key={category}
                className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="row g-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm product-card-store">
                {product.image ? (
                  <img
                    src={product.image}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: '250px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setSelectedProduct(product)}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: '250px', cursor: 'pointer' }}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <i className="bi bi-image display-1 text-muted"></i>
                  </div>
                )}
                
                <div className="card-body d-flex flex-column">
                  <span className="badge bg-secondary mb-2 align-self-start">{product.category}</span>
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text text-muted small flex-grow-1">
                    {product.description.length > 80 
                      ? product.description.substring(0, 80) + '...' 
                      : product.description}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <h4 className="text-primary mb-0">${product.price.toFixed(2)}</h4>
                      <small className={product.stock <= 10 && product.stock > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                        {product.stock === 0 ? 'Agotado' : product.stock <= 10 ? `Quedan ${product.stock} unidades` : ''}
                      </small>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <i className="bi bi-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-search display-1 text-muted mb-3"></i>
            <h4 className="text-muted">No se encontraron productos</h4>
            <p className="text-muted">Intenta con otra búsqueda o categoría</p>
          </div>
        )}
      </div>

      {/* Modal de Detalle del Producto */}
      {selectedProduct && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{selectedProduct.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setSelectedProduct(null);
                      setSelectedQuantity(1);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      {selectedProduct.image ? (
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="img-fluid rounded"
                          style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                        />
                      ) : (
                        <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '300px' }}>
                          <i className="bi bi-image display-1 text-muted"></i>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <span className="badge bg-secondary mb-3">{selectedProduct.category}</span>
                      <h3 className="text-primary mb-3">${selectedProduct.price.toFixed(2)}</h3>
                      <p className="mb-4">{selectedProduct.description}</p>
                      
                      <div className="mb-4">
                        <strong>Disponibilidad:</strong>
                        <span className={`ms-2 badge ${selectedProduct.stock > 10 ? 'bg-success' : selectedProduct.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {selectedProduct.stock === 0 ? 'Agotado' : selectedProduct.stock <= 10 ? 'Pocas unidades' : 'En stock'}
                        </span>
                      </div>

                      {/* Selector de Cantidad */}
                      <div className="mb-4">
                        <label className="form-label fw-bold">Cantidad:</label>
                        <div className="input-group" style={{ maxWidth: '200px' }}>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                            disabled={selectedQuantity <= 1}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <input 
                            type="number" 
                            className="form-control text-center"
                            value={selectedQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setSelectedQuantity(Math.min(Math.max(1, val), selectedProduct.stock));
                            }}
                            min="1"
                            max={selectedProduct.stock}
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => setSelectedQuantity(Math.min(selectedProduct.stock, selectedQuantity + 1))}
                            disabled={selectedQuantity >= selectedProduct.stock}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="mb-4 p-3 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">Total:</span>
                          <span className="h4 text-primary mb-0">
                            ${(selectedProduct.price * selectedQuantity).toFixed(2)}
                          </span>
                        </div>
                        <small className="text-muted">
                          {selectedQuantity} x ${selectedProduct.price.toFixed(2)}
                        </small>
                      </div>

                      <button
                        className="btn btn-primary btn-lg w-100"
                        onClick={() => {
                          handleAddToCart(selectedProduct, selectedQuantity);
                          setSelectedProduct(null);
                          setSelectedQuantity(1);
                        }}
                        disabled={selectedProduct.stock === 0}
                      >
                        <i className="bi bi-cart-plus me-2"></i>
                        Agregar al Carrito
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}

      {/* Banner Info de la Tienda */}
      <div style={{ background: 'linear-gradient(135deg, #8B4513, #D2691E)', marginTop: '2rem' }}>
        <div className="container py-3">
          <div className="row text-center align-items-center">
            <div className="col-md-3 mb-2 mb-md-0">
              <i className="bi bi-clock me-2 text-white"></i>
              <small className="text-white"><strong>Horario:</strong> Lun - Sáb 8:00 AM - 7:00 PM</small>
            </div>
            <div className="col-md-3 mb-2 mb-md-0">
              <i className="bi bi-telephone me-2 text-white"></i>
              <small className="text-white"><strong>Tel:</strong> (809) 753-5382</small>
            </div>
            <div className="col-md-3 mb-2 mb-md-0">
              <i className="bi bi-geo-alt me-2 text-white"></i>
              <small className="text-white"><strong>Av. La Gaviota, Ciudad Real Ecologica CJB, Santo Domingo Este</strong></small>
            </div>
            <div className="col-md-3 mb-2 mb-md-0">
              <i className="bi bi-truck me-2 text-white"></i>
              <small className="text-white"><strong>Delivery disponible</strong></small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
