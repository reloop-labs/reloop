import type { CheckoutPlanId } from "@reloop/pricing";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { requestPlanSupport } from "./request-support";

type ApiErrorBody = {
	message?: string;
	why?: string;
	fix?: string;
};

async function readError(res: Response): Promise<string> {
	const payload = (await res.json().catch(() => ({}))) as ApiErrorBody;
	return (
		payload.fix ||
		payload.why ||
		payload.message ||
		`Request failed (${res.status})`
	);
}

async function startCheckout(planId: CheckoutPlanId): Promise<{ url: string }> {
	const res = await fetch("/api/credits/v1/billing/checkout", {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ planId }),
	});
	if (!res.ok) {
		throw new Error(await readError(res));
	}
	return res.json() as Promise<{ url: string }>;
}

async function startPortal(): Promise<{ url: string }> {
	const res = await fetch("/api/credits/v1/billing/portal", {
		method: "POST",
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(await readError(res));
	}
	return res.json() as Promise<{ url: string }>;
}

export function useBillingCheckout() {
	return useMutation({
		mutationFn: startCheckout,
		onSuccess: (data) => {
			window.location.assign(data.url);
		},
		onError: (error: Error) => {
			toast.error("Could not start checkout", {
				description: error.message,
			});
		},
	});
}

export function useBillingPortal() {
	return useMutation({
		mutationFn: startPortal,
		onSuccess: (data) => {
			window.location.assign(data.url);
		},
		onError: (error: Error) => {
			toast.error("Could not open billing portal", {
				description: error.message,
			});
		},
	});
}

export function contactEnterprise() {
	requestPlanSupport(
		"Hi! I'm interested in the Enterprise plan. Can you help me get set up?",
	);
}
