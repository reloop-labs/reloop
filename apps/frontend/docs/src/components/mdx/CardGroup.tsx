"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CardGroupProps {
	cols?: 2 | 3 | 4;
	children: ReactNode;
}

export function CardGroup({ cols = 3, children }: CardGroupProps) {
	const gridCols = {
		2: "sm:grid-cols-2",
		3: "sm:grid-cols-2 lg:grid-cols-3",
		4: "sm:grid-cols-2 lg:grid-cols-4",
	}[cols];

	return (
		<div className={cn("grid grid-cols-1 gap-6 my-8", gridCols)}>
			{children}
		</div>
	);
}
