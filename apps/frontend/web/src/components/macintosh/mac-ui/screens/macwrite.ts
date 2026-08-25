import type { Chrome } from "../chrome";
import type { RectManager } from "../rects";

export interface MacWriteScreen {
	drawMacWriteContent: () => void;
}

export function createMacWriteScreen({
	ctx,
	rects,
	chrome,
}: {
	ctx: CanvasRenderingContext2D;
	rects: RectManager;
	chrome: Chrome;
}): MacWriteScreen {
	function normalizeWordForMatch(word: string) {
		return String(word)
			.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
			.toLowerCase();
	}

	function drawWrappedTextWithSingleWordHighlight(
		ctx2: CanvasRenderingContext2D,
		textValue: string,
		x: number,
		y: number,
		maxWidth: number,
		lineHeight: number,
		firstLineIndent: number,
		highlightWord: string,
	) {
		const paragraphs = String(textValue).split("\n");
		const target = normalizeWordForMatch(highlightWord);
		const spaceWidth = ctx2.measureText(" ").width;
		const fallbackFontPx = 10;

		let cursorY = y;
		let didHighlight = false;

		function drawHighlightedWord(
			word: string,
			wordX: number,
			baselineY: number,
		) {
			const metrics = ctx2.measureText(word);
			const wordWidth = metrics.width;
			const ascent = Number.isFinite(metrics.actualBoundingBoxAscent)
				? metrics.actualBoundingBoxAscent
				: fallbackFontPx;
			const descent = Number.isFinite(metrics.actualBoundingBoxDescent)
				? metrics.actualBoundingBoxDescent
				: Math.round(fallbackFontPx * 0.25);

			const padX = 1;
			const padY = 1;

			const rectX = Math.round(wordX - padX);
			const rectY = Math.round(baselineY - ascent - padY);
			const rectW = Math.round(wordWidth + padX * 2);
			const rectH = Math.round(ascent + descent + padY * 2);

			const prevFill = ctx2.fillStyle;
			ctx2.fillStyle = "#000000";
			ctx2.fillRect(rectX, rectY, rectW, rectH);
			ctx2.fillStyle = "#FFFFFF";
			ctx2.fillText(word, wordX, baselineY);
			ctx2.fillStyle = prevFill;
		}

		function drawLine(words: string[], startX: number, baselineY: number) {
			let cursorX = startX;
			for (let i = 0; i < words.length; i++) {
				const word = words[i];
				if (!word) continue;
				if (i > 0) cursorX += spaceWidth;

				const shouldHighlight =
					!didHighlight && normalizeWordForMatch(word) === target;
				if (shouldHighlight) {
					drawHighlightedWord(word, cursorX, baselineY);
					didHighlight = true;
				} else {
					ctx2.fillText(word, cursorX, baselineY);
				}

				cursorX += ctx2.measureText(word).width;
			}
		}

		for (const paragraph of paragraphs) {
			const words = paragraph.trim().split(/\s+/).filter(Boolean);
			if (!words.length) continue;

			let lineWords: string[] = [];
			let lineWidth = 0;
			let lineX = x + firstLineIndent;
			let lineMaxW = Math.max(0, maxWidth - firstLineIndent);

			for (const word of words) {
				if (!word) continue;
				const wordWidth = ctx2.measureText(word).width;
				const nextWidth = lineWords.length
					? lineWidth + spaceWidth + wordWidth
					: wordWidth;

				if (lineWords.length && nextWidth > lineMaxW) {
					drawLine(lineWords, lineX, cursorY);
					cursorY += lineHeight;

					lineWords = [word];
					lineWidth = wordWidth;
					lineX = x;
					lineMaxW = maxWidth;
					continue;
				}

				if (lineWords.length) lineWidth += spaceWidth;
				lineWords.push(word);
				lineWidth += wordWidth;
			}

			if (lineWords.length) {
				drawLine(lineWords, lineX, cursorY);
				cursorY += lineHeight;
			}
		}

		return cursorY;
	}

	function drawMacWriteContent() {
		const { windowX, windowY, windowWidth, windowHeight } =
			rects.getWindowRect();
		chrome.drawWindow(
			ctx,
			windowX,
			windowY,
			windowWidth,
			windowHeight,
			"Mac Writing",
		);
		const contentX = windowX + 1;
		const contentY = windowY + 20;
		const contentW = windowWidth - 17;
		const contentH = windowHeight - 36;
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(contentX, contentY, contentW, contentH);

		ctx.strokeStyle = "#000000";
		ctx.strokeRect(contentX, contentY, contentW, contentH);

		const rulerH = 14;
		const toolbarH = 16;
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(contentX + 1, contentY + 1, contentW - 2, rulerH);
		ctx.strokeRect(contentX + 1, contentY + 1, contentW - 2, rulerH);
		ctx.fillStyle = "#000000";
		for (let i = 0; i < contentW - 8; i += 10) {
			const x = contentX + 4 + i;
			const h = i % 50 === 0 ? 8 : 4;
			ctx.fillRect(x, contentY + 2, 1, h);
			if (i % 50 === 0) {
				ctx.font = "8px Chicago, Monaco, monospace";
				ctx.fillText(String(i / 50 + 1), x - 2, contentY + 12);
			}
		}

		const toolbarY = contentY + rulerH + 2;
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(contentX + 1, toolbarY, contentW - 2, toolbarH);
		ctx.strokeRect(contentX + 1, toolbarY, contentW - 2, toolbarH);
		ctx.fillStyle = "#000000";
		for (let i = 0; i < 6; i++) {
			const bx = contentX + 6 + i * 18;
			ctx.strokeRect(bx, toolbarY + 3, 12, 10);
			ctx.fillRect(bx + 2, toolbarY + 6, 8, 1);
			if (i % 2 === 0) {
				ctx.fillRect(bx + 2, toolbarY + 9, 8, 1);
			}
		}

		const textY = toolbarY + toolbarH + 10;
		ctx.fillStyle = "#000000";
		ctx.font = "10px Times";
		const indent = Math.round(ctx.measureText("M").width * 2);
		drawWrappedTextWithSingleWordHighlight(
			ctx,
			"The current common wisdom accepts that computers have revolutionized the craft of writing. A half hour of creating words with the Macintosh will convince you, however, that the real revolution in writing has only just begun.",
			contentX + 8,
			textY,
			contentW - 16,
			12,
			indent,
			"revolution",
		);
	}

	return { drawMacWriteContent };
}
