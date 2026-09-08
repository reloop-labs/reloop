import { describe, expect, test } from "vitest";
import {
	encodePixelArt,
	encodePixelRow,
	getPixelArtGrid,
	getPixelArtPalette,
	PIXEL_GRID_SIZE,
} from "./pixel-art";

/** Decode reference-style RLE back into a grid for round-trip checks. */
function decodePixelArt(d: string, size: number): boolean[] {
	const cells: boolean[] = new Array(size * size).fill(false);
	const rowRe = /M(\d+) (\d+)h(\d+)((?:m\d+ 0h\d+)*)/g;
	const rows = d.matchAll(rowRe);
	for (const row of rows) {
		const [, start, y, len, rest] = row;
		let x = Number(start);
		const rowY = Number(y);
		for (let i = 0; i < Number(len); i++) cells[rowY * size + x + i] = true;
		x += Number(len);
		const runRe = /m(\d+) 0h(\d+)/g;
		const runs = (rest ?? "").matchAll(runRe);
		for (const run of runs) {
			x += Number(run[1]);
			for (let i = 0; i < Number(run[2]); i++)
				cells[rowY * size + x + i] = true;
			x += Number(run[2]);
		}
	}
	return cells;
}

describe("getPixelArtPalette", () => {
	test("is deterministic and varies by seed", () => {
		expect(getPixelArtPalette("ada@example.com")).toEqual(
			getPixelArtPalette("ada@example.com"),
		);
		expect(getPixelArtPalette("ada@example.com")).not.toEqual(
			getPixelArtPalette("grace@example.com"),
		);
	});

	test("stays in the purple family shape (deep bg, light fg)", () => {
		const { background, foreground } = getPixelArtPalette("ada@example.com");
		expect(background).toMatch(/^hsl\(\d+ 57% 39%\)$/);
		expect(foreground).toMatch(/^hsl\(\d+ 100% 80%\)$/);
	});
});

describe("getPixelArtGrid", () => {
	test("is deterministic, 32x32, solid cap row", () => {
		const grid = getPixelArtGrid("ada@example.com");
		expect(grid).toHaveLength(PIXEL_GRID_SIZE * PIXEL_GRID_SIZE);
		expect(grid).toEqual(getPixelArtGrid("ada@example.com"));
		expect(grid.slice(0, PIXEL_GRID_SIZE).every(Boolean)).toBe(true);
	});

	test("density falls off top-to-bottom", () => {
		const grid = getPixelArtGrid("ada@example.com");
		const density = (y: number) =>
			grid.slice(y * PIXEL_GRID_SIZE, (y + 1) * PIXEL_GRID_SIZE).filter(Boolean)
				.length / PIXEL_GRID_SIZE;
		expect(density(1)).toBeGreaterThan(density(PIXEL_GRID_SIZE - 1));
	});
});

describe("encodePixelArt", () => {
	test("round-trips through the reference RLE dialect", () => {
		const grid = getPixelArtGrid("ada@example.com");
		expect(decodePixelArt(encodePixelArt(grid), PIXEL_GRID_SIZE)).toEqual(grid);
	});

	test("row encoding matches the reference format", () => {
		const size = 8;
		const cells: boolean[] = new Array(size * size).fill(false);
		cells[1 * size + 0] = true;
		cells[1 * size + 1] = true;
		cells[1 * size + 4] = true;
		expect(encodePixelRow(cells, size, 1)).toBe("M0 1h2m2 0h1");
		expect(encodePixelRow(cells, size, 2)).toBe("");
	});
});
