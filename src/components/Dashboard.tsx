import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Paper,
	Snackbar,
	TextField,
	Typography,
} from "@mui/material";
import axios from "axios";
import type React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

interface UserProfile {
	firstName: string;
	lastName: string;
	email: string;
	roleAccess: number;
}

const Dashboard = () => {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openUploadModal, setOpenUploadModal] = useState(false);
	const [uploadData, setUploadData] = useState({
		templateName: "",
		description: "",
		file: null as File | null,
	});
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [showSuccessToast, setShowSuccessToast] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const handleToken = async () => {
			try {
				// Get token from URL or localStorage
				const params = new URLSearchParams(location.search);
				const urlToken = params.get("token");

				console.log("URL Token:", urlToken);
				console.log("Stored Token:", localStorage.getItem("token"));

				if (urlToken) {
					console.log("Setting new token from URL");
					localStorage.setItem("token", urlToken);
					// Clean up URL
					navigate("/dashboard", { replace: true });
				}

				const token = localStorage.getItem("token");

				if (!token) {
					console.error("No token found");
					setError("No authentication token found");
					navigate("/login");
					return;
				}

				// Fetch user profile
				console.log("Fetching user profile...");
				const response = await axios.get(`${API_URL}/api/users/profile`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				console.log("User profile response:", response.data);
				setUser(response.data);
				setError(null);
			} catch (error) {
				console.error("Error in handleToken:", error);
				setError("Failed to load user profile");
				localStorage.removeItem("token");
				navigate("/login");
			} finally {
				setLoading(false);
			}
		};

		handleToken();
	}, [navigate, location]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		window.location.href = "/login";
	};

	const handleUploadModalOpen = () => {
		setOpenUploadModal(true);
		setUploadError(null);
	};

	const handleUploadModalClose = () => {
		setOpenUploadModal(false);
		setUploadData({
			templateName: "",
			description: "",
			file: null,
		});
		setUploadError(null);
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files?.[0]) {
			setUploadData((prev) => ({
				...prev,
				file: event.target.files[0],
			}));
		}
	};

	const handleUpload = async () => {
		try {
			if (!uploadData.file) {
				setUploadError("Please select a PDF file");
				return;
			}

			if (!uploadData.templateName.trim()) {
				setUploadError("Please enter a template name");
				return;
			}

			const formData = new FormData();
			formData.append("pdf", uploadData.file);
			formData.append("templateName", uploadData.templateName);
			if (uploadData.description) {
				formData.append("description", uploadData.description);
			}

			const token = localStorage.getItem("token");
			await axios.post(`${API_URL}/api/templates/upload-pdf`, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});

			handleUploadModalClose();
			setShowSuccessToast(true);
		} catch (error) {
			console.error("Upload error:", error);
			setUploadError("Failed to upload PDF");
		}
	};

	const handleCloseSuccessToast = () => {
		setShowSuccessToast(false);
	};

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="100vh"
			>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Container component="main" maxWidth="md">
				<Alert severity="error" sx={{ mt: 4 }}>
					{error}
				</Alert>
			</Container>
		);
	}

	return (
		<Container component="main" maxWidth="md">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Paper
					elevation={3}
					sx={{
						padding: 4,
						width: "100%",
					}}
				>
					<Typography component="h1" variant="h4" gutterBottom>
						Welcome, {user?.firstName}!
					</Typography>
					<Box sx={{ mt: 2 }}>
						<Typography variant="body1" gutterBottom>
							<strong>Name:</strong> {user?.firstName} {user?.lastName}
						</Typography>
						<Typography variant="body1" gutterBottom>
							<strong>Email:</strong> {user?.email}
						</Typography>
						<Typography variant="body1" gutterBottom>
							<strong>Role:</strong>{" "}
							{user?.roleAccess === 99 ? "Administrator" : "User"}
						</Typography>
					</Box>
					<Box sx={{ mt: 3, display: "flex", gap: 2 }}>
						{user?.roleAccess === 99 && (
							<Button
								variant="contained"
								color="primary"
								onClick={handleUploadModalOpen}
							>
								Upload PDF
							</Button>
						)}
						<Button
							variant="contained"
							color="primary"
							onClick={() => navigate("/upload")}
						>
							Upload Files
						</Button>
						<Button variant="contained" color="primary" onClick={handleLogout}>
							Logout
						</Button>
					</Box>
				</Paper>
			</Box>

			{/* Upload PDF Modal */}
			<Dialog open={openUploadModal} onClose={handleUploadModalClose}>
				<DialogTitle>Upload PDF Template</DialogTitle>
				<DialogContent>
					<Box sx={{ mt: 2 }}>
						{uploadError && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{uploadError}
							</Alert>
						)}
						<TextField
							fullWidth
							label="Template Name"
							value={uploadData.templateName}
							onChange={(e) =>
								setUploadData((prev) => ({
									...prev,
									templateName: e.target.value,
								}))
							}
							margin="normal"
							required
						/>
						<TextField
							fullWidth
							label="Description (Optional)"
							value={uploadData.description}
							onChange={(e) =>
								setUploadData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							margin="normal"
							multiline
							rows={3}
						/>
						<input
							accept="application/pdf"
							style={{ display: "none" }}
							id="pdf-file"
							type="file"
							onChange={handleFileChange}
						/>
						<label htmlFor="pdf-file">
							<Button
								variant="outlined"
								component="span"
								fullWidth
								sx={{ mt: 2 }}
							>
								{uploadData.file ? uploadData.file.name : "Choose PDF File"}
							</Button>
						</label>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleUploadModalClose}>Cancel</Button>
					<Button onClick={handleUpload} variant="contained" color="primary">
						Upload
					</Button>
				</DialogActions>
			</Dialog>

			{/* Success Toast */}
			<Snackbar
				open={showSuccessToast}
				autoHideDuration={6000}
				onClose={handleCloseSuccessToast}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleCloseSuccessToast}
					severity="success"
					sx={{ width: "100%" }}
				>
					PDF uploaded successfully!
				</Alert>
			</Snackbar>
		</Container>
	);
};

export default Dashboard;
