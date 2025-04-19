import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type UploadMode = "new" | "existing";

export const Upload = () => {
	const navigate = useNavigate();
	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [jsonFile, setJsonFile] = useState<File | null>(null);
	const [uploadMode, setUploadMode] = useState<UploadMode>("new");

	const handleFileUpload = (
		event: React.ChangeEvent<HTMLInputElement>,
		type: "pdf" | "json",
		mode: UploadMode,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (type === "pdf") {
			if (file.type !== "application/pdf") {
				alert("Please upload a PDF file");
				return;
			}
			setPdfFile(file);
			setUploadMode(mode);
			console.log(`PDF file uploaded in ${mode} mode`);
		} else {
			if (file.type !== "application/json") {
				alert("Please upload a JSON file");
				return;
			}
			setJsonFile(file);
			setUploadMode("existing");
			console.log("JSON file uploaded in existing mode");
		}
	};

	const handleCreateNew = () => {
		if (!pdfFile) {
			alert("Please upload a PDF file");
			return;
		}
		console.log("Creating new project with PDF file");
		navigate("/editor", { state: { pdfFile, mode: "new" } });
	};

	const handleLoadExisting = () => {
		if (!pdfFile || !jsonFile) {
			alert("Please upload both PDF and JSON files");
			return;
		}
		console.log("Loading existing project with PDF and JSON files");
		navigate("/editor", { state: { pdfFile, jsonFile, mode: "existing" } });
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-2xl w-full space-y-8 p-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold">entrypoint</h1>
					<p className="mt-1 text-sm text-gray-500">
						Current mode: {uploadMode}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className={uploadMode === "new" ? "ring-2 ring-element" : ""}>
						<CardHeader>
							<CardTitle>Create New</CardTitle>
							<CardDescription>Start with a new PDF file</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="pdf-new">Upload PDF</Label>
									<Input
										id="pdf-new"
										type="file"
										accept=".pdf"
										onChange={(e) => handleFileUpload(e, "pdf", "new")}
									/>
								</div>
								<Button
									className="w-full"
									onClick={handleCreateNew}
									disabled={!pdfFile || uploadMode !== "new"}
								>
									Create New
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card
						className={uploadMode === "existing" ? "ring-2 ring-element" : ""}
					>
						<CardHeader>
							<CardTitle>Load Existing</CardTitle>
							<CardDescription>Continue with existing files</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="pdf-existing">Upload PDF</Label>
									<Input
										id="pdf-existing"
										type="file"
										accept=".pdf"
										onChange={(e) => handleFileUpload(e, "pdf", "existing")}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="json">Upload JSON</Label>
									<Input
										id="json"
										type="file"
										accept=".json"
										onChange={(e) => handleFileUpload(e, "json", "existing")}
									/>
								</div>
								<Button
									className="w-full"
									onClick={handleLoadExisting}
									disabled={!pdfFile || !jsonFile || uploadMode !== "existing"}
								>
									Load Existing
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};
