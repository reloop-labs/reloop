const CLICK_URL = "/macintosh/audio/click.mp3";
const CLICK_POOL_SIZE = 6;
const CLICK_VOLUME = 0.35;

let clickPool: HTMLAudioElement[] | null = null;
let clickPoolIndex = 0;

function getPool(): HTMLAudioElement[] {
	if (!clickPool && typeof window !== "undefined") {
		clickPool = Array.from({ length: CLICK_POOL_SIZE }, () => {
			const audio = new Audio(CLICK_URL);
			audio.preload = "auto";
			audio.volume = CLICK_VOLUME;
			return audio;
		});
	}
	return clickPool ?? [];
}

export function playMacClick(): void {
	if (typeof window === "undefined") return;
	const pool = getPool();
	if (!pool.length) return;
	const audio = pool[clickPoolIndex++ % pool.length];
	if (!audio) return;
	try {
		audio.pause();
		audio.currentTime = 0;
	} catch {
		// Ignore audio reset error
	}
	audio.play().catch(() => {});
}
