import { readAiTextStream } from "./read-ai-text-stream";

/** Keep existing editor text shimmering before the first replace. */
export const AI_THINK_SHIMMER_MS = 2400;

/**
 * Buffer the stream until `minThinkMs` elapses, then reveal.
 * Keeps the thinking/shimmer phase visible for a beat even when the model is fast.
 */
export async function readAiTextStreamAfterThink(
	response: Response,
	onChunk: (accumulated: string) => void,
	{
		minThinkMs = AI_THINK_SHIMMER_MS,
		onReveal,
		signal,
	}: {
		minThinkMs?: number;
		/** Fired once, right before the first onChunk that replaces editor text. */
		onReveal?: () => void;
		signal?: AbortSignal;
	} = {},
): Promise<string> {
	const startedAt = Date.now();
	let buffered = "";
	let revealed = false;

	const assertNotAborted = () => {
		if (signal?.aborted) {
			throw new DOMException("Aborted", "AbortError");
		}
	};

	const reveal = (text: string) => {
		assertNotAborted();
		if (!revealed) {
			revealed = true;
			onReveal?.();
		}
		onChunk(text);
	};

	const emitOrBuffer = (text: string) => {
		assertNotAborted();
		buffered = text;
		if (revealed) {
			reveal(buffered);
		} else if (Date.now() - startedAt >= minThinkMs && buffered) {
			reveal(buffered);
		}
	};

	const tryReveal = () => {
		if (revealed || !buffered) return;
		if (Date.now() - startedAt < minThinkMs) return;
		reveal(buffered);
	};

	const poll = globalThis.setInterval(tryReveal, 40);
	try {
		const finalText = await readAiTextStream(response, (accumulated) => {
			emitOrBuffer(accumulated);
		});

		if (!revealed && finalText.trim()) {
			const wait = Math.max(0, minThinkMs - (Date.now() - startedAt));
			if (wait > 0) {
				await new Promise<void>((resolve, reject) => {
					const id = globalThis.setTimeout(resolve, wait);
					const onAbort = () => {
						globalThis.clearTimeout(id);
						reject(new DOMException("Aborted", "AbortError"));
					};
					if (signal?.aborted) {
						onAbort();
						return;
					}
					signal?.addEventListener("abort", onAbort, { once: true });
				});
			}
			reveal(finalText);
		} else if (revealed && finalText.trim()) {
			reveal(finalText);
		}

		return finalText;
	} finally {
		globalThis.clearInterval(poll);
	}
}
