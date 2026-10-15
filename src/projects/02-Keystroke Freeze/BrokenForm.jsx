import React, { useState } from 'react';

function SlowAnalyticsChart() {
  console.log('🔴 [RE-RENDER] SlowAnalyticsChart evaluated');
  // Simulate heavy computation
  const now = performance.now();
  while (performance.now() - now < 300) {} // Block thread for 30ms

  return (
    <div style={{ padding: '20px', background: '#ffe6e6', marginTop: '10px' }}>
      <h4>Complex Analytics Chart (30ms artificial delay)</h4>
    </div>
  );
}


function InputForm() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
          <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Type to search (Watch input lag!)..."
        style={{ width: '300px', padding: '8px' }}
      />
  )

}

export function BrokenForm() {

  return (
    <div style={{ padding: '20px' }}>
     <h2>✅ Optimized Form (State Colocation)</h2>

        <InputForm />
      <SlowAnalyticsChart />
    </div>
  );
}