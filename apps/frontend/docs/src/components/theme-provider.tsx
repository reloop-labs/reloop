"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Client-only wrapper around next-themes ThemeProvider.
 * 
 * next-themes@0.4.x injects a raw <script> tag into the React tree
 * to prevent theme flash. React 19 (Next.js 16+) rejects <script>
 * inside components, producing a console error.
 * 
 * By isolating ThemeProvider in a "use client" component, the script
 * tag is only rendered during SSR (where it works fine) and the
 * console error is suppressed because suppressHydrationWarning
 * propagates from the parent <html> element.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			{children}
		</NextThemesProvider>
	);
}
