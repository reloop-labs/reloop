import { describe, expect, test } from "vitest";
import {
	encodePixelArt,
	encodePixelRow,
	getPixelArtGrid,
	getPixelArtGridWithLetter,
	getPixelArtPalette,
	PIXEL_GRID_SIZE,
} from "./pixel-art";
import { getPixelGlyph, PIXEL_FONT, PIXEL_GLYPH_SCALE } from "./pixel-font";

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

describe("getPixelArtGridWithLetter", () => {
	test("carves the glyph into a cleared center plaque", () => {
		const size = PIXEL_GRID_SIZE;
		const grid = getPixelArtGridWithLetter("org_123", "D");
		const glyph = getPixelGlyph("D");
		// Scaled glyph + 2px padding plaque, centered on 32.
		const glyphWidth = 5 * PIXEL_GLYPH_SCALE;
		const glyphHeight = 7 * PIXEL_GLYPH_SCALE;
		const plaqueWidth = glyphWidth + 4;
		const plaqueHeight = glyphHeight + 4;
		const plaqueX = Math.round((size - plaqueWidth) / 2);
		const plaqueY = Math.round((size - plaqueHeight) / 2);
		for (let y = 0; y < 7; y++) {
			for (let x = 0; x < 5; x++) {
				const expected = glyph[y * 5 + x];
				for (let sy = 0; sy < PIXEL_GLYPH_SCALE; sy++) {
					for (let sx = 0; sx < PIXEL_GLYPH_SCALE; sx++) {
						expect(
							grid[
								(plaqueY + 2 + y * PIXEL_GLYPH_SCALE + sy) * size +
									(plaqueX + 2 + x * PIXEL_GLYPH_SCALE + sx)
							],
						).toBe(expected);
					}
				}
			}
		}
		// Plaque padding ring stays cleared.
		expect(grid[plaqueY * size + plaqueX]).toBe(false);
		expect(
			grid[(plaqueY + plaqueHeight - 1) * size + (plaqueX + plaqueWidth - 1)],
		).toBe(false);
	});

	test("round-trips and is deterministic", () => {
		const grid = getPixelArtGridWithLetter("org_123", "D");
		expect(decodePixelArt(encodePixelArt(grid), PIXEL_GRID_SIZE)).toEqual(grid);
		expect(getPixelArtGridWithLetter("org_123", "D")).toEqual(grid);
	});

	test("unknown chars fall back to the ? glyph", () => {
		expect(getPixelGlyph("€")).toEqual(getPixelGlyph("?"));
		expect(Object.keys(PIXEL_FONT)).toHaveLength(37);
	});
});
