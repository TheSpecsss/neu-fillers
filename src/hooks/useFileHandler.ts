import type { CanvasData, DraggableItem } from "@/types/draggable";
import { extractTextFromPdf } from "@/utils/ocrUtils";
import { useEffect, useRef, useState } from "react";
import type { SetStateAction } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FileHandlerProps {
	elements: DraggableItem[];
	pdfInfo: { filename: string; checksum: string } | null;
	pdfData: ArrayBuffer | null;
	setElements: React.Dispatch<React.SetStateAction<DraggableItem[]>>;
	nextId: React.MutableRefObject<number>;
	setSelectedElementId: (id: string | null) => void;
	setElementText: React.Dispatch<React.SetStateAction<string>>;
	setXPosition: React.Dispatch<React.SetStateAction<number>>;
	setYPosition: React.Dispatch<React.SetStateAction<number>>;
	setWidth: React.Dispatch<React.SetStateAction<number>>;
	setHeight: React.Dispatch<React.SetStateAction<number>>;
	setFontSize: React.Dispatch<React.SetStateAction<number>>;
	setPdfInfo: React.Dispatch<
		React.SetStateAction<{ filename: string; checksum: string } | null>
	>;
}

export const useFileHandler = ({
	elements,
	pdfInfo,
	pdfData,
	setElements,
	nextId,
	setSelectedElementId,
	setElementText,
	setXPosition,
	setYPosition,
	setWidth,
	setHeight,
	setFontSize,
	setPdfInfo,
}: FileHandlerProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [exportMessage, setExportMessage] = useState("");
	const navigate = useNavigate();
	// Cache for OCR text to avoid running OCR multiple times
	const [cachedOcrText, setCachedOcrText] = useState<string | null>(null);
	// Store a copy of the PDF data to prevent detachment issues
	const pdfDataRef = useRef<ArrayBuffer | null>(null);

	// Update the ref when pdfData changes
	useEffect(() => {
		if (pdfData) {
			// Create a copy of the ArrayBuffer to prevent detachment
			pdfDataRef.current = pdfData.slice(0);
		}
	}, [pdfData]);

	const handleExportJSON = async () => {
		if (elements.length === 0 && !pdfInfo) {
			toast.error("No content to export!");
			return;
		}

		try {
			setIsExporting(true);
			setExportMessage("Preparing export data...");

			// Use cached OCR text if available, otherwise run OCR
			let pdfText: string;

			if (cachedOcrText !== null) {
				setExportMessage("Using cached OCR text...");
				pdfText = cachedOcrText;
			} else {
				// Extract text from PDF using OCR
				if (pdfData) {
					setExportMessage("Running OCR on PDF...");
				}
				pdfText = await extractTextFromPdf(pdfData);

				// Cache the OCR text for future exports
				setCachedOcrText(pdfText);
			}

			setExportMessage("Creating JSON data...");
			const canvasData: CanvasData = {
				elements,
				pdfInfo,
				pdfText,
			};

			// Use the stored copy of the PDF data
			const pdfDataToUse = pdfDataRef.current;

			if (!pdfDataToUse) {
				throw new Error("PDF data is missing");
			}

			// Create a File object from the PDF data
			const pdfFile = new File(
				[pdfDataToUse],
				pdfInfo?.filename || "document.pdf",
				{ type: "application/pdf" },
			);

			// Navigate to the Process page with the data
			navigate("/process", {
				state: {
					jsonData: canvasData,
					pdfFile: pdfFile,
				},
			});

			toast.success("Redirecting to Process page...");
		} catch (error) {
			console.error("Error preparing data for Process page:", error);
			toast.error("Failed to prepare data for Process page");
		} finally {
			setIsExporting(false);
		}
	};

	// Reset cached OCR text when PDF changes
	useEffect(() => {
		setCachedOcrText(null);
	}, []);

	const handleImportButtonClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const jsonData = JSON.parse(
					event.target?.result as string,
				) as CanvasData;

				// Handle elements import
				if (jsonData.elements) {
					let highestId = 0;
					const validItems = jsonData.elements.filter((item: DraggableItem) => {
						if (
							item.id &&
							item.position &&
							typeof item.position.x === "number" &&
							typeof item.position.y === "number" &&
							item.size &&
							typeof item.size.width === "number" &&
							typeof item.size.height === "number" &&
							typeof item.text === "string"
						) {
							const idMatch = item.id.match(/element-(\d+)/);
							if (idMatch && Number.parseInt(idMatch[1]) > highestId) {
								highestId = Number.parseInt(idMatch[1]);
							}
							return true;
						}
						return false;
					});

					setElements(validItems);
					nextId.current = highestId + 1;

					if (validItems.length > 0) {
						const firstElement = validItems[0] as DraggableItem;
						setSelectedElementId(firstElement.id);
						setElementText(firstElement.text);
						setXPosition(firstElement.position.x);
						setYPosition(firstElement.position.y);
						setWidth(firstElement.size.width);
						setHeight(firstElement.size.height);
						if (firstElement.fontSize) {
							setFontSize(firstElement.fontSize);
						}
					}
				}

				// Handle PDF info
				if (jsonData.pdfInfo) {
					setPdfInfo(jsonData.pdfInfo);
					toast.info(`PDF info imported: ${jsonData.pdfInfo.filename}`);
				} else {
					setPdfInfo(null);
				}

				toast.success("Canvas data imported successfully");
			} catch (error) {
				toast.error("Failed to parse JSON file");
				console.error("Import error:", error);
			}
		};

		reader.readAsText(file);

		if (e.target) {
			e.target.value = "";
		}
	};

	return {
		fileInputRef,
		handleExportJSON,
		handleImportButtonClick,
		handleFileUpload,
		isExporting,
		exportMessage,
	};
};
