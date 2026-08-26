"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { DotmSquare1 } from "./dotm-square-1";
import { DotmSquare3 } from "./dotm-square-3";
import { DotmSquare11 } from "./dotm-square-11";
import { DotmSquare12 } from "./dotm-square-12";
import { cn } from "@reloop/ui/cn";

const LOADERS = [DotmSquare1, DotmSquare3, DotmSquare11, DotmSquare12];

/** In-house 5x5 dot matrix loading indicator */
export function LoadingDot({
	className,
	label = "Loading",
	size = 20,
	dotSize = 2.5,
	style,
	color,
}: {
	className?: string;
	label?: string;
	size?: number;
	dotSize?: number;
	style?: CSSProperties;
	color?: string;
}) {
	const [SelectedLoader, setSelectedLoader] = useState(() => DotmSquare1);

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * LOADERS.length);
		setSelectedLoader(() => LOADERS[randomIndex] ?? DotmSquare1);
	}, []);

	return (
		<span
			role="status"
			aria-label={label}
			className={cn(
				"inline-flex shrink-0 items-center justify-center text-current",
				className
			)}
			style={style}
		>
			<SelectedLoader size={size} dotSize={dotSize} speed={1.35} color={color} />
		</span>
	);
}

export { DotmSquare1, DotmSquare3, DotmSquare11, DotmSquare12 };
