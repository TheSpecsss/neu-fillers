import type { FC } from "react";

interface LoadingModalProps {
	isOpen: boolean;
	message: string;
}

const LoadingModal: FC<LoadingModalProps> = ({ isOpen, message }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
				<div className="flex flex-col items-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-element mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">Processing</h3>
					<p className="text-gray-500 text-center">{message}</p>
				</div>
			</div>
		</div>
	);
};

export default LoadingModal;
