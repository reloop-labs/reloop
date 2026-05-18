import type { DomainResponse } from "@fe/dashboard/types/api.types";
import axios from "axios";
import * as React from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export const useDomainActions = (
	domainId: string | undefined,
	domainData: DomainResponse | undefined,
) => {
	const [isVerifying, setIsVerifying] = React.useState(false);

	const handleVerifyDNS = React.useCallback(async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			// Trigger Inngest workflow for background verification
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				headers: { credentials: "include" },
			});

			// Refresh domain data to get "verifying" status
			await mutate(`/api/domain/v1/${domainId}`);

			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
		}
	}, [domainId]);

	const handleUpdateDomain = React.useCallback(
		async (
			payload: Partial<
				Pick<
					DomainResponse,
					"isSendingEmailEnabled" | "isReceivingEmailEnabled" | "isClickTrackingEnabled" | "isOpenTrackingEnabled"
				>
			>,
			successMessage: string,
		) => {
			if (!domainId || !domainData) {
				toast.error("Domain information not available");
				return;
			}

			const cacheKey = `/api/domain/v1/${domainId}`;
			const optimisticData = { ...domainData, ...payload };

			await mutate(cacheKey, optimisticData, false);

			try {
				const apiPayload: any = {};
				if (payload.isSendingEmailEnabled !== undefined) {
					apiPayload.sending_email = payload.isSendingEmailEnabled;
				}
				if (payload.isReceivingEmailEnabled !== undefined) {
					apiPayload.receiving_email = payload.isReceivingEmailEnabled;
				}
				if (payload.isClickTrackingEnabled !== undefined) {
					apiPayload.click_tracking = payload.isClickTrackingEnabled;
				}
				if (payload.isOpenTrackingEnabled !== undefined) {
					apiPayload.open_tracking = payload.isOpenTrackingEnabled;
				}

				const { data } = await axios.patch<DomainResponse>(
					`/api/domain/v1/${domainId}`,
					apiPayload,
					{ headers: { credentials: "include" } },
				);

				await mutate(cacheKey, data, false);
				toast.success(successMessage);
			} catch (error) {
				await mutate(cacheKey);
				const errorMessage = axios.isAxiosError(error)
					? error.response?.data?.message || "Failed to update domain settings"
					: "Failed to update domain settings";
				toast.error(errorMessage);
			}
		},
		[domainId, domainData],
	);

	return {
		isVerifying,
		handleVerifyDNS,
		handleUpdateDomain,
	};
};
