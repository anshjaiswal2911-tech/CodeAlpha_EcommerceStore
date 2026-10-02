import React, { useState, useEffect } from 'react';
import { apiGetProductById, apiGetProducts } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ProductCard } from '../components/ProductCard.jsx';

export const ProductDetailPage = ({ productId, onBack, onGoToCart, onSelectProduct }) => {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      setQty(1);
      try {
        const res = await apiGetProductById(productId);
        const prod = res.data;
        setProduct(prod);

        // Fetch related products in the same category
        if (prod && prod.category) {
          const relRes = await apiGetProducts('', prod.category);
          setRelatedProducts(
            (relRes.data || []).filter((p) => p._id !== prod._id).slice(0, 3)
          );
        }
      } catch (err) {
        setError(err.message || 'Product details not available');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || product.countInStock <= 0) return;
    addToCart(product, qty);
    setAdded(true);
    showToast(`Added ${qty} × "${product.name}" to cart!`);
    setTimeout(() => setAdded(false), 2200);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-slate-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-24 bg-slate-100 rounded w-full" />
            <div className="h-12 bg-slate-200 rounded-xl w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
        <div className="text-3xl">⚠️</div>
        <h2 className="text-base font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This product might no longer exist.'}</p>
        <div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition cursor-pointer"
          >
            &larr; Back to Products Catalog
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.countInStock <= 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <button
          onClick={onBack}
          className="hover:text-indigo-600 font-semibold cursor-pointer"
        >
          Catalog
        </button>
        <span>&rsaquo;</span>
        <span className="font-semibold text-slate-700">{product.category}</span>
        <span>&rsaquo;</span>
        <span className="text-slate-400 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
        
        {/* Product Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-xs border border-white/60">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details & Purchase Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">USD &bull; Fast shipping</span>
            </div>

            {/* Stock status Badge */}
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className="text-xs font-bold text-slate-700">
                {isOutOfStock
                  ? 'Out of Stock'
                  : product.countInStock <= 5
                  ? `Hurry, only ${product.countInStock} items remaining!`
                  : `In Stock (${product.countInStock} units available)`}
              </span>
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                About this item
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 pt-3 text-slate-600 text-[11px]">
              <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span>🚚</span>
                <span>Free shipping over $100</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span>🔒</span>
                <span>Secure JWT Checkout</span>
              </div>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    disabled={qty <= 1}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900">{qty}</span>
                  <button
                    onClick={() => setQty((prev) => Math.min(product.countInStock, prev + 1))}
                    disabled={qty >= product.countInStock}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-2xl text-sm font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 active:scale-[0.98]'
                }`}
              >
                {added ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Added {qty} to Cart!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Add to Shopping Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={onGoToCart}
                className="py-3.5 px-6 rounded-2xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center space-x-1 shadow-xs"
              >
                <span>View Cart</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Category Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            More in <span className="text-indigo-600">{product.category}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel._id}
                product={rel}
                onSelectProduct={(id) => {
                  if (onSelectProduct) onSelectProduct(id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
