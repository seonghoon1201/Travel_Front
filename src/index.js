import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/tailwind.css';
import App from './App';

// Kakao SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init('3b520efdd3c0917f27e809b99ab17c32');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
