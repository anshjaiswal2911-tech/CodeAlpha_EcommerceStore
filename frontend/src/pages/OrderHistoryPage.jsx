import React, { useState, useEffect } from 'react';
import { apiGetMyOrders } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const OrderHistoryPage = ({ onStartShopping, onGoToCart }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetMyOrders();
      setOrders(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReorder = (order) => {
    if (!order.orderItems || order.orderItems.length === 0) return;
    order.orderItems.forEach((item) => {
      addToCart(
        {
          _id: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          countInStock: 99,
        },
        item.qty
      );
    });
    showToast(`Added ${order.orderItems.length} items from order #${order._id.substring(order._id.length - 6)} to cart!`);
    if (onGoToCart) {
      onGoToCart();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 bg-slate-200 rounded-xl w-48 animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-16 bg-slate-100 rounded-2xl w-full" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and review your past store purchases ({orders.length} orders placed)
          </p>
        </div>
        <button
          onClick={onStartShopping}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer self-start sm:self-auto"
        >
          Shop More Products &rarr;
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 space-y-2">
          <p className="text-xs font-bold">⚠️ {error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            📦
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Orders Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not placed any orders yet. Explore our product catalog and start shopping!
          </p>
          <div className="pt-2">
            <button
              onClick={onStartShopping}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 transition hover:border-slate-300"
            >
              {/* Order Header Summary */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Order ID
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    #{order._id}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Date Placed
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Amount
                  </span>
                  <span className="text-base font-black text-indigo-600">
                    ${order.totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      order.isPaid
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {order.isPaid ? '✓ Paid' : '⏳ Payment Pending'}
                  </span>

                  <button
                    onClick={() => handleReorder(order)}
                    className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
                    title="Add all items to shopping cart"
                  >
                    ↻ Reorder
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Purchased Items ({order.orderItems?.reduce((a, c) => a + c.qty, 0) || 0}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {order.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Qty: {item.qty} &bull; ${(item.price * item.qty).toFixed(2)} (${item.price.toFixed(2)} ea)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Payment Footer */}
              <div className="pt-3 flex flex-wrap justify-between text-[11px] text-slate-500 gap-2 border-t border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700">Delivery Address: </span>
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Payment Method: </span>
                  <span className="font-medium text-slate-800">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
