"use client";

import { Icon } from "@reloop/ui/icon";
import { SupportChatPanel } from "#/features/dashboard/layout/support-chat-panel";

const CONTACT_EMAIL = "reloop.sh@gmail.com";
const CONTACT_PHONE = "+91 7411367725";
const CONTACT_PHONE_HREF = "tel:+917411367725";
const DISCORD_URL = "https://discord.gg/ZBYwWKY96U";

const CONTACT_ITEMS = [
	{
		label: "Email",
		value: CONTACT_EMAIL,
		href: `mailto:${CONTACT_EMAIL}`,
		external: false,
		icon: "mail-single",
	},
	{
		label: "Phone",
		value: CONTACT_PHONE,
		href: CONTACT_PHONE_HREF,
		external: false,
		icon: "smartphone",
	},
	{
		label: "Discord",
		value: "Join Discord",
		href: DISCORD_URL,
		external: true,
		icon: "social-discord",
	},
	{
		label: "Office hours",
		value: "Book a call",
		href: "https://cal.com/pranavp/30",
		external: true,
		icon: "calendar",
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
						Chat directly with the founders. Whoever is free jumps in typically
						replies in 2 to 3 minutes.
					</p>
				</div>
			</div>

			<div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
				{/* Left: live chat */}
				<section
					aria-label="Support chat"
					className="flex h-[560px] flex-col overflow-hidden rounded-[20px] border border-stroke-soft-100 bg-white lg:sticky lg:top-16 lg:h-[720px] dark:border-stroke-soft-100/70 dark:bg-black"
				>
					<SupportChatPanel hideCloseButton />
				</section>

				{/* Right: contact details */}
				<div className="w-full">
					<div className="max-w-sm space-y-5 md:mx-auto">
						{CONTACT_ITEMS.map((item) => (
							<a
								key={item.label}
								href={item.href}
								{...(item.external
									? { target: "_blank", rel: "noopener noreferrer" }
									: {})}
								className="flex items-center gap-2 font-medium text-sm text-text-strong-950 hover:underline dark:text-white"
							>
								<Icon
									name={item.icon}
									className="size-4 shrink-0 text-text-sub-600 dark:text-white/55"
								/>
								{item.value}
							</a>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
