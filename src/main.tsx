import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeCapacitor, iosConfig } from './utils/capacitor'

// Inicializar Capacitor quando a aplicação carregar
const startApp = async () => {
  try {
    await initializeCapacitor();
    iosConfig.configureScrolling();
    iosConfig.configureSafeArea();
  } catch (error) {
    console.log('Capacitor initialization error:', error);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

startApp();
