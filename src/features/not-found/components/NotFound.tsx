import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
        Go back to home
      </Link>
    </div>
  );
};

export default NotFound; 