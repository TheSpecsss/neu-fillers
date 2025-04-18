import type { DraggableItem } from "@/types/draggable";
import { calculateChecksum } from "@/utils/fileUtils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface JsonData {
	elements: DraggableItem[];
	pdfInfo: {
		filename: string;
		checksum: string;
	};
	pdfText?: string;
}

interface UseInitialFileLoaderProps {
	pdfFile: File;
	jsonFile?: File;
}

export const useInitialFileLoader = ({
	pdfFile,
	jsonFile,
}: UseInitialFileLoaderProps) => {
	const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
	const [pdfInfo, setPdfInfo] = useState<{
		filename: string;
		checksum: string;
	} | null>(null);
	const [elements, setElements] = useState<DraggableItem[]>([]);
	const nextId = useRef<number>(1);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const loadingRef = useRef({ pdf: false, json: false });

	useEffect(() => {
		const loadFiles = async () => {
			try {
				setIsLoading(true);
				setError(null);
				loadingRef.current = { pdf: true, json: !!jsonFile };

				// Load PDF file
				const pdfChecksum = await calculateChecksum(pdfFile);
				const pdfReader = new FileReader();

				const pdfPromise = new Promise<void>((resolve, reject) => {
					pdfReader.onload = (event) => {
						try {
							if (event.target?.result) {
								setPdfData(event.target.result as ArrayBuffer);
								setPdfInfo({
									filename: pdfFile.name,
									checksum: pdfChecksum,
								});
								toast.success(`PDF loaded: ${pdfFile.name}`);
								loadingRef.current.pdf = false;
								resolve();
							} else {
								reject(new Error("Failed to read PDF file"));
							}
						} catch (error) {
							reject(error);
						}
					};
					pdfReader.onerror = () => reject(pdfReader.error);
				});

				// Load JSON file if provided
				let jsonPromise = Promise.resolve();
				if (jsonFile) {
					const jsonReader = new FileReader();
					jsonPromise = new Promise<void>((resolve, reject) => {
						jsonReader.onload = (event) => {
							try {
								const jsonData = JSON.parse(
									event.target?.result as string,
								) as JsonData;

								// Validate and set elements
								if (jsonData.elements) {
									let highestId = 0;
									const validItems = jsonData.elements.filter(
										(item: DraggableItem) => {
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
												if (
													idMatch &&
													Number.parseInt(idMatch[1]) > highestId
												) {
													highestId = Number.parseInt(idMatch[1]);
												}
												return true;
											}
											return false;
										},
									);

									setElements(validItems);
									nextId.current = highestId + 1;
									toast.success("Elements loaded from JSON");
								}
								loadingRef.current.json = false;
								resolve();
							} catch (error) {
								reject(error);
							}
						};
						jsonReader.onerror = () => reject(jsonReader.error);
					});
					jsonReader.readAsText(jsonFile);
				}

				// Start reading the PDF file
				pdfReader.readAsArrayBuffer(pdfFile);

				// Wait for both files to load
				await Promise.all([pdfPromise, jsonPromise]);
			} catch (error) {
				console.error("Error loading files:", error);
				toast.error("Error loading files");
				setError("Error loading files");
			} finally {
				// Only set loading to false when both files are done
				if (!loadingRef.current.pdf && !loadingRef.current.json) {
					setIsLoading(false);
				}
			}
		};

		loadFiles();

		// Cleanup function
		return () => {
			loadingRef.current = { pdf: false, json: false };
		};
	}, [pdfFile, jsonFile]);

	return {
		pdfData,
		pdfInfo,
		elements,
		nextId,
		isLoading,
		error,
	};
};
