"use client";

import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import type { Domain, DomainListResponse } from "../types";

/** Domain fields the table toggles, with their PATCH body keys. */
export const DOMAIN_FEATURE_FIELDS = {
	sending: { field: "isSendingEmailEnabled", body: "sending_email" },
	receiving: { field: "isReceivingEmailEnabled", body: "receiving_email" },
	clickTracking: { field: "isClickTrackingEnabled", body: "click_tracking" },
	openTracking: { field: "isOpenTrackingEnabled", body: "open_tracking" },
} as const;

export type DomainFeatureId = keyof typeof DOMAIN_FEATURE_FIELDS;

const LABELS: Record<DomainFeatureId, string> = {
	sending: "sending",
	receiving: "receiving",
	clickTracking: "click tracking",
	openTracking: "open tracking",
};

/**
 * Turns one feature on/off for one or more domains. The list updates
 * immediately; on failure it is refetched (reverting the switch) and a toast
 * explains why.
 */
export function useDomainFeatureToggle() {
	const queryClient = useQueryClient();

	return useCallback(
		async (domainIds: string[], feature: DomainFeatureId, enabled: boolean) => {
			if (domainIds.length === 0) return;
			const { field, body } = DOMAIN_FEATURE_FIELDS[feature];
			const ids = new Set(domainIds);

			await queryClient.cancelQueries({ queryKey: queryKeys.domain.all });
			queryClient.setQueriesData<DomainListResponse>(
				{ queryKey: queryKeys.domain.all },
				(data) =>
					data && Array.isArray(data.domains)
						? {
								...data,
								domains: data.domains.map((d: Domain) =>
									ids.has(d.id) ? { ...d, [field]: enabled } : d,
								),
							}
						: data,
			);

			const results = await Promise.allSettled(
				domainIds.map((id) =>
					axios.patch(
						`/api/domain/v1/${id}`,
						{ [body]: enabled },
						{ withCredentials: true },
					),
				),
			);
			const failed = results.filter(
				(r): r is PromiseRejectedResult => r.status === "rejected",
			);
			if (failed.length > 0) {
				const reason = failed[0]?.reason;
				toast.error(
					axios.isAxiosError(reason) && reason.response?.data?.message
						? reason.response.data.message
						: `Couldn't turn ${enabled ? "on" : "off"} ${LABELS[feature]}`,
				);
			}
			await queryClient.invalidateQueries({ queryKey: queryKeys.domain.all });
		},
		[queryClient],
	);
}
