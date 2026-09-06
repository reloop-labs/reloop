"use client";

import { cn } from "@reloop/ui/cn";
import { useEffect, useRef, useState } from "react";

type Sprite = {
	pixels: string[];
	colors: Record<string, string>;
};

function PixelSprite({
	sprite,
	pixelSize = 4,
	className = "",
}: {
	sprite: Sprite;
	pixelSize?: number;
	className?: string;
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
			className={`shrink-0 select-none ${className}`}
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

// --- SPRITE 0: ENVELOPE (Flap opens and closes) ---
const envelope0: Sprite = {
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

const envelope1: Sprite = {
	colors: { G: "#3d6b45", L: "#4e8658", D: "#2a4d32", W: "#ffffff", H: "#ff5070" },
	pixels: [
		"....WWWW....",
		"...WHHHHW...",
		".DDDWWWWDDD.",
		"DLLLLLLLLLLD",
		"DLGGGGGGGGLD",
		"DLG.WWW.GGLD",
		"DLG.WWW.GGLD",
		"DLGG...GGGLD",
		"DL.GG.GG.LD.",
		"DLLLLLLLLLLD",
		".DDDDDDDDDD.",
		"............",
	],
};

const envelope2: Sprite = {
	colors: { G: "#3d6b45", L: "#4e8658", D: "#2a4d32", W: "#ffffff", H: "#ff5070" },
	pixels: [
		"...WH..HW...",
		"...WHHHHW...",
		"....WHHW....",
		".DDDDWWDDDD.",
		"DLLLLLLLLLLD",
		"DLGGGGGGGGLD",
		"DLG.WWW.GGLD",
		"DLGG...GGGLD",
		"DL.GG.GG.LD.",
		"DLLLLLLLLLLD",
		".DDDDDDDDDD.",
		"............",
	],
};

// --- SPRITE 1: CHECKMARK (Shimmer pulse) ---
const check0: Sprite = {
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

const check1: Sprite = {
	colors: { B: "#4a7dff", D: "#2f5ad4", W: "#ffffff", L: "#a8c5ff" },
	pixels: [
		"............",
		".........BB.",
		"........BBD.",
		".......BBD..",
		"......BBD...",
		"WW...BBD....",
		"LWW.BBD.....",
		".LWWBD......",
		"..DBD.......",
		"...D........",
		"............",
		"............",
	],
};

const check2: Sprite = {
	colors: { B: "#4a7dff", D: "#2f5ad4", W: "#ffffff", L: "#a8c5ff" },
	pixels: [
		"............",
		".........WW.",
		"........WWL.",
		".......WWL..",
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

// --- SPRITE 2: MAILBOT (The Eyes Move: Left -> Right -> Blink -> Center) ---
type MailbotEye = "center" | "left" | "right" | "blink";

const INBOX_COLORS = {
	O: "#e07038",
	D: "#b34e1e",
	S: "#8a3a16",
	L: "#f4a06a",
	W: "#ffffff",
	P: "#3b1606",
};

const INBOX_EYES: Record<MailbotEye, string[]> = {
	center: [
		"..SOOOOOOS..",
		"..SOWLLWOS..",
		"..SOPLLPOS..",
		"..SOOOOOOS..",
	],
	left: [
		"..SOOOOOOS..",
		"..SWLLWOOS..",
		"..SPLLPOOS..",
		"..SOOOOOOS..",
	],
	right: [
		"..SOOOOOOS..",
		"..SOOWLLWS..",
		"..SOOPLLPS..",
		"..SOOOOOOS..",
	],
	blink: [
		"..SOOOOOOS..",
		"..SOOOOOOS..",
		"..SODDDDOS..",
		"..SOOOOOOS..",
	],
};

function getInboxSprite(eye: MailbotEye): Sprite {
	return {
		colors: INBOX_COLORS,
		pixels: [
			"............",
			"...SSSSSS...",
			...INBOX_EYES[eye],
			".SSSSSSSSSS.",
			".SDDDDDDDDS.",
			".SODDDDDDOS.",
			".SOOOOOOOOS.",
			".SSSSSSSSSS.",
			"............",
		],
	};
}

// --- SPRITE 3: LIGHTNING BOLT (Spark flash) ---
const bolt0: Sprite = {
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

const bolt1: Sprite = {
	colors: { Y: "#fbffb0", D: "#d4e878", W: "#ffffff" },
	pixels: [
		"......W.....",
		".....YYW....",
		"....YYYY....",
		"...YYYD.....",
		"..YYYYYYW...",
		".....YYYD...",
		"...WYYYY....",
		"...YYYD.....",
		"..YYD.......",
		".YYD...W....",
		".YD.........",
		"............",
	],
};

const bolt2: Sprite = {
	colors: { Y: "#d4e878", D: "#9db84a", W: "#ffffff" },
	pixels: [
		"............",
		".....YYY..W.",
		"....YYYD....",
		".W.YYYD.....",
		"..YYYYYYY...",
		".....YYYD.W.",
		"....YYYD....",
		"...YYYD.....",
		"..YYD.......",
		".YYD........",
		".YD....W....",
		"............",
	],
};

// --- SPRITE 4: AT SIGN (Center pulse) ---
const atSign0: Sprite = {
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

const atSign1: Sprite = {
	colors: { G: "#2f6b48", L: "#5cb880", D: "#1e4a32", W: "#d6f5e1" },
	pixels: [
		"............",
		"..DDDDDDD...",
		".DLLLLLLLD..",
		"DL......LD..",
		"DL.LLLL.LD..",
		"DL.LW.WLD...",
		"DL.LW.WLD...",
		"DL.LWWGLD...",
		"DL..........",
		".DLLLLLLLD..",
		"..DDDDDDD...",
		"............",
	],
};

// --- SPRITE 5: PLANE (Thrust contrail) ---
const plane0: Sprite = {
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

const plane1: Sprite = {
	colors: { G: "#d4a84a", D: "#b8882e", L: "#efc66a", W: "#ffffff" },
	pixels: [
		"............",
		".L..........",
		".LL.........",
		".LGL........",
		".LGGL.......",
		".LGGGL......",
		".LGGGLLLLL..",
		".LDDDDDDD...",
		"W..DGGD.....",
		"....DGD.....",
		".....D......",
		"............",
	],
};

const plane2: Sprite = {
	colors: { G: "#d4a84a", D: "#b8882e", L: "#efc66a", W: "#ffffff" },
	pixels: [
		"............",
		".L..........",
		".LL.........",
		".LGL........",
		".LGGL.......",
		".LGGGL......",
		".LGGGLLLLL..",
		".LDDDDDDD...",
		".W.DGGD.....",
		"W...DGD.....",
		".....D......",
		"............",
	],
};

// --- SPRITE 6: PROCESSOR / STAMP (Core pulse) ---
const stamp0: Sprite = {
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

const stamp1: Sprite = {
	colors: { B: "#5b82ff", D: "#3d5fd4", L: "#8aa6ff", W: "#ffffff" },
	pixels: [
		"............",
		".B.B.B.B.B..",
		"BLLLLLLLLLB.",
		"BL.DDDDD.LB.",
		"BL.DWWWD.LB.",
		"BL.DWBWD.LB.",
		"BL.DWBWD.LB.",
		"BL.DWWWD.LB.",
		"BL.DDDDD.LB.",
		"BLLLLLLLLLB.",
		".B.B.B.B.B..",
		"............",
	],
};

export function FooterPixelStrip({ className }: { className?: string } = {}) {
	// Frame indexes for each sprite's one-shot animation
	const [envelopeFrame, setEnvelopeFrame] = useState(0);
	const [checkFrame, setCheckFrame] = useState(0);
	const [mailbotEye, setMailbotEye] = useState<MailbotEye>("center");
	const [boltFrame, setBoltFrame] = useState(0);
	const [atSignFrame, setAtSignFrame] = useState(0);
	const [planeFrame, setPlaneFrame] = useState(0);
	const [stampFrame, setStampFrame] = useState(0);

	// Timers
	const mailbotTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
	const spriteTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

	const clearTimers = () => {
		for (const t of spriteTimerRef.current) clearTimeout(t);
		spriteTimerRef.current = [];
	};

	const clearMailbotTimers = () => {
		for (const t of mailbotTimerRef.current) clearTimeout(t);
		mailbotTimerRef.current = [];
	};

	useEffect(() => {
		return () => {
			clearTimers();
			clearMailbotTimers();
		};
	}, []);

	// Mailbot: plays one-shot eye movement: Left -> Right -> Blink -> Center and ends
	const playMailbotOneShot = () => {
		clearMailbotTimers();

		setMailbotEye("left");

		const t1 = setTimeout(() => {
			setMailbotEye("right");
		}, 180);

		const t2 = setTimeout(() => {
			setMailbotEye("blink");
		}, 360);

		const t3 = setTimeout(() => {
			setMailbotEye("center");
		}, 500);

		mailbotTimerRef.current = [t1, t2, t3];
	};

	// Envelope: plays flap open -> letter -> closes and ends
	const playEnvelopeOneShot = () => {
		setEnvelopeFrame(1);
		const t1 = setTimeout(() => setEnvelopeFrame(2), 160);
		const t2 = setTimeout(() => setEnvelopeFrame(1), 360);
		const t3 = setTimeout(() => setEnvelopeFrame(0), 520);
		spriteTimerRef.current.push(t1, t2, t3);
	};

	// Checkmark: plays shimmer sweep and ends
	const playCheckOneShot = () => {
		setCheckFrame(1);
		const t1 = setTimeout(() => setCheckFrame(2), 160);
		const t2 = setTimeout(() => setCheckFrame(0), 340);
		spriteTimerRef.current.push(t1, t2);
	};

	// Bolt: plays spark flash and ends
	const playBoltOneShot = () => {
		setBoltFrame(1);
		const t1 = setTimeout(() => setBoltFrame(2), 120);
		const t2 = setTimeout(() => setBoltFrame(1), 240);
		const t3 = setTimeout(() => setBoltFrame(0), 380);
		spriteTimerRef.current.push(t1, t2, t3);
	};

	// At sign: plays pulse and ends
	const playAtSignOneShot = () => {
		setAtSignFrame(1);
		const t1 = setTimeout(() => setAtSignFrame(0), 300);
		spriteTimerRef.current.push(t1);
	};

	// Plane: plays contrail thrust and ends
	const playPlaneOneShot = () => {
		setPlaneFrame(1);
		const t1 = setTimeout(() => setPlaneFrame(2), 160);
		const t2 = setTimeout(() => setPlaneFrame(0), 360);
		spriteTimerRef.current.push(t1, t2);
	};

	// Stamp: plays core pulse and ends
	const playStampOneShot = () => {
		setStampFrame(1);
		const t1 = setTimeout(() => setStampFrame(0), 320);
		spriteTimerRef.current.push(t1);
	};

	const envelopeSprites = [envelope0, envelope1, envelope2];
	const checkSprites = [check0, check1, check2];
	const boltSprites = [bolt0, bolt1, bolt2];
	const atSignSprites = [atSign0, atSign1];
	const planeSprites = [plane0, plane1, plane2];
	const stampSprites = [stamp0, stamp1];

	return (
		<div
			className={cn(
				"flex w-full items-center justify-evenly border-stroke-soft-100 border-t px-6 py-12 sm:px-16 sm:py-16 lg:px-24 dark:border-white/10",
				className,
			)}
		>
			{/* 0. Envelope */}
			<div
				onMouseEnter={playEnvelopeOneShot}
				className="cursor-pointer select-none"
			>
				<PixelSprite
					sprite={envelopeSprites[envelopeFrame] ?? envelope0}
					pixelSize={4}
				/>
			</div>

			{/* 1. Checkmark */}
			<div
				onMouseEnter={playCheckOneShot}
				className="cursor-pointer select-none"
			>
				<PixelSprite
					sprite={checkSprites[checkFrame] ?? check0}
					pixelSize={4}
				/>
			</div>

			{/* 2. Mailbot (The Eyes Move!) */}
			<div
				onMouseEnter={playMailbotOneShot}
				className="cursor-pointer select-none"
			>
				<PixelSprite
					sprite={getInboxSprite(mailbotEye)}
					pixelSize={4}
				/>
			</div>

			{/* 3. Lightning Bolt */}
			<div
				onMouseEnter={playBoltOneShot}
				className="cursor-pointer select-none"
			>
				<PixelSprite
					sprite={boltSprites[boltFrame] ?? bolt0}
					pixelSize={4}
				/>
			</div>

			{/* 4. At Sign */}
			<div
				onMouseEnter={playAtSignOneShot}
				className="cursor-pointer select-none"
			>
				<PixelSprite
					sprite={atSignSprites[atSignFrame] ?? atSign0}
					pixelSize={4}
				/>
			</div>

			{/* 5. Paper Plane */}
			<div
				onMouseEnter={playPlaneOneShot}
				className="cursor-pointer select-none"
			>
				<PixelSprite
					sprite={planeSprites[planeFrame] ?? plane0}
					pixelSize={4}
				/>
			</div>

			{/* 6. Stamp / CPU */}
			<div
				onMouseEnter={playStampOneShot}
				className="cursor-pointer select-none"
			>
				<PixelSprite
					sprite={stampSprites[stampFrame] ?? stamp0}
					pixelSize={4}
				/>
			</div>
		</div>
	);
}
