"use client";

import { Toaster } from "@reloop/ui/toast";
import * as Tooltip from "@reloop/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense, useState } from "react";
import { LazyIconsSprite } from "#/components/lazy-icons-sprite";
import { AuthSessionLoader } from "#/features/auth/auth-session-loader";
import { createQueryClient } from "#/lib/query-client";
import { ThemeProvider } from "#/providers/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(createQueryClient);

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
				storageKey="theme"
			>
				<Tooltip.Provider>
					<Suspense fallback={<AuthSessionLoader />}>
						<NuqsAdapter>{children}</NuqsAdapter>
					</Suspense>
					<LazyIconsSprite />
					<Toaster />
					{process.env.NODE_ENV === "development" ? (
						<ReactQueryDevtools
							initialIsOpen={false}
							buttonPosition="bottom-right"
						/>
					) : null}
				</Tooltip.Provider>
			</ThemeProvider>
		</QueryClientProvider>
	);
}
