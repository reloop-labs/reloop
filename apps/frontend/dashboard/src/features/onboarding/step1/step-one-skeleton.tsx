import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import { Skeleton } from "@reloop/ui/skeleton";
import { parseAsString, useQueryState } from "nuqs";
import { SidebarPreview } from "../sidebar-preview";

/** Loading stand-in for step 1 — static copy is real; only values pulse. */
export function StepOneSkeleton() {
	const [name] = useQueryState("name", parseAsString.withDefault(""));
	const [logoUrl] = useQueryState("logoUrl", parseAsString.withDefault(""));

	return (
		<div aria-busy="true" aria-live="polite">
			<div className="px-5 pt-8 sm:px-8 lg:px-12">
				<div className="font-medium text-text-soft-400 text-xs">
					Step 1 of 2
				</div>
			</div>

			<div className="grid w-full grid-cols-1 lg:grid-cols-2">
				<div className="flex min-w-0 flex-col gap-4 px-5 pt-2 pb-8 sm:px-8 sm:pb-10 lg:px-12">
					<div>
						<div className="mb-6">
							<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Let's setup your organization
							</h1>
							<p className="text-sm text-text-sub-600">
								Enter your organization details to start sending emails
							</p>
						</div>

						<div className="flex items-center gap-4">
							<Skeleton className="h-[72px] w-[72px] shrink-0 rounded-xl" />
							<div>
								<Label.Root>Organization logo</Label.Root>
								<p className="-mt-0.5 pb-2 text-paragraph-xs text-text-sub-600">
									Recommended size 1:1, up to 10MB.
								</p>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xxsmall"
									type="button"
									disabled
								>
									<Icon name="camera" className="h-4 w-4" />
									Upload Logo
								</Button.Root>
							</div>
						</div>

						<div className="space-y-3.5 pt-6">
							<div className="space-y-2">
								<Label.Root>
									Organization name
									<Label.Asterisk />
								</Label.Root>
								<Skeleton className="h-10 w-full rounded-xl" />
							</div>
							<div className="space-y-2">
								<Label.Root>How did you hear about us?</Label.Root>
								<Skeleton className="h-10 w-full rounded-xl" />
							</div>
						</div>

						<FancyButton.Root
							type="button"
							variant="blue"
							size="medium"
							className="mt-6 h-10 w-full rounded-xl font-medium text-sm"
							disabled
						>
							Create organization
						</FancyButton.Root>
					</div>
				</div>

				<div className="relative hidden min-w-0 overflow-hidden border-stroke-soft-100 border-l lg:block dark:border-stroke-soft-100/40">
					<SidebarPreview name={name} logo={logoUrl || null} />
				</div>
			</div>
		</div>
	);
}
