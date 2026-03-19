import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Invoices from './pages/Invoices';
import SalesHistory from './pages/SalesHistory';
import OrderHistory from './pages/OrderHistory';
import CartOffcanvas from './components/CartOffcanvas';
import Store from './pages/Store';
import OrderConfirmation from './pages/OrderConfirmation';
import CustomerOrders from './pages/CustomerOrders';
import StoreNavbar from './components/StoreNavbar';
import CustomerCartOffcanvas from './components/CustomerCartOffcanvas';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Ruta Principal - Redirige a Tienda */}
            <Route path="/" element={<Navigate to="/store" replace />} />
            
            {/* Rutas Públicas - Tienda Online */}
            <Route path="/store" element={
              <>
                <StoreNavbar />
                <Store />
                <CustomerCartOffcanvas />
              </>
            } />
            <Route path="/store/order-confirmation" element={
              <>
                <StoreNavbar />
                <OrderConfirmation />
                <CustomerCartOffcanvas />
              </>
            } />
            <Route path="/store/orders" element={
              <>
                <StoreNavbar />
                <CustomerOrders />
                <CustomerCartOffcanvas />
              </>
            } />

            {/* Rutas Administrativas */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <>
                  <Layout />
                  <CartOffcanvas />
                </>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="sales" element={<Sales />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="sales-history" element={<SalesHistory />} />
              <Route path="order-history" element={<OrderHistory />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;