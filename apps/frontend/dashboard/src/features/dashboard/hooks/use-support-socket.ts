import { useCallback, useEffect, useRef, useState } from "react";
import { type SupportServerEvent, supportWsUrl } from "#/lib/support-types";

type Options = {
	enabled?: boolean;
	onEvent?: (event: SupportServerEvent) => void;
};

export function useSupportSocket({ enabled = true, onEvent }: Options = {}) {
	const [ready, setReady] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const onEventRef = useRef(onEvent);
	onEventRef.current = onEvent;
	const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const send = useCallback((payload: Record<string, unknown>) => {
		const ws = wsRef.current;
		if (!ws || ws.readyState !== WebSocket.OPEN) return false;
		ws.send(JSON.stringify(payload));
		return true;
	}, []);

	const join = useCallback(
		(conversationId: string) => send({ type: "join", conversationId }),
		[send],
	);

	const leave = useCallback(
		(conversationId: string) => send({ type: "leave", conversationId }),
		[send],
	);

	const sendMessage = useCallback(
		(conversationId: string, body: string) =>
			send({ type: "send", conversationId, body }),
		[send],
	);

	useEffect(() => {
		if (!enabled) return;

		let closed = false;

		const connect = () => {
			const url = supportWsUrl();
			if (!url) return;
			const ws = new WebSocket(url);
			wsRef.current = ws;

			ws.onopen = () => setReady(true);

			ws.onmessage = (ev) => {
				try {
					const data = JSON.parse(String(ev.data)) as SupportServerEvent;
					onEventRef.current?.(data);
				} catch {
					// ignore
				}
			};

			ws.onclose = () => {
				setReady(false);
				wsRef.current = null;
				if (!closed) {
					reconnectTimer.current = setTimeout(connect, 2000);
				}
			};

			ws.onerror = () => ws.close();
		};

		connect();

		return () => {
			closed = true;
			if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
			wsRef.current?.close();
			wsRef.current = null;
			setReady(false);
		};
	}, [enabled]);

	return { ready, join, leave, sendMessage };
}
