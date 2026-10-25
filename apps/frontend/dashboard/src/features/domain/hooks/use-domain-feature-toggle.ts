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

// Same wording as the domain detail page (dns-records-section.tsx).
const MESSAGES: Record<
	DomainFeatureId,
	{ on: [string, string]; off: [string, string] }
> = {
	sending: {
		on: ["Enabling email sending...", "Sending enabled successfully"],
		off: ["Disabling email sending...", "Sending disabled successfully"],
	},
	receiving: {
		on: ["Enabling email receiving...", "Receiving enabled successfully"],
		off: ["Disabling email receiving...", "Receiving disabled successfully"],
	},
	clickTracking: {
		on: ["Enabling click tracking...", "Click tracking enabled successfully"],
		off: [
			"Disabling click tracking...",
			"Click tracking disabled successfully",
		],
	},
	openTracking: {
		on: ["Enabling open tracking...", "Open tracking enabled successfully"],
		off: ["Disabling open tracking...", "Open tracking disabled successfully"],
	},
};

/**
 * Turns one feature on/off for one or more domains, like the detail page:
 * the list updates immediately and a loading → success/error toast tracks the
 * save. On failure the list is refetched, reverting the switch.
 */
export function useDomainFeatureToggle() {
	const queryClient = useQueryClient();

	return useCallback(
		async (domainIds: string[], feature: DomainFeatureId, enabled: boolean) => {
			if (domainIds.length === 0) return;
			const { field, body } = DOMAIN_FEATURE_FIELDS[feature];
			const ids = new Set(domainIds);
			const [loading, success] = MESSAGES[feature][enabled ? "on" : "off"];

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

			const save = Promise.all(
				domainIds.map((id) =>
					axios.patch(
						`/api/domain/v1/${id}`,
						{ [body]: enabled },
						{ withCredentials: true },
					),
				),
			);
			toast.promise(save, {
				loading,
				success,
				error: (error) =>
					axios.isAxiosError(error)
						? error.response?.data?.message ||
							"Failed to update domain settings"
						: "Failed to update domain settings",
			});
			try {
				await save;
			} catch {
				// The toast reports it; the refetch below reverts the switch.
			}
			await queryClient.invalidateQueries({ queryKey: queryKeys.domain.all });
		},
		[queryClient],
	);
}
