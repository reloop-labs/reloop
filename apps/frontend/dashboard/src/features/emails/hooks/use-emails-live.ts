"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useInboxSocket } from "#/features/agent-inbox/hooks/use-inbox-socket";
import { queryKeys } from "#/lib/query-keys";
import { applyEmailLogUpdate } from "./apply-email-log-update";
import {
	type EmailLogsServerEvent,
	useEmailLogsSocket,
} from "./use-email-logs-socket";
import type { EmailListResponse } from "./use-emails-query";

type Options = {
	enabled?: boolean;
	sent?: boolean;
	received?: boolean;
};

export function useEmailsLive({
	enabled = true,
	sent = true,
	received = true,
}: Options = {}) {
	const queryClient = useQueryClient();

	const refreshSent = useCallback(() => {
		void queryClient.invalidateQueries({ queryKey: queryKeys.emails.all });
		void queryClient.invalidateQueries({ queryKey: queryKeys.metrics.all });
	}, [queryClient]);

	const handleLogsEvent = useCallback(
		(event: EmailLogsServerEvent) => {
			if (event.type !== "email_log_updated") return;
			queryClient.setQueriesData<EmailListResponse>(
				{ queryKey: [...queryKeys.emails.all, "sent"] },
				(old) => applyEmailLogUpdate(old, event.data),
			);
			refreshSent();
		},
		[queryClient, refreshSent],
	);

	const handleInboxEvent = useCallback(
		(event: { type: string }) => {
			if (event.type !== "inbound_email_received") return;
			void queryClient.invalidateQueries({
				queryKey: queryKeys.emails.received(),
			});
		},
		[queryClient],
	);

	useEmailLogsSocket({
		enabled: enabled && sent,
		onEvent: handleLogsEvent,
	});

	useInboxSocket({
		enabled: enabled && received,
		onEvent: handleInboxEvent,
	});
}
