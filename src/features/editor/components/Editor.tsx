import DraggableBuilder from "./DraggableBuilder";
import LoadingModal from "@/shared/components/LoadingModal";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { useInitialFileLoader } from "@/features/upload/hooks/useInitialFileLoader";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

// Constant to control visibility of upload buttons in the editor
const HIDE_UPLOAD_BUTTONS_IN_EDITOR = true;

interface LocationState {
	pdfFile: File;
	jsonFile?: File;
}

export const Editor = () => {
	const location = useLocation();
	const navigate = useNavigate();

	// Check if we have the required files in the location state
	if (!location.state?.pdfFile) {
		return <Navigate to="/" replace />;
	}

	const { pdfFile, jsonFile } = location.state as LocationState;
	const { pdfData, pdfInfo, elements, nextId, isLoading, error } =
		useInitialFileLoader({
			pdfFile,
			jsonFile,
		});

	const handleReturnToUpload = () => {
		navigate("/", { replace: true });
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingModal isOpen={true} message="Loading files..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="bg-red-50 text-red-800 p-4 rounded-lg shadow-lg">
					<h3 className="text-lg font-semibold mb-2">Error</h3>
					<p>{error}</p>
					<button
						type="button"
						onClick={handleReturnToUpload}
						className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded"
					>
						Return to Upload
					</button>
				</div>
			</div>
		);
	}

	if (!pdfData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg shadow-lg">
					<h3 className="text-lg font-semibold mb-2">No PDF Data</h3>
					<p>Unable to load the PDF file. Please try again.</p>
					<button
						type="button"
						onClick={handleReturnToUpload}
						className="mt-4 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded"
					>
						Return to Upload
					</button>
				</div>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<div className="min-h-screen flex flex-col w-full">
				<main className="flex-1 max-w-5xl w-full mx-auto">
					<DraggableBuilder
						initialPdfData={pdfData}
						initialPdfInfo={pdfInfo}
						initialElements={elements}
						initialNextId={nextId.current}
						hideUploadButtons={HIDE_UPLOAD_BUTTONS_IN_EDITOR}
					/>
				</main>

				<footer className="mt-4 text-center text-sm text-gray-500 pb-4">
					<p>hehe.</p>
				</footer>
			</div>
		</SidebarProvider>
	);
};
