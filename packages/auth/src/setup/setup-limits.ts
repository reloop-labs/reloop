/** Max length for the instance name written to `APP_NAME`. */
export const APP_NAME_MAX_LENGTH = 40;

/**
 * Values that end up in the bind-mounted `.env` must stay on a single line and
 * carry no control characters, otherwise a patched value can inject further
 * keys into the file.
 */
export function isSafeEnvText(value: string): boolean {
	for (const character of value) {
		const code = character.codePointAt(0) ?? 0;
		if (code < 0x20 || code === 0x7f) return false;
	}

	return true;
}
