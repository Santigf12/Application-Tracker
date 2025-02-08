import React from 'react';
import ReactDOM from 'react-dom/client';
// Import our custom CSS
import './scss/styles.scss';

// Import all of Bootstrap's JS
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
