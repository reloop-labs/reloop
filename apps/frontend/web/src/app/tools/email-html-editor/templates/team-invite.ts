/**
 * Playful workspace invitation. Bricolage Grotesque on a periwinkle canvas
 * with a stacked-avatar row, a workspace tile, and a chunky indigo button.
 */
export function teamInviteHtml(_origin: string): string {
	const font =
		"'Bricolage Grotesque','Helvetica Neue',Helvetica,Arial,sans-serif";
	const canvas = "#eceeff";
	const indigo = "#4f46e5";
	const ink = "#15133a";
	const muted = "#62607e";

	const avatar = (initials: string, bg: string, fg: string) => `
<td style="padding:0 6px 0 0">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${bg};border:2px solid ${ink};border-radius:999px;box-shadow:2px 2px 0 0 ${ink}">
<tbody>
<tr>
<td style="padding:13px 0;width:46px;text-align:center">
<p style="margin:0;font-size:15px;line-height:18px;font-weight:700;color:${fg};text-align:center;font-family:${font}">${initials}</p>
</td>
</tr>
</tbody>
</table>
</td>`;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>You've been invited to join Northwind Design on Kanbo</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:${canvas};margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">Your team is waiting. Accept the invite to start collaborating.</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;background-color:${canvas}">
<tbody>
<tr style="width:100%">
<td style="padding:48px 24px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border:2px solid ${ink};border-radius:32px;box-shadow:8px 8px 0 0 ${ink}">
<tbody>
<tr>
<td style="padding:40px 44px 0 44px">
<p style="margin:0 0 36px 0;font-size:20px;line-height:24px;font-weight:800;letter-spacing:-0.03em;color:${indigo};font-family:${font}">▦ kanbo</p>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px 0">
<tbody>
<tr>${avatar("MR", "#fde047", ink)}${avatar("JS", "#6ee7b7", ink)}${avatar("AK", "#f9a8d4", ink)}${avatar("+9", indigo, "#ffffff")}
</tr>
</tbody>
</table>
<h1 style="margin:0 0 16px 0;font-size:40px;line-height:44px;font-weight:800;letter-spacing:-0.04em;color:${ink};font-family:${font}"><span data-variable="inviter_name">{{{inviter_name}}}</span> wants you on the team</h1>
<p style="margin:0 0 32px 0;font-size:17px;line-height:27px;color:${muted};font-family:${font}">Hey <span data-variable="first_name">{{{first_name}}}</span>, you've been invited to join <strong style="color:${ink}"><span data-variable="workspace_name">{{{workspace_name}}}</span></strong> on Kanbo, where the team plans sprints, ships work, and celebrates the wins.</p>
</td>
</tr>
<tr>
<td style="padding:0 44px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f6f5ff;border:1px solid #dddbfb;border-radius:22px">
<tbody>
<tr>
<td style="padding:20px 0 20px 20px;width:56px;vertical-align:middle">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${indigo};background-image:linear-gradient(135deg,#818cf8 0%,#4f46e5 60%,#3730a3 100%);border-radius:16px">
<tbody>
<tr>
<td style="padding:16px 0;width:56px;text-align:center">
<p style="margin:0;font-size:18px;line-height:22px;font-weight:800;color:#ffffff;text-align:center;font-family:${font}">ND</p>
</td>
</tr>
</tbody>
</table>
</td>
<td style="padding:20px 20px 20px 16px;vertical-align:middle">
<p style="margin:0 0 2px 0;font-size:18px;line-height:24px;font-weight:700;color:${ink};font-family:${font}">Northwind Design</p>
<p style="margin:0;font-size:14px;line-height:20px;color:${muted};font-family:${font}">12 members · 4 active boards · You'll join as <strong style="color:${indigo}">Editor</strong></p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:32px 44px 12px 44px">
<a href="{{{invite_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${indigo};color:#ffffff;font-size:17px;font-weight:700;font-family:${font};border:2px solid ${ink};border-radius:16px;padding:17px 32px;box-shadow:4px 4px 0 0 ${ink}">Join the workspace</a>
</td>
</tr>
<tr>
<td style="padding:16px 44px 40px 44px">
<p style="margin:0;font-size:14px;line-height:22px;color:${muted};font-family:${font}">This invite expires in 7 days. Not expecting it? No worries, just ignore this email and nothing will change.</p>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:36px 8px 0 8px">
<p style="margin:0 0 6px 0;font-size:13px;line-height:20px;color:${muted};font-family:${font}">Sent by Kanbo on behalf of <span data-variable="inviter_name">{{{inviter_name}}}</span>.</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#8e8ca8;font-family:${font}">Kanbo Software GmbH · Torstraße 109 · 10119 Berlin</p>
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
