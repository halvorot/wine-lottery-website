
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      "Full URL:",
      window.location.href,
      "Hash:",
      window.location.hash,
      "Search params:",
      location.search
    );
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-6 bg-white rounded shadow-lg">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <div className="text-left mb-4 p-3 bg-gray-50 rounded text-sm overflow-hidden">
          <p className="mb-1"><strong>Path:</strong> {location.pathname}</p>
          <p className="mb-1"><strong>Full URL:</strong> <span className="break-all">{window.location.href}</span></p>
          {window.location.hash && (
            <p className="mb-1"><strong>Hash:</strong> <span className="break-all">{window.location.hash}</span></p>
          )}
          {location.search && (
            <p><strong>Query:</strong> <span className="break-all">{location.search}</span></p>
          )}
        </div>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
