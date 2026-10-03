"use client";

import { cn } from "@reloop/ui/cn";
import { Check, Copy, Eye } from "lucide-react";
import { useState } from "react";

/**
 * Pure Reloop Logo mark in crisp white/silver for the minimalist manifesto
 */
function ReloopLogoMark({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Reloop Logo"
		>
			<rect x={55} y={51} width={83} height={8} fill="#f4f4f5" />
			<rect
				x={55}
				y={59}
				width={75}
				height={8}
				transform="rotate(90 55 59)"
				fill="#f4f4f5"
			/>
			<rect
				x={146}
				y={59}
				width={46}
				height={8}
				transform="rotate(90 146 59)"
				fill="#f4f4f5"
			/>
			<rect
				x={154}
				y={69}
				width={44}
				height={8}
				transform="rotate(90 154 69)"
				fill="#f4f4f5"
			/>
			<rect
				x={138}
				y={59}
				width={46}
				height={8}
				transform="rotate(90 138 59)"
				fill="#a1a1aa"
			/>
			<rect
				x={130}
				y={59}
				width={46}
				height={8}
				transform="rotate(90 130 59)"
				fill="#a1a1aa"
			/>
			<rect
				x={90}
				y={105}
				width={29}
				height={8}
				transform="rotate(90 90 105)"
				fill="#a1a1aa"
			/>
			<rect
				x={82}
				y={105}
				width={29}
				height={8}
				transform="rotate(90 82 105)"
				fill="#a1a1aa"
			/>
			<rect
				x={98}
				y={59}
				width={29}
				height={8}
				transform="rotate(90 98 59)"
				fill="#a1a1aa"
			/>
			<rect
				x={90}
				y={77}
				width={10}
				height={8}
				transform="rotate(90 90 77)"
				fill="#a1a1aa"
			/>
			<rect
				x={82}
				y={77}
				width={10}
				height={8}
				transform="rotate(90 82 77)"
				fill="#a1a1aa"
			/>
			<rect
				x={146}
				y={113}
				width={21}
				height={8}
				transform="rotate(90 146 113)"
				fill="#f4f4f5"
			/>
			<rect
				x={154}
				y={122}
				width={20}
				height={8}
				transform="rotate(90 154 122)"
				fill="#f4f4f5"
			/>
			<rect
				x={138}
				y={113}
				width={21}
				height={8}
				transform="rotate(90 138 113)"
				fill="#a1a1aa"
			/>
			<rect
				x={130}
				y={113}
				width={21}
				height={8}
				transform="rotate(90 130 113)"
				fill="#a1a1aa"
			/>
			<rect
				x={98}
				y={113}
				width={21}
				height={8}
				transform="rotate(90 98 113)"
				fill="#f4f4f5"
			/>
			<rect x={55} y={134} width={83} height={8} fill="#f4f4f5" />
			<rect x={63} y={142} width={83} height={8} fill="#f4f4f5" />
		</svg>
	);
}

export function TwitterManifestoShowcase() {
	const [copied, setCopied] = useState(false);
	const [showControls, setShowControls] = useState(false);
	const [bgTone, setBgTone] = useState<"polar" | "black">("polar");
	const [fontSize, setFontSize] = useState<"standard" | "large">("standard");

	const tweetText = `You don’t need to learn a tutorial to send an email.

You shouldn’t need to read docs, create API keys, configure domains, figure out DNS, and spend hours connecting email infrastructure just to send your first email.

Just tell your agent what you want.

“Set up email for my app using Reloop.”

Reloop handles the rest.

Prefer agents? We’ve got you.
Prefer the UI? We’ve got you.
Love great DX? We’ve got you.
Love great UI/UX? We’ve got you.

Reloop is built for the way you work.

Still not convinced? Reloop is open source and self-hostable.

Run it yourself. Own your infrastructure.

—

With love,
The Reloop Team`;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(tweetText);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// fallback
		}
	};

	return (
		<div
			className={cn(
				"relative flex min-h-dvh w-full flex-col items-center justify-center p-6 antialiased sm:p-12 md:p-16 transition-colors duration-300",
				bgTone === "polar" ? "bg-[#0e0e10]" : "bg-black",
			)}
		>
			{/* Discreet Floating Utility Bar at top right */}
			<div className="fixed top-4 right-4 z-40 flex items-center gap-2">
				<button
					type="button"
					onClick={() => setShowControls((v) => !v)}
					className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-zinc-400 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
				>
					{showControls ? "Hide Options" : "Options"}
				</button>

				<button
					type="button"
					onClick={handleCopy}
					className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-zinc-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
				>
					{copied ? (
						<>
							<Check className="h-3 w-3 text-emerald-400" />
							<span>Copied</span>
						</>
					) : (
						<>
							<Copy className="h-3 w-3 text-zinc-400" />
							<span>Copy text</span>
						</>
					)}
				</button>
			</div>

			{/* Expandable Options Tray */}
			{showControls && (
				<div className="fixed top-14 right-4 z-40 flex flex-col gap-2 rounded-xl border border-white/10 bg-[#161619] p-3 text-xs shadow-2xl backdrop-blur-xl">
					<div className="flex items-center justify-between gap-4">
						<span className="text-zinc-400 font-mono text-[11px]">Background</span>
						<div className="flex rounded-lg bg-black/40 p-0.5">
							<button
								type="button"
								onClick={() => setBgTone("polar")}
								className={cn(
									"rounded px-2 py-0.5 text-[11px] font-mono",
									bgTone === "polar"
										? "bg-white/20 text-white"
										: "text-zinc-400",
								)}
							>
								Polar (#0e0e10)
							</button>
							<button
								type="button"
								onClick={() => setBgTone("black")}
								className={cn(
									"rounded px-2 py-0.5 text-[11px] font-mono",
									bgTone === "black"
										? "bg-white/20 text-white"
										: "text-zinc-400",
								)}
							>
								Pure Black
							</button>
						</div>
					</div>

					<div className="flex items-center justify-between gap-4">
						<span className="text-zinc-400 font-mono text-[11px]">Size</span>
						<div className="flex rounded-lg bg-black/40 p-0.5">
							<button
								type="button"
								onClick={() => setFontSize("standard")}
								className={cn(
									"rounded px-2 py-0.5 text-[11px] font-mono",
									fontSize === "standard"
										? "bg-white/20 text-white"
										: "text-zinc-400",
								)}
							>
								Standard
							</button>
							<button
								type="button"
								onClick={() => setFontSize("large")}
								className={cn(
									"rounded px-2 py-0.5 text-[11px] font-mono",
									fontSize === "large"
										? "bg-white/20 text-white"
										: "text-zinc-400",
								)}
							>
								Large
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ============================================================== */}
			{/*           THE POLAR-STYLE MANIFESTO CANVAS / CARD              */}
			{/* ============================================================== */}
			<div
				className={cn(
					"relative flex w-full flex-col justify-center",
					fontSize === "standard" ? "max-w-[560px]" : "max-w-[620px]",
				)}
			>
				{/* Brand Logo Mark */}
				<div className="mb-12 sm:mb-16">
					<ReloopLogoMark className="h-10 w-10 sm:h-11 sm:w-11" />
				</div>

				{/* Manifesto Text Content */}
				<div
					className={cn(
						"space-y-6 sm:space-y-7 font-sans font-normal tracking-[-0.01em]",
						"text-[#e1e1e4] selection:bg-white/20 selection:text-white",
						fontSize === "standard"
							? "text-[18px] leading-[1.65] sm:text-[20px] sm:leading-[1.65]"
							: "text-[20px] leading-[1.65] sm:text-[22px] sm:leading-[1.65]",
					)}
				>
					<p>You don’t need to learn a tutorial to send an email.</p>

					<p>
						You shouldn’t need to read docs, create API keys, configure
						domains, figure out DNS, and spend hours connecting email
						infrastructure just to send your first email.
					</p>

					<p>Just tell your agent what you want.</p>

					<p>“Set up email for my app using Reloop.”</p>

					<p>Reloop handles the rest.</p>

					<p>
						Prefer agents? We’ve got you.
						<br />
						Prefer the UI? We’ve got you.
						<br />
						Love great DX? We’ve got you.
						<br />
						Love great UI/UX? We’ve got you.
					</p>

					<p>Reloop is built for the way you work.</p>

					<p>Still not convinced? Reloop is open source and self-hostable.</p>

					<p>Run it yourself. Own your infrastructure.</p>

					{/* Polar-style Em-dash & Sign-off */}
					<div className="pt-2 space-y-4">
						<p className="text-zinc-500">—</p>
						<p className="leading-snug">
							With love,
							<br />
							The Reloop Team
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
