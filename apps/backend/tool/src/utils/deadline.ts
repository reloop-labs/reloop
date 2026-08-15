// The Redis client reconnects forever rather than rejecting, so an `await` on
// it hangs and a try/catch never fires — "fail open" becomes "hang forever".
export function withDeadline<T>(
	operation: Promise<T>,
	ms: number,
	label: string,
): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined;

	const deadline = new Promise<never>((_, reject) => {
		timer = setTimeout(
			() => reject(new Error(`${label} did not respond within ${ms}ms`)),
			ms,
		);
	});

	return Promise.race([operation, deadline]).finally(() => {
		if (timer) clearTimeout(timer);
	});
}
