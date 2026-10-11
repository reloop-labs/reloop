/**
 * New-device security alert for a fintech app. IBM Plex Sans and Mono, a
 * deep navy header band with an amber status pill, a device details sheet,
 * and a primary / secondary button pair.
 */
export function securityAlertHtml(_origin: string): string {
	const font = "'IBM Plex Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
	const mono = "'IBM Plex Mono',SFMono-Regular,Menlo,Consolas,monospace";
	const canvas = "#e9eef4";
	const navy = "#0b1a33";
	const amber = "#fbbf24";
	const ink = "#0f172a";
	const muted = "#5b6676";
	const line = "#e2e8f0";

	const row = (label: string, value: string, last = false) => `
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"${last ? "" : ` style="border-bottom:1px solid ${line}"`}>
<tbody>
<tr>
<td style="padding:14px 20px">
<p style="margin:0;font-size:13px;line-height:20px;color:${muted};font-family:${font}">${label}</p>
</td>
<td style="padding:14px 20px;text-align:right">
<p style="margin:0;font-size:13px;line-height:20px;font-weight:500;color:${ink};text-align:right;font-family:${mono}">${value}</p>
</td>
</tr>
</tbody>
</table>`;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New sign-in to your Vault account</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:${canvas};margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">We noticed a sign-in from a new device in Toronto. Was this you?</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;background-color:${canvas}">
<tbody>
<tr style="width:100%">
<td style="padding:40px 24px 48px 24px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:20px;box-shadow:0 1px 3px rgba(15,23,42,0.08),0 24px 48px -24px rgba(15,23,42,0.3)">
<tbody>
<tr>
<td style="padding:0">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${navy};background-image:linear-gradient(160deg,#16305c 0%,#0b1a33 70%);border-radius:20px 20px 0 0">
<tbody>
<tr>
<td style="padding:28px 40px 0 40px">
<p style="margin:0;font-size:17px;line-height:22px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;font-family:${font}">◆ Vault</p>
</td>
</tr>
<tr>
<td style="padding:40px 40px 40px 40px">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 18px 0;background-color:rgba(251,191,36,0.14);border:1px solid rgba(251,191,36,0.45);border-radius:999px">
<tbody>
<tr>
<td style="padding:6px 14px">
<p style="margin:0;font-size:12px;line-height:16px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${amber};font-family:${mono}">▲ New device sign-in</p>
</td>
</tr>
</tbody>
</table>
<h1 style="margin:0 0 12px 0;font-size:32px;line-height:40px;font-weight:600;letter-spacing:-0.02em;color:#ffffff;font-family:${font}">Was this you, <span data-variable="first_name">{{{first_name}}}</span>?</h1>
<p style="margin:0;font-size:16px;line-height:26px;color:#b8c4d8;font-family:${font}">Your Vault account was just accessed from a device we haven't seen before. If it was you, there's nothing to do.</p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:32px 40px 0 40px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8fafc;border:1px solid ${line};border-radius:14px">
<tbody>
<tr>
<td>${row("Device", "iPhone 16 · Safari")}${row("Location", "Toronto, ON, Canada")}${row("IP address", "142.198.24.7")}${row("Time", "Oct 11, 2026 · 08:14 EDT", true)}
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:32px 40px 0 40px">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0">
<tbody>
<tr>
<td style="padding:0 12px 0 0">
<a href="{{{secure_account_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${amber};color:${navy};font-size:15px;font-weight:600;font-family:${font};border-radius:10px;padding:15px 24px;box-shadow:0 8px 20px -8px rgba(217,119,6,0.7)">Secure my account</a>
</td>
<td style="padding:0">
<a href="#" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:#ffffff;color:${ink};font-size:15px;font-weight:600;font-family:${font};border:1px solid #cbd5e1;border-radius:10px;padding:14px 22px">Yes, it was me</a>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:32px 40px 40px 40px">
<hr style="width:100%;border:none;border-top:1px solid ${line};margin:0 0 20px 0" />
<p style="margin:0 0 8px 0;font-size:14px;line-height:22px;font-weight:600;color:${ink};font-family:${font}">Didn't sign in?</p>
<p style="margin:0;font-size:14px;line-height:22px;color:${muted};font-family:${font}">Secure your account right away. We'll sign out every device, freeze outgoing transfers for 24 hours, and walk you through resetting your password and passkeys.</p>
</td>
</tr>
</tbody>
</table>
<p style="margin:32px 0 6px 0;font-size:12px;line-height:18px;color:#7b8798;text-align:center;font-family:${font}">Vault will never ask for your password, PIN, or one-time codes by email or phone.</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#7b8798;text-align:center;font-family:${mono}">Vault Financial Ltd · 100 King St W · Toronto, ON M5X 1A9</p>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
