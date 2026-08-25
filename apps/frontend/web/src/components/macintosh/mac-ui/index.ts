import { clamp } from "../lib/math";
import { createUiAssets, type UiAssets } from "./assets";
import {
	type BootController,
	createBootController,
	type UiState,
} from "./boot";
import { createChrome, type Chrome } from "./chrome";
import { createRectManager, type RectManager } from "./rects";
import {
	createDesktopScreen,
	type DesktopScreen,
} from "./screens/desktop";
import {
	createMacPaintScreen,
	type MacPaintScreen,
} from "./screens/macpaint";
import {
	createMacWriteScreen,
	type MacWriteScreen,
} from "./screens/macwrite";
import {
	createPicturesScreen,
	type PicturesScreen,
} from "./screens/pictures";
import * as text from "./text";
import {
	createViewportHelpers,
	type ViewportHelpers,
} from "./viewports";

const CANVAS_SCALE =
	typeof window !== "undefined"
		? Math.max(2, Math.round(Math.min(2, window.devicePixelRatio || 1)))
		: 2;
const TOP_INSET = 18;
const LEFT_INSET = 125;
const WINDOW_MIN_W = 180;
const WINDOW_MIN_H = 160;
const TRASH_WINDOW_MIN_W = 170;
const TRASH_WINDOW_MIN_H = 150;
const VIDEO_WINDOW_MIN_W = 220;
const VIDEO_WINDOW_MIN_H = 180;

const constants = {
	CANVAS_SCALE,
	TOP_INSET,
	LEFT_INSET,
	WINDOW_MIN_W,
	WINDOW_MIN_H,
	TRASH_WINDOW_MIN_W,
	TRASH_WINDOW_MIN_H,
	VIDEO_WINDOW_MIN_W,
	VIDEO_WINDOW_MIN_H,
};

export const state: UiState = {
	currentWindow: "desktop",
	bootState: { stage: "welcome", progress: 0 },
	width: 512,
	height: 342,
	windowRect: null,
	trashWindowOpen: false,
	trashWindowRect: null,
	trashVideoOpen: false,
	videoWindowOpen: false,
	videoWindowRect: null,
};

export const uiCanvas: HTMLCanvasElement =
	typeof document !== "undefined"
		? document.createElement("canvas")
		: ({} as HTMLCanvasElement);

if (typeof document !== "undefined") {
	uiCanvas.width = state.width * CANVAS_SCALE;
	uiCanvas.height = state.height * CANVAS_SCALE;
}

const ctx: CanvasRenderingContext2D =
	typeof document !== "undefined" && uiCanvas.getContext
		? (uiCanvas.getContext("2d") as CanvasRenderingContext2D)
		: ({} as CanvasRenderingContext2D);

let uiDirty = true;
function markUiDirty() {
	uiDirty = true;
}

export function consumeUiDirty(): boolean {
	const wasDirty = uiDirty;
	uiDirty = false;
	return wasDirty;
}

export function uvToCanvas(
	uv: { x: number; y: number },
	width = state.width,
	height = state.height,
): { x: number; y: number } {
	return {
		x: uv.x * width,
		y: (1 - uv.y) * height,
	};
}

let isReadyToRedraw = false;

let assets: UiAssets | null = null;
let chrome: Chrome | null = null;
let rects: RectManager | null = null;
let viewports: ViewportHelpers | null = null;
let boot: BootController | null = null;
let desktopScreen: DesktopScreen | null = null;
let macPaintScreen: MacPaintScreen | null = null;
let macWriteScreen: MacWriteScreen | null = null;
let picturesScreen: PicturesScreen | null = null;

if (typeof document !== "undefined" && ctx) {
	assets = createUiAssets({
		ctx,
		onLoad: () => {
			if (!isReadyToRedraw) return;
			drawMacUI();
		},
	});

	chrome = createChrome({ constants, assets });
	rects = createRectManager({ state, clamp, constants });
	viewports = createViewportHelpers({ state, rects });
	desktopScreen = createDesktopScreen({
		state,
		ctx,
		assets,
		rects,
		chrome,
		text,
		viewports,
	});
	macPaintScreen = createMacPaintScreen({
		state,
		ctx,
		assets,
		rects,
		chrome,
		clamp,
	});
	macWriteScreen = createMacWriteScreen({ ctx, rects, chrome });
	picturesScreen = createPicturesScreen({ ctx, assets, rects, chrome, clamp });
	boot = createBootController({
		state,
		clamp,
		drawMacUI,
		loadingIconImage: assets.images.loadingIcon,
	});
}

export function drawMacUI(): void {
	if (!ctx || !chrome || !boot || !desktopScreen || !macPaintScreen || !macWriteScreen || !picturesScreen) {
		return;
	}
	isReadyToRedraw = true;

	ctx.save();
	ctx.setTransform(CANVAS_SCALE, 0, 0, CANVAS_SCALE, 0, 0);
	ctx.imageSmoothingEnabled = false;

	if (state.bootState?.stage && state.bootState.stage !== "desktop") {
		boot.drawBootScreen(ctx, state.width, state.height);
		ctx.restore();
		markUiDirty();
		return;
	}

	if (state.currentWindow === "desktop") {
		chrome.drawBackground(ctx, state.width, state.height);
		chrome.drawMenuBar(ctx, state.width);
		desktopScreen.drawDesktopTrashIcon(ctx);
		desktopScreen.drawDesktopWindow();
		if (state.trashWindowOpen) desktopScreen.drawTrashWindow();
		if (state.videoWindowOpen) desktopScreen.drawVideoWindow();
	} else if (state.currentWindow === "macpaint") {
		chrome.drawBackground(ctx, state.width, state.height);
		chrome.drawMenuBar(ctx, state.width, [
			"File",
			"Edit",
			"Goodies",
			"Font",
			"FontSize",
			"Style",
		]);
		macPaintScreen.drawMacPaintContent();
	} else if (state.currentWindow === "macwrite") {
		chrome.drawBackground(ctx, state.width, state.height);
		chrome.drawMenuBar(ctx, state.width, [
			"File",
			"Edit",
			"Search",
			"Format",
			"Font",
			"Style",
		]);
		macWriteScreen.drawMacWriteContent();
	} else if (state.currentWindow === "pictures") {
		chrome.drawBackground(ctx, state.width, state.height);
		chrome.drawMenuBar(ctx, state.width);
		picturesScreen.drawPicturesContent();
	}

	ctx.restore();
	markUiDirty();
}

export function startBootSequence(): void {
	boot?.startBootSequence();
}

export function cancelBootSequence(): void {
	boot?.cancelBootSequence();
}

export function setBootProgress(fraction: number): void {
	boot?.setBootProgress(fraction);
}

export function finishBootSequence(options: { delayMs?: number } = {}): void {
	boot?.finishBootSequence(options);
}

export function getWindowRect(): {
	windowX: number;
	windowY: number;
	windowWidth: number;
	windowHeight: number;
} {
	return (
		rects?.getWindowRect() ?? {
			windowX: 0,
			windowY: 0,
			windowWidth: 0,
			windowHeight: 0,
		}
	);
}

export function getVideoViewportRect() {
	return viewports?.getVideoViewportRect() ?? null;
}

function getDesktopIconHitTargets() {
	if (!rects || !desktopScreen) {
		return { clipRect: { x: 0, y: 0, w: 0, h: 0 }, targets: {} };
	}
	const { windowX, windowY, windowWidth, windowHeight } =
		rects.getWindowRect();
	const layout = desktopScreen.getDesktopIconLayout(
		windowX,
		windowY,
		windowWidth,
		windowHeight,
	);
	const targets: Record<string, { x: number; y: number; w: number; h: number }> =
		{};
	for (const [id, pos] of Object.entries(layout.icons)) {
		targets[id] = { x: pos.x, y: pos.y, w: pos.w, h: pos.h };
	}
	return { clipRect: layout.clipRect, targets };
}

export function hitTestDesktop(canvasX: number, canvasY: number): string | null {
	const { clipRect, targets } = getDesktopIconHitTargets();
	if (clipRect.w <= 0 || clipRect.h <= 0) return null;
	if (
		canvasX < clipRect.x ||
		canvasX > clipRect.x + clipRect.w ||
		canvasY < clipRect.y ||
		canvasY > clipRect.y + clipRect.h
	) {
		return null;
	}
	for (const [id, b] of Object.entries(targets)) {
		if (
			canvasX >= b.x &&
			canvasX <= b.x + b.w &&
			canvasY >= b.y &&
			canvasY <= b.y + b.h
		) {
			return id;
		}
	}
	return null;
}

export function hitTestTrashIcon(canvasX: number, canvasY: number): boolean {
	if (!desktopScreen) return false;
	const b = desktopScreen.getTrashIconLayout().bounds;
	return (
		canvasX >= b.x &&
		canvasX <= b.x + b.w &&
		canvasY >= b.y &&
		canvasY <= b.y + b.h
	);
}

export function hitTestTrashWindow(canvasX: number, canvasY: number): boolean {
	if (!state.trashWindowOpen || !rects) return false;
	rects.ensureTrashWindowRect();
	const r = state.trashWindowRect;
	if (!r) return false;
	return (
		canvasX >= r.x &&
		canvasX <= r.x + r.width &&
		canvasY >= r.y &&
		canvasY <= r.y + r.height
	);
}

export function hitTestTrashWindowClose(
	canvasX: number,
	canvasY: number,
): boolean {
	if (!state.trashWindowOpen || !rects) return false;
	rects.ensureTrashWindowRect();
	const r = state.trashWindowRect;
	if (!r) return false;
	const bx = r.x + 7;
	const by = r.y + 3;
	const s = 14;
	return (
		canvasX >= bx && canvasX <= bx + s && canvasY >= by && canvasY <= by + s
	);
}

export function hitTestTrashWindowItem(
	canvasX: number,
	canvasY: number,
): string | null {
	if (!state.trashWindowOpen || state.trashVideoOpen || !rects || !desktopScreen)
		return null;
	rects.ensureTrashWindowRect();
	const r = state.trashWindowRect;
	if (!r) return null;
	const { item } = desktopScreen.getTrashWindowItemLayout(
		r.x,
		r.y,
		r.width,
		r.height,
	);
	if (!item) return null;
	if (
		canvasX >= item.x &&
		canvasX <= item.x + item.w &&
		canvasY >= item.y &&
		canvasY <= item.y + item.h
	) {
		return "Macintosh 1984";
	}
	return null;
}

export function hitTestGrowBox(canvasX: number, canvasY: number): boolean {
	if (!rects) return false;
	const { windowX, windowY, windowWidth, windowHeight } =
		rects.getWindowRect();
	const scrollWidth = 16;
	const gbX = windowX + windowWidth - scrollWidth;
	const gbY = windowY + windowHeight - scrollWidth;
	return (
		canvasX >= gbX &&
		canvasX <= gbX + scrollWidth &&
		canvasY >= gbY &&
		canvasY <= gbY + scrollWidth
	);
}

export function hitTestTrashGrowBox(canvasX: number, canvasY: number): boolean {
	if (!state.trashWindowOpen || !rects) return false;
	rects.ensureTrashWindowRect();
	const r = state.trashWindowRect;
	if (!r) return false;
	const scrollWidth = 16;
	const gbX = r.x + r.width - scrollWidth;
	const gbY = r.y + r.height - scrollWidth;
	return (
		canvasX >= gbX &&
		canvasX <= gbX + scrollWidth &&
		canvasY >= gbY &&
		canvasY <= gbY + scrollWidth
	);
}
