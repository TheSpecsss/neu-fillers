/**
 * Calculates a simple checksum for a file
 * @param file The file to calculate the checksum for
 * @returns A Promise that resolves to the checksum as a hex string
 */
export const calculateChecksum = async (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				if (!event.target || !event.target.result) {
					throw new Error("Failed to read file");
				}

				// Simple string-based hash function
				const arrayBuffer = event.target.result as ArrayBuffer;
				const data = new Uint8Array(arrayBuffer);
				let hash = 0;

				for (let i = 0; i < data.length; i++) {
					hash = (hash << 5) - hash + data[i];
					hash = hash & hash; // Convert to 32-bit integer
				}

				// Convert to positive hex string
				const hashHex = Math.abs(hash).toString(16).padStart(8, "0");
				resolve(hashHex);
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsArrayBuffer(file);
	});
};
