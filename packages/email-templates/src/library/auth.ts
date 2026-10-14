import {
	acmeEmail,
	button,
	details,
	fallback,
	footer,
	heading,
	lead,
	link,
	logo,
	text,
} from "../acme/theme";
import type { EmailTemplateExample } from "../index";

function v(name: string): string {
	return `<span data-variable="${name}">{{{${name}}}}</span>`;
}

function accountLockedHtml(origin: string): string {
	return acmeEmail({
		title: "Your Acme account is temporarily locked",
		preview: "We locked sign-in after several failed password attempts.",
		body: `${logo(origin)}
${heading("Your account is temporarily locked")}
${lead(`Hi ${v("first_name")}, we noticed 5 failed sign-in attempts on your Acme account, so we've paused sign-in for 30 minutes to keep it safe.`)}
${details([
	{ label: "Last attempt", value: v("attempt_time") },
	{ label: "Location", value: v("attempt_location") },
	{ label: "Unlocks automatically", value: v("unlock_time"), strong: true },
])}
${button("{{{unlock_url}}}", "Reset password and unlock")}
${text(`If this was you, you can wait or reset your password now to unlock right away. If it wasn't, reset your password and ${link("{{{security_url}}}", "review your security settings")}.`, { marginBottom: 24 })}
${fallback("{{{unlock_url}}}")}
${footer()}`,
	});
}

function passkeyAddedHtml(origin: string): string {
	return acmeEmail({
		title: "A passkey was added to your Acme account",
		preview: "You can now sign in with a passkey on this device.",
		body: `${logo(origin)}
${heading("A passkey was added")}
${lead(`Hi ${v("first_name")}, a new passkey was added to your Acme account. You can now sign in with your fingerprint, face, or device PIN instead of a password.`)}
${details([
	{ label: "Passkey", value: v("passkey_name") },
	{ label: "Added", value: v("added_at") },
	{ label: "Device", value: v("device") },
])}
${button("{{{security_url}}}", "Manage passkeys")}
${text("If you didn't add this passkey, remove it from your security settings right away and change your password.", { marginBottom: 24 })}
${fallback("{{{security_url}}}")}
${footer()}`,
	});
}

export const authTemplates: EmailTemplateExample[] = [
	{
		id: "acme-account-locked",
		name: "Account locked",
		slug: "acme-account-locked",
		category: "auth",
		description:
			"Acme notice that sign-in was paused after repeated failed password attempts.",
		html: accountLockedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{
				name: "attempt_time",
				type: "string",
				defaultValue: "Oct 14, 2026, 9:42 AM UTC",
			},
			{
				name: "attempt_location",
				type: "string",
				defaultValue: "Lisbon, Portugal",
			},
			{
				name: "unlock_time",
				type: "string",
				defaultValue: "Oct 14, 2026, 10:12 AM UTC",
			},
			{ name: "unlock_url", type: "string", defaultValue: null },
			{ name: "security_url", type: "string", defaultValue: null },
		],
	},
	{
		id: "acme-passkey-added",
		name: "Passkey added",
		slug: "acme-passkey-added",
		category: "auth",
		description:
			"Acme confirmation that a new passkey was registered on the account.",
		html: passkeyAddedHtml,
		variables: [
			{ name: "first_name", type: "string", defaultValue: "there" },
			{ name: "passkey_name", type: "string", defaultValue: "MacBook Pro" },
			{
				name: "added_at",
				type: "string",
				defaultValue: "Oct 14, 2026, 2:18 PM UTC",
			},
			{ name: "device", type: "string", defaultValue: "Chrome on macOS" },
			{ name: "security_url", type: "string", defaultValue: null },
		],
	},
];
