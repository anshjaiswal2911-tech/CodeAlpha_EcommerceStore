import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('codealpha_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('codealpha_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Add item to cart with given quantity
   */
  const addToCart = (product, qty = 1) => {
    const existingIndex = cartItems.findIndex((item) => item._id === product._id);

    if (existingIndex > -1) {
      // Item already in cart: update quantity up to max stock
      const updated = [...cartItems];
      const newQty = Math.min(
        updated[existingIndex].qty + qty,
        product.countInStock
      );
      updated[existingIndex].qty = newQty;
      setCartItems(updated);
    } else {
      // New item in cart
      setCartItems((prev) => [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          countInStock: product.countInStock,
          qty: Math.min(qty, product.countInStock),
        },
      ]);
    }
  };

  /**
   * Update item quantity directly
   */
  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id === productId) {
          const validQty = Math.min(Math.max(1, qty), item.countInStock);
          return { ...item, qty: validQty };
        }
        return item;
      })
    );
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  // Free shipping for orders over $100, otherwise $10 flat
  const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10.0;

  // 10% estimated tax
  const taxPrice = itemsPrice * 0.1;

  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        itemsPrice: Number(itemsPrice.toFixed(2)),
        shippingPrice: Number(shippingPrice.toFixed(2)),
        taxPrice: Number(taxPrice.toFixed(2)),
        totalPrice: Number(totalPrice.toFixed(2)),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
