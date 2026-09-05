type Sprite = {
	pixels: string[];
	colors: Record<string, string>;
};

function PixelSprite({
	sprite,
	pixelSize,
}: {
	sprite: Sprite;
	pixelSize: number;
}) {
	const rows = sprite.pixels.length;
	const cols = Math.max(...sprite.pixels.map((row) => row.length), 0);

	return (
		<svg
			aria-hidden
			width={cols * pixelSize}
			height={rows * pixelSize}
			viewBox={`0 0 ${cols} ${rows}`}
			shapeRendering="crispEdges"
			className="shrink-0"
		>
			{sprite.pixels.flatMap((row, y) =>
				row.split("").map((cell, x) => {
					const fill = sprite.colors[cell];
					if (!fill) return null;
					return (
						<rect
							key={`${x}-${y}`}
							x={x}
							y={y}
							width={1}
							height={1}
							fill={fill}
						/>
					);
				}),
			)}
		</svg>
	);
}

const envelope: Sprite = {
	colors: { G: "#3d6b45", L: "#4e8658", D: "#2a4d32" },
	pixels: [
		"............",
		".DDDDDDDDDD.",
		"DLLLLLLLLLLD",
		"DLGGGGGGGGLD",
		"DLG.....GGLD",
		"DLG.GGG.GGLD",
		"DLGG...GGGLD",
		"DL.GG.GG.LD.",
		"DL..GGG..LD.",
		"DLLLLLLLLLLD",
		".DDDDDDDDDD.",
		"............",
	],
};

const check: Sprite = {
	colors: { B: "#4a7dff", D: "#2f5ad4" },
	pixels: [
		"............",
		".........BB.",
		"........BBD.",
		".......BBD..",
		"......BBD...",
		"BB...BBD....",
		"DBB.BBD.....",
		".DBBBD......",
		"..DBD.......",
		"...D........",
		"............",
		"............",
	],
};

const inbox: Sprite = {
	colors: { O: "#e07038", D: "#b34e1e", S: "#8a3a16", L: "#f4a06a" },
	pixels: [
		"............",
		"...SSSSSS...",
		"..SOOOOOOS..",
		"..SO.LL.OS..",
		"..SO.LL.OS..",
		"..SOOOOOOS..",
		".SSSSSSSSSS.",
		".SDDDDDDDDS.",
		".SODDDDDDOS.",
		".SOOOOOOOOS.",
		".SSSSSSSSSS.",
		"............",
	],
};

const bolt: Sprite = {
	colors: { Y: "#d4e878", D: "#9db84a" },
	pixels: [
		"............",
		".....YYY....",
		"....YYYD....",
		"...YYYD.....",
		"..YYYYYYY...",
		".....YYYD...",
		"....YYYD....",
		"...YYYD.....",
		"..YYD.......",
		".YYD........",
		".YD.........",
		"............",
	],
};

const atSign: Sprite = {
	colors: { G: "#2f6b48", L: "#3f8a5c", D: "#1e4a32" },
	pixels: [
		"............",
		"..DDDDDDD...",
		".DLLLLLLLD..",
		"DL......LD..",
		"DL.LLLL.LD..",
		"DL.LG.GLD...",
		"DL.LG.GLD...",
		"DL.LGGGLD...",
		"DL..........",
		".DLLLLLLLD..",
		"..DDDDDDD...",
		"............",
	],
};

const plane: Sprite = {
	colors: { G: "#d4a84a", D: "#b8882e", L: "#efc66a" },
	pixels: [
		"............",
		".L..........",
		".LL.........",
		".LGL........",
		".LGGL.......",
		".LGGGL......",
		".LGGGLLLLL..",
		".LDDDDDDD...",
		"...DGGD.....",
		"....DGD.....",
		".....D......",
		"............",
	],
};

const stamp: Sprite = {
	colors: { B: "#5b82ff", D: "#3d5fd4", L: "#8aa6ff" },
	pixels: [
		"............",
		".B.B.B.B.B..",
		"BLLLLLLLLLB.",
		"BL.DDDDD.LB.",
		"BL.D...D.LB.",
		"BL.D.B.D.LB.",
		"BL.D.B.D.LB.",
		"BL.D...D.LB.",
		"BL.DDDDD.LB.",
		"BLLLLLLLLLB.",
		".B.B.B.B.B..",
		"............",
	],
};

const SPRITES = [envelope, check, inbox, bolt, atSign, plane, stamp];

export function FooterPixelStrip() {
	return (
		<div className="flex w-full items-center justify-evenly border-stroke-soft-100 border-t px-6 py-5 sm:px-16 sm:py-6 lg:px-24 dark:border-white/10">
			{SPRITES.map((sprite, index) => (
				<PixelSprite key={index} sprite={sprite} pixelSize={4} />
			))}
		</div>
	);
}
