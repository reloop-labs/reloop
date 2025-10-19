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
					if (axios.isAxiosError(error)) {
						console.error("SWR Error:", error.response?.data || error.message);
					} else {
						console.error("SWR Error:", error);
					}
				},
			}}
		>
			{children}
		</SWRConfig>
	);
};

export default SWRProvider;
