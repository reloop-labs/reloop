import { getDiscordWidget } from "@reloop/web/lib/discord";
import { socialProfiles } from "@reloop/web/lib/site";
import { siDiscord } from "simple-icons";

const topics = [
	"Self-hosting and the VPS installer",
	"Deliverability, DNS and warm-up questions",
	"Agent inbox, MCP and SDK feedback",
	"Release notes before they hit the changelog",
];

export async function DiscordWidget() {
	const widget = await getDiscordWidget();
	const href = widget?.inviteUrl ?? socialProfiles.discord;
	const online = widget?.onlineCount ?? 0;

	return (
		<section
			aria-labelledby="discord-widget-title"
			className="mt-8 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white dark:border-white/10 dark:bg-[#0a0a0a]"
		>
			<div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
				<div className="flex flex-col justify-between border-stroke-soft-200 border-b p-6 sm:p-8 lg:border-r lg:border-b-0 dark:border-white/10">
					<div>
						<div className="flex items-center gap-3">
							<span className="flex size-11 items-center justify-center rounded-xl bg-[#5865F2]">
								<svg
									viewBox="0 0 24 24"
									className="size-6 fill-white"
									aria-hidden
								>
									<path d={siDiscord.path} />
								</svg>
							</span>
							<div>
								<h2
									id="discord-widget-title"
									className="font-semibold text-[18px] text-text-strong-950 leading-tight dark:text-white"
								>
									{widget?.name ?? "Reloop"} on Discord
								</h2>
								<p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-text-sub-600 dark:text-white/55">
									<span
										aria-hidden
										className={`inline-block size-2 rounded-full ${online > 0 ? "bg-emerald-500" : "bg-stroke-soft-300 dark:bg-white/30"}`}
									/>
									{widget
										? `${online} online right now`
										: "Live count unavailable, the server is still open"}
								</p>
							</div>
						</div>

						<p className="mt-6 max-w-md text-[15px] text-text-sub-600 leading-relaxed dark:text-white/60">
							The team reads every channel. Bring a stuck DNS record, a
							self-host log, or an idea for the agent inbox and you will get a
							person, not a bot.
						</p>
						<ul className="mt-5 grid gap-2 text-[14px] text-text-sub-600 dark:text-white/60">
							{topics.map((topic) => (
								<li key={topic} className="flex items-start gap-2.5">
									<span
										aria-hidden
										className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#5865F2]"
									/>
									{topic}
								</li>
							))}
						</ul>
					</div>

					<div className="mt-8 flex flex-wrap items-center gap-3">
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 font-semibold text-[14px] text-white transition-colors hover:bg-[#4752c4] focus-visible:outline-2 focus-visible:outline-[#5865F2] focus-visible:outline-offset-2"
						>
							Join the Discord
						</a>
						<span className="text-[13px] text-text-sub-600 dark:text-white/45">
							Free, no account with Reloop needed
						</span>
					</div>
				</div>

				<div className="flex flex-col justify-center bg-[#f8f8f8] p-6 sm:p-8 dark:bg-white/[0.03]">
					<p className="font-medium text-[12px] text-text-sub-600 uppercase tracking-wide dark:text-white/45">
						Online now
					</p>
					{widget && widget.members.length > 0 ? (
						<ul className="mt-4 grid gap-3">
							{widget.members.map((member) => (
								<li key={member.id} className="flex items-center gap-3">
									<img
										src={member.avatarUrl}
										alt=""
										width={36}
										height={36}
										loading="lazy"
										className="size-9 rounded-full bg-stroke-soft-200 dark:bg-white/10"
									/>
									<span className="truncate text-[14px] text-text-strong-950 dark:text-white">
										{member.username}
									</span>
									<span
										aria-hidden
										className="ml-auto size-2 rounded-full bg-emerald-500"
									/>
								</li>
							))}
						</ul>
					) : (
						<p className="mt-4 text-[14px] text-text-sub-600 dark:text-white/55">
							Nobody is showing as online at the moment. Post anyway, replies
							land within the day.
						</p>
					)}
				</div>
			</div>
		</section>
	);
}

export function DiscordWidgetSkeleton() {
	return (
		<div
			aria-hidden
			className="mt-8 h-[320px] animate-pulse rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.03]"
		/>
	);
}
