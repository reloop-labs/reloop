/**
 * Field-level change tracking for contact audit history.
 * Controllers attach changes to the response object; auditLogHook reads them.
 */

export type ContactFieldChange = {
	field: string;
	from: string | number | null;
	to: string | number | null;
	label?: string;
};

const changesByResponse = new WeakMap<object, ContactFieldChange[]>();

export function attachAuditChanges(
	response: object,
	changes: ContactFieldChange[],
): void {
	if (changes.length > 0) {
		changesByResponse.set(response, changes);
	}
}

export function getAuditChanges(
	response: unknown,
): ContactFieldChange[] | null {
	if (response && typeof response === "object") {
		return changesByResponse.get(response) ?? null;
	}
	return null;
}

const CORE_FIELDS = ["email", "firstName", "lastName", "status"] as const;

type CoreField = (typeof CORE_FIELDS)[number];

type ContactSnapshot = {
	email?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	status?: string | null;
	properties?: Record<string, string | number> | null;
};

type ContactPatch = {
	email?: string;
	firstName?: string | null;
	lastName?: string | null;
	status?: string;
	properties?: Record<string, string | number>;
};

function normalizeComparable(
	value: string | number | null | undefined,
): string | number | null {
	if (value === undefined || value === null || value === "") return null;
	return value;
}

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
		default:
			if (field.startsWith("properties.")) {
				return field.slice("properties.".length);
			}
			return field;
	}
}

/**
 * Compute field-level diffs between pre-update snapshot and the applied patch.
 * Only fields present in the patch are considered.
 */
export function computeContactFieldChanges(
	before: ContactSnapshot,
	patch: ContactPatch,
): ContactFieldChange[] {
	const changes: ContactFieldChange[] = [];

	for (const field of CORE_FIELDS) {
		if (patch[field] === undefined) continue;
		const from = normalizeComparable(before[field as CoreField]);
		const to = normalizeComparable(patch[field as CoreField]);
		if (from === to) continue;
		changes.push({
			field,
			from,
			to,
			label: fieldLabel(field),
		});
	}

	if (patch.properties) {
		const beforeProps = before.properties ?? {};
		for (const [name, value] of Object.entries(patch.properties)) {
			const from = normalizeComparable(beforeProps[name]);
			const to = normalizeComparable(value);
			if (from === to) continue;
			changes.push({
				field: `properties.${name}`,
				from,
				to,
				label: name,
			});
		}
	}

	return changes;
}

/**
 * Best-effort changes from stored request body when metadata.changes is absent
 * (historical audit rows written before field-level tracking).
 */
export function deriveChangesFromRequestBody(
	requestBody: Record<string, unknown> | null | undefined,
	action: string,
	metadata?: Record<string, unknown> | null,
): ContactFieldChange[] | null {
	if (!requestBody || typeof requestBody !== "object") {
		// Group/channel actions may only have metadata
		if (
			action === "added_to_group" ||
			action === "removed_from_group" ||
			action === "added_to_channel" ||
			action === "updated_channel"
		) {
			return deriveMembershipChanges(action, requestBody, metadata);
		}
		return null;
	}

	if (action === "updated" || action === "created") {
		const changes: ContactFieldChange[] = [];
		for (const field of CORE_FIELDS) {
			if (!(field in requestBody)) continue;
			const raw = requestBody[field];
			if (raw === undefined) continue;
			const to =
				raw === null || raw === ""
					? null
					: typeof raw === "string" || typeof raw === "number"
						? raw
						: String(raw);
			changes.push({
				field,
				from: null,
				to,
				label: fieldLabel(field),
			});
		}
		const props = requestBody.properties;
		if (props && typeof props === "object" && !Array.isArray(props)) {
			for (const [name, value] of Object.entries(
				props as Record<string, unknown>,
			)) {
				const to =
					value === null || value === undefined || value === ""
						? null
						: typeof value === "string" || typeof value === "number"
							? value
							: String(value);
				changes.push({
					field: `properties.${name}`,
					from: null,
					to,
					label: name,
				});
			}
		}
		return changes.length > 0 ? changes : null;
	}

	return deriveMembershipChanges(action, requestBody, metadata);
}

function deriveMembershipChanges(
	action: string,
	requestBody: Record<string, unknown> | null | undefined,
	metadata?: Record<string, unknown> | null,
): ContactFieldChange[] | null {
	const body = requestBody ?? {};
	const meta = metadata ?? {};

	if (action === "added_to_group" || action === "removed_from_group") {
		const groupName =
			(typeof meta.name === "string" && meta.name) ||
			(typeof meta.groupName === "string" && meta.groupName) ||
			(typeof body.groupName === "string" && body.groupName) ||
			null;
		const groupId =
			(typeof meta.groupId === "string" && meta.groupId) ||
			(typeof body.group_id === "string" && body.group_id) ||
			(typeof body.groupId === "string" && body.groupId) ||
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
			(typeof meta.name === "string" && meta.name) ||
			(typeof meta.channelName === "string" && meta.channelName) ||
			null;
		const channelId =
			(typeof meta.channelId === "string" && meta.channelId) ||
			(typeof body.channel_id === "string" && body.channel_id) ||
			(typeof body.channelId === "string" && body.channelId) ||
			null;
		const subscription =
			(typeof meta.subscription === "string" && meta.subscription) ||
			(typeof body.subscription === "string" && body.subscription) ||
			null;
		const label = channelName || channelId;
		if (!label && !subscription) return null;
		const changes: ContactFieldChange[] = [];
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

const ACTION_TITLES: Record<string, string> = {
	created: "Contact created",
	updated: "Contact updated",
	deleted: "Contact deleted",
	added_to_group: "Added to group",
	removed_from_group: "Removed from group",
	added_to_channel: "Added to channel",
	updated_channel: "Channel subscription updated",
};

export function titleForContactAction(action: string): string {
	return ACTION_TITLES[action] ?? `Contact ${action.replaceAll("_", " ")}`;
}

export function summaryFromChanges(
	changes: ContactFieldChange[] | null,
): string | null {
	if (!changes || changes.length === 0) return null;
	return changes.map((c) => c.label ?? c.field).join(", ");
}
