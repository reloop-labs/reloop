const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const TEXT_ENTRY =
	'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="range"]), textarea, [contenteditable="true"]';

/**
 * Default `onOpenAutoFocus` for dialogs. Radix focuses the first focusable
 * element, which paints a focus ring on a header link or button when a dialog
 * opens on page load (e.g. reopened from the URL). Focus the dialog itself
 * instead so focus stays trapped without a ring; Tab still moves to the first
 * control. Dialogs that open on a text field keep focusing it.
 */
export function focusDialogOnOpen(event: Event) {
	const container = event.currentTarget;
	if (!(container instanceof HTMLElement)) return;
	const first = container.querySelector<HTMLElement>(FOCUSABLE);
	if (first?.matches(TEXT_ENTRY)) return;
	event.preventDefault();
	container.focus({ preventScroll: true });
}
