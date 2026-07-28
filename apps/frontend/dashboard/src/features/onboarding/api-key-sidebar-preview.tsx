import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";

interface ApiKeySidebarPreviewProps {
	apiKey?: string;
	lang?: string;
}

export function ApiKeySidebarPreview({ apiKey, lang = "js" }: ApiKeySidebarPreviewProps) {
	const displayKey = apiKey ? `${apiKey.slice(0, 7)}••••••••••••` : "re_live_••••••••••••••••";
	const skeletonBg = "bg-bg-weak-50 dark:bg-bg-soft-200/30";

	return (
		<div className="flex h-full w-full items-center justify-center p-4 sm:p-6">
			<div className="relative flex h-[460px] w-full max-w-[640px] scale-110 flex-col overflow-hidden rounded-2xl [mask-image:linear-gradient(135deg,black_40%,transparent_92%)] sm:h-[480px]">
				{/* Main Body */}
				<div className="flex flex-1 overflow-hidden">
					{/* Left Sidebar */}
					<div className="flex w-44 shrink-0 flex-col border-stroke-soft-100 border-r bg-bg-white-0 p-3.5 text-[11px] dark:border-stroke-soft-100/40">
						<div className="space-y-3.5 overflow-y-auto">
							{/* Reloop Brand Logo */}
							<div className="flex shrink-0 items-center gap-1.5 px-0.5 py-0.5">
								<Logo className="h-5 w-5 shrink-0" />
								<span className="font-semibold text-text-strong-950 text-xs leading-none">
									Reloop
								</span>
								<span
									className={`rounded ${skeletonBg} px-1.5 py-0.5 font-medium font-mono text-[9px] text-text-soft-400 leading-none`}
								>
									BETA
								</span>
							</div>

							{/* Section 1 Navigation */}
							<div className="space-y-1.5">
								<div className="px-0.5 py-0.5">
									<div className={`h-2 w-8 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-1.5 py-1 text-text-soft-400">
									<div
										className={`h-3 w-3 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2.5 w-16 rounded ${skeletonBg}`} />
								</div>
								{/* Active API Keys Navigation Item */}
								<div className="flex items-center gap-2 rounded-lg bg-bg-weak-50 px-1.5 py-1 text-text-strong-950 dark:bg-bg-soft-200/40">
									<Icon name="key" className="h-3 w-3 shrink-0 text-primary-base" />
									<div className="font-medium text-xs">API Keys</div>
								</div>
							</div>

							{/* Section 2 Skeleton */}
							<div className="space-y-1.5 pt-0.5">
								<div className="px-0.5 py-0.5">
									<div className={`h-2 w-10 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-0.5 py-0.5">
									<div
										className={`h-2.5 w-2.5 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2 w-14 rounded ${skeletonBg}`} />
								</div>
								<div className="flex items-center gap-2 px-0.5 py-0.5">
									<div
										className={`h-2.5 w-2.5 shrink-0 rounded-full ${skeletonBg}`}
									/>
									<div className={`h-2 w-12 rounded ${skeletonBg}`} />
								</div>
							</div>
						</div>
					</div>

					{/* Right Content Area */}
					<div className="flex flex-1 flex-col overflow-hidden bg-bg-weak-50/20 dark:bg-bg-weak-50/5">
						{/* Top Header */}
						<div className="flex items-center justify-between border-stroke-soft-100 border-b bg-bg-white-0 px-4 py-2 dark:border-stroke-soft-100/40">
							<div className="flex items-center gap-2">
								<span className="font-semibold text-text-strong-950 text-xs">
									Developer Key Integration
								</span>
							</div>
							<span className="inline-flex items-center gap-1 rounded-full bg-success-lighter px-2 py-0.5 font-medium text-[10px] text-success-base">
								<Icon name="check-circle" className="h-3 w-3" />
								Active Key
							</span>
						</div>

						{/* Main Content: Key Info + Code Snippet */}
						<div className="flex-1 space-y-3 overflow-hidden p-3.5">
							{/* Active Key Box */}
							<div className="rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 shadow-sm dark:border-stroke-soft-100/40">
								<div className="flex items-center justify-between">
									<div className="space-y-0.5">
										<div className="font-medium text-[10px] text-text-soft-400">
											Production Key
										</div>
										<div className="font-mono text-text-strong-950 text-xs">
											{displayKey}
										</div>
									</div>
									<div className="flex h-6 w-6 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600">
										<Icon name="copy" className="h-3.5 w-3.5" />
									</div>
								</div>
							</div>

							{/* Code Snippet Card */}
							<div className="rounded-xl border border-stroke-soft-100 bg-[#1e1e2e] p-3 text-white shadow-sm">
								<div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5 text-[10px]">
									<span className="font-mono text-white/60">{lang === "curl" ? "cURL" : "Node.js"} Integration</span>
									<span className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">SDK</span>
								</div>
								<pre className="overflow-x-auto font-mono text-[10px] text-white/90 leading-relaxed">
									<code>
										{lang === "curl"
											? `curl -X POST https://api.reloop.sh/v1/emails \\\n  -H "Authorization: Bearer ${displayKey}" \\\n  -d '{"from":"hello@domain.com"}'`
											: `import { Reloop } from 'reloop';\n\nconst reloop = new Reloop({ apiKey: '${displayKey}' });\n\nawait reloop.emails.send({\n  from: 'hello@domain.com',\n  to: 'user@example.com',\n  subject: 'Hello World'\n});`}
									</code>
								</pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
