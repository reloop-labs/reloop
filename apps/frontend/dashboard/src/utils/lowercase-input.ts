/**
 * Lowercase an input in place as the user types or pastes, keeping the caret
 * where it was so typing in the middle of the value still works. Only works on
 * text-like inputs: `type="email"` can't restore the caret.
 */
export function lowercaseInput(input: HTMLInputElement): void {
	const lower = input.value.toLowerCase();
	if (lower === input.value) return;
	const { selectionStart, selectionEnd } = input;
	input.value = lower;
	if (selectionStart !== null && selectionEnd !== null) {
		input.setSelectionRange(selectionStart, selectionEnd);
	}
}
