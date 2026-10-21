import React, { useState, useEffect, useRef } from 'react';
import { WorkerControls } from './worker/worker';

// Generates 10,000 raw financial order objects
function generateRawOrders() {
    return Array.from({ length: 50_0 }, (_, i) => ({
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

    const workerRef = useRef(null);

    useEffect(() => {

        workerRef.current = new Worker(new URL("./worker/worker.js", import.meta.url));

        workerRef.current.postMessage({
            type: WorkerControls.INIT,
            payload: orders
        })

        workerRef.current.onmessage = function(e) {
            const {
                type,
                data
            } = e.data;

            if(type === WorkerControls.INIT_COMPLETE) {
                console.log(data);
            }
        }

    },[orders])

    useEffect(() => {
        // Simulates receiving data stream
        const data = generateRawOrders();
        setOrders(data);
    }, []);

    const handleFilterChange = (e) => {
        const text = e.target.value;
        setFilter(text);

        // ⚠️ CRITICAL BUG 1: Un-normalized array filtering on main thread ($O(N)$)
        // ⚠️ CRITICAL BUG 2: Synchronous loop blocks the event loop
        // ⚠️ CRITICAL BUG 3: Renders thousands of DOM elements directly!
        const filtered = orders.filter(o =>
            o.symbol.toLowerCase().includes(text.toLowerCase())
        );
        setOrders(filtered);
    };

    return (
        <div>
            <input
                value={filter}
                onChange={handleFilterChange}
                placeholder="Filter by symbol (Laggy typing!)..."
            />
            <p>Displaying {orders.length} orders</p>
            <ul>
                {orders.map(order => (
                    <li >
                         {order.symbol} - ${order.price} ({order.amount})
                    </li>
                ))}
            </ul>
        </div>
    );
}
