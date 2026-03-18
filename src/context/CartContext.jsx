import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + quantity <= product.stock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity, 
                subtotal: (item.quantity + quantity) * item.price 
              }
            : item
        ));
      } else {
        throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
      }
    } else {
      if (product.stock >= quantity) {
        setCart([...cart, {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity,
          subtotal: product.price * quantity,
          stock: product.stock
        }]);
      } else {
        throw new Error('Producto agotado');
      }
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(i => i.productId === productId);
    if (newQuantity > item.stock) {
      throw new Error('Stock insuficiente');
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

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.16; // 16% IVA
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };

  const openCart = () => {
    setShowCart(true);
  };

  const closeCart = () => {
    setShowCart(false);
  };

  const value = {
    cart,
    showCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    toggleCart,
    openCart,
    closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};