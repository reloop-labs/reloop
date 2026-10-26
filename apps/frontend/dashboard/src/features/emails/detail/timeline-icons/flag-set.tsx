"use client";

import * as Flags from "country-flag-icons/react/3x2";
import type { ReactElement } from "react";

type FlagComponent = (props: {
	title?: string;
	className?: string;
}) => ReactElement;

/** Every country flag; loaded lazily so the set stays out of the main bundle. */
export default function FlagSet({
	code,
	className,
}: {
	code: string;
	className?: string;
}) {
	const Flag = (Flags as Record<string, FlagComponent | undefined>)[
		code.toUpperCase()
	];
	return Flag ? <Flag className={className} /> : null;
}
