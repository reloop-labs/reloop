import { Webhook } from "standardwebhooks";

type Configuration = {
	apiKey: string;
	from: string;
	hookSecret: string;
	supabaseUrl: string;
	apiUrl?: string;
};

type Payload = {
	user: { email?: string; new_email?: string };
	email_data: {
		email_action_type: string;
		token?: string;
		token_hash?: string;
		token_new?: string;
		token_hash_new?: string;
		redirect_to?: string;
	};
};

type Message = { to: string; subject: string; text: string };

const subjects: Record<string, string> = {
	signup: "Confirm your email address",
	invite: "Accept your invitation",
	magiclink: "Your sign-in link",
	recovery: "Reset your password",
	email_change: "Confirm your email change",
	reauthentication: "Your verification code",
};

function httpsUrl(value: string): URL {
	const url = new URL(value);
	if (url.protocol !== "https:" || url.username || url.password) {
		throw new Error("An HTTPS URL without credentials is required");
	}
	return url;
}

function buildMessages(payload: unknown, supabaseUrl: URL): Message[] {
	const { user, email_data: data } = payload as Payload;
	if (!user || !data || !Object.hasOwn(subjects, data.email_action_type)) {
		throw new Error("Unsupported email action");
	}
	const action = data.email_action_type;
	const subject = subjects[action];
	const message = (to: unknown, token: unknown, hash?: unknown): Message => {
		if (
			typeof to !== "string" ||
			!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(to) ||
			typeof token !== "string" ||
			!token
		) {
			throw new Error("Missing email address or verification code");
		}
		let text = `${subject}\n\nYour verification code is: ${token}`;
		if (action !== "reauthentication") {
			if (typeof hash !== "string" || !hash) {
				throw new Error("Missing token hash");
			}
			const link = new URL("/auth/v1/verify", supabaseUrl);
			link.searchParams.set("token", hash);
			link.searchParams.set("type", action);
			if (data.redirect_to) {
				link.searchParams.set("redirect_to", data.redirect_to);
			}
			text += `\n\nOr open this link:\n${link.href}`;
		}
		return { to, subject, text };
	};

	if (action === "email_change") {
		if (data.token_hash_new) {
			return [
				message(user.email, data.token, data.token_hash_new),
				message(user.new_email, data.token_new, data.token_hash),
			];
		}
		return [
			message(user.new_email, data.token_new || data.token, data.token_hash),
		];
	}
	return [message(user.email, data.token, data.token_hash)];
}

function failure(status: number, message: string): Response {
	return Response.json({ error: { http_code: status, message } }, { status });
}

export function createHandler(
	configuration: Configuration,
	send: typeof fetch = fetch,
): (request: Request) => Promise<Response> {
	const { apiKey, from, hookSecret } = configuration;
	if (!apiKey || !from || !hookSecret) {
		throw new Error(
			"RELOOP_API_KEY, RELOOP_FROM and SEND_EMAIL_HOOK_SECRET are required",
		);
	}
	const webhook = new Webhook(hookSecret.replace(/^v1,whsec_/, ""));
	const supabaseUrl = httpsUrl(configuration.supabaseUrl);
	const apiUrl = httpsUrl(
		configuration.apiUrl ?? "https://reloop.sh/api/mail/v1/send",
	);

	return async (request) => {
		if (request.method !== "POST") {
			return new Response(null, { status: 405, headers: { Allow: "POST" } });
		}
		let payload: unknown;
		try {
			payload = webhook.verify(
				await request.text(),
				Object.fromEntries(request.headers),
			);
		} catch {
			return failure(401, "Invalid hook signature");
		}
		let messages: Message[];
		try {
			messages = buildMessages(payload, supabaseUrl);
		} catch {
			return failure(400, "Invalid or unsupported email payload");
		}
		const hookId = request.headers.get("webhook-id");
		const signal = AbortSignal.timeout(4000);
		try {
			const results = await Promise.all(
				messages.map(async (message, index) => {
					const response = await send(apiUrl, {
						method: "POST",
						redirect: "error",
						signal,
						headers: {
							Authorization: `Bearer ${apiKey}`,
							"Content-Type": "application/json",
							"Idempotency-Key": `supabase:${hookId}:${index}`,
						},
						body: JSON.stringify({ from, ...message }),
					});
					if (!response.ok) {
						await response.body?.cancel();
						return false;
					}
					const result: unknown = await response.json();
					return (
						typeof result === "object" &&
						result !== null &&
						"success" in result &&
						result.success === true &&
						"status" in result &&
						(result.status === "sent" || result.status === "delivered")
					);
				}),
			);
			if (results.some((success) => !success)) {
				return failure(502, "Reloop could not accept the email");
			}
		} catch {
			return failure(502, "Reloop could not accept the email");
		}
		return Response.json({});
	};
}
