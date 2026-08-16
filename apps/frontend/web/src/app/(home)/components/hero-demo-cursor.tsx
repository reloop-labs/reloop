"use client";

import { motion, type MotionValue } from "framer-motion";

const CURSOR_FILL = "#006FFE";
const TIP_X = 3.73;
const TIP_Y = 2.08;

export function HeroDemoCursor({
	x,
	y,
	scale,
	opacity,
}: {
	x: MotionValue<number>;
	y: MotionValue<number>;
	scale: MotionValue<number>;
	opacity: MotionValue<number>;
}) {
	return (
		<motion.div
			aria-hidden
			className="pointer-events-none absolute top-0 left-0 z-40"
			style={{ x, y, scale, opacity }}
		>
			<div
				className="relative"
				style={{ transform: `translate(-${TIP_X}px, -${TIP_Y}px)` }}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 18 18"
					className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
				>
					<path
						d="M15.154,6.253L3.731,2.079h0c-.477-.175-.994-.058-1.353,.3-.357,.358-.473,.876-.298,1.352L6.254,15.154c.188,.517,.66,.846,1.208,.846,.009,0,.019,0,.027,0,.559-.011,1.03-.362,1.2-.895l1.556-4.86,4.859-1.555c.532-.17,.884-.642,.896-1.201,.011-.559-.321-1.044-.846-1.236Z"
						fill={CURSOR_FILL}
						stroke="#fff"
						strokeWidth="1.15"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
		</motion.div>
	);
}
