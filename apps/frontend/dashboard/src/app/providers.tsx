"use client";

import { PostHogProvider } from "@reloop/analytics";
import { Toaster } from "@reloop/ui/toast";
import * as Tooltip from "@reloop/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense, useState } from "react";
import { LazyIconsSprite } from "#/components/lazy-icons-sprite";
import { KeyboardShortcutsRevealListener } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { createQueryClient } from "#/lib/query-client";
import { installAxiosRateLimitInterceptor } from "#/lib/rate-limit-toast";
import { ThemeProvider } from "#/providers/theme-provider";
import { ProvidersSuspenseFallback } from "./providers-suspense-fallback";

// Install once for every Axios 429 in the dashboard (domain, contacts, API keys, …).
installAxiosRateLimitInterceptor();

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(createQueryClient);

	return (
		<PostHogProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
					storageKey="theme"
				>
					<Tooltip.Provider>
						{/* Fallback must match dashboard chrome — AuthSessionLoader caused a
						    hard-refresh flash when Nuqs/useSearchParams suspended. */}
						<Suspense fallback={<ProvidersSuspenseFallback />}>
							<NuqsAdapter>{children}</NuqsAdapter>
						</Suspense>
						<KeyboardShortcutsRevealListener />
						<LazyIconsSprite />
						<Toaster position="bottom-center" />
					</Tooltip.Provider>
				</ThemeProvider>
			</QueryClientProvider>
		</PostHogProvider>
	);
}
