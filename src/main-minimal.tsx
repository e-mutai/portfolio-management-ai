import { createRoot } from 'react-dom/client'
import './index.css'

const MinimalApp = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Kenya Wealth AI</h1>
        <p className="text-gray-600">Minimal test - checking if React can render</p>
      </div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(<MinimalApp />);
