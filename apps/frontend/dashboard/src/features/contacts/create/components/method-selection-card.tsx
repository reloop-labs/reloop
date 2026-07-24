import * as FileFormatIcon from "@reloop/ui/file-format-icon";
import { Icon } from "@reloop/ui/icon";
import type { CreateContactStep } from "./create-contact-stepper";

interface MethodSelectionCardProps {
	onSelectMethod: (method: CreateContactStep) => void;
	onSelectGroupModal?: () => void;
}

export function MethodSelectionCard({
	onSelectMethod,
}: MethodSelectionCardProps) {
	return (
		<div className="w-full space-y-6 font-sans">
			{/* Main Card Container */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
				{/* Top Padded Content Area */}
				<div className="m-0.5 space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-4 pb-6">
					{/* Header */}
					<div>
						<h2 className="font-semibold text-base text-text-strong-950 tracking-tight">
							Add contacts to your workspace
						</h2>
						<p className="mt-1 text-text-sub-600 text-xs leading-relaxed">
							Select from CSV drag & drop import, manual entry, or API
							integration to expand your audience.
						</p>
					</div>

					{/* Option Grid */}
					<div className="space-y-3">
						{/* Option 1: Bulk CSV Import (First Option) */}
						<button
							type="button"
							onClick={() => onSelectMethod("csv-import")}
							className="group flex w-full items-center justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50/70"
						>
							<div className="flex items-center gap-3.5">
								<div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
									<FileFormatIcon.Root
										format="CSV"
										color="green"
										size="small"
										className="h-6 w-6"
									/>
								</div>
								<div>
									<div className="font-medium text-sm text-text-strong-950 group-hover:text-black">
										Import CSV file
									</div>
									<div className="text-text-sub-600 text-xs">
										Upload a spreadsheet file to bulk import subscribers.
									</div>
								</div>
							</div>
							<Icon
								name="arrow-right"
								className="h-4 w-4 text-text-soft-400 transition-all group-hover:translate-x-0.5 group-hover:text-text-strong-950"
							/>
						</button>

						{/* Option 2: Copy Paste */}
						<button
							type="button"
							onClick={() => onSelectMethod("single-contact")}
							className="group flex w-full items-center justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50/70"
						>
							<div className="flex items-center gap-3.5">
								<div className="relative flex h-10 w-10 shrink-0 items-center justify-center text-text-strong-950">
									<Icon name="keyboard" className="h-6 w-6 text-amber-500" />
								</div>
								<div>
									<div className="font-medium text-sm text-text-strong-950 group-hover:text-black">
										Copy paste
									</div>
									<div className="text-text-sub-600 text-xs">
										Manually add emails, names, and custom attributes.
									</div>
								</div>
							</div>
							<Icon
								name="arrow-right"
								className="h-4 w-4 text-text-soft-400 transition-all group-hover:translate-x-0.5 group-hover:text-text-strong-950"
							/>
						</button>

						{/* Option 3: REST API Sync */}
						<button
							type="button"
							onClick={() => onSelectMethod("api-sync")}
							className="group flex w-full items-center justify-between rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all hover:border-stroke-soft-300 hover:bg-bg-weak-50/70"
						>
							<div className="flex items-center gap-3.5">
								<div className="relative flex h-10 w-10 shrink-0 items-center justify-center text-text-strong-950">
									<Icon name="file-code" className="h-6 w-6 text-blue-600" />
								</div>
								<div>
									<div className="font-medium text-sm text-text-strong-950 group-hover:text-black">
										Sync via SDK
									</div>
									<div className="text-text-sub-600 text-xs">
										Stream contacts from your backend app using API endpoints.
									</div>
								</div>
							</div>
							<Icon
								name="arrow-right"
								className="h-4 w-4 text-text-soft-400 transition-all group-hover:translate-x-0.5 group-hover:text-text-strong-950"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
