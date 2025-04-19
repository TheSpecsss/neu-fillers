import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import React, { useEffect, useRef, useCallback, useMemo } from "react";

// Set the worker source to use a local file
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js";

interface PdfViewerProps {
	pdfData: ArrayBuffer | null;
	onLoad: (
		numPages: number,
		pageHeight: number,
		pageWidth: number,
		scale: number,
	) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfData, onLoad }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasLoadedRef = useRef<boolean>(false);
	const [isLoading, setIsLoading] = React.useState(true);

	// Create a stable reference to the pdfData to prevent re-renders
	const memoizedPdfData = useMemo(() => pdfData, [pdfData]);

	// Memoize the onLoad callback to prevent causing re-renders
	const stableOnLoad = useMemo(() => onLoad, [onLoad]);

	useEffect(() => {
		if (!memoizedPdfData || !canvasRef.current || hasLoadedRef.current) return;

		const loadPdf = async () => {
			try {
				setIsLoading(true);
				// Clone the ArrayBuffer to prevent "detached ArrayBuffer" errors
				const pdfDataClone = memoizedPdfData.slice(0);

				// Load the PDF
				const loadingTask = pdfjsLib.getDocument({ data: pdfDataClone });
				const pdfDocument = await loadingTask.promise;

				// Clean up previous PDF document if it exists
				if (pdfDocRef.current) {
					pdfDocRef.current.destroy();
				}

				pdfDocRef.current = pdfDocument;

				// Get the first page
				const page = await pdfDocument.getPage(1);

				// Set scale to fit container
				const canvas = canvasRef.current;
				const container = containerRef.current;

				if (!canvas || !container) return;

				const viewport = page.getViewport({ scale: 1 });

				// Scale to fit container width
				const containerWidth = container.clientWidth;
				const scale = containerWidth / viewport.width;
				const scaledViewport = page.getViewport({ scale });

				canvas.height = scaledViewport.height;
				canvas.width = scaledViewport.width;

				// Log the page dimensions
				console.log("PDF Page Dimensions:", {
					originalWidth: viewport.width,
					originalHeight: viewport.height,
					scaledWidth: scaledViewport.width,
					scaledHeight: scaledViewport.height,
					scale: scale,
				});

				// Render the PDF page
				const renderContext = {
					canvasContext: canvas.getContext("2d"),
					viewport: scaledViewport,
				};

				if (!renderContext.canvasContext) return;

				await page.render(renderContext).promise;

				// Mark as loaded to prevent re-rendering the same PDF
				hasLoadedRef.current = true;

				// Notify parent component with number of pages and page height
				stableOnLoad(
					pdfDocument.numPages,
					scaledViewport.height,
					scaledViewport.width,
					scale,
				);
				setIsLoading(false);
			} catch (error) {
				console.error("Error loading PDF:", error);
				setIsLoading(false);
			}
		};

		loadPdf();

		return () => {
			if (pdfDocRef.current) {
				pdfDocRef.current.destroy();
				pdfDocRef.current = null;
			}
		};
	}, [memoizedPdfData, stableOnLoad]);

	// Memoize the canvas component to prevent unnecessary re-renders
	const canvasComponent = useMemo(
		() => (
			<canvas
				ref={canvasRef}
				className="max-w-full h-auto"
				aria-label="PDF preview"
			/>
		),
		[],
	);

	return (
		<div
			ref={containerRef}
			className="relative w-full h-full flex items-center justify-center"
			aria-busy={isLoading}
		>
			{isLoading && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
				</div>
			)}
			{canvasComponent}
		</div>
	);
};

// Use React.memo with a custom comparison function to prevent unnecessary re-renders
export default React.memo(PdfViewer, (prevProps, nextProps) => {
	// Only re-render if pdfData reference changes, not on every drag operation
	return prevProps.pdfData === nextProps.pdfData;
});
