export const RAMP = "*";

export function buildAtlas(ramp = RAMP, cell = 64): HTMLCanvasElement {
	const n = ramp.length;
	const c = document.createElement("canvas");
	c.width = cell * n;
	c.height = cell;
	const ctx = c.getContext("2d")!;
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.fillStyle = "#fff";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx.font = `${Math.floor(cell * 0.74)}px ui-monospace, "SF Mono", Menlo, monospace`;
	for (let i = 0; i < n; i++) {
		const ch = ramp[i] ?? "";
		if (ch !== "" && ch !== " ")
			ctx.fillText(ch, i * cell + cell / 2, cell / 2 + cell * 0.04);
	}
	return c;
}
