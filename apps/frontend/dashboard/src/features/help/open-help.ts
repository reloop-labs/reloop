import { useUIStore } from "#/store/use-ui-store";

/**
 * Navigate to the Help page with a pre-filled message (auto-sent when the
 * support chat is ready). Used by "contact us" CTAs across the dashboard.
 */
export function openHelpWithMessage(
	router: { push: (href: string) => void },
	message: string,
) {
	useUIStore.getState().setPendingSupportMessage(message);
	router.push("/help");
}
