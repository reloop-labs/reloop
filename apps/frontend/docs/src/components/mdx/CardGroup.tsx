"use client";

import type { ReactNode } from "react";
import { cn } from "@reloop/fe-docs/lib/cn";

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
		<div className={cn("my-8 grid grid-cols-1 gap-6", gridCols)}>
			{children}
		</div>
	);
}
