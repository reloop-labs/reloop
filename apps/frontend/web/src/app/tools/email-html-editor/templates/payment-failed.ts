/**
 * Payment-failed dunning email. Outfit throughout, a soft rose canvas, a
 * rendered mini credit card with a "Declined" pill, and a glowing rose CTA.
 */
export function paymentFailedHtml(_origin: string): string {
	const font = "Outfit,'Helvetica Neue',Helvetica,Arial,sans-serif";
	const blush = "#fff1f3";
	const rose = "#e11d48";
	const ink = "#1c1917";
	const muted = "#78716c";

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Action needed: your payment didn't go through</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:${blush};margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">We couldn't charge your card. Update it to keep your Pulse membership active.</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;background-color:${blush}">
<tbody>
<tr style="width:100%">
<td style="padding:48px 24px">
<p style="margin:0 0 32px 0;font-size:22px;line-height:28px;font-weight:700;letter-spacing:-0.03em;color:${ink};text-align:center;font-family:${font}">pulse<span style="color:${rose}">.</span></p>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:32px;box-shadow:0 2px 4px rgba(225,29,72,0.04),0 40px 80px -32px rgba(225,29,72,0.35)">
<tbody>
<tr>
<td style="padding:48px 44px 16px 44px;text-align:center">
<table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 24px auto;background-color:#ffe4e9;border-radius:999px">
<tbody>
<tr>
<td style="padding:8px 16px">
<p style="margin:0;font-size:13px;line-height:16px;font-weight:600;color:${rose};text-align:center;font-family:${font}">● Payment failed</p>
</td>
</tr>
</tbody>
</table>
<h1 style="margin:0 0 14px 0;font-size:36px;line-height:42px;font-weight:600;letter-spacing:-0.03em;color:${ink};text-align:center;font-family:${font}">Let's keep your streak alive</h1>
<p style="margin:0 0 32px 0;font-size:17px;line-height:27px;font-weight:300;color:${muted};text-align:center;font-family:${font}">Hi <span data-variable="first_name">{{{first_name}}}</span>, we tried to renew your Pulse Unlimited membership but your card was declined. Update it in a few seconds and you won't miss a single class.</p>
</td>
</tr>
<tr>
<td style="padding:0 72px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#18181b;background-image:linear-gradient(135deg,#27272a 0%,#09090b 100%);border-radius:20px;box-shadow:0 24px 40px -18px rgba(9,9,11,0.55)">
<tbody>
<tr>
<td style="padding:24px 26px 0 26px">
<p style="margin:0;font-size:15px;line-height:20px;font-weight:700;font-style:italic;letter-spacing:0.02em;color:#ffffff;font-family:${font}">VISA</p>
</td>
<td style="padding:24px 26px 0 26px;text-align:right">
<p style="margin:0;font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#fda4af;text-align:right;font-family:${font}">Declined</p>
</td>
</tr>
<tr>
<td style="padding:44px 26px 24px 26px">
<p style="margin:0 0 6px 0;font-size:18px;line-height:22px;font-weight:500;letter-spacing:0.18em;color:#f4f4f5;font-family:${font}">•••• 4242</p>
<p style="margin:0;font-size:12px;line-height:16px;color:#a1a1aa;font-family:${font}">Expired 09/26</p>
</td>
<td style="padding:44px 26px 24px 26px;text-align:right;vertical-align:bottom">
<p style="margin:0;font-size:12px;line-height:16px;color:#a1a1aa;text-align:right;font-family:${font}">Amount due</p>
<p style="margin:0;font-size:22px;line-height:28px;font-weight:600;color:#ffffff;text-align:right;font-family:${font}"><span data-variable="amount_due">{{{amount_due}}}</span></p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:36px 44px 12px 44px;text-align:center">
<a href="{{{update_payment_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${rose};color:#ffffff;font-size:16px;font-weight:600;font-family:${font};border-radius:16px;padding:18px 34px;box-shadow:0 14px 28px -10px rgba(225,29,72,0.65)">Update payment method</a>
</td>
</tr>
<tr>
<td style="padding:28px 44px 44px 44px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fafaf9;border:1px solid #f0eeec;border-radius:18px">
<tbody>
<tr>
<td style="padding:20px 24px">
<p style="margin:0 0 6px 0;font-size:15px;line-height:22px;font-weight:600;color:${ink};font-family:${font}">What happens next?</p>
<p style="margin:0;font-size:14px;line-height:22px;color:${muted};font-family:${font}">We'll retry automatically on <strong style="color:${ink}">Oct 14</strong> and <strong style="color:${ink}">Oct 18</strong>. If both attempts fail, your membership pauses. Your history and progress stay safe either way.</p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
</tbody>
</table>
<p style="margin:32px 0 6px 0;font-size:14px;line-height:22px;color:${muted};text-align:center;font-family:${font}">Questions? <a href="#" style="color:${rose};font-weight:600;text-decoration:none">Chat with us</a>, we usually reply in minutes.</p>
<p style="margin:0 0 4px 0;font-size:12px;line-height:18px;color:#a8a29e;text-align:center;font-family:${font}">Pulse Fitness Inc. · 400 Congress Ave · Austin, TX 78701</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#a8a29e;text-align:center;font-family:${font}">You're receiving this because a payment on your account needs attention.</p>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
