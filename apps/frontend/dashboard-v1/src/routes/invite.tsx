import { createFileRoute } from "@tanstack/react-router";
import { InvitePage } from "#/features/invite/invite-page";

export const Route = createFileRoute("/invite")({
	validateSearch: (search: Record<string, unknown>) => ({
		id: typeof search.id === "string" ? search.id : "",
	}),
	component: InvitePage,
});
