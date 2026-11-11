import React from 'react';
import { useMachine } from '@xstate/react';
import { toggleMachine } from '../toggleMachine';

export function Toggle() {
  const [snapshot, send] = useMachine(toggleMachine);

  const isActive = snapshot.matches('active');

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      {/* 🟢 Fix: Stringify or match explicitly */}
      <h3>State: <code>{(snapshot.value) as string}</code></h3>

      <button
        onClick={() => send({ type: 'TOGGLE' })}
        style={{
          padding: '10px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: isActive ? '#10b981' : '#6b7280',
          color: '#ffffff',
          transition: 'background-color 0.2s ease',
        }}
      >
        {isActive ? 'Turn Off' : 'Turn On'}
      </button>
    </div>
  );
}