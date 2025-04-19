import { Button } from "@/shared/components/ui/button";
import { Download, FileText, FileUp, Upload } from "lucide-react";
import type React from "react";

interface ActionButtonsProps {
	handleAddElement: () => void;
	handlePdfUploadButtonClick: () => void;
	handleExportJSON: () => void;
	handleImportButtonClick: () => void;
	hideUploadButtons?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
	handleAddElement,
	handlePdfUploadButtonClick,
	handleExportJSON,
	handleImportButtonClick,
	hideUploadButtons = false,
}) => {
	return (
		<div className="flex gap-2 flex-wrap mb-2">
			<Button
				onClick={handleAddElement}
				className="bg-element hover:bg-element-hover active:bg-element-active transition-colors"
			>
				Add Element
			</Button>

			{!hideUploadButtons && (
				<>
					<Button
						onClick={handlePdfUploadButtonClick}
						className="bg-element hover:bg-element-hover active:bg-element-active transition-colors"
					>
						<FileText className="mr-1 h-4 w-4" /> Upload PDF
					</Button>

					<Button
						onClick={handleImportButtonClick}
						variant="outline"
						className="border-element text-element hover:bg-element/10"
					>
						<Upload className="mr-1 h-4 w-4" /> Import JSON
					</Button>
				</>
			)}

			<Button
				onClick={handleExportJSON}
				variant="outline"
				className="border-element text-element hover:bg-element/10"
			>
				<Download className="mr-1 h-4 w-4" /> Proceed
			</Button>
		</div>
	);
};

export default ActionButtons;
