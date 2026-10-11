import {
	assertSecurityAllowed,
	sendSmtpTestEmail,
} from "@reloop/domain/lib/smtp-provider";
import type { SmtpSendTestBody } from "@reloop/domain/model/smtp-provider.model";

/** Try credentials end to end before saving: connect, log in, deliver. */
export async function sendTestEmailController(body: SmtpSendTestBody) {
	const security = body.security ?? "starttls";
	assertSecurityAllowed(security);
	const error = await sendSmtpTestEmail(
		{
			host: body.host.trim().toLowerCase(),
			port: body.port,
			security,
			username: body.username.trim(),
			password: body.password,
		},
		{ from: body.from.trim(), to: body.to.trim() },
	);
	return { ok: error === null, error };
}
