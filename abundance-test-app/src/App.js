import React, { useState } from 'react';
import './App.css';

// Import the stub component directly from source (not from the built library)
// Note: We're importing from source files directly to avoid build issues
const ContrastClarityReflection = React.lazy(() => import('../src/components/ContrastClarityReflection'));

function App() {
  const [activeComponent, setActiveComponent] = useState('ContrastClarityReflection');
  
  const renderComponent = () => {
    switch(activeComponent) {
      case 'ContrastClarityReflection':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ContrastClarityReflection />
          </React.Suspense>
        );
      default:
        return <div>Select a component to view</div>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Abundance Shift Component Viewer</h1>
      </header>
      
      <div className="component-container">
        <div className="sidebar">
          <h2>Components</h2>
          <button 
            onClick={() => setActiveComponent('ContrastClarityReflection')}
            className={activeComponent === 'ContrastClarityReflection' ? 'active' : ''}
          >
            ContrastClarityReflection
          </button>
        </div>
        
        <div className="component-display">
          <h2>Component Preview: {activeComponent}</h2>
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

export default App;
