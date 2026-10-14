/**
 * Concert booking confirmation styled as a tear-off ticket. Syne display
 * type over Manrope, a coral stub on peach, a dashed perforation, and a
 * Libre Barcode 39 code that falls back to readable text.
 */
export function eventTicketHtml(_origin: string): string {
	const display = "Syne,'Arial Black','Helvetica Neue',Arial,sans-serif";
	const font = "Manrope,'Helvetica Neue',Helvetica,Arial,sans-serif";
	const barcode = "'Libre Barcode 39 Text','Courier New',monospace";
	const peach = "#ffe8dc";
	const coral = "#ff5a36";
	const plum = "#2a1238";
	const muted = "#7a6a80";

	const detail = (label: string, value: string) => `
<td style="padding:0 8px 0 0;vertical-align:top">
<p style="margin:0 0 4px 0;font-size:11px;line-height:14px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${muted};font-family:${font}">${label}</p>
<p style="margin:0;font-size:20px;line-height:26px;font-weight:800;color:${plum};font-family:${display}">${value}</p>
</td>`;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>You're going! Your tickets are confirmed</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&amp;family=Manrope:wght@400;500;700&amp;family=Libre+Barcode+39+Text&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:${peach};margin:0;padding:0;font-family:${font}">
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">2 tickets for Neoon Tidess, Fri Nov 7 at The Rounndora Hall. Show this email at the door.</div>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:0 auto;background-color:${peach}">
<tbody>
<tr style="width:100%">
<td style="padding:44px 24px 48px 24px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td style="padding:0 0 28px 0">
<p style="margin:0;font-size:22px;line-height:26px;font-weight:800;letter-spacing:-0.03em;color:${plum};font-family:${display}">encoorra<span style="color:${coral}">*</span></p>
</td>
<td style="padding:0 0 28px 0;text-align:right">
<p style="margin:0;font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${coral};text-align:right;font-family:${font}">Booking confirmed</p>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${coral};border-radius:28px 28px 0 0;box-shadow:0 30px 60px -30px rgba(122,30,10,0.45)">
<tbody>
<tr>
<td style="padding:40px 40px 36px 40px">
<p style="margin:0 0 14px 0;font-size:13px;line-height:18px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#ffd9cc;font-family:${font}">You're going, <span data-variable="first_name">{{{first_name}}}</span> ✦</p>
<h1 style="margin:0 0 10px 0;font-size:60px;line-height:58px;font-weight:800;letter-spacing:-0.045em;text-transform:uppercase;color:#ffffff;font-family:${display}">Neon<br />Tides</h1>
<p style="margin:0;font-size:16px;line-height:24px;font-weight:500;color:#fff1eb;font-family:${font}">The Afterglow World Tour · with special guest Luumii</p>
</td>
</tr>
</tbody>
</table>
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-top:3px dashed ${peach};border-radius:0 0 28px 28px;box-shadow:0 30px 60px -30px rgba(122,30,10,0.45)">
<tbody>
<tr>
<td style="padding:32px 40px 8px 40px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>${detail("Date", "Fri, Nov 7")}${detail("Doors", "7:30 PM")}${detail("Tickets", "2 × GA")}
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:24px 40px 0 40px">
<p style="margin:0 0 4px 0;font-size:11px;line-height:14px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${muted};font-family:${font}">Venue</p>
<p style="margin:0;font-size:16px;line-height:24px;font-weight:500;color:${plum};font-family:${font}">The Rounndora Hall · 12 Sample Lane, Example City</p>
</td>
</tr>
<tr>
<td style="padding:28px 40px 0 40px">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#fff6f1;border-radius:18px">
<tbody>
<tr>
<td style="padding:20px 24px 14px 24px;text-align:center">
<p style="margin:0;font-size:52px;line-height:56px;color:${plum};text-align:center;font-family:${barcode}">*<span data-variable="booking_code">{{{booking_code}}}</span>*</p>
<p style="margin:6px 0 0 0;font-size:12px;line-height:18px;color:${muted};text-align:center;font-family:${font}">Show this at the door, on your phone is fine.</p>
</td>
</tr>
</tbody>
</table>
</td>
</tr>
<tr>
<td style="padding:28px 40px 40px 40px">
<a href="{{{tickets_url}}}" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;background-color:${plum};color:#ffffff;font-size:15px;font-weight:700;font-family:${font};border-radius:14px;padding:16px 26px;box-shadow:0 6px 0 0 ${coral}">Add to your wallet</a>
<p style="margin:20px 0 0 0;font-size:14px;line-height:22px;color:${muted};font-family:${font}">Total paid <strong style="color:${plum}">£84.00</strong> · Refundable until Oct 31. Plans changed? <a href="#" style="color:${coral};font-weight:700;text-decoration:underline">Transfer a ticket</a></p>
</td>
</tr>
</tbody>
</table>
<p style="margin:32px 0 4px 0;font-size:12px;line-height:18px;color:#9a7f73;text-align:center;font-family:${font}">Encoorra Tickets · Fictional sample company · 60 Sample Avenue · Example City</p>
<p style="margin:0;font-size:12px;line-height:18px;color:#9a7f73;text-align:center;font-family:${font}">This is your e-ticket. Please don't forward it, the code can only be scanned once.</p>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
