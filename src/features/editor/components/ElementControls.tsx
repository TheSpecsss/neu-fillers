import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import type React from "react";

interface ElementControlsProps {
	elementText: string;
	xPosition: number;
	yPosition: number;
	width: number;
	height: number;
	fontSize: number;
	selectedElementId: string | null;
	onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onXChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onYChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onWidthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onHeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFontSizeChange: (value: number[]) => void;
}

const ElementControls: React.FC<ElementControlsProps> = ({
	elementText,
	xPosition,
	yPosition,
	width,
	height,
	fontSize,
	selectedElementId,
	onTextChange,
	onXChange,
	onYChange,
	onWidthChange,
	onHeightChange,
	onFontSizeChange,
}) => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
			<div className="md:col-span-2">
				<Label
					htmlFor="element-text"
					className="mb-2 block text-sm font-medium"
				>
					Element Text
				</Label>
				<Input
					id="element-text"
					placeholder="Enter text for element"
					value={elementText}
					onChange={onTextChange}
					disabled={!selectedElementId}
					className="border-element/40 focus:border-element"
				/>
			</div>
			<div>
				<Label htmlFor="x-position" className="mb-2 block text-sm font-medium">
					X Position
				</Label>
				<Input
					id="x-position"
					type="number"
					value={xPosition}
					onChange={onXChange}
					disabled={!selectedElementId}
					className="border-element/40 focus:border-element"
				/>
			</div>
			<div>
				<Label htmlFor="y-position" className="mb-2 block text-sm font-medium">
					Y Position
				</Label>
				<Input
					id="y-position"
					type="number"
					value={yPosition}
					onChange={onYChange}
					disabled={!selectedElementId}
					className="border-element/40 focus:border-element"
				/>
			</div>
			<div>
				<Label htmlFor="width" className="mb-2 block text-sm font-medium">
					Width
				</Label>
				<Input
					id="width"
					type="number"
					min="1"
					value={width}
					onChange={onWidthChange}
					disabled={!selectedElementId}
					className="border-element/40 focus:border-element"
				/>
			</div>
			<div>
				<Label htmlFor="height" className="mb-2 block text-sm font-medium">
					Height
				</Label>
				<Input
					id="height"
					type="number"
					min="1"
					value={height}
					onChange={onHeightChange}
					disabled={!selectedElementId}
					className="border-element/40 focus:border-element"
				/>
			</div>
			<div className="md:col-span-6 pt-2">
				<div className="flex justify-between mb-2">
					<Label htmlFor="font-size" className="text-sm font-medium">
						Font Size: {fontSize}px
					</Label>
				</div>
				<Slider
					id="font-size"
					defaultValue={[fontSize]}
					min={8}
					max={72}
					step={1}
					onValueChange={onFontSizeChange}
					disabled={!selectedElementId}
					className="my-2"
				/>
			</div>
		</div>
	);
};

export default ElementControls;
