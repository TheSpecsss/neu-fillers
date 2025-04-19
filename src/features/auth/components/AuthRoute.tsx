import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface AuthRouteProps {
  element: React.ReactElement;
}

export const AuthRoute = ({ element }: AuthRouteProps) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const urlToken = new URLSearchParams(location.search).get("token");

      console.log("Checking auth - URL token:", urlToken);
      console.log("Checking auth - Stored token:", token);

      setIsAuthenticated(!!token || !!urlToken);
      setIsChecking(false);
    };

    checkAuth();
  }, [location]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
}; 