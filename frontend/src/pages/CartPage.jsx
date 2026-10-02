import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const CartPage = ({ onContinueShopping, onProceedToCheckout }) => {
  const {
    cartItems,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to complete your purchase', 'info');
      openAuthModal('login');
    } else {
      onProceedToCheckout();
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item._id);
    showToast(`Removed "${item.name}" from cart`, 'info');
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.toUpperCase() === 'CODEALPHA' || promoCode.toUpperCase() === 'SAVE10') {
      setPromoApplied(true);
      showToast('Promo code applied successfully!');
    } else {
      showToast('Invalid promo code. Try "CODEALPHA"', 'error');
    }
  };

  // Free shipping threshold
  const freeShippingThreshold = 100;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - itemsPrice);
  const progressPercent = Math.min(100, (itemsPrice / freeShippingThreshold) * 100);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-12 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold">
            🛒
          </div>
          <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't added any products to your shopping cart yet. Explore our wide collection of electronics and essentials!
          </p>
          <div className="pt-4">
            <button
              onClick={onContinueShopping}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer"
            >
              Start Shopping &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and adjust your selected items ({cartItems.reduce((a, c) => a + c.qty, 0)} items)
          </p>
        </div>
        <button
          onClick={() => {
            clearCart();
            showToast('Shopping cart cleared', 'info');
          }}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Meter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-800">
            {remainingForFreeShipping === 0 ? (
              <span className="text-emerald-700 flex items-center space-x-1">
                <span>🎉</span>
                <span>You unlocked FREE shipping on this order!</span>
              </span>
            ) : (
              <span>
                Add <span className="text-indigo-600">${remainingForFreeShipping.toFixed(2)}</span> more for <span className="text-emerald-600">FREE shipping</span>
              </span>
            )}
          </span>
          <span className="text-slate-400 font-medium">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    ${item.price.toFixed(2)} each
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">
                    {item.countInStock} available
                  </p>
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                {/* Stepper */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => updateQuantity(item._id, item.qty - 1)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-900">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.qty + 1)}
                    disabled={item.qty >= item.countInStock}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Line Price */}
                <div className="text-right min-w-[70px]">
                  <span className="text-base font-black text-slate-900">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleRemove(item)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition rounded-xl hover:bg-rose-50 cursor-pointer"
                  title="Remove from Cart"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Continue Shopping Link */}
          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={onContinueShopping}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
            >
              <span>&larr;</span>
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs sticky top-24 space-y-6">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cartItems.reduce((a, c) => a + c.qty, 0)} items)</span>
                <span className="font-bold text-slate-900">${itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-bold text-slate-900">
                  {shippingPrice === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `$${shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (10%)</span>
                <span className="font-bold text-slate-900">${taxPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Have a coupon code?
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. CODEALPHA"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center space-x-1">
                  <span>✓</span>
                  <span>Coupon &ldquo;{promoCode}&rdquo; verified!</span>
                </p>
              )}
            </form>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">Estimated Total</span>
              <span className="text-2xl font-black text-indigo-600">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition cursor-pointer active:scale-[0.98]"
            >
              {isAuthenticated ? 'Proceed to Checkout &rarr;' : 'Sign In to Checkout &rarr;'}
            </button>

            <div className="text-center">
              <span className="text-[11px] text-slate-400">
                🔒 Protected with JWT Authentication & Mongoose Orders
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
