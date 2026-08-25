import type { UiState } from "./boot";
import type { ChromeConstants } from "./chrome";

interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

function constrainRectToCanvas(
	{
		state,
		clamp,
	}: {
		state: UiState;
		clamp: (val: number, min: number, max: number) => number;
	},
	r: Rect,
	{ minWConst, minHConst }: { minWConst: number; minHConst: number },
): Rect {
	r.x = Math.round(r.x);
	r.y = Math.round(r.y);
	r.width = Math.round(r.width);
	r.height = Math.round(r.height);

	const minX = 0;
	const minY = 0;

	r.x = clamp(r.x, minX, Math.max(minX, state.width - 2));
	r.y = clamp(r.y, minY, Math.max(minY, state.height - 2));

	const maxW = Math.max(60, state.width - r.x - 2);
	const maxH = Math.max(60, state.height - r.y - 2);
	const minW = Math.min(minWConst, maxW);
	const minH = Math.min(minHConst, maxH);

	r.width = clamp(r.width, minW, maxW);
	r.height = clamp(r.height, minH, maxH);

	r.x = clamp(r.x, minX, Math.max(minX, state.width - r.width - 2));
	r.y = clamp(r.y, minY, Math.max(minY, state.height - r.height - 2));

	return r;
}

export interface RectManager {
	getWindowRect: () => {
		windowX: number;
		windowY: number;
		windowWidth: number;
		windowHeight: number;
	};
	ensureWindowRect: () => void;
	ensureTrashWindowRect: () => void;
	ensureVideoWindowRect: () => void;
	getDefaultTrashWindowRect: () => Rect;
	getDefaultVideoWindowRect: () => Rect;
}

export function createRectManager({
	state,
	clamp,
	constants,
}: {
	state: UiState;
	clamp: (val: number, min: number, max: number) => number;
	constants: ChromeConstants;
}): RectManager {
	const deps = { state, clamp };
	const {
		TOP_INSET,
		WINDOW_MIN_W,
		WINDOW_MIN_H,
		TRASH_WINDOW_MIN_W,
		TRASH_WINDOW_MIN_H,
		VIDEO_WINDOW_MIN_W,
		VIDEO_WINDOW_MIN_H,
	} = constants;

	function getDefaultWindowRect(): Rect {
		const windowY = 43 + TOP_INSET;
		const windowWidth = Math.min(240, state.width - 60);
		const windowHeight = Math.min(240, state.height - 62 - TOP_INSET);
		const windowX = Math.round((state.width - windowWidth) / 2);
		return { x: windowX, y: windowY, width: windowWidth, height: windowHeight };
	}

	function ensureWindowRect() {
		if (!state.windowRect) state.windowRect = getDefaultWindowRect();
		constrainRectToCanvas(deps, state.windowRect, {
			minWConst: WINDOW_MIN_W,
			minHConst: WINDOW_MIN_H,
		});
	}

	function getWindowRect() {
		ensureWindowRect();
		const r = state.windowRect!;
		return {
			windowX: r.x,
			windowY: r.y,
			windowWidth: r.width,
			windowHeight: r.height,
		};
	}

	function getDefaultTrashWindowRect(): Rect {
		const { windowX: wx, windowY: wy } = getWindowRect();

		const desiredViewportW = 220;
		const desiredViewportH = 185;
		const desiredWindowW = desiredViewportW + 17;
		const desiredWindowH = desiredViewportH + 58;

		const maxWindowW = Math.max(60, state.width - 40);
		const maxWindowH = Math.max(60, state.height - 60);
		const scale = Math.min(
			1,
			maxWindowW / desiredWindowW,
			maxWindowH / desiredWindowH,
		);

		const windowWidth = Math.max(60, Math.round(desiredWindowW * scale));
		const windowHeight = Math.max(60, Math.round(desiredWindowH * scale));

		const maxX = Math.max(0, state.width - windowWidth - 2);
		const maxY = Math.max(0, state.height - windowHeight - 2);
		const windowX = clamp(Math.round(wx), 0, maxX);
		const windowY = clamp(Math.round(wy), 0, maxY);

		return { x: windowX, y: windowY, width: windowWidth, height: windowHeight };
	}

	function ensureTrashWindowRect() {
		if (!state.trashWindowRect) {
			if (!state.trashWindowOpen) return;
			state.trashWindowRect = getDefaultTrashWindowRect();
		}
		constrainRectToCanvas(deps, state.trashWindowRect, {
			minWConst: TRASH_WINDOW_MIN_W,
			minHConst: TRASH_WINDOW_MIN_H,
		});
	}

	function getDefaultVideoWindowRect(): Rect {
		const desiredViewportW = state.trashWindowOpen ? 320 : 352;
		const desiredViewportH = Math.round((desiredViewportW * 9) / 16);
		const desiredWindowW = desiredViewportW + 17;
		const desiredWindowH = desiredViewportH + 36;

		const maxWindowW = Math.max(60, state.width - 40);
		const maxWindowH = Math.max(60, state.height - 60);
		const scale = Math.min(
			1,
			maxWindowW / desiredWindowW,
			maxWindowH / desiredWindowH,
		);

		const windowWidth = Math.max(60, Math.round(desiredWindowW * scale));
		const windowHeight = Math.max(60, Math.round(desiredWindowH * scale));

		if (state.trashWindowOpen) {
			ensureTrashWindowRect();
			const tr = state.trashWindowRect;
			if (tr) {
				const offset = 18;
				const maxX = Math.max(0, state.width - windowWidth - 2);
				const maxY = Math.max(0, state.height - windowHeight - 2);
				const windowX = clamp(Math.round(tr.x + offset), 0, maxX);
				const windowY = clamp(Math.round(tr.y + offset), 0, maxY);
				return {
					x: windowX,
					y: windowY,
					width: windowWidth,
					height: windowHeight,
				};
			}
		}

		const windowX = Math.round((state.width - windowWidth) / 2);
		const windowY = Math.round(TOP_INSET + 55);
		return { x: windowX, y: windowY, width: windowWidth, height: windowHeight };
	}

	function ensureVideoWindowRect() {
		if (!state.videoWindowRect) {
			if (!state.videoWindowOpen) return;
			state.videoWindowRect = getDefaultVideoWindowRect();
		}
		constrainRectToCanvas(deps, state.videoWindowRect, {
			minWConst: VIDEO_WINDOW_MIN_W,
			minHConst: VIDEO_WINDOW_MIN_H,
		});
	}

	return {
		getWindowRect,
		ensureWindowRect,
		ensureTrashWindowRect,
		ensureVideoWindowRect,
		getDefaultTrashWindowRect,
		getDefaultVideoWindowRect,
	};
}
