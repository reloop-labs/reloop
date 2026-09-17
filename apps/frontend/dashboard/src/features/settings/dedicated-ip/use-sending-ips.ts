import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export type MailboxProvider =
	| "gmail"
	| "microsoft"
	| "yahoo"
	| "apple"
	| "other";

export type SendingIpWarmupProvider = {
	provider: MailboxProvider;
	dailyCap: number | null;
	sentToday: number;
};

export type SendingIpWarmup = {
	status: "pending" | "active" | "paused" | "completed" | "aborted";
	overflow: "shared" | "defer";
	day: number;
	dailyCap: number | null;
	sentToday: number;
	providers: SendingIpWarmupProvider[];
	startedAt: string | null;
	completedAt: string | null;
	pausedAt: string | null;
};

export type OrganizationSendingIp = {
	id: string;
	address: string;
	hostname: string;
	isPrimary: boolean;
	assignedAt: string;
	warmup: SendingIpWarmup | null;
};

export type OrganizationSendingIps = {
	dedicatedIpCount: number;
	assignedCount: number;
	items: OrganizationSendingIp[];
};

async function fetchSendingIps(): Promise<OrganizationSendingIps> {
	const res = await fetch("/api/domain/v1/sending-ips", {
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(`Failed to load dedicated IPs (${res.status})`);
	}
	return res.json() as Promise<OrganizationSendingIps>;
}

export function useSendingIps(enabled: boolean) {
	return useQuery({
		queryKey: queryKeys.billing.sendingIps(),
		queryFn: fetchSendingIps,
		enabled,
		refetchOnWindowFocus: false,
	});
}
