import axios from "axios";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import type { DomainListResponse, DomainResponse } from "./domain-types";
import type { DomainFormValues } from "./schema";

export function useAddDomain(setError: UseFormSetError<DomainFormValues>) {
	const [status, setStatus] = useState<"idle" | "loading">("idle");
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [, setDomainId] = useQueryState(
		"domainId",
		parseAsString.withDefault(""),
	);
	const [, setSkippedDns] = useQueryState(
		"skippedDns",
		parseAsString.withDefault(""),
	);

	const submitDomain = async (values: DomainFormValues) => {
		try {
			setStatus("loading");
			const { data } = await axios.post<DomainResponse>(
				"/api/domain/v1/create",
				{
					domain: values.domain,
					click_tracking: values.clickTracking,
					open_tracking: values.openTracking,
					// Return path + tracking host labels are fixed server-side.
					tls: "opportunistic",
				},
				{ withCredentials: true },
			);
			setDomainId(data.id);
			setStep(step + 1);
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
						setDomainId(existingDomain.id);
						setStep(step + 1);
						return;
					}
				} catch (listError) {
					console.error("Failed to fetch existing domain ID:", listError);
				}
			}

			setStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";

			setError("domain", {
				type: "manual",
				message: errorMessage,
			});
			toast.error(errorMessage);
		}
	};

	const skipDns = () => {
		setSkippedDns("true");
		setStep(4);
	};

	return {
		status,
		isLoading: status === "loading",
		submitDomain,
		skipDns,
	};
}
