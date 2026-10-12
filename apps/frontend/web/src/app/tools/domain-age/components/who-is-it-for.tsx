import { cn } from "@reloop/ui/cn";
import { SectionHeading } from "../../components/section-heading";

export type AudienceColumn = {
	title: string;
	items: string[];
};

export function WhoIsItFor({
	title,
	description,
	columns,
}: {
	title: readonly [string, string];
	description: string;
	columns: AudienceColumn[];
}) {
	return (
		<section
			id="who-is-it-for"
			aria-labelledby="who-is-it-for-heading"
			className="w-full"
		>
			<SectionHeading
				id="who-is-it-for-heading"
				eyebrow="Who is it for"
				icon="users"
				title={title}
				description={description}
			/>

			<div className="grid grid-cols-1 border-stroke-soft-100 border-b sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{columns.map((column, index) => {
					const borderClass =
						index === 0
							? "border-b sm:border-r lg:border-b-0 lg:border-r"
							: index === 1
								? "border-b sm:border-r-0 lg:border-b-0 lg:border-r"
								: index === 2
									? "border-b sm:border-b-0 sm:border-r lg:border-b-0 lg:border-r"
									: "border-b-0 sm:border-b-0 sm:border-r-0 lg:border-r-0";

					return (
						<div
							key={column.title}
							className={cn(
								"flex flex-col border-stroke-soft-100 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 dark:border-white/10",
								borderClass,
							)}
						>
							{/* Bar sits in a checkmark-width slot so it centers on the checks and the title lines up with the item text. */}
							<div className="flex items-center gap-2.5">
								<span
									className="flex w-[17px] shrink-0 justify-center"
									aria-hidden="true"
								>
									<span className="h-3.5 w-[2px] rounded-full bg-text-strong-950 dark:bg-white" />
								</span>
								<h3 className="font-semibold text-[15px] text-text-strong-950 tracking-tight sm:text-[16px] dark:text-white">
									{column.title}
								</h3>
							</div>

							{/* Feature checkmark list */}
							<ul className="mt-6 space-y-3.5 sm:mt-7">
								{column.items.map((item) => (
									<li
										key={item}
										className="flex items-start gap-2.5 text-[13.5px] text-text-sub-600 leading-snug sm:text-[14px] dark:text-white/70"
									>
										<span
											className="mt-0.5 flex size-[17px] shrink-0 items-center justify-center rounded-full bg-neutral-100 text-text-strong-950 dark:bg-white/10 dark:text-white"
											aria-hidden="true"
										>
											<svg
												className="size-2.5 stroke-[2.25]"
												viewBox="0 0 12 12"
												fill="none"
												stroke="currentColor"
												aria-hidden="true"
											>
												<path
													d="M2.5 6.5L4.8 8.8L9.5 3.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
										</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					);
				})}
			</div>
		</section>
	);
}
