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
	scheduleCampaign: (id: string, scheduledAt: string) => Promise<void>;
	unscheduleCampaign: (id: string) => Promise<void>;
	duplicateCampaign: (id: string) => Promise<Campaign>;
	deleteCampaign: (id: string) => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function CampaignsProvider({ children }: { children: ReactNode }) {
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "default_org";
	const queryClient = useQueryClient();

	const invalidate = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: queryKeys.campaigns.lists(orgId),
		});
	}, [orgId, queryClient]);

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
			await invalidate();
			toast.success(
				existing
					? `Campaign "${existing.name}" is sending`
					: "Campaign is sending",
			);
		},
		[invalidate, orgId, queryClient],
	);

	const scheduleCampaign = useCallback(
		async (id: string, scheduledAt: string) => {
			await scheduleCampaignRequest(id, scheduledAt);
			await invalidate();
			toast.success(
				`Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}`,
			);
		},
		[invalidate],
	);

	const unscheduleCampaign = useCallback(
		async (id: string) => {
			await unscheduleCampaignRequest(id);
			await invalidate();
			toast.success("Schedule removed. The campaign is a draft again.");
		},
		[invalidate],
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
			scheduleCampaign,
			unscheduleCampaign,
			duplicateCampaign,
			deleteCampaign,
		}),
		[
			createCampaign,
			updateCampaign,
			sendCampaign,
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

export function useCampaigns() {
	const context = useContext(CampaignsContext);
	if (!context) {
		throw new Error("useCampaigns must be used within a CampaignsProvider");
	}
	return context;
}

export function useInvalidateCampaigns() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
}

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

export function useCampaignRecipientsQuery(id: string | undefined) {
	const { activeOrganization } = useActiveOrganization();
	return useQuery({
		queryKey: queryKeys.campaigns.recipients(id ?? ""),
		queryFn: () => listCampaignRecipients(id as string, { limit: 20 }),
		enabled: Boolean(id && activeOrganization?.id),
	});
}
