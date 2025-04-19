import { useEffect, useState } from "react";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation,
} from "react-router-dom";
import { Dashboard } from "./features/dashboard/components/Dashboard";
import { Login } from "./features/auth/components/Login";
import "./App.css";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Editor } from "./features/editor/components/Editor";
import { NotFound } from "./features/not-found/components/NotFound";
import { Process } from "./features/process/components/Process";
import { Upload } from "./features/upload/components/Upload";

const queryClient = new QueryClient();

// Auth wrapper component
const AuthRoute = ({ element }: { element: React.ReactElement }) => {
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

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<Router>
				<Routes>
					<Route
						path="/login"
						element={
							localStorage.getItem("token") ? (
								<Navigate to="/dashboard" />
							) : (
								<Login />
							)
						}
					/>
					<Route
						path="/dashboard"
						element={<AuthRoute element={<Dashboard />} />}
					/>
					<Route path="/" element={<Navigate to="/login" />} />
					<Route path="/upload" element={<Upload />} />
					<Route path="/editor" element={<Editor />} />
					<Route path="/process" element={<Process />} />
					{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Router>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
