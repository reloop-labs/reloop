import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { NotFound } from "#/components/not-found";
import { createQueryClient } from "#/lib/query-client";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = createQueryClient();

	const router = createTanStackRouter({
		routeTree,
		basepath: "/dashboard",
		context: {
			queryClient,
		},
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: NotFound,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
