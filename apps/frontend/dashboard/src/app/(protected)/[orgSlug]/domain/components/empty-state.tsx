import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

export const EmptyState = () => {
	const { activeOrganization } = useUserOrganization();

	return (
		<div>
			<div className="flex h-[calc(100dvh-400px)] items-center justify-center">
				<div className="flex flex-col items-center justify-center gap-4">
					<Icon name="globe" className="h-12 w-12" />
					<div>
						<p className="text-center font-semibold text-2xl">No domains yet</p>
						<p className="max-w-72 text-center text-paragraph-sm text-text-sub-600">
							Add your first domain to begin sending emails from your custom
							domain.
						</p>
					</div>
					<Link
						href={`/${activeOrganization.slug}/domain/add`}
						className={Button.buttonVariants({
							variant: "neutral",
							size: "small",
						}).root()}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add domain
					</Link>
				</div>
			</div>
			<div className="flex w-full flex-col items-center justify-center gap-2 pt-10">
				<div>
					<p className="mb-2 text-left text-sm text-text-sub-600">Learn more</p>
					<div className="flex gap-2">
						<a
							href="https://reloop.sh/docs/domain"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 rounded-2xl border border-stroke-soft-200 p-2 hover:border-stroke-soft-200 hover:bg-bg-weak-50"
						>
							<div className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-stroke-soft-200 transition-colors">
								<div
									className="pointer-events-none absolute inset-0 z-0 text-gray-800"
									style={{
										backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
        repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
        repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),
        repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)
      `,
									}}
								/>
								<Icon
									name="book-closed"
									className="h-5 w-5 text-text-sub-600"
								/>
							</div>
							<p className="pr-4 font-medium">Domain,DNS,MX Records</p>
						</a>
						<a
							href="https://reloop.sh/docs/domain"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 rounded-2xl border border-stroke-soft-200 p-2 hover:border-stroke-soft-200 hover:bg-bg-weak-50"
						>
							<div className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-stroke-soft-200 transition-colors">
								<div
									className="pointer-events-none absolute inset-0 z-0 text-gray-800"
									style={{
										backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
        repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
        repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),
        repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)
      `,
									}}
								/>
								<Icon name="github" className="h-5 w-5 text-text-sub-600" />
							</div>
							<p className="pr-4 font-medium">Star on GitHub</p>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
