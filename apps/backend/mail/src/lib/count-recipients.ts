/** Count billable recipients the same way finalize / credits deduction does. */
export function countEmailRecipients(body: {
	to: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
}): number {
	const to = Array.isArray(body.to) ? body.to : [body.to];
	const cc = body.cc ? (Array.isArray(body.cc) ? body.cc : [body.cc]) : [];
	const bcc = body.bcc
		? Array.isArray(body.bcc)
			? body.bcc
			: [body.bcc]
		: [];
	return to.length + cc.length + bcc.length;
}
