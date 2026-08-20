import { SceneGlyph } from "../../../(home)/components/_shared/scene-header";
import { EmailStack } from "../../../(home)/components/transactional-email/email-stack";
import { WebhookEvents } from "../../../(home)/components/transactional-email/webhook-events";

export function TransactionalPreviewSection() {
	return (
		<section className="w-full bg-bg-white-0 dark:bg-black">
			<div className="border-stroke-soft-200 border-b px-4 py-12 sm:px-6 sm:py-16 lg:px-12 lg:py-20 dark:border-white/10">
				<div className="flex items-center gap-2">
					<SceneGlyph icon="send-2" color="orange" />
					<span className="font-medium text-[13.5px] text-text-strong-950 tracking-tight dark:text-white">
						Developer Primitives
					</span>
				</div>
				<h2 className="mt-3.5 max-w-3xl text-balance font-medium text-4xl text-text-strong-950 leading-[1.05] tracking-tighter sm:text-5xl dark:text-white">
					Modern tools for developer-first email.
				</h2>
				<p className="mt-3 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
					Build responsive templates in React, preview in real time, and stream
					delivery, open, and bounce webhook events the moment they fire.
				</p>
			</div>

			<div className="grid grid-cols-1 border-stroke-soft-200 sm:grid-cols-2 dark:border-white/10">
				{/* [01] React Email supported */}
				<div className="group relative flex min-h-[30rem] flex-col justify-between border-stroke-soft-200 p-6 max-sm:border-b sm:min-h-[34rem] sm:border-r sm:p-8 lg:p-10 dark:border-white/10">
					<div className="font-mono text-text-soft-400 text-xs tracking-wider dark:text-white/40">
						[01]
					</div>

					<div className="my-4 flex w-full flex-1 items-center justify-center overflow-hidden">
						<div className="h-[22rem] w-full max-w-sm overflow-hidden rounded-2xl border border-stroke-soft-200 shadow-sm dark:border-white/10">
							<div className="pointer-events-none origin-top scale-90">
								<EmailStack activeId="otp" />
							</div>
						</div>
					</div>

					<div className="pt-2">
						<h3 className="font-semibold text-lg text-text-strong-950 tracking-tight sm:text-xl dark:text-white">
							React Email supported
						</h3>
						<p className="mt-1.5 text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Build responsive templates in React that render flawlessly in all
							inboxes.
						</p>
					</div>
				</div>

				{/* [02] Webhooks */}
				<div className="group relative flex min-h-[30rem] flex-col justify-between p-6 sm:min-h-[34rem] sm:p-8 lg:p-10">
					<div className="font-mono text-text-soft-400 text-xs tracking-wider dark:text-white/40">
						[02]
					</div>

					<div className="my-4 flex w-full flex-1 items-center justify-center overflow-hidden">
						<div className="w-full max-w-sm">
							<WebhookEvents active={true} />
						</div>
					</div>

					<div className="pt-2">
						<h3 className="font-semibold text-lg text-text-strong-950 tracking-tight sm:text-xl dark:text-white">
							Webhooks
						</h3>
						<p className="mt-1.5 text-[13.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
							Stream delivery, open, and bounce webhook events the moment they
							fire.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
