import axios from "axios";
import * as React from "react";
import { toast } from "sonner";
import { useInvalidateDomains } from "../../hooks/use-domains-query";
import type { DomainResponse } from "../../types";

export function useDomainActions(
	domainId: string | undefined,
	domainData: DomainResponse | undefined,
) {
	const [isVerifying, setIsVerifying] = React.useState(false);
	const invalidate = useInvalidateDomains();

	const handleVerifyDNS = React.useCallback(async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}
		setIsVerifying(true);
		try {
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				withCredentials: true,
			});
			await invalidate();
			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(message);
		} finally {
			setIsVerifying(false);
		}
	}, [domainId, invalidate]);

	const handleUpdateDomain = React.useCallback(
		async (
			payload: Partial<
				Pick<
					DomainResponse,
					| "isSendingEmailEnabled"
					| "isReceivingEmailEnabled"
					| "isClickTrackingEnabled"
					| "isOpenTrackingEnabled"
					| "tls"
				>
			>,
			successMessage: string,
		) => {
			if (!domainId || !domainData) {
				toast.error("Domain information not available");
				return;
			}
			try {
				const apiPayload: {
					sending_email?: boolean;
					receiving_email?: boolean;
					click_tracking?: boolean;
					open_tracking?: boolean;
					tls?: "opportunistic" | "enforced";
				} = {};
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
				if (payload.tls !== undefined) {
					apiPayload.tls = payload.tls;
				}

				await axios.patch(`/api/domain/v1/${domainId}`, apiPayload, {
					withCredentials: true,
				});
				await invalidate();
				toast.success(successMessage);
			} catch (error) {
				const message = axios.isAxiosError(error)
					? error.response?.data?.message || "Failed to update domain settings"
					: "Failed to update domain settings";
				toast.error(message);
			}
		},
		[domainId, domainData, invalidate],
	);

	return {
		isVerifying,
		handleVerifyDNS,
		handleUpdateDomain,
	};
}
