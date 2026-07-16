import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";

export function useVerifyDns(domainId: string) {
	const queryClient = useQueryClient();
	const [, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
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
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start DNS verification"
				: "Failed to start DNS verification";
			toast.error(errorMessage);
		} finally {
			setIsVerifying(false);
		}
	};

	const skip = () => {
		setStep(4);
	};

	return { isVerifying, verifyDns, skip };
}
