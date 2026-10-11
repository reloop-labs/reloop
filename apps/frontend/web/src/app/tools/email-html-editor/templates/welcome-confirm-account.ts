/**
 * Account confirmation welcome email. Authored in the shape React Email
 * emits (one ~600px container table, inline styles, `react-email-button`
 * anchors) so the editor's paste pipeline maps it cleanly onto the canvas.
 *
 * `origin` makes the logo URL absolute, which mail clients require.
 */
export function welcomeConfirmAccountHtml(origin: string): string {
	const logoSrc = `${origin}/tools/email-html-editor/welcome-logo.png`;
	const orange = "#f5a95c";
	const font = "Lato,'Helvetica Neue',Helvetica,Arial,sans-serif";

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome! Confirm your account</title>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:#f4f4f4;margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">We're excited to have you get started. Confirm your account to begin.</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;background-color:#f4f4f4">
<tbody>
<tr style="width:100%">
<td>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff">
<tbody>
<tr>
<td style="padding:10px 24px">
<p style="margin:0;font-size:11px;line-height:16px;color:#9a9a9a;font-family:${font}">Put your preheader text here</p>
</td>
<td style="padding:10px 24px;text-align:right">
<p style="margin:0;font-size:11px;line-height:16px;color:#9a9a9a;font-family:${font};text-align:right"><a href="#" style="color:#9a9a9a;text-decoration:underline">View in browser</a></p>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${orange}">
<tbody>
<tr>
<td style="padding:32px 40px 0 40px">
<img alt="Ceej" src="${logoSrc}" width="48" height="48" style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" />
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px;background-color:#ffffff;border-radius:6px 6px 0 0">
<tbody>
<tr>
<td style="padding:36px 40px 8px 40px">
<h1 style="margin:0;font-size:44px;line-height:52px;font-weight:400;color:#111111;text-align:center;font-family:${font}">Welcome!</h1>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:0 40px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:0 0 6px 6px">
<tbody>
<tr>
<td style="padding:20px 40px 36px 40px">
<p style="margin:0 0 32px 0;font-size:16px;line-height:25px;color:#666666;font-family:${font}">Hi <span data-variable="first_name">{{{first_name}}}</span>, we're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="text-align:center;padding:0 0 32px 0">
<a href="{{{confirm_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${orange};color:#ffffff;font-size:18px;font-family:${font};border-radius:2px;padding:14px 24px">Confirm Account</a>
</td>
</tr>
</tbody>
</table>
<p style="margin:0 0 16px 0;font-size:16px;line-height:25px;color:#666666;font-family:${font}">If that doesn't work, copy and paste the following link in your browser:</p>
<p style="margin:0 0 16px 0;font-size:16px;line-height:25px;font-family:${font}"><a href="{{{confirm_url}}}" target="_blank" style="color:${orange};text-decoration:underline">XXX.XXXXXXX.XXX / XXXXXXXXXXXXX</a></p>
<p style="margin:0 0 16px 0;font-size:16px;line-height:25px;color:#666666;font-family:${font}">If you have any questions, just reply to this email. We're always happy to help out.</p>
<p style="margin:0;font-size:16px;line-height:25px;color:#666666;font-family:${font}">Cheers,<br />The Ceej Team</p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:24px 40px 0 40px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffecd1;border-radius:4px">
<tbody>
<tr>
<td style="padding:24px 30px;text-align:center">
<p style="margin:0;font-size:18px;line-height:24px;color:#111111;text-align:center;font-family:${font}">Need more help?</p>
<p style="margin:0;font-size:16px;line-height:24px;text-align:center;font-family:${font}"><a href="#" target="_blank" style="color:${orange};text-decoration:underline">We're here, ready to talk</a></p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:24px 56px 40px 56px">
<p style="margin:0 0 16px 0;font-size:12px;line-height:18px;color:#111111;font-family:${font}"><a href="#" style="color:#111111;font-weight:700;text-decoration:underline">Dashboard</a> - <a href="#" style="color:#111111;font-weight:700;text-decoration:underline">Billing</a> - <a href="#" style="color:#111111;font-weight:700;text-decoration:underline">Help</a></p>
<p style="margin:0 0 16px 0;font-size:12px;line-height:18px;color:#666666;font-family:${font}">You received this email because you just signed up for a new account. If it looks weird, <a href="#" style="color:#111111;font-weight:700;text-decoration:underline">view it in your browser</a>.</p>
<p style="margin:0 0 16px 0;font-size:12px;line-height:18px;color:#666666;font-family:${font}">If these emails get annoying, please feel free to <a href="{{{unsubscribe_url}}}" style="color:#111111;font-weight:700;text-decoration:underline">unsubscribe</a>.</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#666666;font-family:${font}">Ceej - 1234 Main Street - Anywhere, MA - 56789</p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
