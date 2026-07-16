import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "#/features/auth/signup/signup-page";

export const Route = createFileRoute("/signup")({
	validateSearch: (search: Record<string, unknown>) => ({
		inviteId: typeof search.inviteId === "string" ? search.inviteId : undefined,
	}),
	component: SignupPage,
});
