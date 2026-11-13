"use client";

import {
	type QueryClient,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { toast } from "sonner";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import type {
	Campaign,
	CreateCampaignInput,
	UpdateCampaignInput,
} from "./campaign-types";
import {
	type CampaignListParams,
	type CampaignListResponse,
	createCampaignRequest,
	deleteCampaignRequest,
	duplicateCampaignRequest,
	getCampaignById,
	listCampaignRecipients,
	listCampaigns,
	resumeCampaignRequest,
	scheduleCampaignRequest,
	sendCampaignRequest,
	unscheduleCampaignRequest,
	updateCampaignRequest,
} from "./campaigns-api";

interface CampaignsContextValue {
	createCampaign: (
		input: CreateCampaignInput,
		recipientCount: number,
	) => Promise<Campaign>;
	updateCampaign: (id: string, input: UpdateCampaignInput) => Promise<Campaign>;
	sendCampaign: (id: string) => Promise<void>;
	resumeCampaign: (id: string) => Promise<void>;
	scheduleCampaign: (id: string, scheduledAt: string) => Promise<void>;
	unscheduleCampaign: (id: string) => Promise<void>;
	duplicateCampaign: (id: string) => Promise<Campaign>;
	deleteCampaign: (id: string) => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

/** Provides campaign actions (create, send, schedule, duplicate, delete) for the active organization and refreshes the affected queries. */
export function CampaignsProvider({ children }: { children: ReactNode }) {
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "default_org";
	const queryClient = useQueryClient();

	const invalidate = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: queryKeys.campaigns.lists(orgId),
		});
	}, [orgId, queryClient]);

	// Status-changing actions must also refresh the open detail page; the
	// list-only invalidation left it showing the old status for up to 30s.
	const invalidateWithDetail = useCallback(
		async (id: string) => {
			await Promise.all([
				invalidate(),
				queryClient.invalidateQueries({
					queryKey: queryKeys.campaigns.detail(id),
				}),
			]);
		},
		[invalidate, queryClient],
	);

	const createCampaign = useCallback(
		async (input: CreateCampaignInput, _recipientCount: number) => {
			const created = await createCampaignRequest(input);
			await invalidate();
			return created;
		},
		[invalidate],
	);

	const updateCampaign = useCallback(
		async (id: string, input: UpdateCampaignInput) => {
			const updated = await updateCampaignRequest(id, input);
			await invalidate();
			await queryClient.invalidateQueries({
				queryKey: queryKeys.campaigns.detail(id),
			});
			return updated;
		},
		[invalidate, queryClient],
	);

	const sendCampaign = useCallback(
		async (id: string) => {
			const existing = findCachedCampaign(queryClient, orgId, id);
			await sendCampaignRequest(id);
			await invalidateWithDetail(id);
			toast.success(
				existing
					? `Campaign "${existing.name}" is sending`
					: "Campaign is sending",
			);
		},
		[invalidateWithDetail, orgId, queryClient],
	);

	const resumeCampaign = useCallback(
		async (id: string) => {
			await resumeCampaignRequest(id);
			await invalidateWithDetail(id);
			toast.success("Campaign resumed. Remaining recipients will be sent.");
		},
		[invalidateWithDetail],
	);

	const scheduleCampaign = useCallback(
		async (id: string, scheduledAt: string) => {
			await scheduleCampaignRequest(id, scheduledAt);
			await invalidateWithDetail(id);
			toast.success(
				`Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}`,
			);
		},
		[invalidateWithDetail],
	);

	const unscheduleCampaign = useCallback(
		async (id: string) => {
			await unscheduleCampaignRequest(id);
			await invalidateWithDetail(id);
			toast.success("Schedule removed. The campaign is a draft again.");
		},
		[invalidateWithDetail],
	);

	const duplicateCampaign = useCallback(
		async (id: string) => {
			const existing = findCachedCampaign(queryClient, orgId, id);
			const cloned = await duplicateCampaignRequest(id);
			await invalidate();
			toast.success(
				existing ? `Duplicated "${existing.name}"` : "Campaign duplicated",
			);
			return cloned;
		},
		[invalidate, orgId, queryClient],
	);

	const deleteCampaign = useCallback(
		async (id: string) => {
			const existing = findCachedCampaign(queryClient, orgId, id);
			await deleteCampaignRequest(id);
			await invalidate();
			toast.success(
				existing ? `Deleted "${existing.name}"` : "Campaign deleted",
			);
		},
		[invalidate, orgId, queryClient],
	);

	const value = useMemo<CampaignsContextValue>(
		() => ({
			createCampaign,
			updateCampaign,
			sendCampaign,
			resumeCampaign,
			scheduleCampaign,
			unscheduleCampaign,
			duplicateCampaign,
			deleteCampaign,
		}),
		[
			createCampaign,
			updateCampaign,
			sendCampaign,
			resumeCampaign,
			scheduleCampaign,
			unscheduleCampaign,
			duplicateCampaign,
			deleteCampaign,
		],
	);

	return (
		<CampaignsContext.Provider value={value}>
			{children}
		</CampaignsContext.Provider>
	);
}

/** Look up a campaign in any cached list page or detail query (for toast names). */
function findCachedCampaign(
	queryClient: QueryClient,
	orgId: string,
	id: string,
): Campaign | undefined {
	const detail = queryClient.getQueryData<Campaign>(
		queryKeys.campaigns.detail(id),
	);
	if (detail) return detail;
	const lists = queryClient.getQueriesData<CampaignListResponse>({
		queryKey: queryKeys.campaigns.lists(orgId),
	});
	for (const [, data] of lists) {
		const found = data?.campaigns.find((c) => c.id === id);
		if (found) return found;
	}
	return undefined;
}

/** One server-side page of campaigns for the current search/status/page. */
export function useCampaignsListQuery(params: CampaignListParams) {
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "default_org";
	return useQuery({
		queryKey: queryKeys.campaigns.list(orgId, params),
		queryFn: () => listCampaigns(params),
		enabled: Boolean(activeOrganization?.id),
		placeholderData: (prev) => prev,
	});
}

/** Campaign actions from the nearest CampaignsProvider. Throws when used outside one. */
export function useCampaigns() {
	const context = useContext(CampaignsContext);
	if (!context) {
		throw new Error("useCampaigns must be used within a CampaignsProvider");
	}
	return context;
}

/**
 * Returns a function that invalidates every cached campaign query. Pass
 * `exceptId` after deleting a campaign so its own detail and recipients
 * queries aren't refetched (they would 404 on the open detail page).
 */
export function useInvalidateCampaigns(): (exceptId?: string) => Promise<void> {
	const queryClient = useQueryClient();
	return (exceptId?: string) =>
		queryClient.invalidateQueries({
			queryKey: queryKeys.campaigns.all,
			predicate: exceptId
				? (query) => !query.queryKey.includes(exceptId)
				: undefined,
		});
}

/** Drops every cached query for a deleted campaign. */
export function useForgetCampaign(): (id: string) => void {
	const queryClient = useQueryClient();
	return (id: string) =>
		queryClient.removeQueries({
			queryKey: queryKeys.campaigns.all,
			predicate: (query) => query.queryKey.includes(id),
		});
}

/** Loads one campaign by id, using the cached list row as placeholder data. */
export function useCampaignQuery(id: string | undefined) {
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "default_org";
	const queryClient = useQueryClient();
	return useQuery({
		queryKey: queryKeys.campaigns.detail(id ?? ""),
		queryFn: () => getCampaignById(id as string),
		enabled: Boolean(id && activeOrganization?.id),
		placeholderData: () =>
			id ? findCachedCampaign(queryClient, orgId, id) : undefined,
	});
}

/** Loads the first page of recipients for a campaign. */
export function useCampaignRecipientsQuery(id: string | undefined) {
	const { activeOrganization } = useActiveOrganization();
	return useQuery({
		queryKey: queryKeys.campaigns.recipients(id ?? ""),
		queryFn: () => listCampaignRecipients(id as string, { limit: 20 }),
		enabled: Boolean(id && activeOrganization?.id),
	});
}
