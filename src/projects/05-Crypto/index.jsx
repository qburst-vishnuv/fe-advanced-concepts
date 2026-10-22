import React, { useState, useEffect, useRef, useTransition } from 'react';
import { WorkerControls } from './worker/worker';
import { heavyHandler } from '../../hooks/useHeavyHandler';

// Generates 50,000 raw financial order objects
function generateRawOrders() {
  return Array.from({ length: 50_000 }, (_, i) => ({
    id: `order-${i}`,
    symbol: i % 2 === 0 ? 'BTC-USD' : 'ETH-USD',
    price: (Math.random() * 50000).toFixed(2),
    amount: (Math.random() * 2).toFixed(4),
    timestamp: Date.now(),
    details: { traderId: `user-${i}`, exchange: 'Coinbase', priority: i % 5 }
  }));
}

export function BrokenOrderBook() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  const workerRef = useRef(null);

  // Single useEffect for complete Worker Lifecycle
  useEffect(() => {
    // 1. Instantiate Worker
    workerRef.current = new Worker(
      new URL("./worker/worker.js", import.meta.url), 
      { type: 'module' }
    );

    // 2. Set up listener ONCE before posting messages
    workerRef.current.onmessage = function (e) {
      const { type, data } = e.data;

      if (type === WorkerControls.INIT_COMPLETE) {
        console.log("Worker initialized dataset:", data.length, "items");
        heavyHandler?.();
        
        // Non-blocking UI update via startTransition
        startTransition(() => {
          setOrders(data);
        });
      } else if (type === WorkerControls.FILTER_COMPLETE) {
        heavyHandler?.();
        
        // Non-blocking UI update via startTransition
        startTransition(() => {
          setOrders(data ?? []);
        });
      }
    };

    // 3. Post INIT message with generated dataset
    const rawData = generateRawOrders();
    workerRef.current.postMessage({
      type: WorkerControls.INIT,
      payload: rawData
    });

    // 4. Clean up worker on unmount
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFilterChange = (e) => {
    const text = e.target.value;
    setFilter(text);

    // Dispatch filter command to worker thread
    workerRef.current?.postMessage({
      type: WorkerControls.FILTER,
      payload: { query: text }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <input
        value={filter}
        onChange={handleFilterChange}
        placeholder="Filter by symbol..."
        style={{ padding: '8px', width: '300px' }}
      />
      <p>
        Displaying {orders.length} orders{' '}
        {isPending && <span style={{ color: 'orange' }}>(Updating UI...)</span>}
      </p>

      {/* Render window capped at first 100 items for DOM performance */}
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            <strong>{order.symbol}</strong> - ${order.price} ({order.amount})
          </li>
        ))}
      </ul>
    </div>
  );
}