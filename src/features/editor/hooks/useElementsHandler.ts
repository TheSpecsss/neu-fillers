import type { DraggableItem, Position, Size } from "@/types/draggable";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UseElementsHandlerProps {
	initialElements?: DraggableItem[];
	initialNextId?: number;
}

export const useElementsHandler = ({
	initialElements = [],
	initialNextId = 1,
}: UseElementsHandlerProps = {}) => {
	const [elements, setElements] = useState<DraggableItem[]>(initialElements);
	const [selectedElementId, setSelectedElementId] = useState<string | null>(
		null,
	);
	const [elementText, setElementText] = useState("Drag me!");
	const [xPosition, setXPosition] = useState(0);
	const [yPosition, setYPosition] = useState(0);
	const [width, setWidth] = useState(120);
	const [height, setHeight] = useState(80);
	const [fontSize, setFontSize] = useState(16);
	const nextId = useRef(initialNextId);
	const workspaceRef = useRef<HTMLDivElement>(null);

	// Update elements when initialElements changes
	useEffect(() => {
		if (initialElements.length > 0) {
			setElements(initialElements);
		}
	}, [initialElements]);

	// Update nextId when initialNextId changes
	useEffect(() => {
		nextId.current = initialNextId;
	}, [initialNextId]);

	const handleAddElement = () => {
		let initialX = 100;
		let initialY = 100;

		if (workspaceRef.current) {
			const rect = workspaceRef.current.getBoundingClientRect();
			initialX = Math.max(20, rect.width / 2 - 60);
			initialY = Math.max(20, rect.height / 2 - 40);
		}

		const newElement: DraggableItem = {
			id: `element-${nextId.current}`,
			position: { x: initialX, y: initialY },
			size: { width: 120, height: 50 },
			text: "New Element",
			fontSize: 14,
		};

		setElements((prev) => [...prev, newElement]);
		setSelectedElementId(newElement.id);
		setElementText(newElement.text);
		setXPosition(newElement.position.x);
		setYPosition(newElement.position.y);
		setWidth(newElement.size.width);
		setHeight(newElement.size.height);
		setFontSize(newElement.fontSize || 16);
		nextId.current += 1;

		toast.success("New draggable element added!");
	};

	const handlePositionChange = (id: string, newPosition: Position) => {
		setElements((prev) =>
			prev.map((el) => (el.id === id ? { ...el, position: newPosition } : el)),
		);

		if (id === selectedElementId) {
			setXPosition(newPosition.x);
			setYPosition(newPosition.y);
		}
	};

	const handleSizeChange = (id: string, newSize: Size) => {
		setElements((prev) =>
			prev.map((el) => (el.id === id ? { ...el, size: newSize } : el)),
		);

		if (id === selectedElementId) {
			setWidth(newSize.width);
			setHeight(newSize.height);
		}
	};

	const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newText = e.target.value;
		setElementText(newText);

		if (selectedElementId) {
			setElements((prev) =>
				prev.map((el) =>
					el.id === selectedElementId ? { ...el, text: newText } : el,
				),
			);
		}
	};

	const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newX = Number.parseInt(e.target.value) || 0;
		setXPosition(newX);

		if (selectedElementId) {
			setElements((prev) =>
				prev.map((el) =>
					el.id === selectedElementId
						? { ...el, position: { ...el.position, x: newX } }
						: el,
				),
			);
		}
	};

	const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newY = Number.parseInt(e.target.value) || 0;
		setYPosition(newY);

		if (selectedElementId) {
			setElements((prev) =>
				prev.map((el) =>
					el.id === selectedElementId
						? { ...el, position: { ...el.position, y: newY } }
						: el,
				),
			);
		}
	};

	const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newWidth = Number.parseInt(e.target.value) || 1;
		setWidth(newWidth);

		if (selectedElementId) {
			setElements((prev) =>
				prev.map((el) =>
					el.id === selectedElementId
						? { ...el, size: { ...el.size, width: newWidth } }
						: el,
				),
			);
		}
	};

	const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newHeight = Number.parseInt(e.target.value) || 1;
		setHeight(newHeight);

		if (selectedElementId) {
			setElements((prev) =>
				prev.map((el) =>
					el.id === selectedElementId
						? { ...el, size: { ...el.size, height: newHeight } }
						: el,
				),
			);
		}
	};

	const handleFontSizeChange = (value: number[]) => {
		const newFontSize = value[0];
		setFontSize(newFontSize);

		if (selectedElementId) {
			setElements((prev) =>
				prev.map((el) =>
					el.id === selectedElementId ? { ...el, fontSize: newFontSize } : el,
				),
			);
		}
	};

	const handleSelectElement = (id: string) => {
		setSelectedElementId(id);
		const element = elements.find((el) => el.id === id);
		if (element) {
			setElementText(element.text);
			setXPosition(element.position.x);
			setYPosition(element.position.y);
			setWidth(element.size.width);
			setHeight(element.size.height);
			setFontSize(element.fontSize || 16);
		}
	};

	return {
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
		setSelectedElementId,
		setElementText,
		setXPosition,
		setYPosition,
		setWidth,
		setHeight,
		setFontSize,
		nextId,
	};
};
