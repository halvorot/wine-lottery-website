
import { Link } from "react-router-dom";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export const NavigationHeader = () => {
  const { isAuthenticated, isAdmin } = useAuthStatus();

  return (
    <header className="bg-white border-b">
      <nav className="container mx-auto px-4 py-4">
        <ul className="flex space-x-6">
          <li>
            <Link 
              to="/" 
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
          </li>
          {(isAdmin || !isAuthenticated) && (
            <li>
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};
