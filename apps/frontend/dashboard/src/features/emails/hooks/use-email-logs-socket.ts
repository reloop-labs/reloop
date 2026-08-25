import { useCallback, useEffect, useRef, useState } from "react";
import type { EmailLogData } from "./use-emails-query";

export type EmailLogsServerEvent =
	| {
			type: "ready";
			userId: string;
			organizationId: string;
	  }
	| {
			type: "email_log_updated";
			data: EmailLogData;
	  }
	| { type: "pong" }
	| { type: "error"; message: string };

type Options = {
	enabled?: boolean;
	onEvent?: (event: EmailLogsServerEvent) => void;
};

export function emailLogsWsUrl() {
	if (typeof window === "undefined") return "";
	const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
	return `${proto}//${window.location.host}/api/logs/v1/ws`;
}

export function useEmailLogsSocket({ enabled = true, onEvent }: Options = {}) {
	const [ready, setReady] = useState(false);
	const wsRef = useRef<WebSocket | null>(null);
	const onEventRef = useRef(onEvent);
	onEventRef.current = onEvent;
	const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

	const send = useCallback((payload: Record<string, unknown>) => {
		const ws = wsRef.current;
		if (!ws || ws.readyState !== WebSocket.OPEN) return false;
		ws.send(JSON.stringify(payload));
		return true;
	}, []);

	useEffect(() => {
		if (!enabled) return;

		let closed = false;

		const connect = () => {
			const url = emailLogsWsUrl();
			if (!url) return;

			try {
				const ws = new WebSocket(url);
				wsRef.current = ws;

				ws.onopen = () => {
					setReady(true);
					if (pingInterval.current) clearInterval(pingInterval.current);
					pingInterval.current = setInterval(() => {
						if (ws.readyState === WebSocket.OPEN) {
							ws.send(JSON.stringify({ type: "ping" }));
						}
					}, 30_000);
				};

				ws.onmessage = (ev) => {
					try {
						const data = JSON.parse(String(ev.data)) as EmailLogsServerEvent;
						onEventRef.current?.(data);
					} catch {
						// ignore unparseable payload
					}
				};

				ws.onclose = () => {
					setReady(false);
					wsRef.current = null;
					if (pingInterval.current) clearInterval(pingInterval.current);
					if (!closed) {
						reconnectTimer.current = setTimeout(connect, 3000);
					}
				};

				ws.onerror = () => {
					try {
						ws.close();
					} catch {
						// ignore
					}
				};
			} catch {
				if (!closed) {
					reconnectTimer.current = setTimeout(connect, 5000);
				}
			}
		};

		connect();

		return () => {
			closed = true;
			if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
			if (pingInterval.current) clearInterval(pingInterval.current);
			try {
				wsRef.current?.close();
			} catch {
				// ignore
			}
			wsRef.current = null;
			setReady(false);
		};
	}, [enabled]);

	return { ready, send };
}
