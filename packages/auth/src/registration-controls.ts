export const REGISTRATION_DISABLED_MESSAGE =
	"Registration is disabled on this instance. Ask an administrator for an invitation.";

export function isEnvFlagEnabled(value: string | undefined): boolean {
	return value?.trim().toLowerCase() === "true";
}
