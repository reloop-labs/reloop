/**
 * Campaign-only variable helpers.
 *
 * Campaign variables are read-only references to contact properties.
 * They intentionally do NOT share the template variable engine
 * (`#/features/templates/lib/template-variables`). Templates keep their
 * own editable variable engine with defaults; campaigns only resolve
 * `contact.*` properties at send time (see backend `campaignMergeVars`).
 */

/** Strip `{{name}}` / `{{{name}}}` to a bare name. */
export function normalizeCampaignVariableName(raw: string): string {
	const trimmed = raw.trim();

	const triple = trimmed.match(/^\{\{\{\s*([^{}]+?)\s*\}\}\}$/);
	const tripleName = triple?.[1];
	if (tripleName) return tripleName.trim();

	const double = trimmed.match(/^\{\{\s*([^{}]+?)\s*\}\}$/);
	const doubleName = double?.[1];
	if (doubleName) return doubleName.trim();

	if (/[{}]/.test(trimmed)) {
		return trimmed.replace(/[{}]/g, "").trim();
	}

	return trimmed;
}

export function formatCampaignVariable(name: string): string {
	const key = normalizeCampaignVariableName(name);
	return `{{{${key}}}}`;
}

/** Remove a leading `contact.` prefix (case-insensitive on the prefix only). */
export function stripContactPrefix(name: string): string {
	const normalized = normalizeCampaignVariableName(name);
	if (/^contact\./i.test(normalized)) {
		return normalized.slice("contact.".length);
	}
	return normalized;
}

/** Ensure a `contact.` prefix so every campaign variable resolves via contacts. */
export function toContactVariableName(raw: string): string {
	const bare = stripContactPrefix(raw);
	return bare ? `contact.${bare}` : "contact.";
}

export type CampaignContactProperty = {
	id?: string;
	propertyName: string;
	propertyType?: string;
	defaultValue?: string | null;
};

/**
 * Map raw contact properties to the read-only variable names shown in the
 * campaign editor. Always returns `contact.*` names.
 */
export function mapContactPropertiesToVariables(
	properties: CampaignContactProperty[] | null | undefined,
): string[] {
	if (!properties || properties.length === 0) return [];
	const seen = new Set<string>();
	const result: string[] = [];
	for (const p of properties) {
		if (!p?.propertyName) continue;
		const name = toContactVariableName(p.propertyName);
		const key = normalizeCampaignVariableName(name).toLowerCase();
		if (!key || key === "contact." || seen.has(key)) continue;
		seen.add(key);
		result.push(name);
	}
	return result;
}

/** Find the contact property backing a campaign variable name. */
export function findContactPropertyForVariable(
	properties: CampaignContactProperty[] | null | undefined,
	variableName: string,
): CampaignContactProperty | undefined {
	const target = stripContactPrefix(variableName).toLowerCase();
	return (properties ?? []).find(
		(p) => stripContactPrefix(p.propertyName).toLowerCase() === target,
	);
}
