"use client";

import { SWRConfig } from "swr";

const SWRProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<SWRConfig
			value={{
				refreshInterval: 3000,
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
