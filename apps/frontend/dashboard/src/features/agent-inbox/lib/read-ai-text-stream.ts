/** Read a text/plain streaming response, calling onChunk with the accumulated text. */
export async function readAiTextStream(
	response: Response,
	onChunk: (accumulated: string) => void,
): Promise<string> {
	if (!response.body) {
		throw new Error("No response body");
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let accumulated = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		accumulated += decoder.decode(value, { stream: true });
		onChunk(accumulated);
	}

	accumulated += decoder.decode();
	onChunk(accumulated);
	return accumulated;
}
