import { FileText } from "lucide-react";
import type React from "react";

interface PdfInfoDisplayProps {
	pdfInfo: {
		filename: string;
		checksum: string;
	} | null;
	pdfPages: number;
}

const PdfInfoDisplay: React.FC<PdfInfoDisplayProps> = ({
	pdfInfo,
	pdfPages,
}) => {
	if (!pdfInfo) return null;

	return (
		<div className="text-sm text-muted-foreground mb-2 bg-muted p-2 rounded flex items-center">
			<FileText className="h-4 w-4 mr-2 text-element" />
			<span>
				PDF: {pdfInfo.filename} • {pdfPages} page{pdfPages !== 1 ? "s" : ""}
			</span>
		</div>
	);
};

export default PdfInfoDisplay;
