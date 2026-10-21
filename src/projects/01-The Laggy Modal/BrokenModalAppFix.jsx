import React, { useState } from 'react';
import { processMassiveArray } from '../../yieldWithChannel';

// Heavy component simulating expensive DOM rendering
function HeavyGrid() {
  console.log('🔴 [RE-RENDER] HeavyGrid evaluated');
  const items = Array.from({ length: 300 }, (_, i) => `Item #${i + 1}`);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
      {items.map((item) => (
        <div key={item} style={{ padding: '10px', background: '#e0e0e0', borderRadius: '4px' }}>
          {item}
        </div>
      ))}
    </div>
  );
}

function Modal({children}) {
  const [isOpen, setIsOpen] = useState(false);
  processMassiveArray([1,2,3,4])
   
  return (
    <>
     <button onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? 'Close Modal' : 'Open Modal'}
    </button>

    {isOpen && (
      <div style={{ padding: '15px', background: '#ffcccc', margin: '10px 0' }}>
        <p>I am an active modal window!</p>
      </div>
    )}
    {children}
    </>
  )

}

export function BrokenModalAppFix() {

  return (
    <div style={{ padding: '20px' }}>
     <h2>✅ Optimized Modal (Children Composition)</h2>
      <Modal>
        <h3>Dashboard Grid</h3>
        <HeavyGrid />
      </Modal>
    </div>
  );
}

