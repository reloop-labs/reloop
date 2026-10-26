"use client";

import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { useId, useState } from "react";
import type { SimpleIcon } from "simple-icons";
import { siKit } from "simple-icons";
import {
	type CostMode,
	costModes,
	formatUsd,
	quoteCosts,
} from "../compare-hero-costs";
import { competitorBrands } from "../competitor-brands";
import { CompareVolumeSlider } from "./compare-volume-slider";

type BrandMark = Pick<SimpleIcon, "hex" | "path">;

const brandMarks: Record<string, BrandMark> = {
	kit: siKit,
	...Object.fromEntries(
		competitorBrands.map((brand) => [
			brand.href.replace("/compare/", ""),
			brand.icon,
		]),
	),
};

/** Most rows a mode shows; both lists reserve this height so the columns line up. */
const MAX_ROWS = Math.max(
	...Object.values(costModes).map((mode) => mode.providers.length),
);

function luminance(hex: string): number {
	const r = Number.parseInt(hex.slice(0, 2), 16);
	const g = Number.parseInt(hex.slice(2, 4), 16);
	const b = Number.parseInt(hex.slice(4, 6), 16);
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function ProviderMark({ id }: { id: string }) {
	if (id === "reloop") {
		return (
			<span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-stroke-soft-100 bg-bg-white-0 dark:border-white/15 dark:bg-white/5">
				<Logo className="size-7 shrink-0" />
			</span>
		);
	}
	const mark = brandMarks[id];
	if (!mark) return <span className="size-5 shrink-0" />;
	const dark = luminance(mark.hex) < 0.25;
	return (
		<span
			className={cn(
				"flex size-5 shrink-0 items-center justify-center rounded-[5px]",
				dark &&
					"bg-black ring-1 ring-stroke-soft-200 ring-inset dark:bg-white/10 dark:ring-white/10",
			)}
			style={dark ? undefined : { backgroundColor: `#${mark.hex}` }}
		>
			<svg viewBox="0 0 24 24" className="size-3" aria-hidden>
				<path
					d={mark.path}
					fill={!dark && luminance(mark.hex) > 0.6 ? "#000" : "#fff"}
				/>
			</svg>
		</span>
	);
}

const formatCount = (value: number) =>
	new Intl.NumberFormat("en-US").format(value);

/** Each block pads itself so the slider's dividers run edge to edge of the column. */
const BLOCK_INSET = "px-4 sm:px-10 lg:px-12";

export function CompareCostColumn({ mode }: { mode: CostMode }) {
	const config = costModes[mode];
	const labelId = useId();
	const [volume, setVolume] = useState(config.defaultValue);

	const rows = quoteCosts(mode, volume);
	const maxUsd = Math.max(...rows.map((row) => row.usd), 1);

	return (
		<div className="flex h-full flex-col">
			<div className={BLOCK_INSET}>
				<h3 className="font-semibold text-[18px] text-text-strong-950 tracking-tight sm:text-[19px] dark:text-white">
					{config.title}
				</h3>
				<p className="mt-1 text-[14px] text-text-sub-600 dark:text-white/60">
					{config.subtitle}
				</p>
			</div>

			<div
				className={cn(
					BLOCK_INSET,
					"mt-8 space-y-4 border-stroke-soft-100 border-y py-8 dark:border-white/10",
				)}
			>
				<div className="flex items-center justify-between gap-3">
					<span
						id={labelId}
						className="font-medium text-[14px] text-text-strong-950 dark:text-white"
					>
						{config.sliderLabel}
					</span>
					<div className="flex items-baseline gap-1">
						<span className="font-semibold text-[1.4rem] text-text-strong-950 tabular-nums tracking-tight sm:text-[1.5rem] dark:text-white">
							{formatCount(volume)}
						</span>
						<span className="text-[13px] text-text-sub-600 dark:text-white/50">
							{config.unit}
						</span>
					</div>
				</div>

				<CompareVolumeSlider
					ticks={config.presets}
					value={volume}
					onValueChange={setVolume}
					labelledBy={labelId}
				/>
			</div>

			<ul
				className={cn(BLOCK_INSET, "mt-6 flex flex-col")}
				style={{ minHeight: `${MAX_ROWS * 2.25}rem` }}
				aria-live="polite"
			>
				{rows.map((row) => {
					const isReloop = row.id === "reloop";
					const width =
						row.usd === 0 ? 0 : Math.max(3, (row.usd / maxUsd) * 100);
					return (
						<li
							key={row.id}
							className="grid h-9 grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-3 sm:grid-cols-[7.5rem_1fr_6.5rem_4.5rem] sm:gap-4"
						>
							<span className="flex min-w-0 items-center gap-2.5">
								<ProviderMark id={row.id} />
								<span
									className={cn(
										"truncate text-[14px]",
										isReloop
											? "font-medium text-text-strong-950 dark:text-white"
											: "text-text-strong-950/85 dark:text-white/80",
									)}
								>
									{row.name}
								</span>
							</span>
							<span className="h-1.5 overflow-hidden rounded-full bg-bg-weak-50 dark:bg-white/[0.07]">
								<span
									className={cn(
										"block h-full rounded-full transition-[width] duration-500 ease-out",
										isReloop
											? "bg-text-strong-950 dark:bg-white"
											: "bg-text-soft-400 dark:bg-white/30",
									)}
									style={{ width: `${width}%` }}
								/>
							</span>
							<span className="hidden truncate text-[13px] text-text-sub-600 sm:block dark:text-white/40">
								{row.plan}
							</span>
							<span
								className={cn(
									"text-right text-[14px] tabular-nums",
									isReloop
										? "font-semibold text-text-strong-950 dark:text-white"
										: "text-text-strong-950/85 dark:text-white/80",
								)}
							>
								{formatUsd(row.usd)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
