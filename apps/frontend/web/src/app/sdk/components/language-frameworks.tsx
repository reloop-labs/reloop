import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { frameworksForLanguage } from "../frameworks";
import type { LanguageDefinition } from "../languages";
import {
	getBrandColorStyle,
	isDarkBrandColor,
	LanguageIcon,
} from "./language-icon";
import { AlignedIconBand } from "./section-frame";
import { SectionTitle } from "./section-title";

function GridFillers({
	count,
	cols,
}: {
	count: number;
	cols: { base: number; sm: number; lg: number };
}) {
	const leftover = (n: number) => {
		const rem = count % n;
		return rem === 0 ? 0 : n - rem;
	};
	const fillBase = leftover(cols.base);
	const fillSm = leftover(cols.sm);
	const fillLg = leftover(cols.lg);
	const max = Math.max(fillBase, fillSm, fillLg);

	return Array.from({ length: max }, (_, i) => (
		<div
			key={`fill-${i}`}
			aria-hidden
			className={cn(
				"bg-bg-white-0 dark:bg-black",
				i < fillBase ? "block" : "hidden",
				i < fillSm ? "sm:block" : "sm:hidden",
				i < fillLg ? "lg:block" : "lg:hidden",
			)}
		/>
	));
}

export default function LanguageFrameworks({
	language,
}: {
	language: LanguageDefinition;
}) {
	const related = frameworksForLanguage(language.slug);
	if (related.length === 0) return null;

	return (
		<section className="relative w-full border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="mx-auto w-full max-w-5xl border-stroke-soft-200 md:max-w-7xl xl:border-x dark:border-white/10">
				<SectionTitle
					title={`${language.name} frameworks`}
					icon="code"
					action={
						<Link
							href="/frameworks"
							className="hidden items-center gap-1 font-medium text-[13px] text-text-sub-600 transition-colors hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:text-white"
						>
							View all
							<Icon name="arrow-right" className="size-3.5" aria-hidden />
						</Link>
					}
				/>

				<AlignedIconBand>
					<div className="grid grid-cols-3 gap-px bg-stroke-soft-200 sm:grid-cols-5 lg:grid-cols-6 dark:bg-white/10">
						{related.map((fw) => {
							const isDark = isDarkBrandColor(fw.icon.hex);
							return (
								<Link
									key={fw.slug}
									href={`/frameworks/${fw.slug}`}
									className="group dark:hover:!bg-[#0A0A0A] flex flex-col items-start gap-2 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50 sm:p-5 dark:bg-black"
								>
									<div className="flex w-full items-start justify-between gap-2">
										<span
											className={cn(
												"inline-flex size-8 items-center justify-center rounded-[10px] border border-stroke-soft-200 dark:border-white/10",
												isDark && "text-text-strong-950 dark:text-white",
											)}
											style={getBrandColorStyle(fw.icon.hex)}
										>
											<LanguageIcon icon={fw.icon} className="size-4" />
										</span>
										<Icon
											name="arrow-right"
											className="size-3.5 text-text-sub-600 opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100 dark:text-white/40 dark:group-hover:text-white"
											aria-hidden
										/>
									</div>
									<span className="pl-0.5 font-medium text-[13px] text-text-strong-950 dark:text-white">
										{fw.name}
									</span>
								</Link>
							);
						})}
						<GridFillers
							count={related.length}
							cols={{ base: 3, sm: 5, lg: 6 }}
						/>
					</div>
				</AlignedIconBand>
			</div>
		</section>
	);
}
