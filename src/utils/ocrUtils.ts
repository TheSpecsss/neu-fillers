import * as pdfjsLib from "pdfjs-dist";
import { PSM, createWorker } from "tesseract.js";

/**
 * Detects long horizontal lines in the image data and converts them to underscores
 * @param imageData - The image data to process
 * @param width - The width of the image
 * @param height - The height of the image
 * @returns The processed image data with lines converted to underscores
 */
const detectAndConvertLinesToUnderscores = (
	imageData: ImageData,
	width: number,
	height: number,
): ImageData => {
	const data = imageData.data;
	const lineThreshold = 0.8; // Minimum ratio of black pixels in a row to be considered a line
	const minLineLength = width * 0.1; // Minimum length of a line (10% of width)

	// Create a copy of the image data to avoid modifying the original
	const newImageData = new ImageData(
		new Uint8ClampedArray(data),
		width,
		height,
	);
	const newData = newImageData.data;

	// Scan for horizontal lines
	for (let y = 0; y < height; y++) {
		let blackPixelCount = 0;
		let lineStart = -1;
		let lineEnd = -1;

		// Count black pixels in this row
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			const isBlack = data[idx] < 128; // Consider pixel black if RGB value is below threshold

			if (isBlack) {
				blackPixelCount++;
				if (lineStart === -1) lineStart = x;
				lineEnd = x;
			}
		}

		// Check if this row contains a line
		const lineLength = lineEnd - lineStart + 1;
		const blackRatio = blackPixelCount / width;

		if (blackRatio > lineThreshold && lineLength >= minLineLength) {
			// This is a line, convert it to a solid underscore
			for (let x = lineStart; x <= lineEnd; x++) {
				const idx = (y * width + x) * 4;
				// Make the line solid black
				newData[idx] = 0; // R
				newData[idx + 1] = 0; // G
				newData[idx + 2] = 0; // B
				newData[idx + 3] = 255; // A
			}
		}
	}

	return newImageData;
};

/**
 * Extracts text from a PDF using OCR
 * @param pdfData - The PDF data as ArrayBuffer
 * @returns Promise with the extracted text
 */
export const extractTextFromPdf = async (
	pdfData: ArrayBuffer | null,
): Promise<string> => {
	if (!pdfData) {
		return "no file";
	}

	try {
		// Load the PDF document
		const loadingTask = pdfjsLib.getDocument({ data: pdfData });
		const pdfDocument = await loadingTask.promise;

		// Initialize Tesseract worker with enhanced configuration
		const worker = await createWorker("eng");

		// Configure Tesseract for better character recognition
		await worker.setParameters({
			tessedit_char_whitelist:
				"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.,- ", // Include underscore explicitly
			tessedit_pageseg_mode: PSM.AUTO_OSD, // Automatic page segmentation with OSD
			tessedit_ocr_engine_mode: "1", // Legacy + LSTM mode
			preserve_interword_spaces: "1",
			textord_heavy_nr: "1", // More aggressive noise removal
			textord_min_linesize: "2.5", // Better line detection
		});

		let extractedText = "";

		// Process each page
		for (let i = 1; i <= pdfDocument.numPages; i++) {
			const page = await pdfDocument.getPage(i);

			// Render the page to a canvas with higher scale for better OCR
			const viewport = page.getViewport({ scale: 3.0 }); // Increased scale for better resolution
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");

			if (!context) {
				throw new Error("Could not get canvas context");
			}

			canvas.height = viewport.height;
			canvas.width = viewport.width;

			// Apply image preprocessing for better character detection
			context.fillStyle = "white";
			context.fillRect(0, 0, canvas.width, canvas.height);

			// Render PDF page to canvas
			await page.render({
				canvasContext: context,
				viewport: viewport,
			}).promise;

			// Apply additional image processing for better character recognition
			const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

			// Detect and convert lines to underscores
			const processedImageData = detectAndConvertLinesToUnderscores(
				imageData,
				canvas.width,
				canvas.height,
			);

			// Apply contrast enhancement and noise removal
			const data = processedImageData.data;
			for (let j = 0; j < data.length; j += 4) {
				const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
				const threshold = 128;
				const value = avg > threshold ? 255 : 0;
				data[j] = data[j + 1] = data[j + 2] = value;
			}

			context.putImageData(processedImageData, 0, 0);

			// Perform OCR on the preprocessed canvas
			const {
				data: { text },
			} = await worker.recognize(canvas);
			extractedText += `Page ${i}:\n${text}\n\n`;
		}

		// Terminate the worker
		await worker.terminate();

		return extractedText.trim();
	} catch (error) {
		console.error("Error extracting text from PDF:", error);
		return "Error extracting text from PDF";
	}
};
