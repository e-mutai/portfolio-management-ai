import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use the real App
createRoot(document.getElementById("root")!).render(<App />);
