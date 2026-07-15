"use client";

import axios from "axios";
import { SWRConfig } from "swr";

/**
 * Resolve the HTTP URL from an SWR key.
 * - string keys: used as-is
 * - [url, ...deps] keys: first element is the URL; extra segments are cache deps
 *   (e.g. active org id) so a switch invalidates org-scoped data
 */
function resolveFetchUrl(key: string | unknown[]): string | null {
	if (typeof key === "string") return key;
	if (Array.isArray(key) && typeof key[0] === "string") {
		const url = key[0];
		// Only auto-fetch Reloop API paths. Other array keys (AI SDK, custom
		// fetchers) keep their own fetcher and must not hit axios.
		if (url.startsWith("/api/") && !url.includes("/api/ai/generate-template")) {
			return url;
		}
	}
	return null;
}

const fetcher = async (key: string | unknown[]) => {
	const url = resolveFetchUrl(key);
	if (!url) return null;

	const response = await axios.get(url, {
		withCredentials: true,
	});
	return response.data;
};

const SWRProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<SWRConfig
			value={{
				fetcher,
				refreshInterval: 100000,
				revalidateOnFocus: true,
				revalidateOnReconnect: true,
				revalidateOnMount: true,
				onError: (error) => {
					// Handle SWR errors silently or with proper error reporting
					if (axios.isAxiosError(error)) {
						// Log to error reporting service if needed
					}
				},
			}}
		>
			{children}
		</SWRConfig>
	);
};

export default SWRProvider;
