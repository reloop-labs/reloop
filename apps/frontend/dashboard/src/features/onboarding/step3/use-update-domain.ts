import { toast } from "@reloop/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "#/lib/query-keys";
import type { DomainResponse } from "./domain-types";

type UpdatePayload = Partial<
	Pick<
		DomainResponse,
		| "isSendingEmailEnabled"
		| "isReceivingEmailEnabled"
		| "isClickTrackingEnabled"
		| "isOpenTrackingEnabled"
		| "tls"
	>
>;

export function useUpdateDomain(
	domainId: string,
	domainData: DomainResponse | undefined,
) {
	const queryClient = useQueryClient();

	const handleUpdateDomain = (
		payload: UpdatePayload,
		successMessage: string,
		loadingMessage?: string,
	) => {
		if (!domainId || !domainData) {
			toast.error("Domain information not available");
			return Promise.resolve();
		}

		const detailKey = queryKeys.domain.detail(domainId);
		const optimistic = { ...domainData, ...payload };
		queryClient.setQueryData(detailKey, optimistic);

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
				.patch<DomainResponse>(`/api/domain/v1/${domainId}`, apiPayload, {
					withCredentials: true,
				})
				.then(async (res) => {
					queryClient.setQueryData(detailKey, res.data);
					if (res.data.status === "verifying") {
						await queryClient.invalidateQueries({
							queryKey: queryKeys.domain.list(),
						});
					}
					return res;
				})
				.catch(async (error) => {
					await queryClient.invalidateQueries({ queryKey: detailKey });
					throw error;
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
	};

	return { handleUpdateDomain };
}
