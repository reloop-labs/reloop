"use client";

import { contactEmail } from "@reloop/web/lib/site";

function FullText() {
	return (
		<section className="border-stroke-soft-100 border-y dark:border-white/10">
			<div className="mx-auto w-full max-w-3xl border-stroke-soft-100 border-x dark:border-white/10">
				<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-8 dark:border-white/[0.07]">
					<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
						Parties
					</h3>
					<p className="mt-2 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
						This License Agreement is made by Reloop Labs (the “Licensor”) and
						governs use of the Reloop software (the “Software”). The Software is
						licensed under the Apache License, Version 2.0, with the additional
						use restrictions below.
					</p>
				</div>
				<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-8 dark:border-white/[0.07]">
					<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
						Apache License 2.0
					</h3>
					<p className="mt-2 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
						You may not use this file except in compliance with the License. You
						may obtain a copy of the License at{" "}
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
					<p className="mt-3 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
						Unless required by applicable law or agreed to in writing, software
						distributed under the License is distributed on an “AS IS” BASIS,
						WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
						implied. See the License for the specific language governing
						permissions and limitations.
					</p>
				</div>
				<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-8 dark:border-white/[0.07]">
					<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
						Additional use restrictions
					</h3>
					<p className="mt-2 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
						You are free to use, copy, modify, and distribute the Software for
						personal use and internal company purposes. You are not permitted to
						sell or commercially redistribute it, offer it (or any modified
						version) as a hosted service, or use it in a product whose primary
						purpose is to compete with Reloop Labs.
					</p>
				</div>
				<div className="border-stroke-soft-100 border-b px-5 py-7 sm:px-8 dark:border-white/[0.07]">
					<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
						Hosted service & self-hosting
					</h3>
					<p className="mt-2 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
						Reloop Labs offers Reloop as a hosted service at reloop.sh, or you
						may self-host the open-source software on your own infrastructure.
						There is no commercial license for third parties to resell or offer
						competing hosted services.
					</p>
				</div>
				<div className="px-5 py-7 sm:px-8">
					<h3 className="font-medium text-[15px] text-text-strong-950 dark:text-white">
						Contact
					</h3>
					<p className="mt-2 text-[14px] text-text-sub-600 leading-[1.7] sm:text-[15px] dark:text-white/55">
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
		</section>
	);
}

export function LicenseSection() {
	return <FullText />;
}
