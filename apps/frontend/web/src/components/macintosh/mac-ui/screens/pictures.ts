import type { UiAssets } from "../assets";
import type { Chrome } from "../chrome";
import type { RectManager } from "../rects";

export interface PicturesScreen {
	drawPicturesContent: () => void;
}

export function createPicturesScreen({
	ctx,
	assets,
	rects,
	chrome,
	clamp,
}: {
	ctx: CanvasRenderingContext2D;
	assets: UiAssets;
	rects: RectManager;
	chrome: Chrome;
	clamp: (val: number, min: number, max: number) => number;
}): PicturesScreen {
	function splitPictureFilename(filename: string): string[] {
		const textValue = String(filename);
		const lastDash = textValue.lastIndexOf("-");
		if (lastDash > 0 && lastDash < textValue.length - 1) {
			return [
				textValue.slice(0, lastDash + 1),
				textValue.slice(lastDash + 1),
			];
		}
		return [textValue];
	}

	function drawThumbLabel(
		ctx2: CanvasRenderingContext2D,
		textValue: string,
		centerX: number,
		baselineY: number,
		maxWidth: number,
	) {
		const fontPx = 6;
		const lineHeight = fontPx + 1;
		const bottomPad = 3;
		const lines = splitPictureFilename(textValue).slice(0, 2);

		ctx2.save();
		ctx2.font = `${fontPx}px Chicago, Monaco, monospace`;
		ctx2.fillStyle = "#000000";
		ctx2.textAlign = "center";
		ctx2.beginPath();
		ctx2.rect(
			Math.round(centerX - maxWidth / 2),
			Math.round(baselineY - fontPx),
			Math.round(maxWidth),
			Math.round(
				fontPx + bottomPad + Math.max(0, lines.length - 1) * lineHeight,
			),
		);
		ctx2.clip();
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line) ctx2.fillText(line, centerX, baselineY + i * lineHeight);
		}
		ctx2.restore();
	}

	function drawPicturesContent() {
		const { windowX, windowY, windowWidth, windowHeight } =
			rects.getWindowRect();
		chrome.drawWindow(
			ctx,
			windowX,
			windowY,
			windowWidth,
			windowHeight,
			"Pictures",
		);
		const contentX = windowX + 1;
		const contentY = windowY + 20;
		const contentW = Math.max(0, windowWidth - 17);
		const contentH = Math.max(0, windowHeight - 36);
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(contentX, contentY, contentW, contentH);
		ctx.strokeStyle = "#000000";
		ctx.strokeRect(contentX, contentY, contentW, contentH);

		const thumbW = 24;
		const thumbH = 24;
		const gap = 42;
		const labelMaxW = thumbW + gap;
		const labelFontPx = 6;
		const labelLineHeight = labelFontPx + 1;
		const labelTopGap = 2;
		const labelBottomPad = 3;
		const labelAreaH =
			labelTopGap + labelFontPx + labelLineHeight + labelBottomPad;
		const cellH = thumbH + labelAreaH;

		const items = [
			{ img: assets.images.picturesThumb1, label: "pictures-thumb-1.svg" },
			{ img: assets.images.picturesThumb2, label: "pictures-thumb-2.svg" },
			{ img: assets.images.picturesThumb3, label: "pictures-thumb-3.svg" },
		];

		ctx.save();
		ctx.beginPath();
		ctx.rect(contentX, contentY, contentW, contentH);
		ctx.clip();

		const count = items.length;
		const sidePad = Math.min(10, Math.floor(contentW / 2));
		const desiredTopPad = 24;
		const bottomPad = Math.min(10, Math.floor(contentH / 2));
		const areaW = Math.max(0, contentW - sidePad * 2);

		const maxCols = Math.max(1, Math.floor((areaW + gap) / (thumbW + gap)));
		const cols = Math.min(count, maxCols);
		const rows = Math.ceil(count / cols);

		let gapY = gap;
		if (rows > 1) {
			const availableForGaps = contentH - bottomPad - rows * cellH;
			gapY = clamp(Math.floor(availableForGaps / (rows - 1)), 0, gap);
		}

		const neededH = rows * cellH + (rows - 1) * gapY;
		const topPadMax = Math.max(0, contentH - bottomPad - neededH);
		const topPad = Math.min(desiredTopPad, topPadMax);
		const startY = contentY + topPad;

		let idx = 0;
		for (let r = 0; r < rows; r++) {
			const itemsInRow = Math.min(cols, count - r * cols);
			if (itemsInRow <= 0) break;

			const rowW = itemsInRow * thumbW + (itemsInRow - 1) * gap;
			const extraX = Math.max(0, Math.floor((areaW - rowW) / 2));
			const rowX = contentX + sidePad + extraX;
			const y = Math.round(startY + r * (cellH + gapY));

			for (let c = 0; c < itemsInRow; c++) {
				const x = Math.round(rowX + c * (thumbW + gap));
				const item = items[idx];
				if (item) {
					const drew = assets.drawSprite(ctx, item.img, x, y, thumbW, thumbH);
					if (!drew) {
						ctx.fillStyle = "#FFFFFF";
						ctx.fillRect(x, y, thumbW, thumbH);
						ctx.strokeStyle = "#000000";
						ctx.strokeRect(x, y, thumbW, thumbH);
						ctx.strokeRect(x + 4, y + 4, thumbW - 8, thumbH - 8);
					}

					const labelCenterX = x + thumbW / 2;
					const labelBaselineY = y + thumbH + labelTopGap + labelFontPx;
					drawThumbLabel(
						ctx,
						item.label,
						labelCenterX,
						labelBaselineY,
						labelMaxW,
					);
				}
				idx++;
			}
		}

		ctx.restore();
	}

	return { drawPicturesContent };
}
