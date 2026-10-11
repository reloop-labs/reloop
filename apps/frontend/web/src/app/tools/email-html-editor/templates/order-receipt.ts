/**
 * Minimal monochrome order receipt. Line items are full-width two-cell rows
 * (no width attributes) so the canvas keeps the name/price alignment.
 */
export function orderReceiptHtml(_origin: string): string {
	const font = "Inter,'Helvetica Neue',Helvetica,Arial,sans-serif";
	const ink = "#0a0a0a";
	const muted = "#6b6b6b";
	const line = "#ececec";

	const item = (name: string, detail: string, price: string) => `
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-bottom:1px solid ${line}">
<tbody>
<tr>
<td style="padding:14px 0">
<p style="margin:0;font-size:14px;line-height:20px;font-weight:500;color:${ink};font-family:${font}">${name}</p>
<p style="margin:0;font-size:13px;line-height:20px;color:${muted};font-family:${font}">${detail}</p>
</td>
<td style="padding:14px 0;text-align:right;vertical-align:top">
<p style="margin:0;font-size:14px;line-height:20px;font-weight:500;color:${ink};text-align:right;font-family:${font}">${price}</p>
</td>
</tr>
</tbody>
</table>`;

	const total = (label: string, value: string, strong = false) => `
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:${strong ? "12px" : "4px"} 0 0 0">
<p style="margin:0;font-size:${strong ? "15px" : "13px"};line-height:20px;font-weight:${strong ? 600 : 400};color:${strong ? ink : muted};font-family:${font}">${label}</p>
</td>
<td style="padding:${strong ? "12px" : "4px"} 0 0 0;text-align:right">
<p style="margin:0;font-size:${strong ? "15px" : "13px"};line-height:20px;font-weight:${strong ? 600 : 400};color:${strong ? ink : muted};text-align:right;font-family:${font}">${value}</p>
</td>
</tr>
</tbody>
</table>`;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your receipt from Lumen</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:#fafafa;margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">Thanks for your order. Here's your receipt.</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;margin:0 auto;background-color:#fafafa">
<tbody>
<tr style="width:100%">
<td style="padding:48px 24px">
<p style="margin:0 0 32px 0;font-size:18px;line-height:24px;font-weight:600;letter-spacing:-0.02em;color:${ink};font-family:${font}">Lumen</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border:1px solid ${line};border-radius:12px">
<tbody>
<tr>
<td style="padding:40px 40px 36px 40px">
<p style="margin:0 0 8px 0;font-size:12px;line-height:16px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:#9a9a9a;font-family:${font}">Receipt · Order #<span data-variable="order_number">{{{order_number}}}</span></p>
<h1 style="margin:0 0 12px 0;font-size:24px;line-height:32px;font-weight:600;letter-spacing:-0.02em;color:${ink};font-family:${font}">Thanks for your order</h1>
<p style="margin:0 0 28px 0;font-size:15px;line-height:24px;color:${muted};font-family:${font}">Hi <span data-variable="first_name">{{{first_name}}}</span>, your payment went through. Here's a summary for your records.</p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid ${line}">
<tbody>
<tr>
<td>${item("Pro plan", "Monthly · 1 seat", "$24.00")}${item("Extra storage", "100 GB add-on", "$6.00")}
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px">
<tbody>
<tr>
<td style="padding:12px 0 0 0">${total("Subtotal", "$30.00")}${total("Tax", "$2.40")}${total("Total paid", "$32.40", true)}
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:0 0 24px 0">
<a href="{{{invoice_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${ink};color:#ffffff;font-size:14px;font-weight:500;font-family:${font};border-radius:8px;padding:12px 20px">View invoice</a>
</td>
</tr>
</tbody>
</table>
<hr style="width:100%;border:none;border-top:1px solid ${line};margin:0 0 20px 0" />
<p style="margin:0;font-size:13px;line-height:20px;color:${muted};font-family:${font}">Paid with Visa ending in 4242 on Oct 10, 2026. Questions about this charge? Just reply to this email.</p>
</td>
</tr>
</tbody>
</table>
<p style="margin:32px 0 4px 0;font-size:12px;line-height:18px;color:#9a9a9a;font-family:${font}">Lumen Inc. · 548 Market St · San Francisco, CA 94104</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#9a9a9a;font-family:${font}">This receipt was sent to you because you made a purchase on lumen.app.</p>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
