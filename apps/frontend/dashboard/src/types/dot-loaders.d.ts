declare module "@dot-loaders/react" {
	import * as React from "react";

	export interface LoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
		loader: string;
		renderer?: "text" | "svg-grid";
		speed?: number;
		paused?: boolean;
		respectReducedMotion?: boolean;
		duration?: {
			mode?: string;
			seconds?: number;
		};
		rendererOptions?: Record<string, unknown>;
		fallbackLabel?: string;
	}

	export const Loader: React.FC<LoaderProps>;
	export const LoaderInline: React.FC<LoaderProps>;
	export const LoaderOverlay: React.FC<
		LoaderProps & {
			active?: boolean;
			backdrop?: string;
			containerStyle?: React.CSSProperties;
		}
	>;
	export const LoaderProvider: React.FC<{
		defaults?: unknown;
		children: React.ReactNode;
	}>;
}
