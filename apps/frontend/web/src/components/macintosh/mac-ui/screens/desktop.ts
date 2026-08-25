import type { UiAssets } from "../assets";
import type { UiState } from "../boot";
import type { Chrome } from "../chrome";
import type { RectManager } from "../rects";
import type * as text from "../text";
import type { ViewportHelpers } from "../viewports";

export interface TrashIconLayout {
	canX: number;
	canY: number;
	canW: number;
	canH: number;
	labelText: string;
	labelCenterX: number;
	labelBaselineY: number;
	labelX: number;
	labelY: number;
	labelW: number;
	labelH: number;
	bounds: { x: number; y: number; w: number; h: number };
}

export interface DesktopIconLayout {
	clipRect: { x: number; y: number; w: number; h: number };
	icons: Record<
		string,
		{
			x: number;
			y: number;
			w: number;
			h: number;
			iconX: number;
			iconY: number;
		}
	>;
}

export interface TrashItemLayout {
	clipRect: { x: number; y: number; w: number; h: number };
	item: {
		x: number;
		y: number;
		w: number;
		h: number;
		iconX: number;
		iconY: number;
	};
}

export interface DesktopScreen {
	getTrashIconLayout: () => TrashIconLayout;
	drawDesktopTrashIcon: (ctx2?: CanvasRenderingContext2D) => void;
	getDesktopIconLayout: (
		windowX: number,
		windowY: number,
		windowWidth: number,
		windowHeight: number,
	) => DesktopIconLayout;
	drawDesktopWindow: () => void;
	getTrashWindowItemLayout: (
		windowX: number,
		windowY: number,
		windowWidth: number,
		windowHeight: number,
	) => TrashItemLayout;
	drawTrashWindow: () => void;
	drawVideoWindow: () => void;
}

export function createDesktopScreen({
	state,
	ctx,
	assets,
	rects,
	chrome,
	text: textHelpers,
	viewports,
}: {
	state: UiState;
	ctx: CanvasRenderingContext2D;
	assets: UiAssets;
	rects: RectManager;
	chrome: Chrome;
	text: typeof text;
	viewports: ViewportHelpers;
}): DesktopScreen {
	const { fillTextFauxBold, fillTextWithTracking } = textHelpers;

	function getTrashIconLayout(): TrashIconLayout {
		const canW = 20;
		const canH = 28;
		const labelText = "Trash";

		ctx.save();
		ctx.font = "bold 10px Chicago, Monaco, monospace";
		const labelTextW = ctx.measureText(labelText).width;
		ctx.restore();

		const labelPadX = 6;
		const labelPadY = 3;
		const labelW = Math.round(labelTextW + labelPadX * 0.8);
		const labelH = 14;

		const marginR = 142;
		const marginB = 42;

		const labelCenterX = Math.round(
			state.width - marginR - Math.max(canW, labelW) / 2,
		);
		const labelBaselineY = Math.round(state.height - marginB);

		const labelX = Math.round(labelCenterX - labelW / 2);
		const labelY = Math.round(labelBaselineY - labelH + labelPadY);

		const canX = Math.round(labelCenterX - canW / 2);
		const canY = Math.round(labelY - 6 - canH);

		const boundsX = Math.min(canX, labelX);
		const boundsY = Math.min(canY, labelY);
		const boundsW = Math.max(canX + canW, labelX + labelW) - boundsX;
		const boundsH = Math.max(canY + canH, labelY + labelH) - boundsY;

		return {
			canX,
			canY,
			canW,
			canH,
			labelText,
			labelCenterX,
			labelBaselineY,
			labelX,
			labelY,
			labelW,
			labelH,
			bounds: { x: boundsX, y: boundsY, w: boundsW, h: boundsH },
		};
	}

	function drawDesktopTrashIcon(ctx2: CanvasRenderingContext2D = ctx) {
		const layout = getTrashIconLayout();
		const {
			canX,
			canY,
			labelText,
			labelCenterX,
			labelBaselineY,
			labelX,
			labelY,
			labelW,
			labelH,
		} = layout;

		ctx2.save();
		ctx2.imageSmoothingEnabled = false;
		ctx2.font = "bold 10px Chicago, Monaco, monospace";

		assets.drawSprite(
			ctx2,
			assets.images.trashIcon,
			canX,
			canY,
			layout.canW,
			layout.canH,
		);

		ctx2.fillStyle = "#FFFFFF";
		ctx2.fillRect(labelX, labelY, labelW, labelH);
		ctx2.fillStyle = "#000000";
		ctx2.textAlign = "center";
		ctx2.textBaseline = "alphabetic";
		ctx2.fillText(labelText, labelCenterX, labelBaselineY);
		ctx2.fillText(labelText, labelCenterX + 1, labelBaselineY);

		ctx2.restore();
	}

	function getDesktopIconLayout(
		windowX: number,
		windowY: number,
		windowWidth: number,
		windowHeight: number,
	): DesktopIconLayout {
		const scrollWidth = 16;
		const contentX = windowX + 1;
		const contentWidth = windowWidth - (scrollWidth + 1);
		const contentBottomY = windowY + windowHeight - scrollWidth;

		const clipX = contentX;
		const clipY = windowY + 42;
		const clipW = Math.max(0, contentWidth);
		const clipH = Math.max(0, contentBottomY - clipY);

		const cellW = 60;
		const cellH = 74;

		const cols = Math.max(1, Math.floor(clipW / cellW));

		const startX = clipX + 2;
		const startY = clipY + 10;

		const ids = ["macwrite", "macpaint", "pictures"];
		const icons: DesktopIconLayout["icons"] = {};
		ids.forEach((id, idx) => {
			const col = idx % cols;
			const row = Math.floor(idx / cols);
			const x = Math.round(startX + col * cellW);
			const y = Math.round(startY + row * cellH);
			const iconX = Math.round(x + (cellW - 32) / 2);
			const iconY = Math.round(y + 2);
			icons[id] = { x, y, w: cellW, h: cellH, iconX, iconY };
		});

		return { clipRect: { x: clipX, y: clipY, w: clipW, h: clipH }, icons };
	}

	function measureMultilineTextWidth(
		ctx2: CanvasRenderingContext2D,
		textValue: string,
	): number {
		const lines = String(textValue).split("\n");
		let maxW = 0;
		for (const line of lines) {
			maxW = Math.max(maxW, ctx2.measureText(line).width);
		}
		return maxW;
	}

	function drawIconLabel(
		ctx2: CanvasRenderingContext2D,
		textValue: string,
		centerX: number,
		baselineY: number,
		maxWidth: number,
		fontPx = 8,
	) {
		const lines = String(textValue).split("\n");
		const lineHeight = fontPx + 2;
		const bottomPad = 4;

		ctx2.save();
		ctx2.font = `${fontPx}px Chicago, Monaco, monospace`;
		ctx2.fillStyle = "#000000";
		ctx2.textAlign = "center";
		ctx2.beginPath();
		ctx2.rect(
			centerX - maxWidth / 2,
			baselineY - fontPx,
			maxWidth,
			fontPx + bottomPad + Math.max(0, lines.length - 1) * lineHeight,
		);
		ctx2.clip();
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line) ctx2.fillText(line, centerX, baselineY + i * lineHeight);
		}
		ctx2.restore();
	}

	function drawIconSpriteWithLabel(
		ctx2: CanvasRenderingContext2D,
		img: HTMLImageElement,
		label: string,
		x: number,
		y: number,
	) {
		assets.drawSprite(ctx2, img, x, y, 32, 32);
		drawIconLabel(ctx2, label, x + 16, y + 52, 44);
	}

	function drawWindowContent(
		ctx2: CanvasRenderingContext2D,
		windowX: number,
		windowY: number,
		windowWidth: number,
		windowHeight: number,
	) {
		const contentWidth = windowWidth - 17;
		ctx2.fillStyle = "#FFFFFF";
		ctx2.fillRect(windowX + 1, windowY + 20, contentWidth, 18);
		ctx2.fillStyle = "#000000";
		ctx2.fillRect(windowX + 1, windowY + 38, contentWidth, 1);
		ctx2.fillRect(windowX + 1, windowY + 40, contentWidth, 1);
		ctx2.font = "bold 8px Chicago, Monaco, monospace";

		const infoY = windowY + 33;
		const leftText = "3\u2009items";
		const centerText = "322K in disk";
		const rightText = "68K available";

		const leftX = windowX + 8;
		const centerX = windowX + contentWidth / 2;
		const rightX = windowX + contentWidth - 6;

		const leftW = ctx2.measureText(leftText).width + 2;
		const centerW = ctx2.measureText(centerText).width + 2;
		const rightW = ctx2.measureText(rightText).width + 2;

		const leftRange = { a: leftX, b: leftX + leftW };
		const rightRange = { a: rightX - rightW, b: rightX };
		const centerRange = { a: centerX - centerW / 2, b: centerX + centerW / 2 };

		fillTextFauxBold(ctx2, leftText, leftX, infoY, 1);

		const canDrawRight = rightRange.a > leftRange.b + 8;
		if (canDrawRight) {
			ctx2.textAlign = "right";
			fillTextWithTracking(ctx2, rightText, rightX, infoY, -0.6, "right", 1);
		}

		const centerOverlapsLeft = centerRange.a < leftRange.b + 8;
		const centerOverlapsRight =
			canDrawRight && centerRange.b > rightRange.a - 8;
		if (!centerOverlapsLeft && !centerOverlapsRight) {
			ctx2.textAlign = "center";
			fillTextWithTracking(ctx2, centerText, centerX, infoY, -1.0, "center", 1);
		}
		ctx2.textAlign = "left";

		const layout = getDesktopIconLayout(
			windowX,
			windowY,
			windowWidth,
			windowHeight,
		);
		const { clipRect, icons } = layout;
		if (clipRect.w > 0 && clipRect.h > 0) {
			ctx2.save();
			ctx2.beginPath();
			ctx2.rect(clipRect.x, clipRect.y, clipRect.w, clipRect.h);
			ctx2.clip();
			if (icons.macwrite) {
				drawIconSpriteWithLabel(
					ctx2,
					assets.images.macWriteIcon,
					"MacWrite",
					icons.macwrite.iconX,
					icons.macwrite.iconY,
				);
			}
			if (icons.macpaint) {
				drawIconSpriteWithLabel(
					ctx2,
					assets.images.macPaintIcon,
					"MacPaint",
					icons.macpaint.iconX,
					icons.macpaint.iconY,
				);
			}
			if (icons.pictures) {
				drawIconSpriteWithLabel(
					ctx2,
					assets.images.folderIcon,
					"Pictures",
					icons.pictures.iconX,
					icons.pictures.iconY + 2,
				);
			}
			ctx2.restore();
		}
	}

	function getTrashWindowItemLayout(
		windowX: number,
		windowY: number,
		windowWidth: number,
		windowHeight: number,
	): TrashItemLayout {
		const scrollWidth = 16;
		const contentX = windowX + 1;
		const contentWidth = windowWidth - (scrollWidth + 1);
		const contentBottomY = windowY + windowHeight - scrollWidth;

		const clipX = contentX;
		const clipY = windowY + 42;
		const clipW = Math.max(0, contentWidth);
		const clipH = Math.max(0, contentBottomY - clipY);

		const cellW = 64;
		const cellH = 74;

		const padX = 12;
		const maxOffsetX = Math.max(0, clipW - cellW);
		const startX = Math.round(clipX + Math.min(padX, maxOffsetX));
		const startY = clipY + 10;

		const x = Math.round(startX);
		const y = Math.round(startY);
		const iconX = Math.round(x + (cellW - 32) / 2);
		const iconY = Math.round(y + 2);

		return {
			clipRect: { x: clipX, y: clipY, w: clipW, h: clipH },
			item: { x, y, w: cellW, h: cellH, iconX, iconY },
		};
	}

	function drawTrashWindowContent(
		ctx2: CanvasRenderingContext2D,
		windowX: number,
		windowY: number,
		windowWidth: number,
		windowHeight: number,
	) {
		const contentWidth = Math.max(0, windowWidth - 17);
		ctx2.fillStyle = "#FFFFFF";
		ctx2.fillRect(windowX + 1, windowY + 20, contentWidth, 18);
		ctx2.fillStyle = "#000000";
		ctx2.fillRect(windowX + 1, windowY + 38, contentWidth, 1);
		ctx2.fillRect(windowX + 1, windowY + 40, contentWidth, 1);
		ctx2.font = "bold 8px Chicago, Monaco, monospace";

		const infoY = windowY + 33;
		const leftText = "1\u2009item";
		const centerText = "2.8\u2009MB in disk";
		const rightText = "123.1\u2009MB available";

		const leftX = windowX + 8;
		const centerX = windowX + contentWidth / 2;
		const rightX = windowX + contentWidth - 6;

		const leftW = ctx2.measureText(leftText).width + 2;
		const centerW = ctx2.measureText(centerText).width + 2;
		const rightW = ctx2.measureText(rightText).width + 2;

		const leftRange = { a: leftX, b: leftX + leftW };
		const rightRange = { a: rightX - rightW, b: rightX };
		const centerRange = { a: centerX - centerW / 2, b: centerX + centerW / 2 };

		fillTextFauxBold(ctx2, leftText, leftX, infoY, 1);

		const canDrawRight = rightRange.a > leftRange.b + 8;
		if (canDrawRight) {
			ctx2.textAlign = "right";
			fillTextWithTracking(ctx2, rightText, rightX, infoY, -0.6, "right", 1);
		}

		const centerOverlapsLeft = centerRange.a < leftRange.b + 8;
		const centerOverlapsRight =
			canDrawRight && centerRange.b > rightRange.a - 8;
		if (!centerOverlapsLeft && !centerOverlapsRight) {
			ctx2.textAlign = "center";
			fillTextWithTracking(ctx2, centerText, centerX, infoY, -1.0, "center", 1);
		}
		ctx2.textAlign = "left";

		const layout = getTrashWindowItemLayout(
			windowX,
			windowY,
			windowWidth,
			windowHeight,
		);
		const { clipRect, item } = layout;
		if (clipRect.w > 0 && clipRect.h > 0) {
			ctx2.save();
			ctx2.beginPath();
			ctx2.rect(clipRect.x, clipRect.y, clipRect.w, clipRect.h);
			ctx2.clip();

			if (state.trashVideoOpen) {
				ctx2.fillStyle = "#000000";
				ctx2.fillRect(clipRect.x, clipRect.y, clipRect.w, clipRect.h);
			} else {
				const titleText = "Macintosh\u20091984\nCommercial";
				const labelBaselineY = item.iconY + 52;
				const availableLabelW = Math.max(0, Math.floor(clipRect.w - 8));
				const desiredCenterX = item.iconX + 16;

				let fontPx = 8;
				ctx2.save();
				ctx2.textAlign = "center";
				for (const size of [8, 7, 6]) {
					ctx2.font = `${size}px Chicago, Monaco, monospace`;
					if (
						measureMultilineTextWidth(ctx2, titleText) <= availableLabelW ||
						availableLabelW <= 0
					) {
						fontPx = size;
						break;
					}
				}
				const desiredLabelW =
					Math.ceil(measureMultilineTextWidth(ctx2, titleText)) + 2;
				ctx2.restore();

				const labelW = Math.max(44, Math.min(availableLabelW, desiredLabelW));
				const minCenterX = clipRect.x + labelW / 2;
				const maxCenterX = clipRect.x + clipRect.w - labelW / 2;
				const labelCenterX =
					minCenterX <= maxCenterX
						? Math.min(maxCenterX, Math.max(minCenterX, desiredCenterX))
						: clipRect.x + clipRect.w / 2;

				assets.drawSprite(
					ctx2,
					assets.images.trashVideoIcon,
					item.iconX,
					item.iconY,
					32,
					32,
				);
				drawIconLabel(
					ctx2,
					titleText,
					labelCenterX,
					labelBaselineY,
					labelW,
					fontPx,
				);
			}

			ctx2.restore();
		}
	}

	function drawVideoWindowContent(
		ctx2: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
	) {
		const vp = viewports.getVideoViewportRectForWindow(x, y, width, height);
		ctx2.save();
		ctx2.fillStyle = "#000000";
		ctx2.fillRect(vp.x, vp.y, vp.w, vp.h);
		ctx2.restore();
	}

	function drawDesktopWindow() {
		const { windowX, windowY, windowWidth, windowHeight } =
			rects.getWindowRect();
		chrome.drawWindow(
			ctx,
			windowX,
			windowY,
			windowWidth,
			windowHeight,
			"Write/Paint",
		);
		drawWindowContent(ctx, windowX, windowY, windowWidth, windowHeight);
	}

	function drawTrashWindow() {
		rects.ensureTrashWindowRect();
		const r = state.trashWindowRect;
		if (!r) return;
		const title = state.trashVideoOpen ? "Macintosh\u20091984" : "Trash";
		chrome.drawWindow(ctx, r.x, r.y, r.width, r.height, title);
		drawTrashWindowContent(ctx, r.x, r.y, r.width, r.height);
	}

	function drawVideoWindow() {
		rects.ensureVideoWindowRect();
		const r = state.videoWindowRect;
		if (!r) return;
		chrome.drawWindow(
			ctx,
			r.x,
			r.y,
			r.width,
			r.height,
			"Macintosh\u20091984\u2009Commercial",
		);
		drawVideoWindowContent(ctx, r.x, r.y, r.width, r.height);
	}

	return {
		getTrashIconLayout,
		drawDesktopTrashIcon,
		getDesktopIconLayout,
		drawDesktopWindow,
		getTrashWindowItemLayout,
		drawTrashWindow,
		drawVideoWindow,
	};
}
