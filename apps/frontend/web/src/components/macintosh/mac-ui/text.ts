export function fillTextFauxBold(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	fauxBold = 1,
): void {
	ctx.save();
	ctx.textAlign = "left";
	ctx.fillText(text, x, y);
	for (let b = 0; b < fauxBold; b++) {
		ctx.fillText(text, x + b + 1, y);
	}
	ctx.restore();
}

export function fillTextWithTracking(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	tracking = 0,
	align: "left" | "center" | "right" = "left",
	fauxBold = 0,
): void {
	ctx.save();
	ctx.textAlign = "left";
	const chars = Array.from(text);
	const widths = chars.map((ch) => ctx.measureText(ch).width);
	const totalWidth =
		widths.reduce((sum, w) => sum + w, 0) +
		tracking * Math.max(0, chars.length - 1);

	let startX = x;
	if (align === "center") startX = x - totalWidth / 2 - fauxBold / 2;
	else if (align === "right") startX = x - totalWidth - fauxBold;

	let cx = startX;
	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		const charWidth = widths[i] ?? 0;
		if (char) {
			ctx.fillText(char, cx, y);
			for (let b = 0; b < fauxBold; b++) {
				ctx.fillText(char, cx + b + 1, y);
			}
		}
		cx += charWidth + tracking;
	}
	ctx.restore();
}

export function fillWrappedText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number,
	firstLineIndent = 0,
): number {
	const paragraphs = String(text).split("\n");
	let cy = y;
	for (const p of paragraphs) {
		const words = p.trim().split(/\s+/).filter(Boolean);
		let line = "";
		let lineX = x + firstLineIndent;
		let lineMaxW = Math.max(0, maxWidth - firstLineIndent);
		for (const w of words) {
			if (!w) continue;
			const test = line ? `${line} ${w}` : w;
			if (line && ctx.measureText(test).width > lineMaxW) {
				ctx.fillText(line, lineX, cy);
				cy += lineHeight;
				line = w;
				lineX = x;
				lineMaxW = maxWidth;
			} else {
				line = test;
			}
		}
		if (line) {
			ctx.fillText(line, lineX, cy);
			cy += lineHeight;
		}
	}
	return cy;
}
