import { useCallback, useEffect, useRef, useState } from "react";
import type { BackendMessage, BackendThread } from "../types";

export type InboxServerEvent =
	| {
			type: "ready";
			userId: string;
			organizationId: string;
	  }
	| {
			type: "inbound_email_received";
			data: {
				email: BackendMessage;
				thread: BackendThread | null;
				mailboxId: string;
				threadId: string;
			};
	  }
	| {
			type: "message_updated";
			data: {
				id: string;
				threadId?: string | null;
				isRead?: boolean;
				isStarred?: boolean;
				isSpam?: boolean;
			};
	  }
	| {
			type: "thread_updated";
			data: {
				thread: BackendThread;
				mailboxId: string;
			};
	  }
	| { type: "mailbox_subscribed"; mailboxId: string }
	| { type: "mailbox_unsubscribed"; mailboxId: string }
	| { type: "pong" }
	| { type: "error"; message: string };

type Options = {
	enabled?: boolean;
	mailboxId?: string;
	onEvent?: (event: InboxServerEvent) => void;
};

export function inboxWsUrl() {
	if (typeof window === "undefined") return "";
	const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
	return `${proto}//${window.location.host}/api/inbox/v1/ws`;
}

export function useInboxSocket({
	enabled = true,
	mailboxId,
	onEvent,
}: Options = {}) {
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

	const subscribeMailbox = useCallback(
		(targetMailboxId: string) =>
			send({ type: "subscribe_mailbox", mailboxId: targetMailboxId }),
		[send],
	);

	const unsubscribeMailbox = useCallback(
		(targetMailboxId: string) =>
			send({ type: "unsubscribe_mailbox", mailboxId: targetMailboxId }),
		[send],
	);

	useEffect(() => {
		if (!enabled) return;

		let closed = false;

		const connect = () => {
			const url = inboxWsUrl();
			if (!url) return;

			try {
				const ws = new WebSocket(url);
				wsRef.current = ws;

				ws.onopen = () => {
					setReady(true);
					if (mailboxId) {
						send({ type: "subscribe_mailbox", mailboxId });
					}
					// Start ping keep-alive
					if (pingInterval.current) clearInterval(pingInterval.current);
					pingInterval.current = setInterval(() => {
						if (ws.readyState === WebSocket.OPEN) {
							ws.send(JSON.stringify({ type: "ping" }));
						}
					}, 30_000);
				};

				ws.onmessage = (ev) => {
					try {
						const data = JSON.parse(String(ev.data)) as InboxServerEvent;
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
	}, [enabled, mailboxId, send]);

	// Update mailbox subscription when mailboxId prop changes while open
	useEffect(() => {
		if (ready && mailboxId) {
			subscribeMailbox(mailboxId);
		}
	}, [ready, mailboxId, subscribeMailbox]);

	return { ready, subscribeMailbox, unsubscribeMailbox, send };
}
