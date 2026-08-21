import axios from "axios";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useRef, useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { onboardingStepParser } from "../onboarding-step";
import { useFinishOnboarding } from "../use-finish-onboarding";
import type { DomainListResponse, DomainResponse } from "./domain-types";
import type { DomainFormValues } from "./schema";

export function useAddDomain(setError: UseFormSetError<DomainFormValues>) {
	const [status, setStatus] = useState<"idle" | "loading">("idle");
	const inFlightRef = useRef(false);
	const { finishOnboarding, isFinishing } = useFinishOnboarding();
	const [, setStep] = useQueryState("step", onboardingStepParser);
	const [, setDomainId] = useQueryState(
		"domainId",
		parseAsString.withDefault(""),
	);

	const advanceStep = useCallback(async () => {
		await setStep(4);
	}, [setStep]);

	const submitDomain = useCallback(
		async (values: DomainFormValues) => {
			if (inFlightRef.current) return;
			inFlightRef.current = true;
			setStatus("loading");
			try {
				const { data } = await axios.post<DomainResponse>(
					"/api/domain/v1/create",
					{
						domain: values.domain,
						click_tracking: values.clickTracking,
						open_tracking: values.openTracking,
						// Receiving + tracking on by default for new domains.
						receiving_email: true,
						// Return path + tracking host labels are fixed server-side.
						tls: "opportunistic",
					},
					{ withCredentials: true },
				);
				await setDomainId(data.id);
				await advanceStep();
			} catch (error) {
				const isAlreadyExists =
					axios.isAxiosError(error) &&
					(error.response?.status === 409 ||
						error.response?.data?.message === "Domain already exists");

				if (isAlreadyExists) {
					try {
						const { data: listData } = await axios.get<DomainListResponse>(
							"/api/domain/v1/list?limit=100",
							{ withCredentials: true },
						);
						const existingDomain = listData.domains?.find(
							(d) => d.domain.toLowerCase() === values.domain.toLowerCase(),
						);
						if (existingDomain) {
							await setDomainId(existingDomain.id);
							await advanceStep();
							return;
						}
					} catch (listError) {
						console.error("Failed to fetch existing domain ID:", listError);
					}
				}

				const errorMessage = axios.isAxiosError(error)
					? error.response?.data?.message || "An unexpected error occurred"
					: "An unexpected error occurred";

				setError("domain", {
					type: "manual",
					message: errorMessage,
				});
				toast.error(errorMessage);
			} finally {
				inFlightRef.current = false;
				setStatus("idle");
			}
		},
		[advanceStep, setDomainId, setError],
	);

	const skipDomain = useCallback(async () => {
		await finishOnboarding();
	}, [finishOnboarding]);

	return {
		status,
		isLoading: status === "loading" || isFinishing,
		isFinishing,
		submitDomain,
		skipDns: skipDomain,
		skipDomain,
	};
}

