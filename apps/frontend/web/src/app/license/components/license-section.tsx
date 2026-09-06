"use client";

import { contactEmail } from "@reloop/web/lib/site";

function FullText() {
	return (
		<section className="border-stroke-soft-100 border-y dark:border-white/10">
			<div className="grid lg:grid-cols-[minmax(220px,1.45fr)_repeat(3,minmax(0,1fr))]">
				<header className="flex flex-col gap-3 border-stroke-soft-100 border-b px-5 py-8 sm:px-7 lg:sticky lg:top-16 lg:self-start lg:border-b-0 lg:px-9 lg:py-10 dark:border-white/10">
					<p className="font-medium text-[12px] text-primary-base uppercase">
						Full text
					</p>
					<h2 className="font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white">
						License Agreement.
					</h2>
					<p className="text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
						Apache License 2.0 · 2026 · Reloop Labs
					</p>
				</header>
				<div className="col-span-full border-stroke-soft-100 lg:col-span-3 lg:border-l dark:border-white/10">
					<div className="space-y-0">
						<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-6 lg:px-8 dark:border-white/[0.07]">
							<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								Parties
							</h3>
							<p className="mt-2 max-w-2xl text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
								This License Agreement is made by Reloop Labs (the “Licensor”)
								and governs use of the Reloop software (the “Software”). The
								Software is licensed under the Apache License, Version 2.0, with
								the additional use restrictions below.
							</p>
						</div>
						<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-6 lg:px-8 dark:border-white/[0.07]">
							<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								Apache License 2.0
							</h3>
							<p className="mt-2 max-w-2xl text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
								You may not use this file except in compliance with the License.
								You may obtain a copy of the License at{" "}
								<a
									href="http://www.apache.org/licenses/LICENSE-2.0"
									target="_blank"
									rel="noopener noreferrer"
									className="font-medium text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
								>
									apache.org/licenses/LICENSE-2.0
								</a>
								.
							</p>
							<p className="mt-3 max-w-2xl text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
								Unless required by applicable law or agreed to in writing,
								software distributed under the License is distributed on an “AS
								IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
								express or implied. See the License for the specific language
								governing permissions and limitations.
							</p>
						</div>
						<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-6 lg:px-8 dark:border-white/[0.07]">
							<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								Additional use restrictions
							</h3>
							<p className="mt-2 max-w-2xl text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
								You are free to use, copy, modify, and distribute the Software
								for personal use and internal company purposes. You are not
								permitted to sell or commercially redistribute it, offer it (or
								any modified version) as a hosted service, or use it in a
								product whose primary purpose is to compete with Reloop Labs.
							</p>
						</div>
						<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-6 lg:px-8 dark:border-white/[0.07]">
							<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								Hosted service & self-hosting
							</h3>
							<p className="mt-2 max-w-2xl text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
								Reloop Labs offers Reloop as a hosted service at reloop.sh, or
								you may self-host the open-source software on your own
								infrastructure. There is no commercial license for third parties
								to resell or offer competing hosted services.
							</p>
						</div>
						<div className="px-5 py-7 sm:px-6 lg:px-8">
							<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								Contact
							</h3>
							<p className="mt-2 max-w-2xl text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
								Questions about the license? Contact{" "}
								<a
									href={`mailto:${contactEmail}`}
									className="font-medium text-text-strong-950 underline decoration-text-sub-600/40 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/30 dark:hover:decoration-white"
								>
									{contactEmail}
								</a>
								.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export function LicenseSection() {
	return <FullText />;
}
