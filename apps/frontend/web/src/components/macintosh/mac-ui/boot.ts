import { isDarkMode } from "./theme";

export type BootStage = "off" | "startup" | "happyMac" | "welcome" | "desktop";

export interface BootState {
	stage: BootStage;
	progress: number;
}

export interface UiState {
	currentWindow: string;
	bootState: BootState;
	width: number;
	height: number;
	windowRect: { x: number; y: number; width: number; height: number } | null;
	trashWindowOpen: boolean;
	trashWindowRect: { x: number; y: number; width: number; height: number } | null;
	trashVideoOpen: boolean;
	videoWindowOpen: boolean;
	videoWindowRect: { x: number; y: number; width: number; height: number } | null;
}

export interface BootController {
	drawBootScreen: (
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) => void;
	startBootSequence: () => void;
	cancelBootSequence: () => void;
	setBootProgress: (fraction: number) => void;
	finishBootSequence: (options?: { delayMs?: number }) => void;
}

export function createBootController({
	state,
	clamp,
	drawMacUI,
	loadingIconImage,
}: {
	state: UiState;
	clamp: (val: number, min: number, max: number) => number;
	drawMacUI: () => void;
	loadingIconImage?: HTMLImageElement;
}): BootController {
	let bootTimeoutIds: ReturnType<typeof setTimeout>[] = [];
	let startupFlickerIntervalId: ReturnType<typeof setInterval> | null = null;
	let bootTargetPercent = 0;
	let bootDisplayPercent = 0;
	let bootProgressIntervalId: ReturnType<typeof setInterval> | null = null;

	function stopBootProgressAnimator() {
		if (bootProgressIntervalId) clearInterval(bootProgressIntervalId);
		bootProgressIntervalId = null;
	}

	function startBootProgressAnimator() {
		if (bootProgressIntervalId) return;
		if (state.bootState?.stage !== "welcome") return;
		if (bootDisplayPercent >= bootTargetPercent) return;

		bootProgressIntervalId = setInterval(() => {
			if (state.bootState?.stage !== "welcome") {
				stopBootProgressAnimator();
				return;
			}
			if (bootDisplayPercent >= bootTargetPercent) {
				stopBootProgressAnimator();
				return;
			}
			const diff = bootTargetPercent - bootDisplayPercent;
			const step = diff > 10 ? Math.ceil(diff / 5) : 1;
			bootDisplayPercent = Math.min(bootTargetPercent, bootDisplayPercent + step);
			setBootState({ progress: bootDisplayPercent / 100 });
		}, 16);
	}

	function stopStartupFlicker() {
		if (startupFlickerIntervalId) clearInterval(startupFlickerIntervalId);
		startupFlickerIntervalId = null;
	}

	function startStartupFlicker() {
		stopStartupFlicker();
		startupFlickerIntervalId = setInterval(() => {
			if (state.bootState?.stage !== "startup") {
				stopStartupFlicker();
				return;
			}
			drawMacUI();
		}, 60);
	}

	function clearBootTimers() {
		for (const id of bootTimeoutIds) clearTimeout(id);
		bootTimeoutIds = [];
		stopStartupFlicker();
		stopBootProgressAnimator();
	}

	function setBootState(next: Partial<BootState>) {
		state.bootState = {
			stage: next.stage ?? state.bootState?.stage ?? "off",
			progress: Number.isFinite(next.progress)
				? (next.progress as number)
				: state.bootState?.progress ?? 0,
		};
		if (state.bootState.stage === "desktop") state.currentWindow = "desktop";
		drawMacUI();

		if (state.bootState.stage === "startup") startStartupFlicker();
		else stopStartupFlicker();
	}

	function startBootSequence() {
		clearBootTimers();

		bootTargetPercent = 0;
		bootDisplayPercent = 0;
		setBootState({ stage: "welcome", progress: bootDisplayPercent / 100 });
		startBootProgressAnimator();
	}

	function cancelBootSequence() {
		clearBootTimers();
	}

	function setBootProgress(fraction: number) {
		if (state.bootState?.stage === "desktop") return;
		if (!Number.isFinite(fraction)) return;
		bootTargetPercent = Math.max(
			bootTargetPercent,
			Math.round(clamp(fraction, 0, 1) * 100),
		);
		startBootProgressAnimator();
	}

	function finishBootSequence(options: { delayMs?: number } = {}) {
		if (state.bootState?.stage === "desktop") return;

		const delayMs =
			Number.isFinite(options?.delayMs) && (options.delayMs as number) > 0
				? Math.round(options.delayMs as number)
				: 0;

		clearBootTimers();
		bootTargetPercent = 100;

		if (state.bootState?.stage !== "welcome") {
			setBootState({ stage: "welcome", progress: bootDisplayPercent / 100 });
		} else {
			setBootState({ progress: bootDisplayPercent / 100 });
		}
		startBootProgressAnimator();

		const finishToDesktop = () => {
			if (state.bootState?.stage === "desktop") return;
			if (bootDisplayPercent >= 100) {
				setBootState({ stage: "desktop", progress: 1 });
				return;
			}
			bootTimeoutIds.push(setTimeout(finishToDesktop, 60));
		};

		if (delayMs <= 0) finishToDesktop();
		else bootTimeoutIds.push(setTimeout(finishToDesktop, delayMs));
	}

	function drawOffScreen(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) {
		ctx.fillStyle = "#0a0a0a";
		ctx.fillRect(0, 0, width, height);

		ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
		for (let y = 0; y < height; y += 2) {
			ctx.fillRect(0, y, width, 1);
		}
	}

	function drawStartupScreen(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) {
		const gray = Math.random() > 0.5 ? "#808080" : "#909090";
		ctx.fillStyle = gray;
		ctx.fillRect(0, 0, width, height);

		ctx.fillStyle = "rgba(0, 0, 0, 0.10)";
		for (let y = 0; y < height; y += 2) {
			ctx.fillRect(0, y, width, 1);
		}
	}

	function drawHappyMacIcon(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		scale: number,
	) {
		ctx.save();
		ctx.translate(Math.round(x), Math.round(y));
		ctx.scale(scale, scale);
		ctx.imageSmoothingEnabled = false;

		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 48, 56);
		ctx.fillStyle = "#C0C0C0";
		ctx.fillRect(1, 1, 46, 54);

		ctx.fillStyle = "#000000";
		ctx.fillRect(5, 5, 38, 30);
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(6, 6, 36, 28);

		ctx.fillStyle = "#000000";
		ctx.fillRect(16, 14, 4, 6);
		ctx.fillRect(28, 14, 4, 6);
		ctx.fillRect(23, 22, 2, 4);

		const smile: [number, number][] = [
			[18, 28],
			[30, 28],
			[19, 29],
			[29, 29],
			[20, 30],
			[28, 30],
			[21, 31],
			[27, 31],
			[22, 32],
			[23, 32],
			[24, 32],
			[25, 32],
			[26, 32],
		];
		for (const [sx, sy] of smile) {
			ctx.fillRect(sx, sy, 1, 1);
		}

		ctx.fillStyle = "#404040";
		ctx.fillRect(14, 38, 20, 3);

		ctx.fillStyle = "#000000";
		ctx.fillRect(8, 48, 32, 6);

		ctx.restore();
	}

	function drawHappyMacScreen(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) {
		ctx.fillStyle = "#C0C0C0";
		ctx.fillRect(0, 0, width, height);

		const scale = 2;
		const iconW = 48 * scale;
		const iconH = 56 * scale;
		const iconX = Math.round(width / 2 - iconW / 2);
		const iconY = Math.round(height / 2 - iconH / 2);
		drawHappyMacIcon(ctx, iconX, iconY, scale);
	}

	function drawWelcomeScreen(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		progress = 0.7,
	) {
		const isDark = isDarkMode();
		ctx.fillStyle = isDark ? "#121212" : "#e7e7e7";
		ctx.fillRect(0, 0, width, height);

		const wantsIcon = true;
		const iconReady = Boolean(
			loadingIconImage?.complete &&
				loadingIconImage.naturalWidth &&
				loadingIconImage.naturalHeight,
		);
		const iconScale = 0.4;
		const iconW = Math.round(100 * iconScale);
		const iconH = Math.round(128 * iconScale);
		const iconGap = 20;

		const barW = wantsIcon ? Math.round(iconW * 0.82) : 160;
		const barH = 12;
		const pctFontSize = 12;
		const pctGap = 18;

		const groupH =
			(wantsIcon ? iconH + iconGap : 0) + barH + pctGap + pctFontSize;
		let cursorY = Math.round(height / 2 - groupH / 2);

		if (wantsIcon) {
			const iconX = Math.round(width / 2 - iconW / 2);
			const iconY = cursorY;
			if (iconReady && loadingIconImage) {
				ctx.save();
				if (isDark) ctx.filter = "invert(1)";
				ctx.drawImage(loadingIconImage, iconX, iconY, iconW, iconH);
				ctx.restore();
			}
			cursorY += iconH + iconGap;
		}

		const barX = Math.round(width / 2 - barW / 2);
		const barY = cursorY;

		ctx.strokeStyle = isDark ? "#ffffff" : "#000000";
		ctx.lineWidth = 1;
		ctx.strokeRect(barX, barY, barW, barH);

		const fillFrac = clamp(progress, 0, 1);
		const innerW = Math.max(0, Math.round((barW - 4) * fillFrac));
		ctx.fillStyle = isDark ? "#ffffff" : "#000000";
		ctx.fillRect(barX + 2, barY + 2, innerW, barH - 4);

		const pct = Math.round(fillFrac * 100);
		ctx.save();
		ctx.fillStyle = isDark ? "#ffffff" : "#000000";
		ctx.font = 'bold 12px Chicago, Monaco, "Courier New", monospace';
		ctx.textAlign = "center";
		ctx.textBaseline = "alphabetic";
		ctx.fillText(`${pct}%`, Math.round(width / 2), barY + barH + pctGap);
		ctx.restore();
	}

	function drawBootScreen(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
	) {
		const stage = state.bootState?.stage ?? "off";
		const progress = state.bootState?.progress ?? 0;

		switch (stage) {
			case "off":
				drawOffScreen(ctx, width, height);
				break;
			case "startup":
				drawStartupScreen(ctx, width, height);
				break;
			case "happyMac":
				drawHappyMacScreen(ctx, width, height);
				break;
			case "welcome":
				drawWelcomeScreen(ctx, width, height, progress);
				break;
			default:
				drawOffScreen(ctx, width, height);
				break;
		}
	}

	return {
		drawBootScreen,
		startBootSequence,
		cancelBootSequence,
		setBootProgress,
		finishBootSequence,
	};
}
