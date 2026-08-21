import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import { toastApiError } from "#/lib/rate-limit-toast";
import { useFinishOnboarding } from "../use-finish-onboarding";

export function useVerifyDns(domainId: string) {
	const queryClient = useQueryClient();
	const { finishOnboarding, isFinishing } = useFinishOnboarding();
	const [isVerifying, setIsVerifying] = useState(false);

	const verifyDns = async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}

		setIsVerifying(true);
		try {
			await axios.post(`/api/domain/v1/verify/${domainId}`, undefined, {
				withCredentials: true,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.domain.detail(domainId),
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.domain.list(),
			});
			toast.success(
				"DNS verification started! Verification will continue in the background.",
			);
			await finishOnboarding();
		} catch (error) {
			toastApiError(error, "Failed to start DNS verification");
		} finally {
			setIsVerifying(false);
		}
	};

	const skip = async () => {
		await finishOnboarding();
	};

	return {
		isVerifying: isVerifying || isFinishing,
		verifyDns,
		skip,
		finishOnboarding,
	};
}

