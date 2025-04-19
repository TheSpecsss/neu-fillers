import LoadingModal from "@/shared/components/LoadingModal";
import { OpenAITest } from "@/shared/components/OpenAITest";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useInitialFileLoader } from "@/features/upload/hooks/useInitialFileLoader";
import { ApiClient, ApiError } from "@/lib/api";
import type { CanvasData } from "@/types/draggable";
import { extractTextFromPdf } from "@/shared/utils/ocrUtils";
import { Download } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

interface LocationState {
	jsonData: CanvasData;
	pdfFile: File;
}

export const Process = () => {
	const location = useLocation();
	const navigate = useNavigate();

	// Check if we have the required files in the location state
	if (!location.state?.pdfFile || !location.state?.jsonData) {
		return <Navigate to="/" replace />;
	}

	const { pdfFile, jsonData } = location.state as LocationState;
	const [analyzedFields, setAnalyzedFields] = useState<string>("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);

	const handleDownloadJSON = () => {
		try {
			const jsonContent = JSON.stringify(jsonData, null, 2);
			const blob = new Blob([jsonContent], { type: "application/json" });
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = `draggable-elements-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();

			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success("JSON file downloaded successfully!");
		} catch (error) {
			console.error("Error downloading JSON:", error);
			toast.error("Failed to download JSON file");
		}
	};

	const handleDownloadPDF = () => {
		try {
			const url = URL.createObjectURL(pdfFile);
			const a = document.createElement("a");
			a.href = url;
			a.download = pdfFile.name;
			document.body.appendChild(a);
			a.click();

			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			toast.success("PDF file downloaded successfully!");
		} catch (error) {
			console.error("Error downloading PDF:", error);
			toast.error("Failed to download PDF file");
		}
	};

	const handleBackToEditor = () => {
		navigate("/editor", {
			state: {
				pdfFile,
				jsonFile: new File(
					[JSON.stringify(jsonData, null, 2)],
					`draggable-elements-${new Date().toISOString().split("T")[0]}.json`,
					{ type: "application/json" },
				),
			},
		});
	};

	const handleAnalyzePdfFields = async () => {
		try {
			setIsAnalyzing(true);
			setAnalyzedFields("");

			// Read the PDF file as ArrayBuffer
			const arrayBuffer = await pdfFile.arrayBuffer();

			// Extract text from PDF using OCR
			const pdfText = await extractTextFromPdf(arrayBuffer);

			// Create OpenAI client
			const client = new ApiClient();

			// Create the prompt for analyzing fillable fields
			const prompt = `
Analyze the provided file and identify all *fillable fields* (e.g., form inputs, blanks to be filled). For each fillable:

1. Assign a unique \`id\`, starting from 1 and incrementing by 1.  
2. Capture the name or label of the field.  
3. Determine the *context or purpose* of each field — e.g., is it asking a name, a reason, a date, etc.

**Only return the output in the following JSON format — no extra explanation or text:**

\`\`\`json
{
  "fileName": "${pdfFile.name}",
  "fillables": [
    {
      "id": 1,
      "field": "<field name or label>",
      "context": "<brief description of what this field is asking for>"
    }
  ]
}
\`\`\`

Here is the text content of the file:

${pdfText}
`;

			// Call OpenAI API
			const result = await client.createChatCompletion([
				{ role: "user", content: prompt },
			]);

			setAnalyzedFields(result.choices[0].message.content);
			toast.success("PDF field analysis completed!");
		} catch (error) {
			if (error instanceof ApiError) {
				console.error("API error:", error);
				toast.error("API error. Check console for details.");
			} else {
				console.error("PDF field analysis failed:", error);
				toast.error("PDF field analysis failed. Check console for details.");
			}
			setAnalyzedFields("Error: Failed to analyze PDF fields");
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">process page</h1>
				<div className="flex gap-2">
					<Button onClick={handleBackToEditor} variant="outline">
						Back to Editor
					</Button>
					<Button onClick={handleDownloadJSON} variant="outline">
						<Download className="mr-2 h-4 w-4" /> Download JSON
					</Button>
				</div>
			</div>

			<div className="flex flex-col space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* PDF Download Card */}
					<Card className="h-full">
						<CardHeader>
							<CardTitle>PDF File</CardTitle>
						</CardHeader>
						<CardContent className="h-[calc(600px-var(--card-header-height))]">
							<div className="flex flex-col items-center justify-center space-y-4 p-8 h-full">
								<p className="text-lg text-gray-600">
									Original PDF file: {pdfFile.name}
								</p>
								<Button
									onClick={handleDownloadPDF}
									size="lg"
									className="w-full max-w-sm"
								>
									<Download className="mr-2 h-5 w-5" />
									Download PDF
								</Button>
							</div>
						</CardContent>

						<div className="flex flex-col items-center justify-center space-y-4 p-8">
							<p className="text-lg text-gray-600">
								Edited PDF file: (not available yet)
							</p>
							<Button
								onClick={handleDownloadPDF}
								size="lg"
								disabled={true}
								className="w-full max-w-sm"
							>
								<Download className="mr-2 h-5 w-5" />
								Download PDF
							</Button>
						</div>
					</Card>

					{/* JSON Display */}
					<Card>
						<CardHeader>
							<CardTitle>Generated JSON</CardTitle>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-[600px] w-full rounded-md border p-4">
								<pre className="text-sm">
									{JSON.stringify(jsonData, null, 2)}
								</pre>
							</ScrollArea>
						</CardContent>
					</Card>
				</div>

				{/* OpenAI Test Component */}
				<div className="mt-4">
					<OpenAITest />
				</div>

				{/* PDF Field Analyzer Component */}
				<div className="mt-4">
					<Card>
						<CardHeader>
							<CardTitle>PDF Field Analyzer</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<Button
									onClick={handleAnalyzePdfFields}
									disabled={isAnalyzing}
									className="w-full"
								>
									{isAnalyzing
										? "Analyzing PDF Fields..."
										: "Analyze PDF Fields"}
								</Button>

								{analyzedFields && (
									<div className="p-4 bg-muted rounded-lg">
										<p className="text-sm font-medium mb-2">
											Analysis Results:
										</p>
										<ScrollArea className="h-[300px] w-full rounded-md border p-4">
											<pre className="text-sm whitespace-pre-wrap">
												{analyzedFields}
											</pre>
										</ScrollArea>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};
