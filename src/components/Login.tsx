import { Box, Button, Container, Paper, Typography } from "@mui/material";
import React from "react";
import { API_URL } from "../config/api";

const Login = () => {
	const handleGoogleLogin = () => {
		window.location.href = `${API_URL}/api/auth/google`;
	};

	return (
		<Container component="main" maxWidth="xs">
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
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
					}}
				>
					<Typography component="h1" variant="h5">
						Sign in
					</Typography>
					<Button
						fullWidth
						variant="contained"
						sx={{ mt: 3, mb: 2 }}
						onClick={handleGoogleLogin}
					>
						Sign in with Google
					</Button>
				</Paper>
			</Box>
		</Container>
	);
};

export default Login;
