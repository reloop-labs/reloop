"use client";

import axios from "axios";
import { SWRConfig } from "swr";

const fetcher = async (url: string) => {
	const response = await axios.get(url, {
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
