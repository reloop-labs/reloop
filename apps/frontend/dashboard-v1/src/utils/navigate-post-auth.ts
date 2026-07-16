/**
 * Navigate to a post-auth destination string produced by
 * `resolvePostAuthDestination` (router-relative paths).
 */
export async function navigatePostAuth(
	navigate: (opts: {
		to: "/invite" | "/onboarding" | "/";
		search?: { id?: string; inviteId?: string };
	}) => Promise<void> | void,
	destination: string,
) {
	if (destination.startsWith("/invite")) {
		const qs = destination.includes("?") ? destination.split("?")[1] : "";
		const id = new URLSearchParams(qs).get("id") ?? "";
		await navigate({ to: "/invite", search: { id } });
		return;
	}

	if (destination === "/onboarding") {
		await navigate({ to: "/onboarding" });
		return;
	}

	await navigate({ to: "/" });
}
