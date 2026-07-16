import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "#/features/auth/login/login-page";

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>) => ({
		inviteId: typeof search.inviteId === "string" ? search.inviteId : undefined,
	}),
	component: LoginPage,
});
