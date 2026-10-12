/**
 * Empty starting point: the same ~560px container and inline styles as the
 * other templates, with one empty paragraph so the canvas has a place to type.
 */
export function blankHtml(_origin: string): string {
	const font = "Inter,'Helvetica Neue',Helvetica,Arial,sans-serif";

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Untitled email</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet" />
</head>
<body style="background-color:#ffffff;margin:0;padding:0;font-family:${font}">
<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;margin:0 auto;background-color:#ffffff">
<tbody>
<tr style="width:100%">
<td style="padding:48px 24px">
<p style="margin:0;font-size:15px;line-height:24px;color:#0a0a0a;font-family:${font}"></p>
</td>
</tr>
</tbody>
</table>
</body>
</html>`;
}
