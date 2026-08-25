/**
 * Delivery lifecycle status for the list UI.
 * Open/click live on email_event only — email_log.status stays delivered.
 * Prefer engagement (clicked > opened) over the stored delivery status.
 */
export function deriveDisplayStatus(
	status: string,
	eventTypes: Iterable<string>,
): string {
	if (status === "failed" || status === "bounced" || status === "spam") {
		return status;
	}
	const types = eventTypes instanceof Set ? eventTypes : new Set(eventTypes);
	if (types.has("clicked")) return "clicked";
	if (types.has("opened")) return "opened";
	return status;
}
