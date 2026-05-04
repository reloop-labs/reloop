"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	ArrowUp,
	ChevronDown,
	Code2,
	Coffee,
	GraduationCap,
	Lightbulb,
	Paperclip,
	Pencil,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
	const { user } = useUserOrganization();
	const [message, setMessage] = useState("");

	const firstName = user?.name?.split(" ")[0] || user?.email.split("@")[0];

	const greeting = (() => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	})();

	return (
		<div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 dark:bg-[#0a0a0a]">
			<div className="flex w-full max-w-3xl flex-col items-center">
				<button
					type="button"
					className="mb-12 rounded-full border border-stroke-soft-100 bg-bg-surface-800/5 px-4 py-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:bg-bg-surface-800/10 dark:border-white/10 dark:text-white/60"
				>
					Get Pro
				</button>
				<div className="mb-10 flex items-center gap-1 text-center">
					<div className="p-1">
						<Icon name="sparkling" className="h-8 w-8" strokeWidth={1.5} />
					</div>
					<h1 className="font-medium font-serif text-3xl text-text-strong-950 tracking-tight dark:text-white/90">
						{greeting}, {firstName}
					</h1>
				</div>
				<div className="mb-8 w-full rounded-[32px] border border-stroke-soft-100 bg-white p-5 transition-all focus-within:ring-2 focus-within:ring-neutral-alpha-10 dark:border-white/10 dark:bg-[#1a1a1a]">
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="How can I help you today?"
						className="w-full resize-none bg-transparent px-2 py-1 text-xl placeholder-text-soft-400 outline-none dark:text-white/90 dark:placeholder-white/20"
					/>

					<div className="mt-2 flex items-center justify-between px-1">
						<button
							type="button"
							className="group rounded-full p-2.5 transition-colors hover:bg-bg-weak-50 dark:hover:bg-white/5"
						>
							<Paperclip className="h-5 w-5 text-text-sub-600 transition-colors dark:text-white/40 group-hover:dark:text-white/60" />
						</button>

						<div className="flex items-center gap-2">
							<Button.Root
								variant="neutral"
								className="h-10 w-10 rounded-full p-1!"
							>
								<ArrowUp />
							</Button.Root>
						</div>
					</div>
				</div>
				<div className="flex flex-wrap justify-center gap-3">
					<ActionButton
						icon={<Icon name="mail-single" className="h-4 w-4" />}
						label="Emails"
					/>
					<ActionButton
						icon={<Icon name="fat-row" className="h-4 w-4" />}
						label="Metrics"
					/>
					<ActionButton
						icon={<Icon name="users" className="h-4 w-4" />}
						label="Contacts"
					/>
					<ActionButton
						icon={<Icon name="file-text" className="h-4 w-4" />}
						label="Logs"
					/>
				</div>
			</div>
		</div>
	);
}

function ActionButton({
	icon,
	label,
	isSpecial,
}: {
	icon: React.ReactNode;
	label: string;
	isSpecial?: boolean;
}) {
	return (
		<button
			type="button"
			className="flex items-center gap-2.5 rounded-2xl border border-stroke-soft-100 bg-white px-5 py-2.5 font-medium text-[15px] transition-all hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/10"
		>
			<span className="text-text-soft-400 dark:text-white/40">{icon}</span>
			<span
				className={
					isSpecial
						? "bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent"
						: "text-text-sub-600 dark:text-white/70"
				}
			>
				{label}
			</span>
		</button>
	);
}
