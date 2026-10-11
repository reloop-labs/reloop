/**
 * Editorial shipping update for a plant shop. Fraunces serif display type
 * over DM Sans, cream paper, forest green and terracotta, with a four-step
 * progress tracker and a dark delivery-estimate panel.
 */
export function orderShippedHtml(_origin: string): string {
	const serif = "Fraunces,Georgia,'Times New Roman',serif";
	const sans = "'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
	const paper = "#f3ece1";
	const card = "#fffaf2";
	const forest = "#2f3b2a";
	const terracotta = "#c8553d";
	const ink = "#1f241c";
	const muted = "#6f6a5f";
	const line = "#e8dfcf";

	const step = (label: string, done: boolean) => `
<td style="padding:10px 4px 0 0;vertical-align:top">
<p style="margin:0;font-size:12px;line-height:16px;font-weight:${done ? 700 : 500};color:${done ? forest : "#a49d8f"};font-family:${sans}">${done ? "✓ " : ""}${label}</p>
</td>`;

	const segment = (filled: boolean) => `
<td style="padding:0 4px 0 0">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${filled ? forest : "#e6dccb"};border-radius:999px">
<tbody>
<tr>
<td style="padding:3px 0;font-size:0;line-height:0">&nbsp;</td>
</tr>
</tbody>
</table>
</td>`;

	const item = (emoji: string, tint: string, name: string, detail: string) => `
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-bottom:1px solid ${line}">
<tbody>
<tr>
<td style="padding:16px 16px 16px 0;width:64px;vertical-align:middle">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${tint};border-radius:16px">
<tbody>
<tr>
<td style="padding:14px 16px;font-size:28px;line-height:32px;text-align:center">${emoji}</td>
</tr>
</tbody>
</table>
</td>
<td style="padding:16px 0;vertical-align:middle">
<p style="margin:0;font-size:18px;line-height:24px;font-weight:600;color:${ink};font-family:${serif}">${name}</p>
<p style="margin:2px 0 0 0;font-size:13px;line-height:20px;color:${muted};font-family:${sans}">${detail}</p>
</td>
</tr>
</tbody>
</table>`;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your order is on its way</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&amp;family=DM+Sans:wght@400;500;700&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:${paper};margin:0;padding:0;font-family:${sans}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">Good news: your plants left the greenhouse and should arrive Thursday.</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;background-color:${paper}">
<tbody>
<tr style="width:100%">
<td style="padding:44px 24px 48px 24px">
<p style="margin:0 0 32px 0;font-size:24px;line-height:28px;font-style:italic;color:${forest};text-align:center;font-family:${serif}">Field &amp; Fern</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${card};border:1px solid ${line};border-radius:28px;box-shadow:0 1px 2px rgba(60,40,20,0.06),0 28px 50px -24px rgba(60,40,20,0.28)">
<tbody>
<tr>
<td style="padding:44px 44px 12px 44px">
<p style="margin:0 0 18px 0;font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${terracotta};font-family:${sans}">Order #<span data-variable="order_number">{{{order_number}}}</span> · Shipped</p>
<h1 style="margin:0 0 16px 0;font-size:46px;line-height:50px;font-weight:400;letter-spacing:-0.025em;color:${ink};font-family:${serif}">Your plants are <em style="color:${terracotta}">on their way.</em></h1>
<p style="margin:0 0 32px 0;font-size:16px;line-height:26px;color:${muted};font-family:${sans}">Hi <span data-variable="first_name">{{{first_name}}}</span>, we watered them one last time, wrapped them snug, and handed them to the courier this morning.</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>${segment(true)}${segment(true)}${segment(true)}${segment(false)}
</tr>
<tr>${step("Ordered", true)}${step("Packed", true)}${step("Shipped", true)}${step("Delivered", false)}
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:24px 44px 0 44px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${forest};border-radius:20px">
<tbody>
<tr>
<td style="padding:26px 28px">
<p style="margin:0 0 6px 0;font-size:12px;line-height:16px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:#b9c4a7;font-family:${sans}">Estimated arrival</p>
<p style="margin:0 0 6px 0;font-size:30px;line-height:36px;font-weight:400;color:#fffaf2;font-family:${serif}">Thursday, <em>Oct 15</em></p>
<p style="margin:0;font-size:13px;line-height:20px;color:#d5dcc8;font-family:${sans}">UPS Ground · 1Z 999 AA1 0123 4567 84</p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:28px 44px 8px 44px">
<a href="{{{tracking_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${terracotta};color:#ffffff;font-size:15px;font-weight:700;font-family:${sans};border-radius:999px;padding:16px 30px;box-shadow:0 12px 24px -10px rgba(200,85,61,0.7)">Track your package</a>
</td>
</tr>
<tr>
<td style="padding:28px 44px 40px 44px">
<p style="margin:0 0 4px 0;font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#a49d8f;font-family:${sans}">In this box</p>
${item("🪴", "#e3ead8", "Monstera Deliciosa", "Medium · Terracotta pot · Qty 1")}${item("🌿", "#f3e1d6", "Pothos Marble Queen", "Small · Hanging planter · Qty 2")}
<p style="margin:24px 0 0 0;font-size:14px;line-height:22px;color:${muted};font-family:${sans}"><strong style="color:${ink}">Shipping to</strong><br />Ana Morales · 221 Grove St, Apt 4B · Brooklyn, NY 11201</p>
</td>
</tr>
</tbody>
</table>
<p style="margin:32px 0 6px 0;font-size:15px;line-height:22px;font-style:italic;color:${forest};text-align:center;font-family:${serif}">Unbox within a day and give them some light. They'll thank you.</p>
<p style="margin:0 0 4px 0;font-size:12px;line-height:18px;color:#958e80;text-align:center;font-family:${sans}">Field &amp; Fern · 88 Greenhouse Lane · Portland, OR 97214</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#958e80;text-align:center;font-family:${sans}">You're getting this because you placed an order with us.</p>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
