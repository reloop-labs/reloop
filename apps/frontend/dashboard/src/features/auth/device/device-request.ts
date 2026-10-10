/**
 * RFC 8628 verification helpers for the `/device` page.
 *
 * Flow: the user enters the `user_code` shown on their device, `GET /device`
 * claims the pending code for the calling session and returns what is being
 * authorized, then the user explicitly approves or denies it. The device
 * polls `/oauth2/token` with the device_code grant for an OAuth access token.
 */

export interface DeviceVerification {
	user_code: string;
	status: string;
	client_id?: string;
	scope?: string;
	resource?: string | string[];
}

async function readErrorMessage(
	res: Response,
	fallback: string,
): Promise<string> {
	try {
		const data = (await res.json()) as {
			error_description?: unknown;
			message?: unknown;
		};
		if (typeof data.error_description === "string" && data.error_description)
			return data.error_description;
		if (typeof data.message === "string" && data.message) return data.message;
	} catch {
		// Fall through to the status-based fallback below.
	}
	return `${fallback} (status ${res.status})`;
}

/**
 * Normalize a user-entered code: default server codes are case-insensitive
 * and ignore dashes/whitespace added for readability.
 */
export function normalizeUserCode(input: string): string {
	return input
		.trim()
		.replace(/[^a-z0-9]/gi, "")
		.toUpperCase();
}

export function verificationResources(
	verification: DeviceVerification,
): string[] {
	const resource = verification.resource;
	if (!resource) return [];
	return Array.isArray(resource) ? resource.filter(Boolean) : [resource];
}

export function verificationScopes(verification: DeviceVerification): string[] {
	return (verification.scope ?? "").split(" ").filter(Boolean);
}

export async function verifyDeviceCode(
	userCode: string,
): Promise<DeviceVerification> {
	const res = await fetch(
		`/api/auth/v1/device?user_code=${encodeURIComponent(userCode)}`,
		{ credentials: "include", headers: { accept: "application/json" } },
	);
	if (!res.ok)
		throw new Error(await readErrorMessage(res, "Invalid or expired code"));
	return (await res.json()) as DeviceVerification;
}

export async function approveDeviceCode(userCode: string): Promise<void> {
	const res = await fetch("/api/auth/v1/device/approve", {
		method: "POST",
		credentials: "include",
		headers: {
			"content-type": "application/json",
			accept: "application/json",
		},
		body: JSON.stringify({ userCode }),
	});
	if (!res.ok)
		throw new Error(await readErrorMessage(res, "Could not approve device"));
}

export async function denyDeviceCode(userCode: string): Promise<void> {
	const res = await fetch("/api/auth/v1/device/deny", {
		method: "POST",
		credentials: "include",
		headers: {
			"content-type": "application/json",
			accept: "application/json",
		},
		body: JSON.stringify({ userCode }),
	});
	if (!res.ok)
		throw new Error(await readErrorMessage(res, "Could not deny device"));
}
