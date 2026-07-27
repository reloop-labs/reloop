"use client";

import { cn } from "@reloop/ui/cn";
import { type CSSProperties, useEffect, useState } from "react";
import { DotmSquare1 } from "#/components/ui/dotm-square-1";
import { DotmSquare3 } from "#/components/ui/dotm-square-3";
import { DotmSquare11 } from "#/components/ui/dotm-square-11";
import { DotmSquare12 } from "#/components/ui/dotm-square-12";

const LOADERS = [DotmSquare1, DotmSquare3, DotmSquare11, DotmSquare12];

/** Shared inbox loading indicator — randomizes between Neon Drift, Core Spiral, Echo Ring, and Origin Wave. */
export function LoadingDot({
	className,
	label = "Loading",
	size = 14,
	dotSize = 2,
	style,
}: {
	className?: string;
	label?: string;
	size?: number;
	dotSize?: number;
	style?: CSSProperties;
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
			className={cn("inline-flex items-center justify-center shrink-0 text-current", className)}
			style={style}
		>
			<SelectedLoader size={size} dotSize={dotSize} speed={1.35} />
		</span>
	);
}
