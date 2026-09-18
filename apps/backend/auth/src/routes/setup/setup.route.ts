import { ORGANIZATION_NAME_MAX_LENGTH } from "@reloop/auth/organization-limits";
import type { CompleteSetupInput } from "@reloop/auth/setup/complete-setup";
import {
	APP_NAME_MAX_LENGTH,
	isSafeEnvText,
} from "@reloop/auth/setup/setup-limits";
import { APIError } from "better-auth/api";
import { Elysia } from "elysia";
import {
	completeSetupController,
	setupStatusController,
} from "./setup.controllers";

type ParsedBody =
	| { ok: true; value: CompleteSetupInput }
	| { ok: false; message: string };

const notFound = () =>
	new Response(null, { status: 404, statusText: "Not Found" });

const isSetupNotAvailable = (error: unknown): boolean =>
	error instanceof Error && error.name === "SetupNotAvailable";

const isInvalidAdminSetupKey = (error: unknown): boolean =>
	error instanceof Error && error.name === "InvalidAdminSetupKey";

const isAdminPromotionFailed = (error: unknown): boolean =>
	error instanceof Error && error.name === "AdminPromotionFailed";

function requiredText(value: unknown): string | null {
	return typeof value === "string" && value.trim() ? value.trim() : null;
}

type OptionalText = { ok: true; value: string | undefined } | { ok: false };

function boundedOptionalText(value: unknown, maxLength: number): OptionalText {
	if (value === undefined || value === null)
		return { ok: true, value: undefined };
	if (typeof value !== "string") return { ok: false };

	const trimmed = value.trim();
	if (!trimmed) return { ok: true, value: undefined };
	if (trimmed.length > maxLength || !isSafeEnvText(trimmed)) {
		return { ok: false };
	}

	return { ok: true, value: trimmed };
}

async function readJsonBody(request: Request): Promise<unknown> {
	const text = await request.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return null;
	}
}

function parseCompleteSetupBody(raw: unknown): ParsedBody {
	if (typeof raw !== "object" || raw === null) {
		return { ok: false, message: "Expected a JSON object body" };
	}

	const body = raw as Record<string, unknown>;
	const adminKey = requiredText(body.adminKey);
	const name = requiredText(body.name);
	const email = requiredText(body.email);
	const password = typeof body.password === "string" ? body.password : null;
	const organizationName = boundedOptionalText(
		body.organizationName,
		ORGANIZATION_NAME_MAX_LENGTH,
	);
	const appName = boundedOptionalText(body.appName, APP_NAME_MAX_LENGTH);

	const invalid: string[] = [];
	if (!adminKey) invalid.push("adminKey");
	if (!name) invalid.push("name");
	if (!email) invalid.push("email");
	if (!password) invalid.push("password");
	if (typeof body.disableSignup !== "boolean") invalid.push("disableSignup");
	if (!organizationName.ok) invalid.push("organizationName");
	if (!appName.ok) invalid.push("appName");

	if (
		invalid.length > 0 ||
		adminKey === null ||
		name === null ||
		email === null ||
		password === null ||
		typeof body.disableSignup !== "boolean" ||
		!organizationName.ok ||
		!appName.ok
	) {
		return {
			ok: false,
			message: `Invalid or missing fields: ${invalid.join(", ")}`,
		};
	}

	return {
		ok: true,
		value: {
			adminKey,
			name,
			email,
			password,
			disableSignup: body.disableSignup,
			organizationName: organizationName.value,
			appName: appName.value,
		},
	};
}

export const setupRoutes = new Elysia({ name: "selfhost-setup" })
	.get(
		"/v1/setup/status",
		async () => {
			const setup = await setupStatusController();
			if (!setup.required) return notFound();
			return { required: setup.required, reason: setup.reason };
		},
		{
			detail: {
				tags: ["Setup"],
				summary: "Report whether this instance still needs first-run setup",
			},
		},
	)
	.post(
		"/v1/setup/complete",
		async ({ request, status, set }) => {
			const setup = await setupStatusController();
			if (!setup.required) return notFound();

			const parsed = parseCompleteSetupBody(await readJsonBody(request));
			if (!parsed.ok) return status(400, { message: parsed.message });

			try {
				const result = await completeSetupController(parsed.value);
				set.headers["set-cookie"] = result.setCookies;
				return { user: result.user, organizationId: result.organizationId };
			} catch (error) {
				if (isSetupNotAvailable(error)) return notFound();
				if (isInvalidAdminSetupKey(error)) {
					return status(403, { message: "Invalid setup key" });
				}
				if (isAdminPromotionFailed(error)) {
					return status(500, { message: (error as Error).message });
				}
				if (error instanceof APIError) {
					const message = error.body?.message ?? "Setup could not be completed";
					return status(error.statusCode < 500 ? 400 : 500, { message });
				}
				throw error;
			}
		},
		{
			parse: "none",
			detail: {
				tags: ["Setup"],
				summary: "Create the first super-admin and sign them in",
			},
		},
	);
