import * as Button from "@reloop/ui/button";
import { BadgeCheck, Inbox, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const providers = [
	{ name: "Gmail", src: "/company-logos/gmail.svg" },
	{ name: "Outlook", src: "/company-logos/outlook.svg" },
	{ name: "Yahoo", src: "/company-logos/yahoo.svg" },
	{ name: "Apple", src: "/company-logos/apple.svg", invert: true },
	{ name: "Inbox" },
];

export function TransactionalEmails() {
	return (
		<section
			aria-labelledby="transactional-emails-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl dark:border-white/10">
				{/* 2-column main split */}
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 border-stroke-soft-100 border-t lg:grid-cols-2 lg:divide-x lg:divide-y-0 dark:divide-white/10 dark:border-white/10">
					{/* Left Column: Styled exactly to reference card specification */}
					<div
						data-grid-content="true"
						data-slot="feature-card-content"
						className="flex h-full flex-col space-y-6 bg-white p-6 sm:p-8 lg:p-12 dark:bg-black"
					>
						{/* Icon Circle */}
						<div className="flex size-12 rounded-full bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
							<Mail
								aria-hidden
								className="m-auto size-4 text-zinc-950 dark:text-white"
							/>
						</div>

						{/* Headline */}
						<h2
							id="transactional-emails-heading"
							className="font-semibold text-3xl text-zinc-950 dark:text-white"
						>
							Built for deliverability.
						</h2>

						{/* Description */}
						<p className="text-balance text-zinc-600 dark:text-zinc-400">
							Get your emails where they belong. We handle authentication, IP
							reputation and warmups so your messages land in inboxes, not spam
							folders.
						</p>

						{/* Checklist */}
						<ul className="w-full space-y-2">
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<BadgeCheck
									className="size-4 shrink-0 fill-zinc-950 text-white dark:fill-white dark:text-zinc-950"
									strokeWidth={2}
								/>
								<span>SPF, DKIM & DMARC Authentication</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<BadgeCheck
									className="size-4 shrink-0 fill-zinc-950 text-white dark:fill-white dark:text-zinc-950"
									strokeWidth={2}
								/>
								<span>IP Reputation & Warmup Management</span>
							</li>
							<li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
								<BadgeCheck
									className="size-4 shrink-0 fill-zinc-950 text-white dark:fill-white dark:text-zinc-950"
									strokeWidth={2}
								/>
								<span>Real-time Deliverability & Blocklist Tracking</span>
							</li>
						</ul>

						{/* Action Button */}
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							asChild
							className="mt-auto w-fit"
						>
							<Link href="/features/transaction-emails">Learn more</Link>
						</Button.Root>
					</div>

					{/* Right Column: App -> Reloop -> Inbox providers flow */}
					<div className="flex h-full flex-col items-center justify-center bg-white px-6 py-12 sm:px-12 dark:bg-black">
						<div className="flex w-full max-w-sm flex-col items-center">
							{/* Top node: email template file */}
							<div aria-hidden="true" className="relative size-fit">
								<div className="-right-3 absolute bottom-2 z-[2] rounded bg-zinc-600 px-1.5 py-0.5 font-semibold text-[10px] text-white shadow-lg">
									email
								</div>
								<div className="relative z-[1] w-16 space-y-2 rounded-md rounded-tr-[15%] bg-white p-2.5 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
									<div className="space-y-1.5">
										<div className="flex items-center gap-1">
											<div className="font-bold text-[6px] text-zinc-300 dark:text-zinc-600">
												#
											</div>
											<div className="h-[3px] w-6 rounded-full bg-zinc-300 dark:bg-zinc-700" />
										</div>
										<div className="space-y-0.5 pl-0.5">
											<div className="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
											<div className="h-0.5 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
											<div className="h-0.5 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
										</div>
									</div>
									<div className="space-y-1.5">
										<div className="flex items-center gap-1">
											<div className="font-bold text-[6px] text-zinc-300 dark:text-zinc-600">
												##
											</div>
											<div className="h-[3px] w-5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
										</div>
										<div className="space-y-0.5 pl-0.5">
											<div className="h-0.5 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
											<div className="h-0.5 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800" />
										</div>
										<div className="space-y-0.5 pl-0.5">
											<div className="h-0.5 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
											<div className="h-0.5 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800" />
											<div className="h-0.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
										</div>
									</div>
								</div>
							</div>

							{/* Connector: top to center */}
							<span
								aria-hidden
								className="h-10 w-0 border-stroke-soft-100 border-l border-solid dark:border-white/10"
							/>

							{/* Center node: Reloop */}
							<span className="relative flex items-center justify-center">
								<span className="relative flex size-12 items-center justify-center rounded-full bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
									<svg
										width="38"
										height="38"
										viewBox="0 0 200 200"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										aria-hidden
										className="overflow-visible"
									>
										<rect
											x={55}
											y={51}
											width={83}
											height={8}
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={55}
											y={59}
											width={75}
											height={8}
											transform="rotate(90 55 59)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={146}
											y={59}
											width={46}
											height={8}
											transform="rotate(90 146 59)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={154}
											y={69}
											width={44}
											height={8}
											transform="rotate(90 154 69)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={138}
											y={59}
											width={46}
											height={8}
											transform="rotate(90 138 59)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={130}
											y={59}
											width={46}
											height={8}
											transform="rotate(90 130 59)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={90}
											y={105}
											width={29}
											height={8}
											transform="rotate(90 90 105)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={82}
											y={105}
											width={29}
											height={8}
											transform="rotate(90 82 105)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={138}
											y={105}
											width={8}
											height={8}
											transform="rotate(90 138 105)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={146}
											y={105}
											width={8}
											height={8}
											transform="rotate(90 146 105)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={146}
											y={134}
											width={8}
											height={8}
											transform="rotate(90 146 134)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={130}
											y={105}
											width={8}
											height={8}
											transform="rotate(90 130 105)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={122}
											y={105}
											width={8}
											height={8}
											transform="rotate(90 122 105)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={98}
											y={77}
											width={10}
											height={8}
											transform="rotate(90 98 77)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={90}
											y={77}
											width={10}
											height={8}
											transform="rotate(90 90 77)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={82}
											y={77}
											width={10}
											height={8}
											transform="rotate(90 82 77)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={146}
											y={113}
											width={21}
											height={8}
											transform="rotate(90 146 113)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={154}
											y={122}
											width={20}
											height={8}
											transform="rotate(90 154 122)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={138}
											y={113}
											width={21}
											height={8}
											transform="rotate(90 138 113)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={130}
											y={113}
											width={21}
											height={8}
											transform="rotate(90 130 113)"
											className="fill-[#4D4D4D] dark:fill-[#878787]"
										/>
										<rect
											x={98}
											y={113}
											width={21}
											height={8}
											transform="rotate(90 98 113)"
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={55}
											y={134}
											width={83}
											height={8}
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
										<rect
											x={63}
											y={142}
											width={83}
											height={8}
											className="fill-[#2C2C2C] dark:fill-[#D2D2D2]"
										/>
									</svg>
								</span>
							</span>

							{/* Curved connectors to providers */}
							<svg
								aria-hidden
								viewBox="0 0 300 72"
								preserveAspectRatio="none"
								className="h-28 w-full max-w-sm"
							>
								{["30", "90", "150", "210", "270"].map((x) => (
									<path
										key={x}
										d={`M150 0 C150 36 ${x} 36 ${x} 72`}
										fill="none"
										strokeWidth="1"
										strokeLinecap="round"
										strokeDasharray="1 5"
										vectorEffect="non-scaling-stroke"
										className="stroke-stroke-soft-100 dark:stroke-white/10"
									/>
								))}
							</svg>

							{/* Provider nodes */}
							<div className="flex w-full max-w-md items-start justify-between">
								{providers.map((provider) => (
									<div
										key={provider.name}
										className="flex w-16 flex-col items-center gap-2"
									>
										<span className="flex size-12 items-center justify-center rounded-full bg-white p-2 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
											{"src" in provider && provider.src ? (
												<Image
													alt={provider.name}
													src={provider.src}
													width={32}
													height={32}
													loading="lazy"
													className={`h-6 w-6 object-contain ${"invert" in provider && provider.invert ? "dark:invert" : ""}`}
												/>
											) : (
												<Inbox
													aria-hidden
													className="size-6 text-zinc-500 dark:text-zinc-400"
													strokeWidth={1.75}
												/>
											)}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
