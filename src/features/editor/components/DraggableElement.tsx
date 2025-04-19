import { cn } from "@/lib/utils";
import { ArrowsUpFromLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Position {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

interface DraggableElementProps {
	id: string;
	initialPosition: Position;
	initialSize: Size;
	initialText: string;
	initialFontSize?: number;
	onPositionChange: (id: string, position: Position) => void;
	onSizeChange: (id: string, size: Size) => void;
	onSelect: (id: string) => void;
	isSelected: boolean;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
	id,
	initialPosition,
	initialSize,
	initialText,
	initialFontSize = 16,
	onPositionChange,
	onSizeChange,
	onSelect,
	isSelected,
}) => {
	const [position, setPosition] = useState<Position>(initialPosition);
	const [size, setSize] = useState<Size>(initialSize);
	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const elementRef = useRef<HTMLButtonElement>(null);
	const dragStartPosition = useRef<{
		x: number;
		y: number;
		mouseX: number;
		mouseY: number;
	}>({
		x: 0,
		y: 0,
		mouseX: 0,
		mouseY: 0,
	});
	const resizeStartInfo = useRef<{
		width: number;
		height: number;
		mouseX: number;
		mouseY: number;
	}>({
		width: 0,
		height: 0,
		mouseX: 0,
		mouseY: 0,
	});

	// Calculate minimum height based on font size
	const minHeight = Math.max(initialFontSize * 2, 40); // At least 2x font size or 40px

	// Update local position when initialPosition prop changes
	useEffect(() => {
		setPosition(initialPosition);
	}, [initialPosition]);

	// Update local size when initialSize prop changes or font size changes
	useEffect(() => {
		// Ensure height is at least the minimum height
		const newHeight = Math.max(initialSize.height, minHeight);
		setSize({ ...initialSize, height: newHeight });
	}, [initialSize, minHeight]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (elementRef.current) {
				setIsDragging(true);
				onSelect(id);

				// Store starting positions
				dragStartPosition.current = {
					x: position.x,
					y: position.y,
					mouseX: e.clientX,
					mouseY: e.clientY,
				};

				// Prevent text selection during drag
				e.preventDefault();
			}
		},
		[id, onSelect, position.x, position.y],
	);

	const handleResizeStart = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			setIsResizing(true);
			onSelect(id);

			// Store starting size and mouse position
			resizeStartInfo.current = {
				width: size.width,
				height: size.height,
				mouseX: e.clientX,
				mouseY: e.clientY,
			};
		},
		[id, onSelect, size.width, size.height],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (isDragging) {
				// Calculate new position based on mouse movement
				const newX =
					dragStartPosition.current.x +
					(e.clientX - dragStartPosition.current.mouseX);
				const newY =
					dragStartPosition.current.y +
					(e.clientY - dragStartPosition.current.mouseY);

				// Update position
				setPosition({ x: newX, y: newY });

				// Notify parent component
				onPositionChange(id, { x: newX, y: newY });
			} else if (isResizing) {
				// Calculate new size based on mouse movement
				const deltaX = e.clientX - resizeStartInfo.current.mouseX;
				const deltaY = e.clientY - resizeStartInfo.current.mouseY;

				const newWidth = Math.max(1, resizeStartInfo.current.width + deltaX);
				const newHeight = Math.max(
					minHeight,
					resizeStartInfo.current.height + deltaY,
				);

				// Update size
				setSize({ width: newWidth, height: newHeight });

				// Notify parent component
				onSizeChange(id, { width: newWidth, height: newHeight });
			}
		},
		[id, isDragging, isResizing, onPositionChange, onSizeChange, minHeight],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		setIsResizing(false);
	}, []);

	// Add and remove event listeners
	useEffect(() => {
		if (isDragging || isResizing) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

	const handleClick = useCallback(() => {
		onSelect(id);
	}, [id, onSelect]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" || e.key === " ") {
				onSelect(id);
			}
		},
		[id, onSelect],
	);

	return (
		<button
			ref={elementRef}
			className={cn(
				"absolute flex items-start justify-start rounded-md cursor-move transition-all duration-150 select-none",
				isDragging || isSelected
					? "shadow-md border-2 bg-transparent text-black border-element-active"
					: "border-transparent bg-transparent text-black hover:shadow-sm hover:border-dashed hover:border-2 hover:border-element/30",
			)}
			style={{
				transform: `translate(${position.x}px, ${position.y}px)`,
				zIndex: isDragging || isResizing || isSelected ? 10 : 1,
				width: `${size.width}px`,
				height: `${size.height}px`,
				fontSize: `${initialFontSize}px`,
			}}
			onMouseDown={handleMouseDown}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			aria-label={`Draggable element: ${initialText}`}
			type="button"
		>
			{initialText}
			<div
				className={cn(
					"absolute bottom-0 right-0 w-6 h-6 flex items-center justify-center rounded-tl-md cursor-se-resize",
					isDragging || isSelected
						? "bg-element-active/80 hover:bg-element-active"
						: "opacity-0 hover:opacity-100 bg-element-active/60",
					"transition-opacity",
				)}
				onMouseDown={handleResizeStart}
			>
				<ArrowsUpFromLine className="h-3 w-3 text-white rotate-45" />
			</div>
		</button>
	);
};

export default DraggableElement;
