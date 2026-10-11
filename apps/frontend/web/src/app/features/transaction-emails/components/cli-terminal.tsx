const MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

// figlet "ANSI Shadow"
const BANNER = `██████╗ ███████╗██╗      ██████╗  ██████╗ ██████╗      ██████╗██╗     ██╗
██╔══██╗██╔════╝██║     ██╔═══██╗██╔═══██╗██╔══██╗    ██╔════╝██║     ██║
██████╔╝█████╗  ██║     ██║   ██║██║   ██║██████╔╝    ██║     ██║     ██║
██╔══██╗██╔══╝  ██║     ██║   ██║██║   ██║██╔═══╝     ██║     ██║     ██║
██║  ██║███████╗███████╗╚██████╔╝╚██████╔╝██║         ╚██████╗███████╗██║
╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═╝          ╚═════╝╚══════╝╚═╝`;

/**
 * Terminal session for the Reloop CLI. Type sizes are in container units so
 * the banner and long JSON line always fit the card, from phone to desktop.
 */
export function CliTerminal() {
	return (
		<div className="@container w-full px-[4.8%]" style={{ fontFamily: MONO }}>
			<div className="text-[2cqi] text-zinc-500 leading-none dark:text-zinc-400">
				<span
					aria-hidden
					className="mr-3 inline-flex gap-[1.2cqi] align-middle"
				>
					<span className="size-[1.6cqi] rounded-full bg-zinc-300 dark:bg-zinc-700" />
					<span className="size-[1.6cqi] rounded-full bg-zinc-300 dark:bg-zinc-700" />
					<span className="size-[1.6cqi] rounded-full bg-zinc-300 dark:bg-zinc-700" />
				</span>
				<span className="font-semibold text-zinc-400 dark:text-zinc-500">
					⌘1
				</span>
				<span className="text-zinc-300 dark:text-zinc-700"> · </span>
				developer@mac ~ reloop
			</div>

			<span className="sr-only">Reloop CLI</span>
			<pre
				aria-hidden
				className="mt-[5.4cqi] overflow-hidden text-[1.95cqi] text-zinc-950 leading-none dark:text-white"
				style={{ fontFamily: MONO }}
			>
				{BANNER}
			</pre>
			<p className="mt-[2.4cqi] text-[2cqi] text-zinc-500 dark:text-zinc-400">
				v0.4.2 · Send email from your terminal
			</p>

			<div className="mt-[3cqi] border-zinc-200 border-t border-dashed pt-[3cqi] text-[2.3cqi] leading-[1.6] dark:border-white/10">
				<p className="font-medium text-zinc-900 dark:text-zinc-100">
					<span className="font-bold text-zinc-950 dark:text-white">$</span>{" "}
					reloop emails send \
				</p>
				<p className="pl-[4cqi] text-zinc-600 dark:text-zinc-400">
					--to user@example.com \
				</p>
				<p className="pl-[4cqi] text-zinc-600 dark:text-zinc-400">
					--subject "Welcome to Reloop" \
				</p>
				<p className="pl-[4cqi] text-zinc-600 dark:text-zinc-400">--json</p>

				<p className="mt-[2cqi] text-[2.1cqi] text-zinc-500 dark:text-zinc-400">
					<span className="font-semibold text-zinc-950 dark:text-white">✓</span>{" "}
					queued → sent → delivered (78ms)
				</p>
				<p className="whitespace-nowrap text-[2cqi] text-zinc-500 dark:text-zinc-400">
					{"{"} "id":{" "}
					<span className="text-zinc-800 dark:text-zinc-200">
						"msg_01jh8q..."
					</span>
					, "to":{" "}
					<span className="text-zinc-800 dark:text-zinc-200">
						"user@example.com"
					</span>
					, "status":{" "}
					<span className="text-zinc-800 dark:text-zinc-200">"delivered"</span>{" "}
					{"}"}
				</p>

				<p className="mt-[3cqi] font-medium text-zinc-900 dark:text-zinc-100">
					<span className="font-bold text-zinc-950 dark:text-white">$</span>{" "}
					reloop emails send --to dev@company.com{" "}
					<span className="animate-pulse text-zinc-950 dark:text-white">█</span>
				</p>
			</div>
		</div>
	);
}
