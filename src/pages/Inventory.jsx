import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { user } = useAuth();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('entrada');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [movementsData, productsData, summaryData] = await Promise.all([
        inventoryService.getMovements(),
        productService.getProducts(),
        inventoryService.getInventorySummary()
      ]);
      
      setMovements(movementsData);
      setProducts(productsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error al cargar datos de inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct || !adjustmentQuantity || adjustmentQuantity <= 0) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const quantity = parseInt(adjustmentQuantity);
      
      if (adjustmentType === 'entrada') {
        await inventoryService.increaseStock(selectedProduct, quantity, user.uid, adjustmentReason);
      } else {
        const product = products.find(p => p.id === selectedProduct);
        if (product.stock < quantity) {
          alert('No hay suficiente stock para realizar esta salida');
          return;
        }
        await inventoryService.decreaseStock(selectedProduct, quantity, user.uid, 'MANUAL-' + Date.now());
      }

      alert('Ajuste de inventario realizado exitosamente');
      setShowAdjustModal(false);
      setSelectedProduct('');
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      loadInventoryData();
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
      alert('Error al ajustar inventario: ' + error.message);
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
          <i className="bi bi-clipboard-data me-2"></i>
          Control de Inventario
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAdjustModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Ajustar Stock
        </button>
      </div>

      {/* Resumen de inventario */}
      {summary && (
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card stats-card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Total Productos</h6>
                    <h3 className="card-title mb-0">{summary.totalProducts}</h3>
                  </div>
                  <div className="text-primary">
                    <i className="bi bi-box display-6"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card stats-card success">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Valor Total</h6>
                    <h3 className="card-title mb-0">${summary.totalValue.toFixed(2)}</h3>
                  </div>
                  <div className="text-success">
                    <i className="bi bi-currency-dollar display-6"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card stats-card warning">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Stock Bajo</h6>
                    <h3 className="card-title mb-0">{summary.lowStockCount}</h3>
                  </div>
                  <div className="text-warning">
                    <i className="bi bi-exclamation-triangle display-6"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card stats-card danger">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2 text-muted">Sin Stock</h6>
                    <h3 className="card-title mb-0">{summary.outOfStockCount}</h3>
                  </div>
                  <div className="text-danger">
                    <i className="bi bi-x-circle display-6"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Historial de movimientos */}
        <div className="col-md-8 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Historial de Movimientos
              </h5>
            </div>
            <div className="card-body">
              {movements.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th>Tipo</th>
                        <th>Cantidad</th>
                        <th>Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map(movement => (
                        <tr key={movement.id}>
                          <td>
                            <small>
                              {new Date(movement.date.seconds * 1000).toLocaleString()}
                            </small>
                          </td>
                          <td>{movement.productName}</td>
                          <td>
                            <span className={`badge ${
                              movement.type === 'entrada' ? 'bg-success' : 'bg-danger'
                            }`}>
                              {movement.type === 'entrada' ? 'Entrada' : 'Salida'}
                            </span>
                          </td>
                          <td>
                            <strong className={movement.type === 'entrada' ? 'text-success' : 'text-danger'}>
                              {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                            </strong>
                          </td>
                          <td>
                            <small className="text-muted">{movement.reason}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-clipboard-x display-4 text-muted mb-3"></i>
                  <p className="text-muted">No hay movimientos registrados</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos con alertas */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Alertas de Stock
              </h5>
            </div>
            <div className="card-body">
              {summary && (summary.lowStockProducts.length > 0 || summary.outOfStockProducts.length > 0) ? (
                <div>
                  {summary.outOfStockProducts.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-danger">Sin Stock</h6>
                      {summary.outOfStockProducts.map(product => (
                        <div key={product.id} className="alert alert-danger py-2">
                          <strong>{product.name}</strong>
                          <br />
                          <small>Stock: {product.stock}</small>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {summary.lowStockProducts.length > 0 && (
                    <div>
                      <h6 className="text-warning">Stock Bajo</h6>
                      {summary.lowStockProducts.map(product => (
                        <div key={product.id} className="alert alert-warning py-2">
                          <strong>{product.name}</strong>
                          <br />
                          <small>Stock: {product.stock}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle display-4 text-success mb-3"></i>
                  <p className="text-muted">Stock en buen estado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de ajuste de stock */}
      {showAdjustModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Ajustar Stock
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAdjustModal(false)}
                ></button>
              </div>

              <form onSubmit={handleStockAdjustment}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="product" className="form-label">Producto</label>
                    <select
                      className="form-select"
                      id="product"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.filter(p => p.active).map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock actual: {product.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="type" className="form-label">Tipo de Movimiento</label>
                    <select
                      className="form-select"
                      id="type"
                      value={adjustmentType}
                      onChange={(e) => setAdjustmentType(e.target.value)}
                    >
                      <option value="entrada">Entrada (Aumentar Stock)</option>
                      <option value="salida">Salida (Disminuir Stock)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">Cantidad</label>
                    <input
                      type="number"
                      className="form-control"
                      id="quantity"
                      value={adjustmentQuantity}
                      onChange={(e) => setAdjustmentQuantity(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="reason" className="form-label">Motivo</label>
                    <input
                      type="text"
                      className="form-control"
                      id="reason"
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                      placeholder="Ej: Reposición, Merma, Ajuste de inventario"
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAdjustModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>
                    Realizar Ajuste
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;