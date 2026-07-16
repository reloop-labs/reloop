import { Icon } from "@reloop/ui/icon";

interface SidebarPreviewProps {
	name: string;
	logo: string | null;
}

export function SidebarPreview({ name, logo }: SidebarPreviewProps) {
	return (
		<div className="absolute top-32 left-28">
			<div className="relative flex h-[520px] w-[480px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 shadow-2xl dark:border-stroke-soft-100/40">
				<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-bg-white-0 to-transparent" />
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-white-0 p-3 dark:border-stroke-soft-100/40">
					<div className="flex gap-1.5">
						<div className="h-3 w-3 rounded-full bg-error-base/80" />
						<div className="h-3 w-3 rounded-full bg-warning-base/80" />
						<div className="h-3 w-3 rounded-full bg-success-base/80" />
					</div>
					<div className="ml-4 flex-1 rounded-md bg-bg-weak-50 px-3 py-1 text-center font-mono text-text-soft-400 text-xs">
						reloop.sh/dashboard
					</div>
				</div>
				<div className="flex flex-1 overflow-hidden">
					<div className="flex w-52 flex-col gap-2 border-stroke-soft-100 border-r dark:border-stroke-soft-100/40">
						<div className="flex w-full items-center gap-2 border-stroke-soft-100 border-b px-4 py-2 dark:border-stroke-soft-100/40">
							{logo ? (
								<img
									src={logo}
									alt="Logo"
									className="h-5 w-5 rounded-sm object-cover"
								/>
							) : (
								<span className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-100 p-1 font-bold text-xs dark:border-stroke-soft-100/40">
									{name && name.length > 0 ? name[0]?.toUpperCase() : "W"}
								</span>
							)}
							<p className="text-text-soft-400">/</p>
							<div className="truncate font-semibold text-xs">
								{name || "Workspace"}
							</div>
							<Icon
								name="chevron-down"
								className="h-3 w-3 text-text-soft-400"
							/>
						</div>

						<div className="space-y-1 px-4">
							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
							</div>
							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
							</div>
							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
							</div>
						</div>

						<div className="mt-auto border-stroke-soft-100 border-t pt-4 dark:border-stroke-soft-100/40">
							<div className="flex items-center gap-2 opacity-50">
								<div className="h-8 w-8 rounded-full bg-bg-soft-200" />
								<div className="flex-1 space-y-1">
									<div className="h-2 w-20 rounded bg-bg-soft-200" />
									<div className="h-2 w-12 rounded bg-bg-soft-200" />
								</div>
							</div>
						</div>
					</div>

					<div className="flex-1 bg-bg-white-0 p-6">
						<div className="mb-6 h-8 w-32 rounded bg-bg-weak-50" />
						<div className="grid grid-cols-2 gap-4">
							<div className="h-24 rounded-xl border border-stroke-soft-100 bg-bg-weak-50 dark:border-stroke-soft-100/40" />
							<div className="h-24 rounded-xl border border-stroke-soft-100 bg-bg-weak-50 dark:border-stroke-soft-100/40" />
						</div>
						<div className="mt-6 h-40 rounded-xl border border-stroke-soft-100 bg-bg-weak-50 dark:border-stroke-soft-100/40" />
					</div>
				</div>
			</div>
		</div>
	);
}
