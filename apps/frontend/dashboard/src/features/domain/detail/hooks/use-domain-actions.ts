import { toast } from "@reloop/ui/toast";
import axios from "axios";
import * as React from "react";
import { useInvalidateDomains } from "../../hooks/use-domains-query";
import type { DomainResponse } from "../../types";

export function useDomainActions(
	domainId: string | undefined,
	domainData?: DomainResponse | undefined,
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
			await toast.promise(
				axios
					.post(`/api/domain/v1/verify/${domainId}`, undefined, {
						withCredentials: true,
					})
					.then(async (res) => {
						await invalidate();
						return res;
					}),
				{
					loading: "Verifying DNS records...",
					success:
						"DNS verification started! Verification will continue in the background.",
					error: (error) =>
						axios.isAxiosError(error)
							? error.response?.data?.message ||
								"Failed to start DNS verification"
							: "Failed to start DNS verification",
				},
			);
		} finally {
			setIsVerifying(false);
		}
	}, [domainId, invalidate]);

	const handleUpdateDomain = React.useCallback(
		(
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
			loadingMessage?: string,
		) => {
			if (!domainId || !domainData) {
				toast.error("Domain information not available");
				return Promise.resolve();
			}

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

			const defaultLoading = loadingMessage || "Updating domain settings...";

			return toast.promise(
				axios
					.patch(`/api/domain/v1/${domainId}`, apiPayload, {
						withCredentials: true,
					})
					.then(async (res) => {
						await invalidate();
						return res;
					}),
				{
					loading: defaultLoading,
					success: successMessage,
					error: (error) =>
						axios.isAxiosError(error)
							? error.response?.data?.message ||
								"Failed to update domain settings"
							: "Failed to update domain settings",
				},
			);
		},
		[domainId, domainData, invalidate],
	);

	return {
		isVerifying,
		handleVerifyDNS,
		handleUpdateDomain,
	};
}
