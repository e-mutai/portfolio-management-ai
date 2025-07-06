import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ForceLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all possible authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies (if any)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    console.log('🔄 Force logout: All data cleared');
    
    // Redirect to auth page
    setTimeout(() => {
      navigate('/auth', { replace: true });
      window.location.reload();
    }, 100);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
};

export default ForceLogout;
