/**
 * Replace `{{key}}` / `{{{key}}}` placeholders. Supports a simple
 * `{{key | default: "fallback"}}` filter used by the campaign editor.
 */
export function interpolate(
	template: string,
	vars: Record<string, string | null | undefined>,
): string {
	return template.replace(
		/\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([\w.]+)(?:\s*\|\s*default:\s*["']([^"']*)["'])?\s*\}\}/g,
		(_match, tripleKey?: string, doubleKey?: string, fallback?: string) => {
			const key = tripleKey || doubleKey || "";
			const value = vars[key];
			if (value != null && value !== "") return String(value);
			return fallback ?? "";
		},
	);
}

export function campaignMergeVars(contact: {
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	properties?: Record<string, any> | null;
}): Record<string, string> {
	const vars: Record<string, string> = {
		email: contact.email,
		firstName: contact.firstName ?? "",
		lastName: contact.lastName ?? "",
		"contact.email": contact.email,
		"contact.firstName": contact.firstName ?? "",
		"contact.lastName": contact.lastName ?? "",
		EMAIL: contact.email,
		FIRST_NAME: contact.firstName ?? "",
		LAST_NAME: contact.lastName ?? "",
	};

	if (contact.properties && typeof contact.properties === "object") {
		for (const [key, value] of Object.entries(contact.properties)) {
			const strVal = value != null ? String(value) : "";
			vars[key] = strVal;
			vars[`contact.${key}`] = strVal;
		}
	}

	return vars;
}
