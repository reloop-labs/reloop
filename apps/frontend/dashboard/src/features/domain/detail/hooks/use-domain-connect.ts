import axios from "axios";
import * as React from "react";
import { toast } from "sonner";

interface DCDiscoveryResult {
	supported: boolean;
	templateSupported: boolean;
	provider: { id: string; name: string; displayName: string } | null;
	error?: string;
}

interface DCApplyUrlResult {
	applyUrl: string;
	provider: { id: string; name: string; displayName: string };
}

type DCStatus = "idle" | "discovering" | "redirecting" | "error";

export const useDomainConnect = (domainId: string | undefined) => {
	const [status, setStatus] = React.useState<DCStatus>("idle");
	const [discovery, setDiscovery] = React.useState<DCDiscoveryResult | null>(null);

	/**
	 * Discover if the domain's DNS provider supports Domain Connect.
	 */
	const discover = React.useCallback(async () => {
		if (!domainId) return null;

		try {
			const { data } = await axios.get<DCDiscoveryResult>(
				`/api/domain/v1/domain-connect/discover/${domainId}`,
				{ withCredentials: true },
			);
			setDiscovery(data);
			return data;
		} catch {
			setDiscovery(null);
			return null;
		}
	}, [domainId]);

	/**
	 * Full auto-connect flow: discover → get apply URL → redirect.
	 */
	const startAutoConnect = React.useCallback(async () => {
		if (!domainId) {
			toast.error("Domain information not available");
			return;
		}

		setStatus("discovering");
		try {
			// 1. Check DC support
			const { data: disc } = await axios.get<DCDiscoveryResult>(
				`/api/domain/v1/domain-connect/discover/${domainId}`,
				{ withCredentials: true },
			);

			if (!disc.supported) {
				toast.error(
					"Your DNS provider doesn't support automatic configuration.",
				);
				setStatus("error");
				return;
			}

			if (!disc.templateSupported) {
				toast.error(
					`${disc.provider?.displayName || "Your DNS provider"} supports Domain Connect but hasn't onboarded Reloop's template yet. Please configure DNS records manually.`,
				);
				setStatus("error");
				return;
			}

			// 2. Get the signed redirect URL
			setStatus("redirecting");
			const { data } = await axios.get<DCApplyUrlResult>(
				`/api/domain/v1/domain-connect/apply-url/${domainId}`,
				{ withCredentials: true },
			);

			// 3. Redirect to DNS provider's consent page (same window)
			window.location.href = data.applyUrl;
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to start auto-configuration"
				: "Failed to start auto-configuration";
			toast.error(errorMessage);
			setStatus("error");
		}
	}, [domainId]);

	return {
		status,
		discovery,
		discover,
		startAutoConnect,
		isConnecting: status === "discovering" || status === "redirecting",
	};
};
