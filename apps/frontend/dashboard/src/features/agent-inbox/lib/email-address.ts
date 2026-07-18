/** Pull the bare address out of nested "Name <Name <email>>" forms. */
export function extractBareEmail(value: string): string {
	let current = value.trim();
	for (let i = 0; i < 5; i++) {
		const angled = current.match(/<([^<>]+@[^<>]+)>/);
		if (angled?.[1]) {
			current = angled[1].trim();
			continue;
		}
		break;
	}
	const match = current.match(
		/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
	);
	return (match?.[0] ?? current).trim();
}

/** Display name without angle-bracket address parts. */
export function extractDisplayName(value: string): string {
	const bare = extractBareEmail(value);
	let name = value;
	// Strip nested <...> from the inside out so leftovers like ">" don't stick.
	while (/<[^<>]*>/.test(name)) {
		name = name.replace(/<[^<>]*>/g, " ");
	}
	name = name
		.replace(/[<>"']/g, "")
		.replace(/\s+/g, " ")
		.trim();
	if (!name || name.includes("@") || name.toLowerCase() === bare.toLowerCase()) {
		return "";
	}
	return name;
}

/** Canonical "Name <email>" or bare email — never double-wraps. */
export function formatRecipient(
	name: string | undefined | null,
	emailOrCombined: string,
): string {
	const email = extractBareEmail(emailOrCombined);
	if (!email) return "";

	let display = (name ?? "").trim();
	if (display.includes("<") || display.includes("@")) {
		display = extractDisplayName(display);
	}
	if (!display) {
		display = extractDisplayName(emailOrCombined);
	}
	if (display && display.toLowerCase() !== email.toLowerCase()) {
		return `${display} <${email}>`;
	}
	return email;
}

export function parseEmail(input: string) {
	return {
		name: extractDisplayName(input),
		email: extractBareEmail(input),
	};
}

export function validateEmail(emailStr: string) {
	const { email } = parseEmail(emailStr);
	return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}
