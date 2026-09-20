import { isSetupBootstrapBypassed } from "./setup/bootstrap-bypass";
import { getRuntimeDisableSignup } from "./setup/runtime-registration";

export const REGISTRATION_DISABLED_MESSAGE =
	"Registration is disabled on this instance. Ask an administrator for an invitation.";

export function isEnvFlagEnabled(value: string | undefined): boolean {
	return value?.trim().toLowerCase() === "true";
}

export function normalizeInviteEmail(email: string | undefined): string {
	return email?.trim().toLowerCase() ?? "";
}

/**
 * Resolves whether a sign-up may proceed while registration is closed. The
 * invitation lookup is injected so the decision stays testable without the
 * better-auth server graph, and so callers keep ownership of the query.
 */
export async function isRegistrationAllowed(
	email: string | undefined,
	disableSignup: string | undefined,
	hasPendingInvitation: (email: string) => Promise<boolean>,
): Promise<boolean> {
	if (isSetupBootstrapBypassed()) return true;

	const runtime = getRuntimeDisableSignup();
	const closed =
		runtime === true || (runtime !== false && isEnvFlagEnabled(disableSignup));
	if (!closed) return true;

	const normalized = normalizeInviteEmail(email);
	if (!normalized) return false;

	return await hasPendingInvitation(normalized);
}
