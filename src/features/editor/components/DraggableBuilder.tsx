import { Card } from "@/shared/components/ui/card";
import { useElementsHandler } from "@/features/editor/hooks/useElementsHandler";
import { useFileHandler } from "@/features/upload/hooks/useFileHandler";
import { usePdfHandler } from "@/features/process/hooks/usePdfHandler";
import type { DraggableItem } from "@/types/draggable";
import type React from "react";
import { useEffect, useState } from "react";
import ActionButtons from "@/shared/components/ActionButtons";
import AppSidebar from "@/shared/components/AppSidebar";
import ElementCanvas from "./ElementCanvas";
import ElementControls from "./ElementControls";
import LoadingModal from "@/shared/components/LoadingModal";
import PdfInfoDisplay from "@/features/process/components/PdfInfoDisplay";

interface DraggableBuilderProps {
	initialPdfData?: ArrayBuffer | null;
	initialPdfInfo?: { filename: string; checksum: string } | null;
	initialElements?: DraggableItem[];
	initialNextId?: number;
	hideUploadButtons?: boolean;
}

const DraggableBuilder: React.FC<DraggableBuilderProps> = ({
	initialPdfData = null,
	initialPdfInfo = null,
	initialElements = [],
	initialNextId = 1,
	hideUploadButtons = false,
}) => {
	const {
		elements,
		selectedElementId,
		elementText,
		xPosition,
		yPosition,
		width,
		height,
		fontSize,
		workspaceRef,
		handleAddElement,
		handlePositionChange,
		handleSizeChange,
		handleTextChange,
		handleXChange,
		handleYChange,
		handleWidthChange,
		handleHeightChange,
		handleFontSizeChange,
		handleSelectElement,
		setElements,
		setElementText,
		setXPosition,
		setYPosition,
		setWidth,
		setHeight,
		setFontSize,
		nextId,
	} = useElementsHandler({ initialElements, initialNextId });

	const {
		pdfData,
		pdfInfo,
		pdfPages,
		pdfInputRef,
		handlePdfUploadButtonClick,
		handlePdfUpload,
		handlePdfLoad,
	} = usePdfHandler({ initialPdfData, initialPdfInfo });

	const [pdfInfoState, setPdfInfoState] = useState<{
		filename: string;
		checksum: string;
	} | null>(initialPdfInfo);

	// Update pdfInfoState when pdfInfo changes
	useEffect(() => {
		setPdfInfoState(pdfInfo);
	}, [pdfInfo]);

	const {
		fileInputRef,
		handleExportJSON,
		handleImportButtonClick,
		handleFileUpload,
		isExporting,
		exportMessage,
	} = useFileHandler({
		elements,
		pdfInfo: pdfInfoState,
		pdfData,
		setElements,
		nextId,
		setSelectedElementId: (id) => handleSelectElement(id || ""),
		setElementText,
		setXPosition,
		setYPosition,
		setWidth,
		setHeight,
		setFontSize,
		setPdfInfo: setPdfInfoState,
	});

	// Trigger PDF load when initialPdfData is provided
	useEffect(() => {
		if (initialPdfData && !pdfData) {
			setPdfInfoState(initialPdfInfo);
		}
	}, [initialPdfData, initialPdfInfo, pdfData]);

	return (
		<div className="flex h-full w-full">
			<AppSidebar
				elements={elements.map((el) => ({ id: el.id, text: el.text }))}
				selectedElementId={selectedElementId}
				onSelectElement={handleSelectElement}
			/>

			<div className="flex flex-col h-full w-full">
				<Card className="p-4 mb-4 bg-white/90 backdrop-blur border-element/20">
					<ElementControls
						elementText={elementText}
						xPosition={xPosition}
						yPosition={yPosition}
						width={width}
						height={height}
						fontSize={fontSize}
						selectedElementId={selectedElementId}
						onTextChange={handleTextChange}
						onXChange={handleXChange}
						onYChange={handleYChange}
						onWidthChange={handleWidthChange}
						onHeightChange={handleHeightChange}
						onFontSizeChange={handleFontSizeChange}
					/>

					<ActionButtons
						handleAddElement={handleAddElement}
						handlePdfUploadButtonClick={handlePdfUploadButtonClick}
						handleExportJSON={handleExportJSON}
						handleImportButtonClick={handleImportButtonClick}
						hideUploadButtons={hideUploadButtons}
					/>

					<PdfInfoDisplay pdfInfo={pdfInfo} pdfPages={pdfPages} />

					<input
						ref={fileInputRef}
						type="file"
						accept=".json"
						onChange={handleFileUpload}
						className="hidden"
					/>

					<input
						ref={pdfInputRef}
						type="file"
						accept=".pdf"
						onChange={handlePdfUpload}
						className="hidden"
					/>
				</Card>

				<ElementCanvas
					workspaceRef={workspaceRef}
					elements={elements}
					selectedElementId={selectedElementId}
					pdfData={pdfData || initialPdfData}
					onPositionChange={handlePositionChange}
					onSizeChange={handleSizeChange}
					onSelectElement={handleSelectElement}
					onPdfLoad={handlePdfLoad}
				/>
			</div>

			<LoadingModal isOpen={isExporting} message={exportMessage} />
		</div>
	);
};

export default DraggableBuilder;
