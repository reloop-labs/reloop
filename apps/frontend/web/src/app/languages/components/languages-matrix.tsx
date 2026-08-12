import Link from "next/link";
import { languages } from "../languages";
import { LanguageIcon } from "./language-icon";

export default function LanguagesMatrix() {
	return (
		<section id="sdk-matrix" className="w-full py-16 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-2">
					<p className="font-mono text-text-sub-600 text-xs uppercase tracking-wider dark:text-white/50">
						Ecosystem Specifications • Matrix
					</p>
					<h2 className="font-sans font-semibold text-2xl text-text-strong-950 tracking-tight sm:text-3xl dark:text-white">
						Compare runtime capabilities
					</h2>
					<p className="max-w-2xl text-base text-text-sub-600 leading-relaxed dark:text-white/60">
						Every SDK is built natively for its language's package ecosystem,
						enforcing strict type-checking, idiomatic error handling, and zero
						external dependencies.
					</p>
				</div>

				{/* 12-Column Evidence Table */}
				<div className="mt-10 overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-transparent">
					<table className="w-full text-left font-sans text-xs">
						<thead>
							<tr className="border-stroke-soft-200 border-b bg-bg-weak-50 font-medium text-text-sub-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
								<th scope="col" className="px-4 py-3.5 font-mono text-xs">
									Runtime
								</th>
								<th scope="col" className="px-4 py-3.5 font-mono text-xs">
									Package Identifier
								</th>
								<th scope="col" className="px-4 py-3.5">
									Type Safety
								</th>
								<th scope="col" className="px-4 py-3.5">
									Concurrency & Runtime
								</th>
								<th scope="col" className="px-4 py-3.5">
									Framework Integrations
								</th>
								<th
									scope="col"
									className="px-4 py-3.5 text-right font-mono text-xs"
								>
									Action
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-stroke-soft-200 dark:divide-white/10">
							{languages.map((lang) => (
								<tr
									key={lang.slug}
									className="transition-colors hover:bg-bg-weak-50/60 dark:hover:bg-white/[0.015]"
								>
									<td className="px-4 py-4 font-semibold text-text-strong-950 dark:text-white">
										<div className="flex items-center gap-2.5">
											<span style={{ color: `#${lang.icon.hex}` }}>
												<LanguageIcon icon={lang.icon} className="size-4" />
											</span>
											<span>{lang.name}</span>
										</div>
									</td>
									<td className="px-4 py-4 font-mono text-text-sub-600 dark:text-white/70">
										{lang.packageName}
									</td>
									<td className="px-4 py-4 text-text-strong-950 dark:text-white/90">
										{lang.typeSafety}
									</td>
									<td className="px-4 py-4 text-text-sub-600 dark:text-white/70">
										{lang.concurrency}
									</td>
									<td className="px-4 py-4 text-text-sub-600 dark:text-white/70">
										{lang.primaryFramework}
									</td>
									<td className="px-4 py-4 text-right">
										<Link
											href={lang.docsPath}
											className="font-medium text-primary-base transition-opacity hover:opacity-80"
										>
											View Guide &rarr;
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
