/**
 * Deterministic pixel-art avatar (identicon) from a seed string.
 * Same seed always yields the same grid + palette — no storage needed.
 *
 * Output dialect mirrors the reference artwork: a 32x32 grid encoded as
 * run-length horizontal strokes (`M{x} {y}h{len}` runs joined by relative
 * `m{gap} 0` gaps) drawn with `translate(0,2.5)scale(5)`.
 */

/** Fast non-cryptographic string hash (djb2). */
function hashString(str: string): number {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return hash >>> 0;
}

/** Seeded PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
	let state = seed;
	return () => {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export const PIXEL_GRID_SIZE = 32;
/** Matches the reference artwork's stroke transform. */
export const PIXEL_PATH_TRANSFORM = "translate(0,2.5)scale(5)";

export interface PixelArtPalette {
	background: string;
	foreground: string;
}

/**
 * Per-user palette in the reference purple family: deep saturated
 * background (`#752a9c`-like) + light stroke (`#e399ff`-like).
 * Hue is derived from the seed; saturation/lightness stay fixed.
 */
export function getPixelArtPalette(seed: string): PixelArtPalette {
	const rand = mulberry32(hashString(seed || "user"));
	const hue = Math.floor(rand() * 360);
	return {
		background: `hsl(${hue} 57% 39%)`,
		foreground: `hsl(${hue} 100% 80%)`,
	};
}

/**
 * 32x32 fill grid, row-major. Density falls off top-to-bottom like the
 * reference (solid cap row, sparse tail).
 */
export function getPixelArtGrid(
	seed: string,
	size = PIXEL_GRID_SIZE,
): boolean[] {
	const rand = mulberry32(hashString(`grid:${seed || "user"}`));
	const cells: boolean[] = new Array(size * size).fill(false);
	for (let y = 0; y < size; y++) {
		// Top row is always solid, then ~0.9 density fading to ~0.1.
		const density = y === 0 ? 1 : 0.95 - 0.85 * (y / (size - 1));
		for (let x = 0; x < size; x++) {
			cells[y * size + x] = rand() < density;
		}
	}
	return cells;
}

interface Run {
	start: number;
	length: number;
}

/**
 * Encode one grid row as reference-style runs:
 * `M{x} {y}h{len}` for the first run, `m{gap} 0h{len}` after.
 */
export function encodePixelRow(
	cells: boolean[],
	size: number,
	y: number,
): string {
	const runs: Run[] = [];
	let x = 0;
	while (x < size) {
		while (x < size && !cells[y * size + x]) x++;
		if (x >= size) break;
		const start = x;
		while (x < size && cells[y * size + x]) x++;
		runs.push({ start, length: x - start });
	}
	return runs
		.map((run, i) =>
			i === 0
				? `M${run.start} ${y}h${run.length}`
				: `m${run.start - (runs[i - 1]?.start ?? 0) - (runs[i - 1]?.length ?? 0)} 0h${run.length}`,
		)
		.join("");
}

/** Encode the full grid as the reference `d` attribute. */
export function encodePixelArt(
	cells: boolean[],
	size = PIXEL_GRID_SIZE,
): string {
	let d = "";
	for (let y = 0; y < size; y++) {
		d += encodePixelRow(cells, size, y);
	}
	return d;
}
