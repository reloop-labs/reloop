/**
 * The public tool has no upload API. Images stay in the browser as data
 * URLs so the canvas and copied HTML both show them.
 */
export function readImageFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === "string") resolve(reader.result);
			else reject(new Error("Failed to read image file"));
		};
		reader.onerror = () => reject(new Error("Failed to read image file"));
		reader.readAsDataURL(file);
	});
}
