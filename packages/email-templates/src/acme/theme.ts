/**
 * Shared look for the Acme transactional set: warm gray page, flat white
 * card, two-tone logo mark, near-black headings, gray body copy, a pill
 * black pill button, and a "Sent by Acme" footer under a hairline.
 *
 * Every template in the set builds from these pieces so a change here
 * restyles the whole family.
 */
export const acme = {
	font: "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif",
	page: "#f3f3f1",
	ink: "#111111",
	body: "#5d5d5d",
	muted: "#7e7e7e",
	number: "#696969",
	line: "#ebebeb",
	brand: "#111111",
	tint: "#f3f3f1",
	domain: "acme.example",
};

const { font } = acme;

/** Full-width single-cell table, the editor's Layout Table → Table Cell. */
export function block(
	content: string,
	cellStyle = "",
	tableStyle = "",
): string {
	return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"${tableStyle ? ` style="${tableStyle}"` : ""}>
<tbody>
<tr>
<td${cellStyle ? ` style="${cellStyle}"` : ""}>${content}</td>
</tr>
</tbody>
</table>`;
}

export function logo(origin: string): string {
	return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 44px 0">
<tbody>
<tr>
<td style="padding:0 10px 0 0;vertical-align:middle"><img alt="" src="${origin}/tools/email-html-editor/acme-logo.png" width="30" height="26" style="display:block;outline:none;border:none;text-decoration:none" /></td>
<td style="vertical-align:middle"><p style="margin:0;font-size:26px;line-height:30px;font-weight:400;letter-spacing:-0.02em;color:${acme.ink};font-family:${font}">Acme</p></td>
</tr>
</tbody>
</table>`;
}

export function heading(text: string): string {
	return `<h1 style="margin:0 0 16px 0;font-size:26px;line-height:34px;font-weight:500;letter-spacing:-0.015em;color:${acme.ink};font-family:${font}">${text}</h1>`;
}

/** Larger gray lead paragraph under the heading. */
export function lead(html: string, marginBottom = 28): string {
	return `<p style="margin:0 0 ${marginBottom}px 0;font-size:18px;line-height:28px;color:${acme.body};font-family:${font}">${html}</p>`;
}

export function text(
	html: string,
	{ marginBottom = 20, color = acme.body, size = 15 } = {},
): string {
	return `<p style="margin:0 0 ${marginBottom}px 0;font-size:${size}px;line-height:24px;color:${color};font-family:${font}">${html}</p>`;
}

export function link(href: string, label: string): string {
	return `<a href="${href}" target="_blank" style="color:${acme.ink};text-decoration:underline">${label}</a>`;
}

export function button(href: string, label: string): string {
	return block(
		`<a href="${href}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${acme.brand};color:#ffffff;font-size:16px;font-weight:500;font-family:${font};border-radius:999px;padding:14px 24px">${label}</a>`,
		"padding:0 0 32px 0",
	);
}

/** Numbered onboarding step: gray number column, title, and gray detail. */
export function step(n: number, title: string, detail: string): string {
	return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px 0">
<tbody>
<tr>
<td style="width:34px;vertical-align:top;padding:1px 0 0 0"><p style="margin:0;font-size:15px;line-height:24px;color:${acme.number};font-family:${font}">${n}.</p></td>
<td style="vertical-align:top">
<p style="margin:0 0 4px 0;font-size:17px;line-height:26px;font-weight:500;color:${acme.ink};font-family:${font}">${title}</p>
<p style="margin:0;font-size:15px;line-height:24px;color:${acme.body};font-family:${font}">${detail}</p>
</td>
</tr>
</tbody>
</table>`;
}

export interface DetailRow {
	label: string;
	value: string;
	/** Optional gray line under the label (line item detail). */
	note?: string;
	/** Heavier final row, e.g. "Total paid". */
	strong?: boolean;
}

/** Label / value rows between hairlines: totals, sign-in details, tracking. */
export function details(rows: DetailRow[], marginBottom = 28): string {
	const rowHtml = rows
		.map(({ label, value, note, strong }) => {
			const size = strong ? 16 : 15;
			const weight = strong ? 500 : 400;
			return `<tr>
<td style="padding:14px 16px 14px 0;border-bottom:1px solid ${acme.line};vertical-align:top">
<p style="margin:0;font-size:${size}px;line-height:24px;font-weight:${weight};color:${strong || note ? acme.ink : acme.body};font-family:${font}">${label}</p>${note ? `\n<p style="margin:0;font-size:14px;line-height:22px;color:${acme.body};font-family:${font}">${note}</p>` : ""}
</td>
<td style="padding:14px 0;border-bottom:1px solid ${acme.line};text-align:right;vertical-align:top">
<p style="margin:0;font-size:${size}px;line-height:24px;font-weight:${weight};color:${acme.ink};text-align:right;font-family:${font}">${value}</p>
</td>
</tr>`;
		})
		.join("\n");
	return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid ${acme.line};margin:0 0 ${marginBottom}px 0">
<tbody>
${rowHtml}
</tbody>
</table>`;
}

export function fallback(href: string): string {
	return text(`Button not working? ${link(href, "Open Acme")}`, {
		marginBottom: 32,
	});
}

export function footer(): string {
	return `<hr style="width:100%;border:none;border-top:1px solid ${acme.line};margin:0 0 28px 0" />
<p style="margin:0 0 6px 0;font-size:13px;line-height:20px;color:${acme.muted};font-family:${font}">Sent by Acme</p>
<p style="margin:0;font-size:13px;line-height:20px;color:${acme.muted};font-family:${font}">${acme.domain} &nbsp;·&nbsp; <a href="#" target="_blank" style="color:${acme.muted};text-decoration:underline">Privacy policy</a></p>`;
}

/** Page shell: preheader, warm gray page, and the flat white card. */
export function acmeEmail({
	title,
	preview,
	body,
}: {
	title: string;
	preview: string;
	body: string;
}): string {
	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="background-color:${acme.page};margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">${preview}</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;background-color:${acme.page}">
<tbody>
<tr style="width:100%">
<td style="padding:32px 0">
${block(body, "padding:44px 44px 40px 44px", "background-color:#ffffff")}
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
