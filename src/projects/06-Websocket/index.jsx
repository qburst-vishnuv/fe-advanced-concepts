import React, { useState, useEffect, useRef, useTransition } from 'react';
import {  WorkerActions } from './worker';

// Helper to generate 20,000 mock products
function generateInitialProducts() {
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Toys'];
  return Array.from({ length: 2000 }, (_, i) => ({
    id: `prod-${i}`,
    name: `Product ${i} - Premium Item`,
    category: categories[i % categories.length],
    stock: Math.floor(Math.random() * 500),
    price: (Math.random() * 100 + 5).toFixed(2),
    lastUpdated: Date.now(),
    // Heavy unnecessary metadata
    supplierInfo: { name: `Supplier ${i}`, location: 'Warehouse A', rating: 4.5 },
  }));
}

export function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const workerRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./worker/index.ts', import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = async (e) => {
      const { type, data } = e.data;

      if (
        type === WorkerActions.INIT_COMPLETE ||
        type === WorkerActions.UPDATE_COMPLETE ||
        type === WorkerActions.FILTER_COMPLETE
      ) {
        // ⚠️ BOTTLE-NECK: Direct main-thread state update triggers full un-batched re-render
          startTransition(async() => {
            await window.scheduler.yield();
            setProducts(data);
          })
      }
    };

    // Load dataset into worker
    const initialData = generateInitialProducts();
    workerRef.current.postMessage({
      type: WorkerActions.INIT,
      payload: { products: initialData },
    });

    return () => {
      workerRef.current?.terminate();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ⚠️ UN-OPTIMIZED STREAM SIMULATOR: Floods worker with 100 updates/sec synchronously
  const toggleStreaming = async () => {
    if (isStreaming) {
      clearInterval(intervalRef.current);
      setIsStreaming(false);
    } else {
      setIsStreaming(true);
      intervalRef.current = setInterval(async() => {
        // Generate 50 random updates
        const updates = Array.from({ length: 50 }, () => ({
          id: `prod-${Math.floor(Math.random() * 20000)}`,
          stockDelta: Math.floor(Math.random() * 10) - 5,
        }));

        await window.scheduler.yield();
        workerRef.current.postMessage({
          type: WorkerActions.UPDATE_STREAM,
          payload: { updates },
        });
      }, 50); // Fires every 50ms (Freezes UI!)
    }
  };

  const handleCategoryChange = (newCategory) => {
    
    setCategory(newCategory);
    workerRef.current.postMessage({
      type: WorkerActions.FILTER,
      payload: { category: newCategory, query: searchQuery },
    });
  };

  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchQuery(text);
    

  

    workerRef.current.postMessage({
      type: WorkerActions.FILTER,
      payload: { category, query: text },
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>📦 Live E-Commerce Inventory Dashboard</h1>

      {/* Control Panel */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={toggleStreaming} style={{ padding: '10px' }}>
          {isStreaming ? '🛑 Stop Stream' : '⚡ Start Live Stream (50 updates/50ms)'}
        </button>

        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Filter products..."
          style={{ padding: '10px', width: '250px' }}
        />

        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          style={{ padding: '10px' }}
        >
          <option value="ALL">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Home">Home</option>
          <option value="Books">Books</option>
          <option value="Toys">Toys</option>
        </select>
      </div>

      <p>Displaying {products.length} products</p>

      {/* ⚠️ BOTTLE-NECK: Renders 20,000 DOM nodes without Virtualization or Caps */}
      <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ccc' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>
          {isLoading && <tbody>Loading...</tbody>}
         { !isLoading &&  <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td style={{ color: p.stock < 10 ? 'red' : 'green' }}>{p.stock}</td>
                <td>${p.price}</td>
              </tr>
            ))}
          </tbody> }
        </table>
      </div>
    </div>
  );
}
