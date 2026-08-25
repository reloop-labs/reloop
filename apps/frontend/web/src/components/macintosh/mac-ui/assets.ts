import { LOADING_ICON_SVG } from "../components/ModelLoadingOverlay";
import { svgToDataUrl } from "../lib/svg";

const desktopPatternUrl = "/macintosh/ui/pattern-desktop.svg";
const dither25PatternUrl = "/macintosh/ui/pattern-dither25.svg";
const earthIconUrl = "/macintosh/ui/icon-earth.svg";
const folderIconUrl = "/macintosh/ui/icon-folder.svg";
const macPaintIconUrl = "/macintosh/ui/icon-macpaint.svg";
const macWriteIconUrl = "/macintosh/ui/icon-macwrite.svg";
const trashIconUrl = "/macintosh/ui/icon-trash.svg";
const trashVideoIconUrl = "/macintosh/ui/icon-trash-video.svg";

const macPaintToolboxUrl = "/macintosh/ui/macpaint-toolbox.svg";
const macPaintPatternsUrl = "/macintosh/ui/macpaint-patterns.svg";
const picturesThumb1Url = "/macintosh/ui/pictures-thumb-1.svg";
const picturesThumb2Url = "/macintosh/ui/pictures-thumb-2.svg";
const picturesThumb3Url = "/macintosh/ui/pictures-thumb-3.svg";
const arrowUrl = "/macintosh/ui/arrow.svg";
const resizeUrl = "/macintosh/ui/resize.svg";

export interface UiImages {
	loadingIcon: HTMLImageElement;
	desktopPattern: HTMLImageElement;
	dither25Pattern: HTMLImageElement;
	earthIcon: HTMLImageElement;
	folderIcon: HTMLImageElement;
	macPaintIcon: HTMLImageElement;
	macWriteIcon: HTMLImageElement;
	trashIcon: HTMLImageElement;
	trashVideoIcon: HTMLImageElement;
	macPaintToolbox: HTMLImageElement;
	macPaintPatterns: HTMLImageElement;
	picturesThumb1: HTMLImageElement;
	picturesThumb2: HTMLImageElement;
	picturesThumb3: HTMLImageElement;
	arrow: HTMLImageElement;
	resize: HTMLImageElement;
}

export interface UiAssets {
	images: UiImages;
	isImageReady: (img?: HTMLImageElement | null) => boolean;
	drawSprite: (
		ctx: CanvasRenderingContext2D,
		img: HTMLImageElement,
		x: number,
		y: number,
		w: number,
		h: number,
	) => boolean;
	drawSpriteCrop: (
		ctx: CanvasRenderingContext2D,
		img: HTMLImageElement,
		sx: number,
		sy: number,
		sw: number,
		sh: number,
		dx: number,
		dy: number,
		dw: number,
		dh: number,
	) => boolean;
	getDesktopPattern: () => CanvasPattern | null;
	fillDither25: (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number,
	) => void;
}

function isImageReady(img?: HTMLImageElement | null): boolean {
	return Boolean(img && img.complete && img.naturalWidth && img.naturalHeight);
}

function drawSprite(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	x: number,
	y: number,
	w: number,
	h: number,
): boolean {
	if (!isImageReady(img)) return false;
	ctx.drawImage(
		img,
		Math.round(x),
		Math.round(y),
		Math.round(w),
		Math.round(h),
	);
	return true;
}

function drawSpriteCrop(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	sx: number,
	sy: number,
	sw: number,
	sh: number,
	dx: number,
	dy: number,
	dw: number,
	dh: number,
): boolean {
	if (!isImageReady(img)) return false;
	ctx.drawImage(
		img,
		Math.round(sx),
		Math.round(sy),
		Math.round(sw),
		Math.round(sh),
		Math.round(dx),
		Math.round(dy),
		Math.round(dw),
		Math.round(dh),
	);
	return true;
}

export function createUiAssets({
	ctx,
	onLoad,
}: {
	ctx: CanvasRenderingContext2D;
	onLoad?: () => void;
}): UiAssets {
	const onAssetLoad = typeof onLoad === "function" ? onLoad : null;

	const createUiImage = (url: string): HTMLImageElement => {
		const img = new Image();
		img.decoding = "async";
		if (onAssetLoad) img.addEventListener("load", onAssetLoad);
		img.src = url;
		return img;
	};

	const loadingIconImage = new Image();
	loadingIconImage.decoding = "async";
	if (onAssetLoad) loadingIconImage.addEventListener("load", onAssetLoad);
	loadingIconImage.src = svgToDataUrl(LOADING_ICON_SVG);

	const images: UiImages = {
		loadingIcon: loadingIconImage,
		desktopPattern: createUiImage(desktopPatternUrl),
		dither25Pattern: createUiImage(dither25PatternUrl),
		earthIcon: createUiImage(earthIconUrl),
		folderIcon: createUiImage(folderIconUrl),
		macPaintIcon: createUiImage(macPaintIconUrl),
		macWriteIcon: createUiImage(macWriteIconUrl),
		trashIcon: createUiImage(trashIconUrl),
		trashVideoIcon: createUiImage(trashVideoIconUrl),
		macPaintToolbox: createUiImage(macPaintToolboxUrl),
		macPaintPatterns: createUiImage(macPaintPatternsUrl),
		picturesThumb1: createUiImage(picturesThumb1Url),
		picturesThumb2: createUiImage(picturesThumb2Url),
		picturesThumb3: createUiImage(picturesThumb3Url),
		arrow: createUiImage(arrowUrl),
		resize: createUiImage(resizeUrl),
	};

	let desktopPattern: CanvasPattern | null = null;
	let dither25Pattern: CanvasPattern | null = null;

	function getDesktopPattern(): CanvasPattern | null {
		if (desktopPattern) return desktopPattern;
		if (!isImageReady(images.desktopPattern)) return null;
		desktopPattern = ctx.createPattern(images.desktopPattern, "repeat");
		return desktopPattern;
	}

	function getDither25Pattern(): CanvasPattern | null {
		if (dither25Pattern) return dither25Pattern;
		if (!isImageReady(images.dither25Pattern)) return null;
		dither25Pattern = ctx.createPattern(images.dither25Pattern, "repeat");
		return dither25Pattern;
	}

	function fillPatternAt(
		ctx2: CanvasRenderingContext2D,
		pattern: CanvasPattern | null,
		x: number,
		y: number,
		w: number,
		h: number,
	) {
		if (!pattern) return;
		const w0 = Math.max(0, Math.floor(w));
		const h0 = Math.max(0, Math.floor(h));
		if (w0 <= 0 || h0 <= 0) return;

		ctx2.save();
		ctx2.translate(Math.round(x), Math.round(y));
		ctx2.fillStyle = pattern;
		ctx2.fillRect(0, 0, w0, h0);
		ctx2.restore();
	}

	function fillDither25(
		ctx2: CanvasRenderingContext2D,
		x: number,
		y: number,
		w: number,
		h: number,
	) {
		const pattern = getDither25Pattern();
		if (pattern) {
			fillPatternAt(ctx2, pattern, x, y, w, h);
			return;
		}

		const w0 = Math.max(0, Math.floor(w));
		const h0 = Math.max(0, Math.floor(h));
		if (w0 <= 0 || h0 <= 0) return;

		ctx2.fillStyle = "#000000";
		for (let yy = 0; yy < h0; yy += 2) {
			for (let xx = yy % 4 === 0 ? 0 : 2; xx < w0; xx += 4) {
				ctx2.fillRect(x + xx, y + yy, 1, 1);
			}
		}
	}

	return {
		images,
		isImageReady,
		drawSprite,
		drawSpriteCrop,
		getDesktopPattern,
		fillDither25,
	};
}
