import React, { useState } from 'react';

function SlowAnalyticsChart() {
  console.log('🔴 [RE-RENDER] SlowAnalyticsChart evaluated');
  // Simulate heavy computation
  const now = performance.now();
  while (performance.now() - now < 30) {} // Block thread for 30ms

  return (
    <div style={{ padding: '20px', background: '#ffe6e6', marginTop: '10px' }}>
      <h4>Complex Analytics Chart (30ms artificial delay)</h4>
    </div>
  );
}

export function BrokenForm() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{ padding: '20px' }}>
      <h2>❌ Broken Form (Input State Lifted Too High)</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Type to search (Watch input lag!)..."
        style={{ width: '300px', padding: '8px' }}
      />

      <SlowAnalyticsChart />
    </div>
  );
}