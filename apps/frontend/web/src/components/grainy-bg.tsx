import { cn } from "@reloop/ui/cn";
import type { CSSProperties, ReactNode } from "react";

export type GrainyBgVariant = "blue" | "amber" | "mint" | "rose" | "grape" | "sky";

const NOISE_SVG =
	"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

const BASE: Record<GrainyBgVariant, string> = {
	blue: "#E7EFFF",
	amber: "#FFF6D9",
	mint: "#E8FFF4",
	rose: "#FFEAF1",
	grape: "#EFE9FF",
	sky: "#E6F6FF",
};

const DARK_BASE: Record<GrainyBgVariant, string> = {
	blue: "#0B1026",
	amber: "#1E1408",
	mint: "#071712",
	rose: "#1D0D14",
	grape: "#120E26",
	sky: "#081522",
};

const ACCENT: Record<GrainyBgVariant, string> = {
	blue: "#8AA2FF",
	amber: "#E8A94C",
	mint: "#7CC9A8",
	rose: "#FF8FAD",
	grape: "#9D85F2",
	sky: "#5EB9E8",
};

const DARK_ACCENT: Record<GrainyBgVariant, string> = {
	blue: "#4C6FFF",
	amber: "#F5B544",
	mint: "#2FBF8F",
	rose: "#FF5F8F",
	grape: "#8B6FF0",
	sky: "#3FA9E0",
};

function Shapes({
	variant,
	accent,
}: {
	variant: GrainyBgVariant;
	accent: string;
}) {
	if (variant === "blue" || variant === "rose") {
		return (
			<>
				<div
					aria-hidden
					className="absolute"
					style={{
						left: "18%",
						top: "32%",
						width: "22%",
						aspectRatio: "1",
						background: accent,
						borderRadius: "9999px",
						filter: "blur(28px)",
						opacity: 0.9,
					}}
				/>
				<div
					aria-hidden
					className="absolute"
					style={{
						right: "-12%",
						bottom: "-28%",
						width: "72%",
						aspectRatio: "1",
						background: `radial-gradient(closest-side, transparent 42%, ${accent} 43%, ${accent} 68%, transparent 71%)`,
						filter: "blur(22px)",
						opacity: 0.9,
					}}
				/>
			</>
		);
	}
	if (variant === "amber" || variant === "grape") {
		return (
			<div
				aria-hidden
				className="absolute inset-x-[-20%]"
				style={{
					top: "22%",
					height: "46%",
					background: accent,
					filter: "blur(48px)",
					opacity: 0.95,
					clipPath:
						"polygon(0 12%, 25% 0, 50% 42%, 75% 8%, 100% 28%, 100% 72%, 75% 92%, 50% 58%, 25% 100%, 0 88%)",
				}}
			/>
		);
	}
	return (
		<div
			aria-hidden
			className="absolute"
			style={{
				inset: "4%",
				background: `radial-gradient(closest-side, transparent 52%, ${accent} 53%, ${accent} 78%, transparent 81%)`,
				filter: "blur(24px)",
				opacity: 0.95,
			}}
		/>
	);
}

/**
 * Grainy pastel background — CSS recreation of the reference:
 * soft blurred blob / wave / ring on a tinted base + film grain.
 * Use as a card/section backdrop: <GrainyBg variant="blue" />
 */
export function GrainyBg({
	variant,
	className,
	style,
	children,
}: {
	variant: GrainyBgVariant;
	className?: string;
	style?: CSSProperties;
	children?: ReactNode;
}) {
	return (
		<div
			className={cn("relative overflow-hidden", className)}
			style={{ ...style, backgroundColor: BASE[variant] }}
		>
			<div className="absolute inset-0 dark:hidden">
				<Shapes variant={variant} accent={ACCENT[variant]} />
			</div>
			<div
				className="absolute inset-0 hidden dark:block"
				style={{ backgroundColor: DARK_BASE[variant] }}
			>
				<Shapes variant={variant} accent={DARK_ACCENT[variant]} />
			</div>
			{/* film grain — multiply on light, screen on dark */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 dark:hidden"
				style={{
					backgroundImage: NOISE_SVG,
					opacity: 0.28,
					mixBlendMode: "multiply",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 hidden dark:block"
				style={{
					backgroundImage: NOISE_SVG,
					opacity: 0.22,
					mixBlendMode: "screen",
				}}
			/>
			{children && <div className="relative">{children}</div>}
		</div>
	);
}
