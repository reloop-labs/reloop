import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import Image from "next/image";
import Link from "next/link";
import {
	PLATFORM_ALT,
	TAB_GRADIENTS,
	TAB_SCREENSHOT,
} from "../../../(home)/components/platform-tabs-data";
import { toolDescription, toolPath } from "../content";

const editorHref = `${toolPath}/password-reset`;

export function EmailHtmlEditorHero() {
	return (
		<header className="relative w-full bg-transparent">
			<div className="relative mx-auto mt-14 w-full max-w-5xl border-stroke-soft-100 border-x md:max-w-7xl min-[1280px]:mt-[72px] dark:border-white/10">
				<div
					aria-hidden
					className="h-10 border-stroke-soft-100 border-t sm:h-24 dark:border-white/10"
				/>
				<div className="flex flex-col items-start px-4 pt-0 pb-16 text-left sm:items-center sm:px-8 sm:pb-20 sm:text-center lg:px-12">
					<Link href="/tools" className="mb-5 flex items-center gap-2 sm:mb-6">
						<span
							aria-hidden
							className="inline-flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-primary-dark p-px pb-[2px] dark:bg-[#30363d]"
						>
							<span className="flex size-full items-center justify-center rounded-[4px] bg-primary-base text-white shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.45)] dark:text-black dark:shadow-[inset_0_0.5px_0_0_rgba(255,255,255,0.28),0_0_0_0.5px_rgba(255,255,255,0.08)]">
								<Icon name="code" className="size-[11px]" />
							</span>
						</span>
						<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight underline decoration-dotted underline-offset-4 dark:text-white">
							Free Tools
						</span>
					</Link>

					<h1 className="max-w-4xl text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.1rem] dark:text-white">
						Free Email HTML Editor
					</h1>

					<p className="mt-4 max-w-[40rem] text-balance text-[15px] text-text-sub-600 leading-relaxed sm:mt-6 sm:text-[18.5px] dark:text-white/60">
						{toolDescription}
					</p>

					<div className="mt-7 flex flex-wrap items-center justify-start gap-3 sm:mt-9 sm:justify-center sm:gap-4">
						<FancyButton.Root
							asChild
							variant="neutral"
							size="medium"
							className="h-10 rounded-xl px-5 font-medium text-[14.5px] sm:h-11 sm:px-6 sm:text-[15.5px]"
						>
							<Link href={editorHref}>Open the editor</Link>
						</FancyButton.Root>
					</div>
					<p className="mt-3.5 text-balance text-[12.5px] text-text-sub-600 sm:text-[13.5px] dark:text-white/50">
						Free to use. No account needed.
					</p>
				</div>

				<div className="border-stroke-soft-100 border-t dark:border-white/10">
					<div className="relative w-full overflow-hidden bg-bg-white-0 dark:bg-black">
						<div
							aria-hidden
							className={`absolute inset-0 bg-gradient-to-t ${TAB_GRADIENTS.templates}`}
						/>
						<div className="relative w-full px-4 pt-6 pb-6 sm:px-10 sm:pt-10 sm:pb-10">
							<Link
								href={editorHref}
								aria-label="Open the email HTML editor"
								className="relative block w-full overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 transition-shadow hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.18)] sm:rounded-2xl dark:border-white/10 dark:bg-black"
							>
								<div className="relative aspect-[2774/1920] w-full">
									<Image
										src={TAB_SCREENSHOT.templates.src}
										alt={PLATFORM_ALT.templates}
										fill
										sizes="(min-width: 1280px) 1200px, 100vw"
										className="object-cover object-top-left"
										preload
										draggable={false}
									/>
								</div>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
