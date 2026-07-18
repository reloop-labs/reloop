import { IconsSprite } from "@reloop/ui/icons-sprite";
import { Toaster } from "@reloop/ui/toast";
import * as Tooltip from "@reloop/ui/tooltip";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { NotFound } from "#/components/not-found";
import { ThemeProvider } from "#/providers/theme-provider";

import appCss from "../styles.css?url";

export interface RouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='system')?stored:'system';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='system'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);}catch(e){}})();`;

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Reloop Dashboard",
			},
			{
				name: "description",
				content: "Reloop Dashboard",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="bg-bg-white-0 font-sans text-text-strong-950 antialiased">
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootComponent() {
	return (
		<NuqsAdapter>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
				storageKey="theme"
			>
				<Tooltip.Provider>
					<Outlet />
				</Tooltip.Provider>
				<IconsSprite />
				<Toaster />
				{import.meta.env.DEV ? (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							{
								name: "Tanstack Query",
								render: <ReactQueryDevtoolsPanel />,
							},
						]}
					/>
				) : null}
			</ThemeProvider>
		</NuqsAdapter>
	);
}
