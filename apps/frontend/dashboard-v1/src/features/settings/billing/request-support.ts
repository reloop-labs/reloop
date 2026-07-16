import { toast } from "sonner";

/**
 * Support chat panel is not ported yet. Queue plan-change requests as toasts
 * so billing CTAs stay usable without the AI/support shell.
 */
export function requestPlanSupport(message: string) {
	console.info("[billing] support request:", message);
	toast.message("Support is coming soon", {
		description:
			"Plan changes currently go through support. We logged your request for the next support panel.",
	});
}
