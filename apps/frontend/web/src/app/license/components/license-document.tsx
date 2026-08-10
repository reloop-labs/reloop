import { cn } from "@reloop/ui/cn";
import { contactEmail } from "@reloop/web/lib/site";
import type { ReactNode } from "react";

function Chip({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"mx-0.5 inline-flex translate-y-px items-center gap-1 rounded-md border border-blue-200/80 bg-blue-50 px-1.5 py-[0.2em] align-middle font-medium text-[0.92em] text-primary-base leading-none dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300",
				className,
			)}
		>
			{children}
		</span>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="mt-7 sm:mt-8">
			{/* Section title matched to changelog category headers: 11px uppercase tracking-wider */}
			<h2 className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider dark:text-white/40">
				{title}
			</h2>
			{/* Matches changelog body: 14–14.5px muted */}
			<div className="mt-2.5 space-y-3 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
				{children}
			</div>
		</section>
	);
}

/**
 * Layered card shell — dashboard create-contact pattern.
 * Typography matched to changelog (title / body scale).
 */
export function LicenseDocument() {
	return (
		<div className="mx-auto w-full max-w-2xl font-sans">
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-white/10 dark:bg-white/[0.03]">
				<div className="m-0.5 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-6 sm:px-8 sm:py-8 md:px-9 md:py-9 dark:border-white/10 dark:bg-[#0c0c0c]">
					{/* Title — changelog page h1 scale */}
					<header className="mb-4 flex items-center justify-between">
						<h1 className="font-semibold text-text-strong-950 leading-snug tracking-tight dark:text-white">
							License Agreement
						</h1>
						<p className="shrink-0 font-medium text-[12.5px] text-text-sub-600 dark:text-white/60">
							Apache 2.0 · 2026
						</p>
					</header>

					{/* Intro — changelog description scale */}
					<div className="mt-5 space-y-3 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
						<p>
							This License Agreement is made by{" "}
							<Chip>
								<svg
									width="11"
									height="11"
									viewBox="0 0 200 200"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden
									className="opacity-90"
								>
									<rect
										x="55"
										y="51"
										width="83"
										height="10"
										fill="currentColor"
									/>
									<rect
										x="55"
										y="59"
										width="75"
										height="10"
										transform="rotate(90 55 59)"
										fill="currentColor"
									/>
									<rect
										x="55"
										y="134"
										width="83"
										height="10"
										fill="currentColor"
									/>
									<rect
										x="63"
										y="142"
										width="83"
										height="10"
										fill="currentColor"
									/>
								</svg>
								Reloop Labs
							</Chip>{" "}
							(the “Licensor”) and governs use of the{" "}
							<Chip className="ring-1 ring-primary-base/25">Reloop</Chip>{" "}
							software (the “Software”).
						</p>
						<p>
							The Software is licensed under the{" "}
							<Chip>Apache License, Version 2.0</Chip>, with the additional use
							restrictions set forth below.
						</p>
					</div>

					<Section title="Apache License 2.0">
						<p>
							You may not use this file except in compliance with the License.
							You may obtain a copy of the License at{" "}
							<Chip>http://www.apache.org/licenses/LICENSE-2.0</Chip>.
						</p>
						<p>
							Unless required by applicable law or agreed to in writing,
							software distributed under the License is distributed on an{" "}
							<Chip>“AS IS”</Chip> BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
							ANY KIND, either express or implied. See the License for the
							specific language governing permissions and limitations under the
							License.
						</p>
					</Section>

					<Section title="Additional use restrictions">
						<p>
							You are free to use, copy, modify, and distribute this software
							for <Chip>personal use</Chip> and{" "}
							<Chip>internal company purposes</Chip>.
						</p>
						<p>You are NOT permitted to:</p>
						<ul className="my-3 space-y-3">
							<li className="flex items-start gap-3 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
								<span
									className="mt-2 size-1 shrink-0 rounded-[1px] bg-text-sub-600/40 dark:bg-white/35"
									aria-hidden="true"
								/>
								<div>
									<Chip>Sell</Chip>, sublicense, or otherwise commercially
									redistribute this software.
								</div>
							</li>
							<li className="flex items-start gap-3 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
								<span
									className="mt-2 size-1 shrink-0 rounded-[1px] bg-text-sub-600/40 dark:bg-white/35"
									aria-hidden="true"
								/>
								<div>
									Offer this software, or any modified version of it, as a{" "}
									<Chip>hosted service</Chip> (including SaaS, PaaS, or any
									similar commercial hosting model).
								</div>
							</li>
							<li className="flex items-start gap-3 text-[14px] text-text-sub-600 leading-relaxed sm:text-[14.5px] dark:text-white/60">
								<span
									className="mt-2 size-1 shrink-0 rounded-[1px] bg-text-sub-600/40 dark:bg-white/35"
									aria-hidden="true"
								/>
								<div>
									Use this software in any product or service whose primary
									purpose is to <Chip>compete with Reloop Labs</Chip>.
								</div>
							</li>
						</ul>
					</Section>

					<Section title="Hosted service and self-hosting">
						<p>
							Reloop Labs offers Reloop as a hosted email service at{" "}
							<Chip>reloop.sh</Chip>, or you may self-host the open-source
							software on your own infrastructure.
						</p>
						<p>
							There is no commercial license for third parties to resell or
							offer competing hosted services using this software.
						</p>
					</Section>

					<Section title="Contact">
						<p>
							For questions about the license or project, contact{" "}
							<a
								href={`mailto:${contactEmail}`}
								className="font-medium text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
							>
								{contactEmail}
							</a>
							.
						</p>
					</Section>
				</div>
			</div>
		</div>
	);
}
