import { useCallback, useMemo } from "react";
import { apiFetch } from "#/features/agent-inbox/lib/api-fetch";
import { useSWR } from "#/features/agent-inbox/lib/use-swr-compat";
import type { InboxLabel } from "../types";

type ApiLabel = {
	id: string;
	mailboxId: string;
	organizationId: string;
	name: string;
	color: string;
	createdAt: string | Date;
	updatedAt: string | Date;
};

export const useInboxLabels = (mailboxId: string) => {
	const { data, mutate, isLoading, error } = useSWR<ApiLabel[]>(
		mailboxId ? `/api/inbox/v1/labels?mailboxId=${mailboxId}` : null,
	);

	const labels: InboxLabel[] = useMemo(
		() =>
			(data || []).map((l) => ({
				id: l.id,
				mailboxId: l.mailboxId,
				name: l.name,
				color: l.color,
			})),
		[data],
	);

	const addLabel = useCallback(
		async (name: string, color = "default") => {
			const trimmed = name.trim();
			if (!trimmed || !mailboxId) return null;
			const res = await apiFetch("/api/inbox/v1/labels", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ mailboxId, name: trimmed, color }),
			});
			if (!res.ok) return null;
			const created = (await res.json()) as ApiLabel;
			await mutate();
			return created.id;
		},
		[mailboxId, mutate],
	);

	const deleteLabel = useCallback(
		async (labelId: string) => {
			const res = await apiFetch(`/api/inbox/v1/labels/${labelId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete label");
			await mutate();
		},
		[mutate],
	);

	const assignThreadToLabel = useCallback(
		async (threadId: string, labelId: string) => {
			const res = await apiFetch(
				`/api/inbox/v1/labels/threads/${threadId}/assign`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ labelId }),
				},
			);
			if (!res.ok) throw new Error("Failed to assign label");
		},
		[],
	);

	const unassignThreadFromLabel = useCallback(
		async (threadId: string, labelId: string) => {
			const res = await apiFetch(
				`/api/inbox/v1/labels/threads/${threadId}/unassign`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ labelId }),
				},
			);
			if (!res.ok) throw new Error("Failed to unassign label");
		},
		[],
	);

	const getThreadLabels = useCallback(async (threadId: string) => {
		const res = await apiFetch(`/api/inbox/v1/labels/threads/${threadId}`);
		if (!res.ok) return [] as InboxLabel[];
		const list = (await res.json()) as ApiLabel[];
		return list.map((l) => ({
			id: l.id,
			mailboxId: l.mailboxId,
			name: l.name,
			color: l.color,
		}));
	}, []);

	const fetchThreadIdsForLabel = useCallback(async (labelId: string) => {
		const res = await apiFetch(`/api/inbox/v1/labels/${labelId}/threads`);
		if (!res.ok) return [] as string[];
		const body = (await res.json()) as { threadIds: string[] };
		return body.threadIds || [];
	}, []);

	const getLabelCount = useCallback((_labelId: string) => 0, []);

	const labelsError =
		error instanceof Error
			? error
			: error
				? new Error("Failed to load labels")
				: null;

	return useMemo(
		() => ({
			labels,
			isLoading,
			labelsError,
			addLabel,
			deleteLabel,
			getLabelCount,
			fetchThreadIdsForLabel,
			assignThreadToLabel,
			unassignThreadFromLabel,
			getThreadLabels,
			refreshLabels: mutate,
		}),
		[
			labels,
			isLoading,
			labelsError,
			addLabel,
			deleteLabel,
			getLabelCount,
			fetchThreadIdsForLabel,
			assignThreadToLabel,
			unassignThreadFromLabel,
			getThreadLabels,
			mutate,
		],
	);
};

export const useLabelThreadIds = (labelId: string | undefined) => {
	const { data, isLoading, mutate } = useSWR<{ threadIds: string[] }>(
		labelId ? `/api/inbox/v1/labels/${labelId}/threads` : null,
	);
	return {
		threadIds: data?.threadIds ?? [],
		isLoading,
		refresh: mutate,
	};
};
