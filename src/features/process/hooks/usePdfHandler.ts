import { calculateChecksum } from "@/shared/utils/fileUtils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UsePdfHandlerProps {
	initialPdfData?: ArrayBuffer | null;
	initialPdfInfo?: { filename: string; checksum: string } | null;
}

export const usePdfHandler = ({
	initialPdfData = null,
	initialPdfInfo = null,
}: UsePdfHandlerProps = {}) => {
	const [pdfData, setPdfData] = useState<ArrayBuffer | null>(initialPdfData);
	const [pdfInfo, setPdfInfo] = useState<{
		filename: string;
		checksum: string;
	} | null>(initialPdfInfo);
	const [pdfPages, setPdfPages] = useState(0);
	const pdfInputRef = useRef<HTMLInputElement>(null);

	// Update PDF data when initialPdfData changes
	useEffect(() => {
		if (initialPdfData) {
			setPdfData(initialPdfData);
		}
	}, [initialPdfData]);

	// Update PDF info when initialPdfInfo changes
	useEffect(() => {
		if (initialPdfInfo) {
			setPdfInfo(initialPdfInfo);
		}
	}, [initialPdfInfo]);

	const handlePdfUploadButtonClick = () => {
		if (pdfInputRef.current) {
			pdfInputRef.current.click();
		}
	};

	const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !file.type.includes("pdf")) {
			toast.error("Please upload a valid PDF file");
			return;
		}

		try {
			// Calculate checksum
			const checksum = await calculateChecksum(file);

			// Read file as ArrayBuffer for PDF.js
			const reader = new FileReader();
			reader.onload = (event) => {
				if (event.target?.result) {
					setPdfData(event.target.result as ArrayBuffer);
					setPdfInfo({
						filename: file.name,
						checksum: checksum,
					});
					toast.success(`PDF uploaded: ${file.name}`);
				}
			};
			reader.readAsArrayBuffer(file);
		} catch (error) {
			console.error("Error processing PDF:", error);
			toast.error("Error processing PDF file");
		}

		if (e.target) {
			e.target.value = "";
		}
	};

	const handlePdfLoad = (numPages: number) => {
		setPdfPages(numPages);
		toast.info(`PDF loaded with ${numPages} page${numPages !== 1 ? "s" : ""}`);
	};

	return {
		pdfData,
		pdfInfo,
		pdfPages,
		pdfInputRef,
		handlePdfUploadButtonClick,
		handlePdfUpload,
		handlePdfLoad,
	};
};
