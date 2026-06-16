"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
	const origError = console.error;
	console.error = (...args: unknown[]) => {
		if (
			typeof args[0] === "string" &&
			args[0].includes("Encountered a script tag")
		) {
			return;
		}
		origError.apply(console, args);
	};
}

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
