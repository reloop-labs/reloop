import type { UiAssets } from "./assets";
import { getThemeTokens } from "./theme";

export interface ChromeConstants {
	CANVAS_SCALE: number;
	TOP_INSET: number;
	LEFT_INSET: number;
	WINDOW_MIN_W: number;
	WINDOW_MIN_H: number;
	TRASH_WINDOW_MIN_W: number;
	TRASH_WINDOW_MIN_H: number;
	VIDEO_WINDOW_MIN_W: number;
	VIDEO_WINDOW_MIN_H: number;
}

export interface Chrome {
	drawBackground: (
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) => void;
	drawMenuBar: (
		ctx: CanvasRenderingContext2D,
		width: number,
		menu?: string[] | string | null,
	) => void;
	drawWindow: (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
		title: string,
		options?: { scrollbars?: boolean },
	) => void;
}

export function createChrome({
	constants,
	assets,
}: {
	constants: ChromeConstants;
	assets: UiAssets;
}): Chrome {
	const { TOP_INSET, LEFT_INSET } = constants;
	const LARGE_DESKTOP_PATTERN_SCALE = 0.25;

	function drawBackground(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) {
		const { isDark, desktopBg, desktopDither } = getThemeTokens();
		const pattern = assets.getDesktopPattern();
		if (pattern) {
			const img = assets?.images?.desktopPattern;
			const scale =
				img && (img.naturalWidth > 256 || img.naturalHeight > 256)
					? LARGE_DESKTOP_PATTERN_SCALE
					: 1;

			ctx.save();
			if (isDark) ctx.filter = "invert(0.9) brightness(0.4)";
			if (scale !== 1) ctx.scale(scale, scale);
			ctx.fillStyle = pattern;
			ctx.fillRect(0, 0, width / scale, height / scale);
			ctx.restore();
			return;
		}

		ctx.fillStyle = desktopBg;
		ctx.fillRect(0, 0, width, height);
		ctx.fillStyle = desktopDither;
		for (let y = 0; y < height; y += 2) {
			for (let x = y % 4 === 0 ? 0 : 2; x < width; x += 4) {
				ctx.fillRect(x, y, 1, 1);
			}
		}
	}

	function drawMenuBar(
		ctx: CanvasRenderingContext2D,
		width: number,
		menu: string[] | string | null = null,
	) {
		const { menuBg, menuText, menuBorder } = getThemeTokens();
		const y = TOP_INSET;
		const x = LEFT_INSET;
		const barBaseH = 16;
		const extraTop = TOP_INSET;
		const textLift = 3;
		const barY = y - extraTop;
		const barH = barBaseH + extraTop;

		ctx.fillStyle = menuBg;
		ctx.fillRect(x, barY, width - x, barH);
		ctx.fillStyle = menuBorder;
		ctx.fillRect(x, y + barBaseH - 1, width - x, 1);
		ctx.font = "bold 10px Chicago, Monaco, monospace";
		ctx.fillStyle = menuText;
		ctx.fillText("\uF8FF", x + 8, y + 13 - textLift);

		const menuItems = Array.isArray(menu)
			? menu
			: menu
				? [menu]
				: ["File", "Edit", "View", "Special"];
		let xPos = x + 24;
		ctx.font = "bold 8px Chicago, Monaco, monospace";
		menuItems.forEach((item) => {
			ctx.fillText(item, xPos, y + 14 - textLift);
			xPos += ctx.measureText(item).width + 10;
		});
	}

	function drawArrow(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		direction: "up" | "down" | "left" | "right",
	) {
		const { isDark } = getThemeTokens();
		const arrowImg = assets?.images?.arrow;
		if (arrowImg && assets.isImageReady?.(arrowImg)) {
			const angleByDir = {
				left: 0,
				up: Math.PI / 2,
				right: Math.PI,
				down: -Math.PI / 2,
			};
			const angle = angleByDir[direction];
			if (!Number.isFinite(angle)) return;

			const iconBox = 12;
			const imgW = arrowImg.naturalWidth || 33;
			const imgH = arrowImg.naturalHeight || 34;
			const k = iconBox / Math.max(1, Math.max(imgW, imgH));
			const dw = Math.max(1, Math.round(imgW * k));
			const dh = Math.max(1, Math.round(imgH * k));

			ctx.save();
			ctx.translate(Math.round(x), Math.round(y));
			ctx.rotate(angle);
			if (isDark) ctx.filter = "invert(1)";
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(
				arrowImg,
				Math.round(-dw / 2),
				Math.round(-dh / 2),
				dw,
				dh,
			);
			ctx.restore();
			return;
		}

		const glyphs: Record<string, string[]> = {
			left: [
				"......#",
				"....#.#",
				"..#...#",
				"#.....#",
				"..#...#",
				"....#.#",
				"......#",
			],
			right: [
				"#......",
				"#.#....",
				"#...#..",
				"#.....#",
				"#...#..",
				"#.#....",
				"#......",
			],
			up: [
				"...#...",
				"..#.#..",
				".#...#.",
				"#.....#",
				"#.....#",
				"#.....#",
				"#######",
			],
			down: [
				"#######",
				"#.....#",
				"#.....#",
				"#.....#",
				".#...#.",
				"..#.#..",
				"...#...",
			],
		};
		const g = glyphs[direction];
		if (!g || !g[0]) return;

		ctx.save();
		ctx.fillStyle = "#000000";
		const h = g.length;
		const w = g[0].length;
		const sx = Math.round(x) - Math.floor(w / 2);
		const sy = Math.round(y) - Math.floor(h / 2);
		for (let yy = 0; yy < h; yy++) {
			const row = g[yy];
			if (!row) continue;
			for (let xx = 0; xx < w; xx++) {
				if (row[xx] === "#") ctx.fillRect(sx + xx, sy + yy, 1, 1);
			}
		}
		ctx.restore();
	}

	function drawScrollBars(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
	) {
		const { isDark, scrollTrack, scrollThumb, scrollBorder } = getThemeTokens();
		const scrollWidth = 16;

		// Vertical scrollbar
		const vX = x + width - scrollWidth;
		const vY = y + 20;
		const vW = scrollWidth;
		const vH = height - 36;

		ctx.fillStyle = scrollTrack;
		ctx.fillRect(vX, vY, vW, vH);
		ctx.strokeStyle = scrollBorder;
		ctx.strokeRect(vX, vY, vW, vH);

		ctx.fillStyle = scrollBorder;
		ctx.fillRect(vX, vY + scrollWidth, vW, 1);
		ctx.fillRect(vX, vY + vH - scrollWidth, vW, 1);

		drawArrow(ctx, vX + vW / 2, vY + scrollWidth / 2, "up");
		drawArrow(ctx, vX + vW / 2, vY + vH - scrollWidth / 2, "down");

		const vTrackX = vX + 1;
		const vTrackY = vY + scrollWidth + 1;
		const vTrackW = vW - 2;
		const vTrackH = vH - scrollWidth * 2 - 2;
		assets.fillDither25(
			ctx,
			vTrackX + 1,
			vTrackY + 1,
			vTrackW - 2,
			vTrackH - 2,
		);

		const vThumbSize = vTrackW;
		const vThumbX = vTrackX;
		const vThumbY = vTrackY;
		ctx.fillStyle = scrollThumb;
		ctx.fillRect(vThumbX, vThumbY, vThumbSize, vThumbSize);
		ctx.strokeStyle = scrollBorder;
		ctx.strokeRect(vThumbX, vThumbY, vThumbSize, vThumbSize);

		// Horizontal scrollbar
		ctx.fillStyle = scrollTrack;
		const hX = x;
		const hY = y + height - scrollWidth;
		const hW = width - scrollWidth;
		const hH = scrollWidth;
		ctx.fillRect(hX, hY, hW, hH);
		ctx.strokeStyle = scrollBorder;
		ctx.strokeRect(hX, hY, hW, hH);

		ctx.fillStyle = scrollBorder;
		ctx.fillRect(hX + scrollWidth, hY, 1, hH);
		ctx.fillRect(hX + hW - scrollWidth, hY, 1, hH);

		drawArrow(ctx, hX + scrollWidth / 2, hY + scrollWidth / 2, "left");
		drawArrow(ctx, hX + hW - scrollWidth / 2, hY + scrollWidth / 2, "right");

		const trackX = hX + scrollWidth + 1;
		const trackY = hY + 1;
		const trackW = hW - scrollWidth * 2 - 2;
		const trackH = hH - 2;
		assets.fillDither25(ctx, trackX + 1, trackY + 1, trackW - 2, trackH - 2);

		const thumbSize = trackH;
		const thumbX = trackX;
		const thumbY = trackY;
		ctx.fillStyle = scrollThumb;
		ctx.fillRect(thumbX, thumbY, thumbSize, thumbSize);
		ctx.strokeStyle = scrollBorder;
		ctx.strokeRect(thumbX, thumbY, thumbSize, thumbSize);

		// Grow box
		ctx.fillStyle = scrollTrack;
		const gbX = x + width - scrollWidth;
		const gbY = y + height - scrollWidth;
		ctx.fillRect(gbX, gbY, scrollWidth, scrollWidth);

		const resizeImg = assets?.images?.resize;
		if (resizeImg && assets.isImageReady?.(resizeImg)) {
			const pad = 1;
			const iw = Math.max(0, scrollWidth - pad * 2);
			const ih = Math.max(0, scrollWidth - pad * 2);
			ctx.save();
			if (isDark) ctx.filter = "invert(1)";
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(
				resizeImg,
				Math.round(gbX + pad),
				Math.round(gbY + pad),
				iw,
				ih,
			);
			ctx.restore();
		} else {
			ctx.fillStyle = scrollBorder;
			for (let i = 0; i < 4; i++) {
				ctx.fillRect(x + width - 12 + i * 2, y + height - 4, 1, 1);
				ctx.fillRect(x + width - 4, y + height - 12 + i * 2, 1, 1);
			}
		}

		ctx.strokeStyle = scrollBorder;
		ctx.strokeRect(gbX, gbY, scrollWidth, scrollWidth);
	}

	function drawWindow(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
		title: string,
		options: { scrollbars?: boolean } = {},
	) {
		const { windowBg, windowText, windowBorder, windowShadow } =
			getThemeTokens();
		ctx.fillStyle = windowShadow;
		ctx.fillRect(x + 2, y + 2, width, height);
		ctx.fillStyle = windowBg;
		ctx.fillRect(x, y, width, height);
		ctx.strokeStyle = windowBorder;
		ctx.lineWidth = 1;
		ctx.strokeRect(x, y, width, height);
		ctx.fillStyle = windowBg;
		ctx.fillRect(x + 1, y + 1, width - 2, 18);
		ctx.fillStyle = windowBorder;
		const stripesX = x + 24;
		const stripesW = Math.max(0, width - 28);
		for (let yy = y + 2; yy <= y + 17; yy += 2) {
			ctx.fillRect(stripesX, yy, stripesW, 1);
		}
		ctx.fillRect(x, y + 19, width, 1);
		ctx.strokeRect(x + 7, y + 3, 14, 14);

		ctx.save();
		ctx.font = "bold 13px Chicago, Monaco, monospace";
		const titleWidth = ctx.measureText(title).width;
		ctx.fillStyle = windowBg;
		ctx.fillRect(
			x + width / 2 - titleWidth / 2 - 8,
			y + 1,
			titleWidth + 16,
			18,
		);
		ctx.fillStyle = windowText;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(title, x + width / 2, y + 10);
		ctx.restore();

		if (options.scrollbars !== false)
			drawScrollBars(ctx, x, y, width, height);
	}

	return { drawBackground, drawMenuBar, drawWindow };
}
