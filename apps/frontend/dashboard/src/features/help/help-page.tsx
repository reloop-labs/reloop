"use client";

import { Icon } from "@reloop/ui/icon";
import { Calendar, Mail, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import { SupportChatPanel } from "#/features/dashboard/layout/support-chat-panel";

const CONTACT_EMAIL = "reloop.sh@gmail.com";
const CONTACT_PHONE = "+91 7411367725";
const CONTACT_PHONE_HREF = "tel:+917411367725";
const DISCORD_URL = "https://discord.gg/ZBYwWKY96U";

const CARD =
	"rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/30 p-5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]";

const FOUNDERS = [
	{
		name: "Pranav Patel",
		role: "Co-founder",
		bio: "Sets platform architecture, API ergonomics, and core open-source engine design across Reloop.",
		image: "/team/pranav-patel.png",
		socials: [
			{
				label: "X (Twitter)",
				href: "https://x.com/thatspranav",
				icon: "twitter",
			},
			{
				label: "LinkedIn",
				href: "https://www.linkedin.com/in/pranavp10/",
				icon: "linkedin",
			},
			{
				label: "GitHub",
				href: "https://github.com/pranavp10",
				icon: "github",
			},
			{
				label: "Email",
				href: "mailto:pranavkp.me@outlook.com",
				icon: "mail",
			},
		],
	},
	{
		name: "Twinkal P",
		role: "Co-founder",
		bio: "Architects the high-throughput delivery pipeline and deployment infrastructure across hosted and self-hosted environments.",
		image: "/team/twinkal-p.png",
		socials: [
			{
				label: "GitHub",
				href: "https://github.com/twinkalp10",
				icon: "github",
			},
		],
	},
];

const BENEFITS = [
	"Get help setting up self-hosting or SMTP",
	"Debug deliverability or API integration issues",
	"Share feedback and feature requests directly",
];

const CONTACT_ROWS = [
	{
		icon: Mail,
		label: CONTACT_EMAIL,
		href: `mailto:${CONTACT_EMAIL}`,
		external: false,
	},
	{
		icon: Phone,
		label: CONTACT_PHONE,
		href: CONTACT_PHONE_HREF,
		external: false,
	},
	{
		icon: MessageCircle,
		label: "Join Discord",
		href: DISCORD_URL,
		external: true,
	},
	{
		icon: Calendar,
		label: "Book a call",
		href: "https://cal.com/pranavp/30",
		external: true,
	},
];

export function HelpPage() {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="pt-5">
				<div>
					<h1 className="font-semibold text-text-strong-950 text-title-h5">
						Help
					</h1>
					<p className="mt-1 text-paragraph-sm text-text-sub-600">
						Chat directly with the founders. Whoever is free jumps in —
						typically replies in 2 to 3 minutes.
					</p>
				</div>
			</div>

			<div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
				{/* Left: live chat */}
				<section
					aria-label="Support chat"
					className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-100 bg-white lg:sticky lg:top-16 lg:h-[720px] dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]"
				>
					<SupportChatPanel hideCloseButton />
				</section>

				{/* Right: topics + founder details */}
				<div className="w-full space-y-6">
					<div className={CARD}>
						<div className="border-stroke-soft-100 border-b pb-5 dark:border-stroke-soft-100/40">
							<h2 className="font-medium text-label-md text-text-strong-950">
								What we can help with
							</h2>
						</div>

						<div className="grid grid-cols-1 gap-x-6 gap-y-3 pt-5">
							{BENEFITS.map((benefit) => (
								<div key={benefit} className="flex items-center gap-2">
									<Icon
										name="check-circle"
										className="h-4 w-4 shrink-0 text-text-sub-600"
									/>
									<span className="font-medium text-paragraph-sm text-text-sub-600">
										{benefit}
									</span>
								</div>
							))}
						</div>

						<div className="mt-5 overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/40">
							{CONTACT_ROWS.map((row, index) => {
								const RowIcon = row.icon;
								return (
									<a
										key={row.label}
										href={row.href}
										{...(row.external
											? { target: "_blank", rel: "noopener noreferrer" }
											: {})}
										className={`flex items-center gap-2.5 px-5 py-3.5 transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/[0.03] ${
											index < CONTACT_ROWS.length - 1
												? "border-stroke-soft-100 border-b dark:border-stroke-soft-100/40"
												: ""
										}`}
									>
										<RowIcon className="h-4 w-4 shrink-0 text-text-sub-600" />
										<span className="font-medium text-paragraph-sm text-text-strong-950">
											{row.label}
										</span>
									</a>
								);
							})}
						</div>
					</div>

					<div className={CARD}>
						<div className="border-stroke-soft-100 border-b pb-5 dark:border-stroke-soft-100/40">
							<div className="flex items-center gap-2">
								<h2 className="font-medium text-label-md text-text-strong-950">
									The founders
								</h2>
								<span className="inline-flex h-5 items-center gap-1 rounded-full bg-emerald-500/10 px-2 font-medium text-emerald-700 text-label-xs dark:text-emerald-400">
									<span className="relative flex h-1.5 w-1.5">
										<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
										<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
									</span>
									Online
								</span>
							</div>
							<p className="mt-1 font-medium text-[12px] text-text-sub-600">
								Pranav & Twinkal · replies in ~2 mins
							</p>
						</div>

						<div className="divide-y divide-stroke-soft-100 dark:divide-stroke-soft-100/40">
							{FOUNDERS.map((founder) => (
								<div key={founder.name} className="flex gap-4 py-5">
									<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bg-weak-50 dark:bg-white/[0.06]">
										<Image
											src={founder.image}
											alt={founder.name}
											fill
											className="object-cover object-top"
											sizes="64px"
										/>
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-mono text-[11px] text-text-sub-600 uppercase tracking-wider">
											{founder.role}
										</p>
										<h3 className="mt-0.5 font-semibold text-[15px] text-text-strong-950">
											{founder.name}
										</h3>
										<p className="mt-1 text-paragraph-sm text-text-sub-600 leading-relaxed">
											{founder.bio}
										</p>
										<div className="mt-3 flex items-center gap-1.5">
											{founder.socials.map((social) => {
												const isEmail = social.href.startsWith("mailto:");
												return (
													<a
														key={social.label}
														href={social.href}
														{...(isEmail
															? {}
															: {
																	target: "_blank",
																	rel: "noopener noreferrer",
																})}
														title={social.label}
														aria-label={`${social.label} – ${founder.name}`}
														className="flex h-8 w-8 items-center justify-center rounded-xl border border-stroke-soft-100 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
													>
														<Icon name={social.icon} className="h-3.5 w-3.5" />
													</a>
												);
											})}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
