import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSupportSocket } from "#/features/dashboard/hooks/use-support-socket";
import { queryKeys } from "#/lib/query-keys";
import type { SupportServerEvent } from "#/lib/support-types";

async function fetchUnreadCount() {
	const { data } = await axios.get<{ count: number }>(
		"/api/admin/v1/support/unread-count",
		{ withCredentials: true },
	);
	return data.count;
}

/** Imperative clear for the Help page chat (sets cache to 0). */
export function clearSupportUnreadInCache(
	queryClient: ReturnType<typeof useQueryClient>,
) {
	queryClient.setQueryData(queryKeys.support.unreadCount(), 0);
}

export function useSupportUnread() {
	const queryClient = useQueryClient();
	const pathname = usePathname() ?? "/";
	const supportOpen = (pathname.replace(/^\/dashboard/, "") || "/") === "/help";

	// Defer non-critical support work off the initial paint critical path.
	// Enable after idle (or 2s), or immediately on the Help page.
	const [networkEnabled, setNetworkEnabled] = useState(false);
	useEffect(() => {
		if (supportOpen) {
			setNetworkEnabled(true);
			return;
		}
		let cancelled = false;
		const enable = () => {
			if (!cancelled) setNetworkEnabled(true);
		};
		if (typeof requestIdleCallback === "function") {
			const id = requestIdleCallback(enable, { timeout: 2000 });
			return () => {
				cancelled = true;
				cancelIdleCallback(id);
			};
		}
		const timer = setTimeout(enable, 2000);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [supportOpen]);

	const { data: count = 0, refetch: mutateUnread } = useQuery({
		queryKey: queryKeys.support.unreadCount(),
		queryFn: fetchUnreadCount,
		enabled: networkEnabled,
		refetchInterval: networkEnabled ? 30_000 : false,
		refetchOnWindowFocus: networkEnabled,
	});

	const clearUnread = useCallback(() => {
		clearSupportUnreadInCache(queryClient);
	}, [queryClient]);

	const onEvent = useCallback(
		(event: SupportServerEvent) => {
			if (
				event.type === "message_created" ||
				event.type === "conversation_updated"
			) {
				void mutateUnread();
			}
		},
		[mutateUnread],
	);

	// WebSocket only after idle (or on the Help page), not on first paint.
	useSupportSocket({
		enabled: networkEnabled,
		onEvent,
	});

	useEffect(() => {
		if (!supportOpen || !networkEnabled) return;
		void mutateUnread();
	}, [supportOpen, networkEnabled, mutateUnread]);

	return {
		unreadCount: count,
		mutateUnread,
		clearUnread,
	};
}
