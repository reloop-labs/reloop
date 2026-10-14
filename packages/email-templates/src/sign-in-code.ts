/**
 * Dark one-time sign-in code. Space Grotesk headings with a JetBrains Mono
 * code block and an electric lime accent glowing off a midnight card.
 */
export function signInCodeHtml(_origin: string): string {
	const font = "'Space Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif";
	const mono = "'JetBrains Mono',SFMono-Regular,Menlo,Consolas,monospace";
	const page = "#07080c";
	const card = "#10131a";
	const line = "#232836";
	const lime = "#c6f432";
	const text = "#f4f6fb";
	const muted = "#9aa3b2";
	const faint = "#5f6878";

	const meta = (label: string, value: string) => `
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-bottom:1px solid ${line}">
<tbody>
<tr>
<td style="padding:12px 0">
<p style="margin:0;font-size:12px;line-height:18px;letter-spacing:0.06em;text-transform:uppercase;color:${faint};font-family:${mono}">${label}</p>
</td>
<td style="padding:12px 0;text-align:right">
<p style="margin:0;font-size:13px;line-height:18px;color:${text};text-align:right;font-family:${mono}">${value}</p>
</td>
</tr>
</tbody>
</table>`;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="dark" />
<title>Your Ooorbitoooo sign-in code</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&amp;family=JetBrains+Mono:wght@400;700&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:${page};margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">Your sign-in code is inside. It expires in 10 minutes.</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;background-color:${page}">
<tbody>
<tr style="width:100%">
<td style="padding:56px 24px 48px 24px">
<p style="margin:0 0 40px 0;font-size:20px;line-height:24px;font-weight:700;letter-spacing:-0.04em;color:${text};font-family:${font}"><span style="color:${lime}">●</span> oorbitoo</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${card};border:1px solid ${line};border-radius:24px;box-shadow:0 0 0 1px rgba(198,244,50,0.05),0 30px 80px -20px rgba(198,244,50,0.22)">
<tbody>
<tr>
<td style="padding:44px 44px 40px 44px">
<p style="margin:0 0 16px 0;font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${lime};font-family:${mono}">// Sign-in request</p>
<h1 style="margin:0 0 14px 0;font-size:34px;line-height:40px;font-weight:700;letter-spacing:-0.035em;color:${text};font-family:${font}">Here's your code, <span data-variable="first_name">{{{first_name}}}</span>.</h1>
<p style="margin:0 0 32px 0;font-size:16px;line-height:26px;color:${muted};font-family:${font}">Enter it in the Ooorbitoooo window you just opened. For your security, never share this code with anyone, including us.</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0a0c11;border:1px solid #2c3446;border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.04),0 0 40px -8px rgba(198,244,50,0.25)">
<tbody>
<tr>
<td style="padding:30px 24px;text-align:center">
<p style="margin:0;font-size:44px;line-height:52px;font-weight:700;letter-spacing:0.32em;color:${lime};text-align:center;font-family:${mono}"><span data-variable="otp_code">{{{otp_code}}}</span></p>
<p style="margin:10px 0 0 0;font-size:12px;line-height:18px;letter-spacing:0.08em;text-transform:uppercase;color:${faint};text-align:center;font-family:${mono}">Expires in 10 minutes</p>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:32px 0 36px 0">
<p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:${muted};font-family:${font}">Prefer one click? Use the magic link instead.</p>
<a href="{{{magic_link_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${lime};color:#0b0d12;font-size:15px;font-weight:700;letter-spacing:-0.01em;font-family:${font};border-radius:999px;padding:15px 28px;box-shadow:0 10px 30px -6px rgba(198,244,50,0.55)">Sign in to Ooorbitoooo →</a>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid ${line}">
<tbody>
<tr>
<td>${meta("Device", "Desktop browser")}${meta("Location", "Lisbon, PT")}${meta("Requested", "Oct 11, 09:42 UTC")}
</td>
</tr>
</tbody>
</table>
<p style="margin:24px 0 0 0;font-size:13px;line-height:21px;color:${faint};font-family:${font}">Didn't try to sign in? You can safely ignore this email. Someone may have typed your address by mistake.</p>
</td>
</tr>
</tbody>
</table>
<p style="margin:36px 0 6px 0;font-size:12px;line-height:18px;color:${faint};font-family:${mono}">Ooorbitoooo · Fictional sample company · 36 Sample Road · Example City</p>
<p style="margin:0;font-size:12px;line-height:18px;color:${faint};font-family:${mono}">Sent because a sign-in was requested for this address.</p>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
