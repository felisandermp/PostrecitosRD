import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ProductModal from '../components/ProductModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      try {
        await productService.deleteProduct(product.id);
        await loadProducts();
        alert('Producto eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar producto');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    loadProducts();
    handleModalClose();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

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
          <i className="bi bi-box-seam me-2"></i>
          Gestión de Productos
        </h1>
        <button className="btn btn-primary" onClick={handleCreateProduct}>
          <i className="bi bi-plus-circle me-2"></i>
          Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
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
            <div className="col-md-4">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={loadProducts}>
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="card">
        <div className="card-body">
          {filteredProducts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Costo</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="rounded"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'inline-block';
                            }}
                          />
                        ) : null}
                        <i 
                          className="bi bi-box text-muted" 
                          style={{ 
                            fontSize: '2rem',
                            display: product.image ? 'none' : 'inline-block'
                          }}
                        ></i>
                      </td>
                      <td>
                        <div>
                          <strong>{product.name}</strong>
                          <br />
                          <small className="text-muted">{product.description}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{product.category}</span>
                      </td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>${product.cost.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${
                          product.stock === 0 ? 'bg-danger' : 
                          product.stock <= 10 ? 'bg-warning text-dark' : 
                          'bg-success'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${product.active ? 'bg-success' : 'bg-secondary'}`}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditProduct(product)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-box display-4 text-muted mb-3"></i>
              <p className="text-muted">No se encontraron productos</p>
              <button className="btn btn-primary" onClick={handleCreateProduct}>
                <i className="bi bi-plus-circle me-2"></i>
                Crear primer producto
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de producto */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          onClose={handleModalClose}
          onSave={handleProductSaved}
        />
      )}
    </div>
  );
};

export default Products;