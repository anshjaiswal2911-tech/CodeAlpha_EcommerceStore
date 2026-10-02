import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { ProductListPage } from './pages/ProductListPage.jsx';
import { ProductDetailPage } from './pages/ProductDetailPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { OrderHistoryPage } from './pages/OrderHistoryPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { AuthModal } from './pages/AuthModal.jsx';

function MainStore() {
  // Views: 'catalog' | 'detail' | 'cart' | 'checkout' | 'orders' | 'auth'
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSuccessNotice, setOrderSuccessNotice] = useState(null);

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order) => {
    setOrderSuccessNotice(order);
    setCurrentView('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Order Success Toast Notification */}
        {orderSuccessNotice && (
          <div className="mb-8 p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-xs shadow-emerald-200">
                ✓
              </div>
              <div>
                <p className="text-sm font-black">
                  Order #{orderSuccessNotice._id} placed and confirmed!
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Amount: ${orderSuccessNotice.totalPrice?.toFixed(2)} &bull; Method: {orderSuccessNotice.paymentMethod} &bull; Delivery: {orderSuccessNotice.shippingAddress?.city}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOrderSuccessNotice(null)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-4 py-2 rounded-xl bg-emerald-100/80 hover:bg-emerald-200 transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Page Views */}
        {currentView === 'catalog' && (
          <ProductListPage
            onSelectProduct={handleSelectProduct}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {currentView === 'detail' && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={() => setCurrentView('catalog')}
            onGoToCart={() => setCurrentView('cart')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'cart' && (
          <CartPage
            onContinueShopping={() => setCurrentView('catalog')}
            onProceedToCheckout={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onCancel={() => setCurrentView('cart')}
          />
        )}

        {currentView === 'orders' && (
          <OrderHistoryPage
            onStartShopping={() => setCurrentView('catalog')}
            onGoToCart={() => setCurrentView('cart')}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage
            onAuthSuccess={() => setCurrentView('catalog')}
            onGoToCatalog={() => setCurrentView('catalog')}
          />
        )}
      </main>

      {/* Global Auth Modal for quick modal logins */}
      <AuthModal />

      {/* Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              CA
            </span>
            <span className="font-bold text-slate-800">CodeAlpha Store</span>
            <span>&bull; Full Stack Internship Project</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400 text-xs">
            <span>React 18 + Vite</span>
            <span>Tailwind CSS</span>
            <span>Express.js API</span>
            <span>MongoDB + JWT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <MainStore />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
