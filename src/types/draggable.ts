export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface DraggableItem {
	id: string;
	position: Position;
	size: Size;
	text: string;
	fontSize?: number;
}

export interface CanvasData {
	elements: DraggableItem[];
	pdfInfo: {
		filename: string;
		checksum: string;
	} | null;
	pdfText?: string;
}
