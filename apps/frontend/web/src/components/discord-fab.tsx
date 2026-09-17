import { getDiscordWidget } from "@reloop/web/lib/discord";
import { socialProfiles } from "@reloop/web/lib/site";
import Link from "next/link";
import { siDiscord } from "simple-icons";

export async function DiscordFab() {
	const widget = await getDiscordWidget();
	const online = widget?.onlineCount ?? 0;

	return (
		<div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 sm:right-6 sm:bottom-6">
			<Link
				href="/community"
				className="hidden rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 font-medium text-[13px] text-text-sub-600 shadow-md transition-colors hover:text-text-strong-950 sm:inline-flex dark:border-white/10 dark:bg-[#151518] dark:text-white/60 dark:hover:text-white"
			>
				Community
			</Link>
			<a
				href={widget?.inviteUrl ?? socialProfiles.discord}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={
					online > 0
						? `Join the Reloop Discord, ${online} online`
						: "Join the Reloop Discord"
				}
				className="inline-flex items-center gap-2 rounded-full bg-[#5865F2] py-2 pr-4 pl-3 font-semibold text-[13px] text-white shadow-lg transition-colors hover:bg-[#4752c4] focus-visible:outline-2 focus-visible:outline-[#5865F2] focus-visible:outline-offset-2"
			>
				<svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden>
					<path d={siDiscord.path} />
				</svg>
				Discord
				{online > 0 ? (
					<span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 font-medium text-[12px] tabular-nums">
						<span
							aria-hidden
							className="inline-block size-1.5 rounded-full bg-emerald-300"
						/>
						{online}
					</span>
				) : null}
			</a>
		</div>
	);
}
