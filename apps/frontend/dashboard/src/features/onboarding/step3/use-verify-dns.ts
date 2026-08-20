import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import { toastApiError } from "#/lib/rate-limit-toast";
import { onboardingStepParser } from "../onboarding-step";

export function useVerifyDns(domainId: string) {
	const queryClient = useQueryClient();
	const [, setStep] = useQueryState("step", onboardingStepParser);
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
			setStep(4);
		} catch (error) {
			toastApiError(error, "Failed to start DNS verification");
		} finally {
			setIsVerifying(false);
		}
	};

	const skip = () => {
		setStep(4);
	};

	return { isVerifying, verifyDns, skip };
}
