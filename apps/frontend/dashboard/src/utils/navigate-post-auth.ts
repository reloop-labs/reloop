/**
 * Navigate to a post-auth destination string produced by
 * `resolvePostAuthDestination` (router-relative paths or full URLs).
 */
export async function navigatePostAuth(
	router: { push: (href: string) => void },
	destination: string,
) {
	if (destination.startsWith("http://") || destination.startsWith("https://")) {
		window.location.href = destination;
		return;
	}

	if (
		destination.startsWith("/contact") ||
		destination.startsWith("/about") ||
		destination.startsWith("/pricing") ||
		destination.startsWith("/blog")
	) {
		window.location.href = destination;
		return;
	}

	if (destination.startsWith("/invite")) {
		const qs = destination.includes("?") ? destination.split("?")[1] : "";
		const id = new URLSearchParams(qs).get("id") ?? "";
		const href = id ? `/invite?id=${encodeURIComponent(id)}` : "/invite";
		router.push(href);
		return;
	}

	if (destination === "/onboarding") {
		router.push("/onboarding");
		return;
	}

	if (destination === "/") {
		router.push("/");
		return;
	}

	router.push(destination);
}

