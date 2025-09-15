// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import AppBackHandler from './components/AppBackHandler';

function App() {
  return (
    <div className="bg-background min-h-screen">
      <Router>
        {/* 이제 AppBackHandler가 Router 내부에 있으므로 useNavigate OK */}
        <AppBackHandler />
        <AppRoutes />
      </Router>
    </div>
  );
}

export default App;
