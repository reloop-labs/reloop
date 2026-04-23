"use client";

import type { ReactNode } from "react";

interface CardGroupProps {
	cols?: 2 | 3 | 4;
	children: ReactNode;
}

export function CardGroup({ cols = 3, children }: CardGroupProps) {
	const colClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[
		cols
	];
	return <div className={`grid ${colClass} my-6 gap-4`}>{children}</div>;
}
