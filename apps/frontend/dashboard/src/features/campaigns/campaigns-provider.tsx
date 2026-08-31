"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "./campaign-types";
import {
	createCampaignRequest,
	deleteCampaignRequest,
	duplicateCampaignRequest,
	getCampaignById,
	listCampaigns,
	scheduleCampaignRequest,
	sendCampaignRequest,
} from "./campaigns-api";

interface CampaignsContextValue {
	campaigns: Campaign[];
	isLoading: boolean;
	isHydrated: boolean;
	getCampaign: (id: string) => Campaign | undefined;
	createCampaign: (
		input: CreateCampaignInput,
		recipientCount: number,
	) => Promise<Campaign>;
	sendCampaign: (id: string) => Promise<void>;
	scheduleCampaign: (id: string, scheduledAt: string) => Promise<void>;
	duplicateCampaign: (id: string) => Promise<Campaign>;
	deleteCampaign: (id: string) => Promise<void>;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function CampaignsProvider({ children }: { children: ReactNode }) {
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "default_org";
	const queryClient = useQueryClient();

	const listQuery = useQuery({
		queryKey: queryKeys.campaigns.list(orgId),
		queryFn: listCampaigns,
		enabled: Boolean(activeOrganization?.id),
	});

	const campaigns = listQuery.data ?? [];

	const invalidate = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: queryKeys.campaigns.list(orgId),
		});
	}, [orgId, queryClient]);

	const getCampaign = useCallback(
		(id: string) => campaigns.find((c) => c.id === id),
		[campaigns],
	);

	const createCampaign = useCallback(
		async (input: CreateCampaignInput, _recipientCount: number) => {
			const created = await createCampaignRequest(input);
			await invalidate();
			return created;
		},
		[invalidate],
	);

	const sendCampaign = useCallback(
		async (id: string) => {
			const existing = campaigns.find((c) => c.id === id);
			await sendCampaignRequest(id);
			await invalidate();
			toast.success(
				existing
					? `Campaign "${existing.name}" is sending`
					: "Campaign is sending",
			);
		},
		[campaigns, invalidate],
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

	const duplicateCampaign = useCallback(
		async (id: string) => {
			const existing = campaigns.find((c) => c.id === id);
			const cloned = await duplicateCampaignRequest(id);
			await invalidate();
			toast.success(
				existing ? `Duplicated "${existing.name}"` : "Campaign duplicated",
			);
			return cloned;
		},
		[campaigns, invalidate],
	);

	const deleteCampaign = useCallback(
		async (id: string) => {
			const existing = campaigns.find((c) => c.id === id);
			await deleteCampaignRequest(id);
			await invalidate();
			toast.success(
				existing ? `Deleted "${existing.name}"` : "Campaign deleted",
			);
		},
		[campaigns, invalidate],
	);

	const value = useMemo<CampaignsContextValue>(
		() => ({
			campaigns,
			isLoading: listQuery.isLoading,
			isHydrated: listQuery.isFetched || listQuery.isError,
			getCampaign,
			createCampaign,
			sendCampaign,
			scheduleCampaign,
			duplicateCampaign,
			deleteCampaign,
		}),
		[
			campaigns,
			listQuery.isLoading,
			listQuery.isFetched,
			listQuery.isError,
			getCampaign,
			createCampaign,
			sendCampaign,
			scheduleCampaign,
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

export function useCampaigns() {
	const context = useContext(CampaignsContext);
	if (!context) {
		throw new Error("useCampaigns must be used within a CampaignsProvider");
	}
	return context;
}

export function useCampaignQuery(id: string | undefined) {
	const { activeOrganization } = useActiveOrganization();
	const orgId = activeOrganization?.id ?? "default_org";
	const queryClient = useQueryClient();
	return useQuery({
		queryKey: queryKeys.campaigns.detail(id ?? ""),
		queryFn: () => getCampaignById(id as string),
		enabled: Boolean(id && activeOrganization?.id),
		placeholderData: () => {
			if (!id) return undefined;
			const listed = queryClient.getQueryData<Campaign[]>(
				queryKeys.campaigns.list(orgId),
			);
			return listed?.find((campaign) => campaign.id === id);
		},
	});
}
