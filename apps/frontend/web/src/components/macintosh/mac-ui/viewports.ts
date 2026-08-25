import type { UiState } from "./boot";
import type { RectManager } from "./rects";

export interface ViewportRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface ViewportHelpers {
	getVideoViewportRect: () => ViewportRect | null;
	getVideoViewportRectForWindow: (
		x: number,
		y: number,
		width: number,
		height: number,
	) => ViewportRect;
	getTrashVideoViewportRectForWindow: (
		x: number,
		y: number,
		width: number,
		height: number,
	) => ViewportRect;
}

export function createViewportHelpers({
	state,
	rects,
}: {
	state: UiState;
	rects: RectManager;
}): ViewportHelpers {
	function getVideoViewportRectForWindow(
		x: number,
		y: number,
		width: number,
		height: number,
	): ViewportRect {
		const scrollWidth = 16;
		const vx = x + 1;
		const vy = y + 20;
		const vw = Math.max(0, width - (scrollWidth + 1));
		const vh = Math.max(0, height - 36);
		return { x: vx, y: vy, w: vw, h: vh };
	}

	function getTrashVideoViewportRectForWindow(
		x: number,
		y: number,
		width: number,
		height: number,
	): ViewportRect {
		const scrollWidth = 16;
		const contentX = x + 1;
		const contentWidth = width - (scrollWidth + 1);
		const contentBottomY = y + height - scrollWidth;

		const clipX = contentX;
		const clipY = y + 42;
		const clipW = Math.max(0, contentWidth);
		const clipH = Math.max(0, contentBottomY - clipY);
		return { x: clipX, y: clipY, w: clipW, h: clipH };
	}

	function getVideoViewportRect(): ViewportRect | null {
		if (state.trashVideoOpen) {
			if (!state.trashWindowOpen) return null;
			rects.ensureTrashWindowRect();
			const r = state.trashWindowRect;
			if (!r) return null;
			return getTrashVideoViewportRectForWindow(r.x, r.y, r.width, r.height);
		}

		if (!state.videoWindowOpen) return null;
		rects.ensureVideoWindowRect();
		const r = state.videoWindowRect;
		if (!r) return null;
		return getVideoViewportRectForWindow(r.x, r.y, r.width, r.height);
	}

	return {
		getVideoViewportRect,
		getVideoViewportRectForWindow,
		getTrashVideoViewportRectForWindow,
	};
}
