/**
 * Pure helpers to shape contact audit rows for the contact detail timeline.
 * Mirrors write-side field change vocabulary from the contacts service.
 */

export type ContactHistoryChange = {
	field: string;
	from: string | number | null;
	to: string | number | null;
	label?: string;
};

const CORE_FIELDS = ["email", "firstName", "lastName", "status"] as const;

const ACTION_TITLES: Record<string, string> = {
	created: "Contact created",
	updated: "Contact updated",
	deleted: "Contact deleted",
	added_to_group: "Added to group",
	removed_from_group: "Removed from group",
	added_to_channel: "Added to channel",
	updated_channel: "Channel subscription updated",
};

function fieldLabel(field: string): string {
	switch (field) {
		case "email":
			return "Email";
		case "firstName":
			return "First name";
		case "lastName":
			return "Last name";
		case "status":
			return "Status";
		case "group":
			return "Group";
		case "channel":
			return "Channel";
		case "channel_subscription":
			return "Subscription";
		default:
			if (field.startsWith("properties.")) {
				return field.slice("properties.".length);
			}
			return field;
	}
}

export function titleForContactAction(action: string): string {
	return ACTION_TITLES[action] ?? `Contact ${action.replaceAll("_", " ")}`;
}

export function summaryFromChanges(
	changes: ContactHistoryChange[] | null,
): string | null {
	if (!changes || changes.length === 0) return null;
	return changes.map((c) => c.label ?? c.field).join(", ");
}

function asRecord(value: unknown): Record<string, unknown> | null {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return value as Record<string, unknown>;
	}
	return null;
}

function normalizeChangeValue(
	value: unknown,
): string | number | null {
	if (value === undefined || value === null || value === "") return null;
	if (typeof value === "string" || typeof value === "number") return value;
	return String(value);
}

function parseStoredChanges(
	metadata: Record<string, unknown> | null,
): ContactHistoryChange[] | null {
	const raw = metadata?.changes;
	if (!Array.isArray(raw) || raw.length === 0) return null;

	const changes: ContactHistoryChange[] = [];
	for (const item of raw) {
		const row = asRecord(item);
		if (!row || typeof row.field !== "string") continue;
		changes.push({
			field: row.field,
			from: normalizeChangeValue(row.from),
			to: normalizeChangeValue(row.to),
			label:
				typeof row.label === "string" ? row.label : fieldLabel(row.field),
		});
	}
	return changes.length > 0 ? changes : null;
}

function deriveFromRequestBody(
	requestBody: Record<string, unknown> | null,
	action: string,
	metadata: Record<string, unknown> | null,
): ContactHistoryChange[] | null {
	if (action === "updated" || action === "created") {
		if (!requestBody) return null;
		const changes: ContactHistoryChange[] = [];
		for (const field of CORE_FIELDS) {
			if (!(field in requestBody)) continue;
			changes.push({
				field,
				from: null,
				to: normalizeChangeValue(requestBody[field]),
				label: fieldLabel(field),
			});
		}
		const props = asRecord(requestBody.properties);
		if (props) {
			for (const [name, value] of Object.entries(props)) {
				changes.push({
					field: `properties.${name}`,
					from: null,
					to: normalizeChangeValue(value),
					label: name,
				});
			}
		}
		return changes.length > 0 ? changes : null;
	}

	if (action === "added_to_group" || action === "removed_from_group") {
		const groupName =
			(typeof metadata?.groupName === "string" && metadata.groupName) ||
			(typeof metadata?.name === "string" && metadata.name) ||
			(typeof requestBody?.groupName === "string" && requestBody.groupName) ||
			null;
		const groupId =
			(typeof metadata?.groupId === "string" && metadata.groupId) ||
			(typeof requestBody?.group_id === "string" && requestBody.group_id) ||
			null;
		const label = groupName || groupId;
		if (!label) return null;
		return [
			{
				field: "group",
				from: action === "removed_from_group" ? label : null,
				to: action === "added_to_group" ? label : null,
				label: "Group",
			},
		];
	}

	if (action === "added_to_channel" || action === "updated_channel") {
		const channelName =
			(typeof metadata?.channelName === "string" && metadata.channelName) ||
			(typeof metadata?.name === "string" && metadata.name) ||
			null;
		const channelId =
			(typeof metadata?.channelId === "string" && metadata.channelId) ||
			(typeof requestBody?.channel_id === "string" && requestBody.channel_id) ||
			null;
		const subscription =
			(typeof metadata?.subscription === "string" && metadata.subscription) ||
			(typeof metadata?.status === "string" && metadata.status) ||
			(typeof requestBody?.subscription === "string" &&
				requestBody.subscription) ||
			null;
		const label = channelName || channelId;
		const changes: ContactHistoryChange[] = [];
		if (label) {
			changes.push({
				field: "channel",
				from: null,
				to: label,
				label: "Channel",
			});
		}
		if (subscription) {
			changes.push({
				field: "channel_subscription",
				from: null,
				to: subscription,
				label: "Subscription",
			});
		}
		return changes.length > 0 ? changes : null;
	}

	return null;
}

export function resolveContactHistoryChanges(
	action: string,
	metadata: unknown,
	requestBody: unknown,
	requestDetails: unknown,
): ContactHistoryChange[] | null {
	const meta = asRecord(metadata);
	const stored = parseStoredChanges(meta);
	if (stored) return stored;

	const body =
		asRecord(requestBody) ??
		asRecord(asRecord(requestDetails)?.requestBody) ??
		null;

	return deriveFromRequestBody(body, action, meta);
}
