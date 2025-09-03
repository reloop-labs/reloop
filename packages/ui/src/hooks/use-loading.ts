import { useCallback, useEffect, useRef, useState } from "react";

type ButtonState = "idle" | "loading" | "success" | "error";

interface UseStatusOptions {
	autoResetDelay?: number;
}

export function useLoading(
	initialState: ButtonState = "idle",
	options?: UseStatusOptions,
) {
	const { autoResetDelay = 2000 } = options || {};
	const [status, setStatus] = useState<ButtonState>(initialState);
	const callbackRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		if (status === "success" || status === "error") {
			const timeout = setTimeout(() => {
				if (callbackRef.current) {
					callbackRef.current();
					callbackRef.current = null;
				} else if (status === "error" || status === "success") {
					setStatus("idle");
				}
			}, autoResetDelay);
			return () => clearTimeout(timeout);
		}
	}, [status, autoResetDelay]);

	const changeStatus = useCallback((status: ButtonState) => {
		callbackRef.current = null;
		setStatus(status);
	}, []);

	return { status, changeStatus };
}
