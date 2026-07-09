"use client";

import axios from "axios";
import { SWRConfig } from "swr";

const fetcher = async (key: string | unknown[]) => {
	if (Array.isArray(key)) return null;
	if (typeof key !== "string") return null;

	const response = await axios.get(key, {
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
			}}
		>
			{children}
		</SWRConfig>
	);
};

export default SWRProvider;
