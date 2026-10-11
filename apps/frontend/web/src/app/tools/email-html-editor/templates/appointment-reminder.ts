/** Transactional appointment reminder with email-safe layout and font fallbacks. */
export function appointmentReminderHtml(_origin: string): string {
	const body = "'DM Sans',Arial,sans-serif";
	const display = "'DM Serif Display',Georgia,serif";
	return `<!DOCTYPE html>
<html lang="en" dir="ltr"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Your moment of calm is tomorrow</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
<style>@media only screen and (max-width:480px){.outer{padding:24px 12px!important}.content{padding:28px 22px!important}.display{font-size:36px!important;line-height:40px!important}.stack{display:block!important;width:auto!important}.date{padding-bottom:20px!important}}</style></head>
<body style="margin:0;padding:0;background:#e6f2ef;color:#153e35;font-family:${body}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Your appointment at Stiillora Studio is tomorrow at 10:30 AM.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="outer" style="padding:48px 24px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width:560px;margin:0 auto"><tbody>
<tr><td style="padding:0 8px 24px;font-size:21px;font-weight:700;letter-spacing:-1px">stiillora<span style="color:#467867"> / studio</span></td></tr>
<tr><td class="content" style="padding:40px;background:#ffffff;border-radius:80px 80px 20px 20px;box-shadow:0 18px 40px -24px #497d70">
<p style="margin:0 0 18px;font-size:11px;letter-spacing:2px;font-weight:700;color:#467867;text-transform:uppercase;text-align:center">A little time for you</p>
<h1 class="display" style="margin:0 0 20px;font-family:${display};font-weight:400;font-size:48px;line-height:52px;letter-spacing:-1px;text-align:center">Your moment<br />of calm awaits.</h1>
<p style="margin:0 0 28px;font-size:15px;line-height:25px;color:#4b685f;text-align:center">Hi <span data-variable="first_name">{{{first_name}}}</span>, a gentle reminder that we’ll see you tomorrow. Your time is reserved, and everything is ready.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf6f2;border-radius:16px"><tbody><tr><td class="stack date" style="padding:24px;text-align:center;border-right:1px solid #c9dfd5"><p style="margin:0;font-size:11px;letter-spacing:2px">OCT</p><p style="margin:4px 0;font-family:${display};font-size:52px;line-height:54px">12</p><p style="margin:0;font-size:12px">MONDAY</p></td><td class="stack" style="padding:24px"><p style="margin:0 0 8px;font-size:18px;font-weight:700">Restorative massage</p><p style="margin:0;font-size:14px;line-height:24px;color:#4b685f">10:30–11:30 AM IST<br />With Olivia Chen<br />Stiillora Studio · Example City</p></td></tr></tbody></table>
<p style="margin:24px 0;font-size:14px;line-height:23px;color:#4b685f">Arrive 10 minutes early to settle in. We’ll take care of the rest.</p>
<a href="{{{appointment_url}}}" data-id="react-email-button" style="display:block;text-align:center;padding:17px 20px;border-radius:40px;background:#245b4c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700">Manage appointment</a>
<p style="margin:18px 0 0;text-align:center;font-size:12px;line-height:20px;color:#4b685f">Need to reschedule? Make changes up to 12 hours before your visit.</p></td></tr>
<tr><td style="padding:24px;text-align:center;font-size:12px;line-height:20px;color:#4b685f">Stiillora Studio · Fictional sample company · 72 Sample Road · Example City<br />Sent because you booked an appointment with us.</td></tr></tbody></table></td></tr></tbody></table></body></html>`;
}
