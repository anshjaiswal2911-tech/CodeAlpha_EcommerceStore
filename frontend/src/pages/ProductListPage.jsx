import React, { useState, useEffect, useMemo } from 'react';
import { apiGetProducts } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.jsx';

const CATEGORIES = [
  'All',
  'Electronics',
  'Lifestyle',
  'Accessories',
  'Home & Kitchen',
  'Clothing',
];

export const ProductListPage = ({ onSelectProduct, searchTerm, setSearchTerm }) => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-asc' | 'price-desc' | 'name'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGetProducts(searchTerm, selectedCategory);
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory]);

  // Client-side sorting on retrieved products
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [products, sortBy]);

  return (
    <div className="space-y-8">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-4">
            ✨ CodeAlpha Full-Stack Store
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Discover Quality Products for Your Everyday Lifestyle
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Shop modern electronics, premium lifestyle essentials, and apparel with fast delivery, secure authentication, and easy checkout.
          </p>
        </div>
        
        {/* Background glow styling */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        
        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort & Counter Controls */}
        <div className="flex items-center justify-between md:justify-end space-x-4">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{sortedProducts.length}</span> items
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(searchTerm || selectedCategory !== 'All') && (
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg border border-indigo-200">
              Keyword: &ldquo;{searchTerm}&rdquo;
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1.5 text-indigo-400 hover:text-indigo-800"
              >
                ✕
              </button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg border border-slate-200">
              Category: {selectedCategory}
              <button
                onClick={() => setSelectedCategory('All')}
                className="ml-1.5 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="text-xs text-indigo-600 hover:underline font-bold ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-4/3 bg-slate-200 w-full" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-full" />
                <div className="h-3 bg-slate-100 rounded-md w-2/3" />
                <div className="pt-3 flex justify-between items-center border-t border-slate-100">
                  <div className="h-6 bg-slate-200 rounded-md w-16" />
                  <div className="h-8 bg-slate-200 rounded-xl w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center text-rose-700 max-w-md mx-auto space-y-3">
          <div className="text-3xl">⚠️</div>
          <p className="font-bold text-sm">Failed to retrieve product catalog</p>
          <p className="text-xs text-rose-600">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-sm"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Empty Products State */}
      {!loading && !error && sortedProducts.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We couldn't find any products matching your current search or category filter. Try changing your search query or reset filters.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && sortedProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};
