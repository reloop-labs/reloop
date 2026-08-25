import type { UiAssets } from "../assets";
import type { UiState } from "../boot";
import type { Chrome } from "../chrome";
import type { RectManager } from "../rects";

export interface MacPaintScreen {
	drawMacPaintContent: () => void;
}

export function createMacPaintScreen({
	state: _state,
	ctx,
	assets,
	rects,
	chrome,
	clamp,
}: {
	state: UiState;
	ctx: CanvasRenderingContext2D;
	assets: UiAssets;
	rects: RectManager;
	chrome: Chrome;
	clamp: (val: number, min: number, max: number) => number;
}): MacPaintScreen {
	function drawMacPaintContent() {
		const { windowX, windowY, windowWidth, windowHeight } =
			rects.getWindowRect();
		chrome.drawWindow(
			ctx,
			windowX,
			windowY,
			windowWidth,
			windowHeight,
			"Mac Painting",
			{
				scrollbars: false,
			},
		);

		const contentX = windowX + 1;
		const contentY = windowY + 20;
		const clipW = Math.max(0, windowWidth - 2);
		const clipH = Math.max(0, windowHeight - 21);

		ctx.save();
		ctx.beginPath();
		ctx.rect(contentX, contentY, clipW, clipH);
		ctx.clip();

		const contentW = clipW;
		const contentH = clipH;

		const pad = 2;
		const gap = 4;
		const cols = 2;
		const rows = 10;
		const baseCell = 16;

		const maxToolH = Math.max(0, contentH - gap - 2 * pad);
		const cellMaxForHeight = Math.floor((maxToolH - 2) / rows);
		const cell = clamp(cellMaxForHeight, 8, baseCell);
		const toolW = cols * cell + 2;
		const toolX = contentX + pad;
		const toolY = contentY + pad;
		const toolH = rows * cell + 2;

		const bottomY = toolY + toolH + gap;
		const bottomH = Math.max(0, contentY + contentH - bottomY - pad);

		const canvasOuterX = toolX + toolW + gap;
		const canvasOuterY = toolY;
		const canvasOuterW = Math.max(0, contentX + contentW - pad - canvasOuterX);
		const canvasOuterH = Math.max(0, bottomY - canvasOuterY - gap);

		// Work area background
		ctx.fillStyle = "#C0C0C0";
		ctx.fillRect(contentX, contentY, contentW, contentH);
		assets.fillDither25(ctx, contentX, contentY, contentW, contentH);

		// Outer padding solid white
		ctx.fillStyle = "#FFFFFF";
		if (pad > 0) {
			ctx.fillRect(contentX, contentY, contentW, pad);
			ctx.fillRect(contentX, contentY, pad, contentH);
			ctx.fillRect(contentX + contentW - pad, contentY, pad, contentH);
			ctx.fillRect(contentX, contentY + contentH - pad, contentW, pad);
		}

		// White gutters between sections
		ctx.fillStyle = "#FFFFFF";
		const gutterX = toolX + toolW;
		const gutterY = contentY + pad;
		const gutterH = Math.max(0, contentH - pad * 2);
		if (gap > 0 && gutterH > 0) ctx.fillRect(gutterX, gutterY, gap, gutterH);

		const hGutterX = contentX + pad;
		const hGutterY = toolY + toolH;
		const hGutterW = Math.max(0, contentW - pad * 2);
		if (gap > 0 && hGutterW > 0) ctx.fillRect(hGutterX, hGutterY, hGutterW, gap);

		// Toolbox
		const drewToolbox = assets.drawSprite(
			ctx,
			assets.images.macPaintToolbox,
			toolX,
			toolY,
			toolW,
			toolH,
		);
		if (!drewToolbox) {
			ctx.fillStyle = "#FFFFFF";
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 1;
			ctx.fillRect(toolX, toolY, toolW, toolH);
			ctx.strokeRect(toolX, toolY, toolW, toolH);
			ctx.fillStyle = "#000000";
			ctx.fillRect(toolX + 1 + cell, toolY, 1, toolH);
			for (let r = 1; r < rows; r++) {
				ctx.fillRect(toolX, toolY + 1 + r * cell, toolW, 1);
			}
		}

		// Drawing canvas
		ctx.fillStyle = "#000000";
		ctx.fillRect(canvasOuterX, canvasOuterY, canvasOuterW, canvasOuterH);
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(
			canvasOuterX + 2,
			canvasOuterY + 2,
			canvasOuterW - 4,
			canvasOuterH - 4,
		);

		const innerX = canvasOuterX + 4;
		const innerY = canvasOuterY + 4;
		const innerW = canvasOuterW - 8;
		const innerH = canvasOuterH - 8;
		const pxCell = 6;
		const maxGrid = Math.floor(Math.min(innerW, innerH) / pxCell) - 2;
		const grid = clamp(maxGrid, 0, 26);

		if (grid >= 4) {
			const artW = grid * pxCell;
			const artH = grid * pxCell;
			const artX = innerX + Math.floor((innerW - artW) / 2);
			const artY = innerY + Math.floor((innerH - artH) / 2) + 4;

			assets.drawSprite(ctx, assets.images.earthIcon, artX, artY, artW, artH);
		}

		// Preview box
		const previewMaxSize = Math.min(34, canvasOuterW - 4, canvasOuterH - 4);
		const previewSize = Math.max(0, Math.floor(previewMaxSize));
		if (previewSize >= 10) {
			const previewX = canvasOuterX + 2;
			const previewY = canvasOuterY + 2;
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(previewX, previewY, previewSize, previewSize);
			ctx.strokeRect(previewX, previewY, previewSize, previewSize);

			const pArtW = Math.max(0, previewSize - 4);
			if (pArtW > 0) {
				const pArtX = previewX + Math.floor((previewSize - pArtW) / 2);
				const pArtY = previewY + Math.floor((previewSize - pArtW) / 2);
				assets.drawSprite(
					ctx,
					assets.images.earthIcon,
					pArtX,
					pArtY,
					pArtW,
					pArtW,
				);
			}
		}

		// Line thickness palette
		ctx.fillStyle = "#FFFFFF";
		ctx.strokeStyle = "#000000";
		ctx.fillRect(toolX, bottomY, toolW, bottomH);
		ctx.strokeRect(toolX, bottomY, toolW, bottomH);
		if (bottomH >= 14) {
			ctx.strokeStyle = "#000000";
			ctx.beginPath();
			ctx.moveTo(toolX + 4, bottomY + 10);
			ctx.lineTo(toolX + 7, bottomY + 13);
			ctx.lineTo(toolX + 12, bottomY + 6);
			ctx.stroke();
		}

		const widths = [1, 2, 3, 4];
		const offsets = [18, 26, 34, 42];
		for (let i = 0; i < widths.length; i++) {
			const offset = offsets[i] ?? 0;
			const lineWidthVal = widths[i] ?? 1;
			const y = bottomY + offset;
			if (y < bottomY + bottomH - 2) {
				ctx.lineWidth = lineWidthVal;
				ctx.beginPath();
				ctx.moveTo(toolX + 4, y);
				ctx.lineTo(toolX + toolW - 4, y);
				ctx.stroke();
			}
		}
		ctx.lineWidth = 1;

		// Patterns
		const patX = canvasOuterX;
		const patY = bottomY;
		const patW = canvasOuterW;
		const patH = bottomH;
		ctx.fillStyle = "#FFFFFF";
		ctx.strokeStyle = "#000000";
		ctx.fillRect(patX, patY, patW, patH);
		ctx.strokeRect(patX, patY, patW, patH);

		const well = Math.min(18, Math.max(0, patH - 14));
		if (well > 0) {
			const foreX = patX + 8;
			const foreY = patY + 7;
			ctx.fillStyle = "#000000";
			ctx.fillRect(foreX, foreY, well, well);
			ctx.strokeStyle = "#000000";
			ctx.strokeRect(foreX, foreY, well, well);
		}

		const sw = 12;
		const swGap = 3;
		const swRows = 2;
		const swStartX = patX + well + 26;
		const swStartY = patY + 6;
		const swAvailW = patX + patW - 6 - swStartX;
		const swCols = Math.max(1, Math.floor((swAvailW + swGap) / (sw + swGap)));

		const atlas = assets.images.macPaintPatterns;
		const atlasCols = 5;
		const atlasCell = 12;

		let pIdx = 0;
		for (let r = 0; r < swRows; r++) {
			for (let c = 0; c < swCols; c++) {
				const sx = swStartX + c * (sw + swGap);
				const sy = swStartY + r * (sw + swGap);
				if (sx + sw > patX + patW - 6) continue;
				if (sy + sw > patY + patH - 6) continue;

				ctx.fillStyle = "#FFFFFF";
				ctx.fillRect(sx, sy, sw, sw);
				ctx.strokeStyle = "#000000";
				ctx.strokeRect(sx, sy, sw, sw);

				const atlasIdx = pIdx % 10;
				const srcX = (atlasIdx % atlasCols) * atlasCell;
				const srcY = Math.floor(atlasIdx / atlasCols) * atlasCell;
				assets.drawSpriteCrop(
					ctx,
					atlas,
					srcX,
					srcY,
					atlasCell,
					atlasCell,
					sx,
					sy,
					sw,
					sw,
				);
				pIdx++;
			}
		}

		ctx.restore();
	}

	return { drawMacPaintContent };
}
