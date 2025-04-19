import { cn } from "@/lib/utils";
import type { DraggableItem, Position, Size } from "@/types/draggable";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DraggableElement from "./DraggableElement";
import PdfViewer from "@/features/process/components/PdfViewer";

interface ElementCanvasProps {
	workspaceRef: React.RefObject<HTMLDivElement>;
	elements: DraggableItem[];
	selectedElementId: string | null;
	pdfData: ArrayBuffer | null;
	onPositionChange: (id: string, position: Position) => void;
	onSizeChange: (id: string, size: Size) => void;
	onSelectElement: (id: string) => void;
	onPdfLoad: (numPages: number) => void;
}

export const ElementCanvas: React.FC<ElementCanvasProps> = ({
	workspaceRef,
	elements,
	selectedElementId,
	pdfData,
	onPositionChange,
	onSizeChange,
	onSelectElement,
	onPdfLoad,
}) => {
	const [pdfPageHeight, setPdfPageHeight] = useState<number | null>(null);
	const [pdfPageWidth, setPdfPageWidth] = useState<number | null>(null);
	const [scaleFactor, setScaleFactor] = useState<number>(1);
	const previousScaleRef = useRef<number>(1);

	// Memoize the onPdfLoad callback to prevent unnecessary re-renders
	const handlePdfLoad = useCallback(
		(
			numPages: number,
			pageHeight: number,
			pageWidth: number,
			scale: number,
		) => {
			onPdfLoad(numPages);
			setPdfPageHeight(pageHeight);
			setPdfPageWidth(pageWidth);
			setScaleFactor(scale);
			previousScaleRef.current = scale;
			console.log(
				`PDF loaded with ${numPages} pages, dimensions: ${pageWidth}x${pageHeight}px, scale: ${scale}`,
			);
		},
		[onPdfLoad],
	);

	// Update element positions and sizes when scale changes
	useEffect(() => {
		if (scaleFactor === null || previousScaleRef.current === null) {
			previousScaleRef.current = scaleFactor;
			return;
		}

		const scaleRatio = scaleFactor / previousScaleRef.current;
		previousScaleRef.current = scaleFactor;

		const updatedElements = elements.map((element) => ({
			...element,
			x: element.position.x * scaleRatio,
			y: element.position.y * scaleRatio,
			width: element.size.width * scaleRatio,
			height: element.size.height * scaleRatio,
		}));

		for (const element of updatedElements) {
			onPositionChange(element.id, element.position);
			onSizeChange(element.id, element.size);
		}
	}, [scaleFactor, elements, onPositionChange, onSizeChange]);

	// Memoize the PDF component to prevent re-rendering during drag operations
	const pdfComponent = useMemo(() => {
		if (!pdfData) return null;

		return (
			<div className="absolute inset-0 pdf-viewer">
				<PdfViewer pdfData={pdfData} onLoad={handlePdfLoad} />
			</div>
		);
	}, [pdfData, handlePdfLoad]);

	// Calculate canvas height based on PDF page height
	const canvasHeight = useMemo(() => {
		if (pdfPageHeight === null) return "auto";
		return `${pdfPageHeight}px`;
	}, [pdfPageHeight]);

	// Add useEffect for click outside detection
	useEffect(() => {
		if (!workspaceRef.current) return;

		const workspace = workspaceRef.current;
		const handleClickOutside = (event: MouseEvent) => {
			// Don't deselect if clicking on any of the element control inputs
			const target = event.target as HTMLElement;
			const controlInputs = [
				"element-text",
				"x-position",
				"y-position",
				"width",
				"height",
				"font-size",
			];

			if (target.tagName === "INPUT" && controlInputs.includes(target.id)) {
				return;
			}

			if (!workspace.contains(event.target as Node)) {
				onSelectElement(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [workspaceRef, onSelectElement]);

	const handleWorkspaceClick = (e: React.MouseEvent) => {
		// Only handle clicks inside the canvas
		const target = e.target as HTMLElement;

		// Only deselect if clicking on the workspace, PDF viewer, or empty canvas area
		// but not on draggable elements
		if (
			target === workspaceRef.current ||
			target.classList.contains("pdf-viewer") ||
			target.tagName === "CANVAS" ||
			target.classList.contains("empty-canvas-message")
		) {
			onSelectElement(null);
		}
	};

	const handleWorkspaceKeyDown = (e: React.KeyboardEvent) => {
		// Deselect on Escape key
		if (e.key === "Escape") {
			onSelectElement(null);
		}
	};

	return (
		<section
			ref={workspaceRef}
			className="relative border-2 border-dashed border-gray-200 rounded-md bg-gray-50 scrollbar-hide"
			style={{
				minHeight: "300px",
				height: canvasHeight,
				flexGrow: 0,
				flexShrink: 0,
				overflowY: "auto",
				overflowX: "hidden",
				msOverflowStyle: "none" /* IE and Edge */,
				scrollbarWidth: "none" /* Firefox */,
			}}
			onClick={handleWorkspaceClick}
			onKeyDown={handleWorkspaceKeyDown}
			aria-label="Element canvas workspace"
		>
			<style>
				{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;  /* Chrome, Safari and Opera */
          }
        `}
			</style>
			<div
				className="relative min-h-[300px]"
				style={{
					height: pdfPageHeight ? `${pdfPageHeight}px` : "300px",
					width: pdfPageWidth ? `${pdfPageWidth}px` : "100%",
				}}
			>
				{!pdfData && elements.length === 0 && (
					<div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 empty-canvas-message">
						<div className="text-center">
							<p className="mb-2 text-lg font-medium">
								Click "Add Draggable Element" to get started
							</p>
							<p className="text-lg font-medium">
								or "Upload PDF" to add a PDF background
							</p>
						</div>
					</div>
				)}

				<div className="absolute inset-0">{pdfComponent}</div>

				<div className="absolute inset-0">
					{elements.map((element) => (
						<DraggableElement
							key={element.id}
							id={element.id}
							initialPosition={element.position}
							initialSize={element.size}
							initialText={element.text}
							initialFontSize={element.fontSize}
							onPositionChange={onPositionChange}
							onSizeChange={onSizeChange}
							onSelect={onSelectElement}
							isSelected={element.id === selectedElementId}
						/>
					))}
				</div>
			</div>
		</section>
	);
};

export default ElementCanvas;
