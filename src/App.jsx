import React from 'react';
import AppRoutes from './routes';
import AppBackHandler from './components/AppBackHandler';

function App() {
  return (
    <div className="bg-background min-h-screen">
      <AppBackHandler />
      <AppRoutes />
    </div>
  );
}

export default App;
