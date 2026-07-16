import * as React from "react";

export const useClipboard = () => {
	const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());

	const copyToClipboard = React.useCallback(
		async (text: string, itemId: string) => {
			try {
				await navigator.clipboard.writeText(text);
				setCopiedItems((prev) => new Set(prev).add(itemId));
				setTimeout(() => {
					setCopiedItems((prev) => {
						const newSet = new Set(prev);
						newSet.delete(itemId);
						return newSet;
					});
				}, 2000);
			} catch {
				// Handle copy error silently
			}
		},
		[],
	);

	return { copiedItems, copyToClipboard };
};
