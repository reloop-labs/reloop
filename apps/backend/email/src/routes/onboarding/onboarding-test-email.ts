import { appName } from "@reloop/brand";
import { ONBOARDING_TEST_SUBJECT } from "@reloop/email/routes/onboarding/onboarding.constants";

export type OnboardingTestEmail = {
	subject: string;
	text: string;
	html: string;
};

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

/**
 * Onboarding test email for one user. Every new account sends this to
 * itself from the shared onboarding domain, so the body names the recipient
 * and send time rather than repeating one identical line for everyone.
 */
export function buildOnboardingTestEmail({
	to,
	from,
	name,
	sentAt = new Date(),
}: {
	to: string;
	from: string;
	name?: string | null;
	sentAt?: Date;
}): OnboardingTestEmail {
	const firstName = name?.trim().split(/\s+/)[0];
	const greeting = firstName ? `Hi ${firstName},` : "Hi,";
	const sentAtLabel = `${sentAt.toISOString().slice(0, 16).replace("T", " ")} UTC`;

	const text = [
		greeting,
		"",
		`This email confirms your ${appName} account can send. It went from ${from} to ${to} at ${sentAtLabel}.`,
		"",
		`Next, add and verify your own domain in the ${appName} dashboard so your emails come from your brand.`,
		"",
		`The ${appName} team`,
	].join("\n");

	const html = `<!doctype html>
<html>
<body style="margin:0;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#111111;">
<p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
<p style="margin:0 0 16px;">This email confirms your ${escapeHtml(appName)} account can send. It went from <strong>${escapeHtml(from)}</strong> to <strong>${escapeHtml(to)}</strong> at ${escapeHtml(sentAtLabel)}.</p>
<p style="margin:0 0 16px;">Next, add and verify your own domain in the ${escapeHtml(appName)} dashboard so your emails come from your brand.</p>
<p style="margin:0;">The ${escapeHtml(appName)} team</p>
</body>
</html>`;

	return { subject: ONBOARDING_TEST_SUBJECT, text, html };
}
