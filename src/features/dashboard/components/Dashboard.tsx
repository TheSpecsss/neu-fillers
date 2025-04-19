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
	Card,
	CardContent,
	CardMedia,
	CardActions,
	IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "@/shared/config/api";

interface UserProfile {
	firstName: string;
	lastName: string;
	email: string;
	roleAccess: number;
}

interface Template {
	template_id: number;
	template_name: string;
	template_desc: string | null;
	pdfPath: string | null;
	createdAt: string;
}

export const Dashboard = () => {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [templates, setTemplates] = useState<Template[]>([]);
	const [templatesLoading, setTemplatesLoading] = useState(false);
	const [openUploadModal, setOpenUploadModal] = useState(false);
	const [uploadData, setUploadData] = useState({
		templateName: "",
		description: "",
		file: null as File | null,
	});
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [showSuccessToast, setShowSuccessToast] = useState(false);
	const [editTemplate, setEditTemplate] = useState<Template | null>(null);
	const [editData, setEditData] = useState({
		templateName: "",
		description: "",
	});
	const [openEditModal, setOpenEditModal] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
	const [actionSuccess, setActionSuccess] = useState<{
		show: boolean;
		message: string;
	}>({
		show: false,
		message: "",
	});
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

	const fetchTemplates = useCallback(async () => {
		if (user?.roleAccess !== 99) return; // Only fetch for admin
		
		try {
			setTemplatesLoading(true);
			const token = localStorage.getItem("token");
			const response = await axios.get(`${API_URL}/api/templates`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setTemplates(response.data);
		} catch (error) {
			console.error("Error fetching templates:", error);
		} finally {
			setTemplatesLoading(false);
		}
	}, [user?.roleAccess]);

	useEffect(() => {
		if (user?.roleAccess === 99) {
			fetchTemplates();
		}
	}, [user?.roleAccess, fetchTemplates]);

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
			fetchTemplates(); // Refresh templates list after upload
		} catch (error) {
			console.error("Upload error:", error);
			setUploadError("Failed to upload PDF");
		}
	};

	const handleCloseSuccessToast = () => {
		setShowSuccessToast(false);
	};

	const handleEditClick = (template: Template) => {
		setEditTemplate(template);
		setEditData({
			templateName: template.template_name,
			description: template.template_desc || "",
		});
		setOpenEditModal(true);
	};

	const handleEditModalClose = () => {
		setOpenEditModal(false);
		setEditTemplate(null);
		setEditData({
			templateName: "",
			description: "",
		});
	};

	const handleEditSave = async () => {
		try {
			if (!editTemplate) return;

			const token = localStorage.getItem("token");
			await axios.put(
				`${API_URL}/api/templates/${editTemplate.template_id}`,
				{
					templateName: editData.templateName,
					description: editData.description,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			handleEditModalClose();
			setActionSuccess({
				show: true,
				message: "Template updated successfully!",
			});
			fetchTemplates();
		} catch (error) {
			console.error("Edit error:", error);
			setUploadError("Failed to update template");
		}
	};

	const handleDeleteClick = (template: Template) => {
		setTemplateToDelete(template);
		setOpenDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		try {
			if (!templateToDelete) return;

			const token = localStorage.getItem("token");
			await axios.delete(
				`${API_URL}/api/templates/${templateToDelete.template_id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setOpenDeleteDialog(false);
			setTemplateToDelete(null);
			setActionSuccess({
				show: true,
				message: "Template deleted successfully!",
			});
			fetchTemplates();
		} catch (error) {
			console.error("Delete error:", error);
			setUploadError("Failed to delete template");
		}
	};

	const handleActionSuccessClose = () => {
		setActionSuccess({
			show: false,
			message: "",
		});
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

				{/* Templates List - Only visible to admin */}
				{user?.roleAccess === 99 && (
					<Box sx={{ mt: 4, width: "100%" }}>
						<Typography variant="h5" gutterBottom>
							Uploaded PDF Templates
						</Typography>
						{templatesLoading ? (
							<Box display="flex" justifyContent="center" p={4}>
								<CircularProgress />
							</Box>
						) : templates.length === 0 ? (
							<Typography variant="body1" color="text.secondary" align="center">
								No templates uploaded yet
							</Typography>
						) : (
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: {
										xs: "1fr",
										sm: "repeat(2, 1fr)",
										md: "repeat(3, 1fr)",
									},
									gap: 3,
								}}
							>
								{templates.map((template) => (
									<Box key={template.template_id}>
										<Card>
											<CardMedia
												component="img"
												height="200"
												image={`${API_URL}/api/templates/${template.template_id}/thumbnail`}
												alt={template.template_name}
												sx={{ objectFit: "contain", bgcolor: "grey.100" }}
											/>
											<CardContent>
												<Typography variant="h6" component="div">
													{template.template_name}
												</Typography>
												{template.template_desc && (
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ mt: 1 }}
													>
														{template.template_desc}
													</Typography>
												)}
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ display: "block", mt: 1 }}
												>
													Uploaded: {new Date(template.createdAt).toLocaleDateString()}
												</Typography>
											</CardContent>
											<CardActions>
												<IconButton
													size="small"
													onClick={() => handleEditClick(template)}
													aria-label="edit"
												>
													<EditIcon />
												</IconButton>
												<IconButton
													size="small"
													onClick={() => handleDeleteClick(template)}
													aria-label="delete"
													color="error"
												>
													<DeleteIcon />
												</IconButton>
											</CardActions>
										</Card>
									</Box>
								))}
							</Box>
						)}
					</Box>
				)}
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

			{/* Edit Template Modal */}
			<Dialog open={openEditModal} onClose={handleEditModalClose}>
				<DialogTitle>Edit Template</DialogTitle>
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
							value={editData.templateName}
							onChange={(e) =>
								setEditData((prev) => ({
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
							value={editData.description}
							onChange={(e) =>
								setEditData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							margin="normal"
							multiline
							rows={3}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleEditModalClose}>Cancel</Button>
					<Button onClick={handleEditSave} variant="contained" color="primary">
						Save Changes
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
				<DialogTitle>Delete Template</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete "{templateToDelete?.template_name}"? This action cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
					<Button onClick={handleDeleteConfirm} variant="contained" color="error">
						Delete
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

			{/* Success Toast */}
			<Snackbar
				open={actionSuccess.show}
				autoHideDuration={6000}
				onClose={handleActionSuccessClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={handleActionSuccessClose}
					severity="success"
					sx={{ width: "100%" }}
				>
					{actionSuccess.message}
				</Alert>
			</Snackbar>
		</Container>
	);
};
