import { Logo } from "@reloop/ui/logo";
import type { SimpleIcon } from "simple-icons";
import { BrandIcon } from "./brand-icon";

export function CompareHeroIcons({
	icon,
}: {
	icon: Pick<SimpleIcon, "hex" | "path">;
}) {
	return (
		<div className="mb-8 flex items-center justify-center gap-5 sm:mb-10 sm:gap-8">
			<div
				className="relative flex size-20 items-center justify-center rounded-[22px] bg-white sm:size-24 sm:rounded-[26px]"
				aria-hidden
			>
				<Logo className="size-full text-text-strong-950 dark:text-[#0a0d12]" />
			</div>

			<span
				className="font-semibold text-sm text-text-sub-600 uppercase tracking-[0.12em] sm:text-base dark:text-white/55"
				aria-hidden
			>
				vs
			</span>

			<div className="relative flex size-20 items-center justify-center sm:size-24">
				<div
					className="relative flex size-20 items-center justify-center rounded-[20px] bg-white sm:size-24 sm:rounded-[24px]"
					aria-hidden
				>
					<BrandIcon icon={icon} className="size-12 sm:size-14" />
				</div>
			</div>
		</div>
	);
}
