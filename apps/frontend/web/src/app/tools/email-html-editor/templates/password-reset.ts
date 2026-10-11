/**
 * Minimal monochrome password reset email. Same React Email shape as the
 * welcome template: one ~560px container, inline styles, and a
 * `react-email-button` anchor. Text wordmark only, so no image assets.
 */
export function passwordResetHtml(_origin: string): string {
	const font = "Inter,'Helvetica Neue',Helvetica,Arial,sans-serif";
	const ink = "#0a0a0a";
	const muted = "#6b6b6b";
	const line = "#ececec";

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset your password</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:#fafafa;margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">Use this link to reset your password. It expires in 30 minutes.</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;margin:0 auto;background-color:#fafafa">
<tbody>
<tr style="width:100%">
<td style="padding:48px 24px">
<p style="margin:0 0 32px 0;font-size:18px;line-height:24px;font-weight:600;letter-spacing:-0.02em;color:${ink};font-family:${font}">Lumen</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border:1px solid ${line};border-radius:12px">
<tbody>
<tr>
<td style="padding:40px 40px 36px 40px">
<h1 style="margin:0 0 12px 0;font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.02em;color:${ink};font-family:${font}">Reset your password</h1>
<p style="margin:0 0 28px 0;font-size:15px;line-height:24px;color:${muted};font-family:${font}">Hi <span data-variable="first_name">{{{first_name}}}</span>, we got a request to reset the password for your Lumen account. Click the button below to choose a new one.</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:0 0 28px 0">
<a href="{{{reset_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${ink};color:#ffffff;font-size:14px;font-weight:500;font-family:${font};border-radius:8px;padding:12px 20px">Reset password</a>
</td>
</tr>
</tbody>
</table>
<p style="margin:0 0 20px 0;font-size:13px;line-height:20px;color:${muted};font-family:${font}">This link expires in 30 minutes. If you didn't request a reset, you can safely ignore this email. Your password won't change.</p>
<hr style="width:100%;border:none;border-top:1px solid ${line};margin:0 0 20px 0" />
<p style="margin:0;font-size:12px;line-height:18px;color:#9a9a9a;font-family:${font}">Button not working? Paste this link into your browser:<br /><a href="{{{reset_url}}}" target="_blank" style="color:${ink};text-decoration:underline">https://lumen.app/reset/••••••••</a></p>
</td>
</tr>
</tbody>
</table>
<p style="margin:32px 0 4px 0;font-size:12px;line-height:18px;color:#9a9a9a;font-family:${font}">Lumen Inc. · 548 Market St · San Francisco, CA 94104</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#9a9a9a;font-family:${font}">You're receiving this because a password reset was requested for your account.</p>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
