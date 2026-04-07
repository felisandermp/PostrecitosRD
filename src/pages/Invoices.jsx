import { useState, useEffect } from 'react';
import { invoiceService } from '../services/invoiceService';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const invoicesData = await invoiceService.getInvoices();
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      await invoiceService.downloadInvoicePDF(invoice);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
    }
  };

  const handlePreviewPDF = async (invoice) => {
    try {
      const doc = await invoiceService.generateInvoicePDF(invoice);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewInvoice(invoice);
    } catch (error) {
      console.error('Error al generar vista previa:', error);
    }
  };

  const handlePrintPDF = async (invoice) => {
    try {
      const doc = await invoiceService.generateInvoicePDF(invoice);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    } catch (error) {
      console.error('Error al imprimir:', error);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewInvoice(null);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    let matchesDate = true;
    if (dateFilter) {
      const invoiceDate = new Date(invoice.date.seconds * 1000).toISOString().split('T')[0];
      matchesDate = invoiceDate === dateFilter;
    }
    return matchesSearch && matchesDate;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);

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
          <i className="bi bi-receipt me-2"></i>
          Gestión de Facturas
        </h1>
        <button className="btn btn-outline-primary" onClick={loadInvoices}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input type="text" className="form-control" placeholder="Buscar por número o cliente..."
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <input type="date" className="form-control" value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)} />
                </div>
                <div className="col-md-2">
                  <button className="btn btn-outline-secondary w-100"
                    onClick={() => { setSearchTerm(''); setDateFilter(''); }}>
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stats-card success">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle mb-2 text-muted">Total Filtrado</h6>
                  <h4 className="card-title mb-0">${totalAmount.toFixed(2)}</h4>
                </div>
                <div className="text-success">
                  <i className="bi bi-currency-dollar display-6"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de facturas */}
      <div className="card">
        <div className="card-body">
          {filteredInvoices.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Pago</th>
                    <th>Subtotal</th>
                    <th>IVA</th>
                    <th>Total</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(invoice => (
                    <tr key={invoice.id}>
                      <td><strong className="text-primary">{invoice.invoiceNumber}</strong></td>
                      <td>
                        {new Date(invoice.date.seconds * 1000).toLocaleDateString()}
                        <br />
                        <small className="text-muted">
                          {new Date(invoice.date.seconds * 1000).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        {invoice.customer?.name || 'Cliente General'}
                        {invoice.customer?.phone && (
                          <><br /><small className="text-muted"><i className="bi bi-telephone me-1"></i>{invoice.customer.phone}</small></>
                        )}
                      </td>
                      <td>
                        {invoice.type === 'online' ? (
                          <span className="badge bg-info"><i className="bi bi-globe me-1"></i>Online</span>
                        ) : (
                          <span className="badge bg-secondary"><i className="bi bi-shop me-1"></i>Tienda</span>
                        )}
                      </td>
                      <td><span className="badge bg-secondary">{invoice.paymentMethod}</span></td>
                      <td>${invoice.subtotal.toFixed(2)}</td>
                      <td>${(invoice.tax || 0).toFixed(2)}</td>
                      <td><strong>${invoice.total.toFixed(2)}</strong></td>
                      <td>
                        <div className="btn-group" role="group">
                          <button className="btn btn-sm btn-outline-info" onClick={() => handlePreviewPDF(invoice)} title="Vista previa">
                            <i className="bi bi-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownloadPDF(invoice)} title="Descargar PDF">
                            <i className="bi bi-download"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-success" onClick={() => handlePrintPDF(invoice)} title="Imprimir">
                            <i className="bi bi-printer"></i>
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
              <i className="bi bi-receipt display-4 text-muted mb-3"></i>
              <p className="text-muted">
                {invoices.length === 0 ? 'No hay facturas registradas' : 'No se encontraron facturas'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      {filteredInvoices.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0"><i className="bi bi-graph-up me-2"></i>Resumen del Período</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <h4 className="text-primary">{filteredInvoices.length}</h4>
                    <small className="text-muted">Facturas</small>
                  </div>
                  <div className="col-4">
                    <h4 className="text-success">${totalAmount.toFixed(2)}</h4>
                    <small className="text-muted">Total Vendido</small>
                  </div>
                  <div className="col-4">
                    <h4 className="text-info">
                      ${filteredInvoices.length > 0 ? (totalAmount / filteredInvoices.length).toFixed(2) : '0.00'}
                    </h4>
                    <small className="text-muted">Promedio</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa PDF */}
      {previewUrl && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9998 }}
          onClick={closePreview}>
          <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '900px' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6 className="modal-title">
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Vista Previa - {previewInvoice?.invoiceNumber}
                </h6>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-primary" onClick={() => handleDownloadPDF(previewInvoice)}>
                    <i className="bi bi-download me-1"></i>Descargar
                  </button>
                  <button className="btn btn-sm btn-success" onClick={() => handlePrintPDF(previewInvoice)}>
                    <i className="bi bi-printer me-1"></i>Imprimir
                  </button>
                  <button type="button" className="btn-close" onClick={closePreview}></button>
                </div>
              </div>
              <div className="modal-body p-0">
                <iframe src={previewUrl} style={{ width: '100%', height: '75vh', border: 'none' }}
                  title="Vista previa factura"></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
