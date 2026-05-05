"use client";

import axios from "axios";
import { SWRConfig } from "swr";

const fetcher = async (key: string | any[]) => {
	// Third-party hooks like Vercel AI SDK use array keys and handle their own fetching.
	// We should ignore them to prevent SWR from sending malformed GET requests.
	if (Array.isArray(key)) return null;
	if (typeof key !== "string") return null;
	if (key.includes("/api/ai/generate-template")) return null;

	const response = await axios.get(key, {
		headers: { credentials: "include" },
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
