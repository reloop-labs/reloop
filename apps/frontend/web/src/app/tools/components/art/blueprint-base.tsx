import type { ReactNode } from "react";

/**
 * Shared drafting backdrop for card arts: faint grid + dotted guide.
 */
export function BlueprintBase({ children }: { children: ReactNode }) {
	return (
		<>
			<g stroke="currentColor" strokeWidth="1" opacity="0.2">
				<line x1="20" y1="0" x2="20" y2="160" />
				<line x1="60" y1="0" x2="60" y2="160" />
				<line x1="100" y1="0" x2="100" y2="160" />
				<line x1="140" y1="0" x2="140" y2="160" />
				<line x1="180" y1="0" x2="180" y2="160" />
				<line x1="0" y1="40" x2="200" y2="40" />
				<line x1="0" y1="80" x2="200" y2="80" />
				<line x1="0" y1="120" x2="200" y2="120" />
			</g>
			<circle
				cx="100"
				cy="80"
				r="62"
				stroke="currentColor"
				strokeWidth="1"
				strokeDasharray="3 4"
				opacity="0.3"
			/>
			{children}
			<g fill="currentColor">
				<rect x="14" y="14" width="9" height="9" rx="2" />
				<rect x="177" y="14" width="9" height="9" rx="2" />
				<rect x="14" y="137" width="9" height="9" rx="2" />
			</g>
		</>
	);
}
