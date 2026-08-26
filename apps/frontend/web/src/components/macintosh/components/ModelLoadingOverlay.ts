import { clamp } from "../lib/math";
import { svgToDataUrl } from "../lib/svg";

const LOADER_REF_W = 512;
const LOADER_REF_H = 342;
const MIN_BOOT_MS = 200;

export const LOADING_ICON_SVG = `<svg width="100" height="128" viewBox="0 0 100 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 0H92V4H8V0Z" fill="#212121"/>
<path d="M92 4H96V8H92V4Z" fill="#212121"/>
<path d="M0 8H4V108H0V8Z" fill="#212121"/>
<path d="M96 8H100V108H96V8Z" fill="#212121"/>
<path d="M4 4H8V8H4V4Z" fill="#212121"/>
<path d="M12 16H16V20H12V16Z" fill="#212121"/>
<path d="M84 16H88V20H84V16Z" fill="#212121"/>
<path d="M12 20H16V24H12V20Z" fill="#212121"/>
<path d="M84 20H88V24H84V20Z" fill="#212121"/>
<path d="M12 24H16V28H12V24Z" fill="#212121"/>
<path d="M84 24H88V28H84V24Z" fill="#212121"/>
<path d="M12 28H16V32H12V28Z" fill="#212121"/>
<path d="M32 28H36V32H32V28Z" fill="#212121"/>
<path d="M60 28H64V32H60V28Z" fill="#212121"/>
<path d="M48 28H52V32H48V28Z" fill="#212121"/>
<path d="M48 32H52V36H48V32Z" fill="#212121"/>
<path d="M48 36H52V40H48V36Z" fill="#212121"/>
<path d="M48 40H52V44H48V40Z" fill="#212121"/>
<path d="M48 44H52V48H48V44Z" fill="#212121"/>
<path d="M44 44H48V48H44V44Z" fill="#212121"/>
<path d="M44 56H48V60H44V56Z" fill="#212121"/>
<path d="M40 56H44V60H40V56Z" fill="#212121"/>
<path d="M48 56H52V60H48V56Z" fill="#212121"/>
<path d="M52 56H56V60H52V56Z" fill="#212121"/>
<path d="M56 52H60V56H56V52Z" fill="#212121"/>
<path d="M36 52H40V56H36V52Z" fill="#212121"/>
<path d="M32 32H36V36H32V32Z" fill="#212121"/>
<path d="M60 32H64V36H60V32Z" fill="#212121"/>
<path d="M84 28H88V32H84V28Z" fill="#212121"/>
<path d="M12 32H16V36H12V32Z" fill="#212121"/>
<path d="M84 32H88V36H84V32Z" fill="#212121"/>
<path d="M12 36H16V40H12V36Z" fill="#212121"/>
<path d="M84 36H88V40H84V36Z" fill="#212121"/>
<path d="M12 40H16V44H12V40Z" fill="#212121"/>
<path d="M84 40H88V44H84V40Z" fill="#212121"/>
<path d="M12 44H16V48H12V44Z" fill="#212121"/>
<path d="M84 44H88V48H84V44Z" fill="#212121"/>
<path d="M12 48H16V52H12V48Z" fill="#212121"/>
<path d="M84 48H88V52H84V48Z" fill="#212121"/>
<path d="M12 52H16V56H12V52Z" fill="#212121"/>
<path d="M84 52H88V56H84V52Z" fill="#212121"/>
<path d="M12 56H16V60H12V56Z" fill="#212121"/>
<path d="M84 56H88V60H84V56Z" fill="#212121"/>
<path d="M12 60H16V64H12V60Z" fill="#212121"/>
<path d="M84 60H88V64H84V60Z" fill="#212121"/>
<path d="M12 64H16V68H12V64Z" fill="#212121"/>
<path d="M12 92H16V96H12V92Z" fill="#212121"/>
<path d="M16 92H20V96H16V92Z" fill="#212121"/>
<path d="M60 88H64V92H60V88Z" fill="#212121"/>
<path d="M68 88H72V92H68V88Z" fill="#212121"/>
<path d="M76 88H80V92H76V88Z" fill="#212121"/>
<path d="M64 88H68V92H64V88Z" fill="#212121"/>
<path d="M72 88H76V92H72V88Z" fill="#212121"/>
<path d="M80 88H84V92H80V88Z" fill="#212121"/>
<path d="M8 108H92V112H8V108Z" fill="#212121"/>
<path d="M84 64H88V68H84V64Z" fill="#212121"/>
<path d="M16 68H84V72H16V68Z" fill="#212121"/>
<path d="M16 12H20V16H16V12Z" fill="#212121"/>
<path d="M20 12H24V16H20V12Z" fill="#212121"/>
<path d="M24 12H28V16H24V12Z" fill="#212121"/>
<path d="M28 12H32V16H28V12Z" fill="#212121"/>
<path d="M32 12H36V16H32V12Z" fill="#212121"/>
<path d="M36 12H40V16H36V12Z" fill="#212121"/>
<path d="M40 12H44V16H40V12Z" fill="#212121"/>
<path d="M44 12H48V16H44V12Z" fill="#212121"/>
<path d="M48 12H52V16H48V12Z" fill="#212121"/>
<path d="M52 12H56V16H52V12Z" fill="#212121"/>
<path d="M56 12H60V16H56V12Z" fill="#212121"/>
<path d="M60 12H64V16H60V12Z" fill="#212121"/>
<path d="M64 12H68V16H64V12Z" fill="#212121"/>
<path d="M68 12H72V16H68V12Z" fill="#212121"/>
<path d="M72 12H76V16H72V12Z" fill="#212121"/>
<path d="M76 12H80V16H76V12Z" fill="#212121"/>
<path d="M80 12H84V16H80V12Z" fill="#212121"/>
<path d="M4 108H8V128H4V108Z" fill="#212121"/>
<path d="M92 108H96V128H92V108Z" fill="#212121"/>
<path d="M8 124H12V128H8V124Z" fill="#212121"/>
<path d="M12 124H16V128H12V124Z" fill="#212121"/>
<path d="M16 124H20V128H16V124Z" fill="#212121"/>
<path d="M20 124H24V128H20V124Z" fill="#212121"/>
<path d="M24 124H28V128H24V124Z" fill="#212121"/>
<path d="M28 124H32V128H28V124Z" fill="#212121"/>
<path d="M32 124H36V128H32V124Z" fill="#212121"/>
<path d="M36 124H40V128H36V124Z" fill="#212121"/>
<path d="M40 124H44V128H40V124Z" fill="#212121"/>
<path d="M44 124H48V128H44V124Z" fill="#212121"/>
<path d="M48 124H52V128H48V124Z" fill="#212121"/>
<path d="M52 124H56V128H52V124Z" fill="#212121"/>
<path d="M56 124H60V128H56V124Z" fill="#212121"/>
<path d="M60 124H64V128H60V124Z" fill="#212121"/>
<path d="M64 124H68V128H64V124Z" fill="#212121"/>
<path d="M68 124H72V128H68V124Z" fill="#212121"/>
<path d="M72 124H76V128H72V124Z" fill="#212121"/>
<path d="M76 124H80V128H76V124Z" fill="#212121"/>
<path d="M80 124H84V128H80V124Z" fill="#212121"/>
<path d="M84 124H88V128H84V124Z" fill="#212121"/>
<path d="M88 124H92V128H88V124Z" fill="#212121"/>
<path d="M92 124H96V128H92V124Z" fill="#212121"/>
</svg>`;

const loadingIconDataUrl = svgToDataUrl(LOADING_ICON_SVG);

export interface ModelLoadingOverlayController {
	start: () => void;
	setProgress: (fraction: number) => void;
	finish: () => Promise<void>;
	error: (text?: string) => void;
	dispose: () => void;
}

export function createModelLoadingOverlay(
	container?: HTMLElement,
): ModelLoadingOverlayController {
	const overlay = document.createElement("div");
	overlay.setAttribute("role", "status");
	overlay.setAttribute("aria-label", "Loading 3D model");

	overlay.style.position = "absolute";
	overlay.style.inset = "0";
	overlay.style.width = "100%";
	overlay.style.height = "100%";
	overlay.style.display = "flex";
	overlay.style.alignItems = "center";
	overlay.style.justifyContent = "center";
	overlay.style.background = "transparent";
	overlay.style.zIndex = "10";
	overlay.style.opacity = "1";
	overlay.style.transition = "opacity 240ms ease";
	overlay.style.pointerEvents = "none";

	const panel = document.createElement("div");
	panel.style.transformOrigin = "center";
	panel.style.willChange = "transform";
	panel.style.display = "flex";
	panel.style.flexDirection = "column";
	panel.style.alignItems = "center";

	const icon = document.createElement("img");
	icon.alt = "";
	icon.decoding = "async";
	icon.width = 90;
	icon.height = 115;
	icon.src = loadingIconDataUrl;
	icon.draggable = false;
	icon.style.display = "block";
	icon.style.imageRendering = "pixelated";
	icon.style.pointerEvents = "none";
	icon.style.marginBottom = "20px";
	icon.style.userSelect = "none";

	const barOuter = document.createElement("div");
	barOuter.style.width = `${Math.round(icon.width * 0.7)}px`;
	barOuter.style.height = "12px";
	barOuter.style.boxSizing = "border-box";
	barOuter.style.border = "1px solid #000000";
	barOuter.style.padding = "1px";
	barOuter.style.marginBottom = "5px";

	const barFill = document.createElement("div");
	barFill.style.height = "100%";
	barFill.style.background = "#000000";
	barFill.style.width = "0%";
	barOuter.appendChild(barFill);

	const percent = document.createElement("div");
	percent.style.fontFamily = 'Chicago, Monaco, "Courier New", monospace';
	percent.style.fontWeight = "700";
	percent.style.fontSize = "12px";
	percent.style.color = "#000000";
	percent.textContent = "0%";

	const message = document.createElement("div");
	message.style.display = "none";
	message.style.marginTop = "12px";
	message.style.fontFamily = 'Chicago, Monaco, "Courier New", monospace';
	message.style.fontWeight = "700";
	message.style.fontSize = "12px";
	message.style.color = "#000000";
	message.style.textAlign = "center";
	message.style.maxWidth = "280px";

	const applyTheme = () => {
		const isDark =
			typeof document !== "undefined" &&
			document.documentElement.classList.contains("dark");

		icon.style.filter = isDark ? "invert(1) brightness(1.2)" : "none";
		barOuter.style.border = isDark
			? "1px solid rgba(255, 255, 255, 0.9)"
			: "1px solid #000000";
		barFill.style.background = isDark ? "#ffffff" : "#000000";
		percent.style.color = isDark ? "#ffffff" : "#000000";
		message.style.color = isDark ? "#ffffff" : "#000000";
	};

	applyTheme();

	let observer: MutationObserver | null = null;
	if (typeof document !== "undefined" && typeof MutationObserver !== "undefined") {
		observer = new MutationObserver(() => {
			if (!disposed) applyTheme();
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
	}

	panel.append(icon, barOuter, percent, message);
	overlay.appendChild(panel);

	const parent = container || document.body;
	parent.appendChild(overlay);

	let disposed = false;
	let targetPercent = 0;
	let displayPercent = 0;

	let startAtMs = performance.now();
	let finishRequested = false;
	let finishInProgress = false;
	let finishCheckTimeoutId: ReturnType<typeof setTimeout> | null = null;
	let progressIntervalId: ReturnType<typeof setInterval> | null = null;

	let finishPromise: Promise<void> | null = null;
	let finishResolve: (() => void) | null = null;

	const clearFinishCheck = () => {
		if (finishCheckTimeoutId) clearTimeout(finishCheckTimeoutId);
		finishCheckTimeoutId = null;
	};

	const clearProgressAnimator = () => {
		if (progressIntervalId) clearInterval(progressIntervalId);
		progressIntervalId = null;
	};

	const updateScale = () => {
		const targetW = container ? container.clientWidth : window.innerWidth;
		const targetH = container ? container.clientHeight : window.innerHeight;
		const scale = Math.min(
			targetW / LOADER_REF_W,
			targetH / LOADER_REF_H,
		);
		const k = clamp(scale * 0.9, 0.25, 1.6);
		panel.style.transform = `scale(${k})`;
	};

	const render = () => {
		const pct = clamp(displayPercent, 0, 100);
		percent.textContent = `${pct}%`;
		barFill.style.width = `${pct}%`;
	};

	const removeOverlay = () => {
		disposed = true;
		observer?.disconnect();
		observer = null;
		clearFinishCheck();
		clearProgressAnimator();
		window.removeEventListener("resize", updateScale);
		overlay.remove();
		finishResolve?.();
		finishResolve = null;
	};

	const maybeFinish = () => {
		if (disposed || !finishRequested || finishInProgress) return;
		if (displayPercent < 100) return;

		const elapsedMs = performance.now() - startAtMs;
		const remainingMs = MIN_BOOT_MS - elapsedMs;
		if (remainingMs > 0) {
			clearFinishCheck();
			finishCheckTimeoutId = setTimeout(maybeFinish, remainingMs);
			return;
		}

		finishInProgress = true;
		clearFinishCheck();
		clearProgressAnimator();

		setTimeout(() => {
			if (disposed) return;
			overlay.style.opacity = "0";
			overlay.style.pointerEvents = "none";
			setTimeout(() => {
				if (disposed) return;
				removeOverlay();
			}, 260);
		}, 140);
	};

	const startProgressAnimator = () => {
		if (disposed) return;
		if (progressIntervalId) return;
		if (displayPercent >= targetPercent) return;

		progressIntervalId = setInterval(() => {
			if (disposed) {
				clearProgressAnimator();
				return;
			}

			if (displayPercent >= targetPercent) {
				clearProgressAnimator();
				maybeFinish();
				return;
			}

			const step = finishRequested ? 5 : 1;
			displayPercent = Math.min(targetPercent, displayPercent + step);
			render();
			maybeFinish();
		}, 16);
	};

	const start = () => {
		if (disposed) return;

		overlay.style.display = "flex";
		overlay.style.opacity = "1";

		message.textContent = "";
		message.style.display = "none";

		startAtMs = performance.now();
		finishRequested = false;
		finishInProgress = false;
		clearFinishCheck();
		clearProgressAnimator();
		finishPromise = null;
		finishResolve = null;

		targetPercent = 0;
		displayPercent = 0;
		render();
		updateScale();
	};

	const setProgress = (fraction: number) => {
		if (disposed) return;
		if (!Number.isFinite(fraction)) return;
		targetPercent = Math.max(
			targetPercent,
			Math.round(clamp(fraction, 0, 1) * 100),
		);
		startProgressAnimator();
		maybeFinish();
	};

	const finish = (): Promise<void> => {
		if (disposed) return Promise.resolve();

		if (!finishPromise) {
			finishPromise = new Promise<void>((resolve) => {
				finishResolve = resolve;
			});
		}

		finishRequested = true;
		setProgress(1);
		maybeFinish();
		return finishPromise;
	};

	const error = (text = "Failed to load 3D model.") => {
		if (disposed) return;
		message.textContent = text;
		message.style.display = "block";
	};

	const dispose = () => {
		removeOverlay();
	};

	updateScale();
	window.addEventListener("resize", updateScale);
	render();

	return { start, setProgress, finish, error, dispose };
}
