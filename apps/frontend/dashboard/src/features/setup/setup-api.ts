export type SetupStatus = {
	required: boolean;
	reason: string;
};

export type CompleteSetupInput = {
	adminKey: string;
	name: string;
	email: string;
	password: string;
	disableSignup: boolean;
	organizationName?: string;
	appName?: string;
};

const NOT_REQUIRED: SetupStatus = { required: false, reason: "not_required" };

export class SetupRequestError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "SetupRequestError";
		this.status = status;
	}
}

function setupEndpoint(path: string): string {
	const configured = (process.env.NEXT_PUBLIC_URL || "")
		.trim()
		.replace(/\/$/, "");
	const origin =
		configured || (typeof window !== "undefined" ? window.location.origin : "");
	return `${origin}/api/auth/v1/setup${path}`;
}

async function readMessage(response: Response): Promise<string | null> {
	try {
		const body = (await response.json()) as { message?: unknown } | null;
		return typeof body?.message === "string" ? body.message : null;
	} catch {
		return null;
	}
}

export async function fetchSetupStatus(
	signal?: AbortSignal,
): Promise<SetupStatus> {
	const response = await fetch(setupEndpoint("/status"), {
		credentials: "include",
		headers: { accept: "application/json" },
		signal,
	});

	if (!response.ok) return NOT_REQUIRED;

	try {
		const body = (await response.json()) as SetupStatus | null;
		return body?.required === true
			? { required: true, reason: body.reason ?? "ready" }
			: NOT_REQUIRED;
	} catch {
		return NOT_REQUIRED;
	}
}

export async function completeSetup(input: CompleteSetupInput): Promise<void> {
	const organizationName = input.organizationName?.trim();
	const appName = input.appName?.trim();

	const response = await fetch(setupEndpoint("/complete"), {
		method: "POST",
		credentials: "include",
		headers: { "content-type": "application/json", accept: "application/json" },
		body: JSON.stringify({
			adminKey: input.adminKey.trim(),
			name: input.name.trim(),
			email: input.email.trim(),
			password: input.password,
			disableSignup: input.disableSignup,
			...(organizationName ? { organizationName } : {}),
			...(appName ? { appName } : {}),
		}),
	});

	if (response.ok) return;

	const message = await readMessage(response);
	if (response.status === 403) {
		throw new SetupRequestError(403, message ?? "Invalid setup key");
	}
	if (response.status === 404) {
		throw new SetupRequestError(
			404,
			"This instance is already set up. Sign in instead.",
		);
	}
	throw new SetupRequestError(
		response.status,
		message ?? "Setup could not be completed. Check the server logs.",
	);
}
