import { ThemeToggle } from "@reloop/links/components/theme-toggle";
import { socialProfiles } from "@reloop/links/lib/site";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";

/**
 * Full-viewport retro technical poster for link.reloop.sh.
 * Grain + line art; supports light & dark via next-themes + --retro-* tokens.
 */
export function LinksLanding() {
	return (
		<div className="links-retro flex h-dvh w-full items-center justify-center p-4 sm:p-6">
			<div className="links-poster relative flex h-full max-h-[820px] w-full max-w-[420px] flex-col">
				{/* Theme control — top right of the plate */}
				<div className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
					<ThemeToggle />
				</div>

				{/* Brand */}
				<header className="flex shrink-0 flex-col items-center gap-2 px-6 pt-7 sm:pt-8">
					<a
						href={socialProfiles.main}
						className="links-poster-brand flex items-center gap-2.5 transition-opacity hover:opacity-75"
						aria-label="Reloop"
					>
						<span className="links-poster-logo inline-flex">
							<Logo className="h-8 w-8" />
						</span>
						<span className="links-poster-mono text-[13px] uppercase tracking-[0.06em]">
							Reloop
						</span>
					</a>
					<span className="links-poster-mono text-[9px] uppercase tracking-[0.16em] opacity-45">
						link.reloop.sh
					</span>
				</header>

				{/* Diagram / legend + window */}
				<div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-4 sm:px-8">
					<div className="flex w-full max-w-[280px] items-start justify-between gap-3">
						<div className="flex flex-col gap-3 pt-1">
							<div className="flex items-center gap-3">
								<BoltMark />
								<LinkRingsMark />
							</div>
							<ul className="links-poster-mono space-y-0.5 text-[9px] uppercase leading-[1.45] tracking-[0.04em] sm:text-[10px]">
								<li>TRACKING</li>
								<li>
									CLICK <span className="opacity-50">→</span> REDIRECT
								</li>
								<li>
									OPEN{" "}
									<span className="inline-block align-middle">
										<span className="inline-block h-1.5 w-2.5 border border-current border-dashed" />
									</span>
								</li>
								<li>EMAIL PREFS</li>
							</ul>
						</div>

						<div className="pt-0.5" aria-hidden>
							<DotGrid />
						</div>

						<div
							className="links-poster-mono flex flex-col items-center self-stretch py-0.5 text-[10px] tracking-[0.2em]"
							aria-hidden
						>
							<span className="leading-none">]</span>
							<span
								className="flex flex-1 items-center justify-center py-1"
								style={{
									writingMode: "vertical-rl",
									transform: "rotate(180deg)",
								}}
							>
								RELOOP
							</span>
							<span className="leading-none">[</span>
						</div>
					</div>

					{/* Browser window */}
					<div className="links-poster-window mt-7 w-full max-w-[300px]">
						<div className="links-poster-window-chrome flex items-center gap-1.5 px-2.5 py-2">
							<span className="links-poster-dot" />
							<span className="links-poster-dot" />
							<span className="links-poster-dot" />
						</div>
						<div className="flex items-center justify-center px-6 py-9 sm:py-10">
							<div className="links-poster-cta" role="presentation">
								<span className="links-poster-cta-label">Preferences</span>
							</div>
						</div>
					</div>

					<p className="links-poster-mono mt-5 max-w-[34ch] text-center text-[10px] uppercase leading-relaxed tracking-[0.06em] opacity-55 sm:text-[11px]">
						Open the link from your email to manage
						<br className="hidden sm:block" /> topics or unsubscribe.
					</p>
				</div>

				{/* About Reloop + socials */}
				<section className="shrink-0 px-6 pb-3 sm:px-8">
					<div className="links-poster-footer-rule mb-4" />
					<div className="text-center">
						<p className="links-poster-mono text-[9px] uppercase tracking-[0.18em] opacity-50">
							About Reloop
						</p>
						<p className="links-poster-about mx-auto mt-2 max-w-[36ch] text-[12px] leading-relaxed sm:text-[13px]">
							Reloop is the email platform behind this host — transactional
							mail, domains, tracking, and preference pages for modern product
							teams.
						</p>
						<a
							href={socialProfiles.main}
							className="links-poster-mono mt-2.5 inline-block text-[10px] uppercase tracking-[0.1em] underline-offset-4 opacity-70 transition-opacity hover:underline hover:opacity-100"
						>
							reloop.sh →
						</a>
					</div>

					<nav
						className="mt-5 flex items-center justify-center gap-3"
						aria-label="Reloop on the web"
					>
						{SOCIALS.map((item) => (
							<a
								key={item.href}
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="links-poster-social"
								aria-label={item.label}
								title={item.label}
							>
								<Icon name={item.icon} className="size-4" aria-hidden />
							</a>
						))}
					</nav>
				</section>

				{/* Footer plate */}
				<footer className="shrink-0 px-5 pt-3 pb-5 sm:px-7">
					<div className="links-poster-footer-rule" />
					<div className="links-poster-mono mt-2.5 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.12em] sm:text-[10px]">
						<span>link.reloop.sh</span>
						<span
							className="links-poster-footer-rule min-w-[2.5rem] flex-1 opacity-40"
							aria-hidden
						/>
						<span className="opacity-70">[ preferences ]</span>
					</div>
				</footer>
			</div>
		</div>
	);
}

const SOCIALS = [
	{
		label: "Reloop on X",
		href: socialProfiles.x,
		icon: "social-x",
	},
	{
		label: "Reloop on GitHub",
		href: socialProfiles.github,
		icon: "social-github",
	},
	{
		label: "Reloop on Discord",
		href: socialProfiles.discord,
		icon: "social-discord",
	},
	{
		label: "Reloop website",
		href: socialProfiles.main,
		icon: "social-link",
	},
] as const;

function BoltMark() {
	return (
		<svg
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden
			className="shrink-0"
		>
			<path d="M13.5 2 6 13.5h5.2L9.5 22 18 10.5h-5.2L13.5 2Z" />
		</svg>
	);
}

function LinkRingsMark() {
	return (
		<svg
			width="26"
			height="14"
			viewBox="0 0 28 14"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			aria-hidden
			className="shrink-0"
		>
			<circle cx="8" cy="7" r="5.25" />
			<circle cx="20" cy="7" r="5.25" />
		</svg>
	);
}

function DotGrid() {
	const cells = [
		["dot", "plus", "dot"],
		["plus", "x", "plus"],
		["dot", "plus", "dot"],
		["plus", "dot", "plus"],
	] as const;

	return (
		<div className="grid grid-cols-3 gap-x-2.5 gap-y-2.5">
			{cells.flatMap((row, ri) =>
				row.map((kind, ci) => (
					<span
						key={`${ri}-${ci}`}
						className="flex h-3.5 w-3.5 items-center justify-center"
					>
						{kind === "dot" && <span className="links-poster-grid-dot" />}
						{kind === "plus" && <PlusMark />}
						{kind === "x" && <XMark />}
					</span>
				)),
			)}
		</div>
	);
}

function PlusMark() {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
			<path
				d="M6 1v10M1 6h10"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="square"
			/>
		</svg>
	);
}

function XMark() {
	return (
		<svg width="11" height="11" viewBox="0 0 12 12" aria-hidden>
			<path
				d="M2 2l8 8M10 2l-8 8"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="square"
			/>
		</svg>
	);
}
