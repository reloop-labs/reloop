"use client";

import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import {
	comparisonSections,
	formatPrice,
	getPlanPrice,
	pricingPlans,
} from "@reloop/web/lib/pricing";
import Link from "next/link";
import { Fragment } from "react";

function PlanCtaLink({
	href,
	label,
	external,
	variant = "default",
	size = "medium",
}: {
	href: string;
	label: string;
	external?: boolean;
	variant?: "default" | "primary";
	size?: "medium" | "small" | "xsmall";
}) {
	const fancyVariant = variant === "primary" ? "neutral" : "basic";
	const heightClass =
		size === "xsmall"
			? "h-7.5! px-3!"
			: size === "small"
				? "h-8.5! px-4!"
				: "h-11! px-6!";
	const textSizeClass =
		size === "xsmall"
			? "text-[12px]"
			: size === "small"
				? "text-[13px]"
				: "text-[14px]";

	const content = (
		<span className={cn("font-semibold", textSizeClass)}>{label}</span>
	);

	if (external) {
		return (
			<FancyButton.Root
				asChild
				variant={fancyVariant}
				size={size}
				className={cn("w-full! rounded-full!", heightClass)}
			>
				<a href={href} target="_blank" rel="noopener noreferrer">
					{content}
				</a>
			</FancyButton.Root>
		);
	}

	return (
		<FancyButton.Root
			asChild
			variant={fancyVariant}
			size={size}
			className={cn("w-full! rounded-full!", heightClass)}
		>
			<Link href={href}>{content}</Link>
		</FancyButton.Root>
	);
}

function getFeatureIcon(feature: string, customClassName?: string) {
	const key = feature.toLowerCase().trim();
	const className =
		customClassName ??
		"mt-0.5 size-4 shrink-0 text-text-sub-600 dark:text-white/40";

	if (key.includes("all ") && key.includes("features")) {
		return (
			<Icon
				name="sparkling"
				className={
					customClassName
						? className
						: "mt-0.5 size-4 shrink-0 text-primary-base"
				}
			/>
		);
	}
	if (
		key.includes("retention") ||
		key.includes("database") ||
		key.includes("export")
	) {
		return <Icon name="database" className={className} />;
	}
	if (key.includes("day") || key.includes("limit")) {
		return <Icon name="limit" className={className} />;
	}
	if (
		key.includes("monthly emails") ||
		(key.includes("email") && (key.includes("month") || key.includes("volume")))
	) {
		return <Icon name="mail-single" className={className} />;
	}
	if (key.includes("inbound")) {
		return <Icon name="mail-receive" className={className} />;
	}
	if (key.includes("human inbox")) {
		return (
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={className}
			>
				<path
					opacity="0.12"
					d="M21.5148 15.9403L21.9999 14H18.7126C18.0864 14 17.7734 14 17.4892 14.0863C17.2376 14.1627 17.0036 14.288 16.8004 14.4549C16.571 14.6435 16.3974 14.904 16.05 15.425L16.05 15.425L15.95 15.575L15.95 15.575C15.6026 16.096 15.429 16.3565 15.1996 16.5451C14.9964 16.712 14.7624 16.8373 14.5108 16.9137C14.2266 17 13.9136 17 13.2874 17H10.7126C10.0864 17 9.77338 17 9.4892 16.9137C9.23762 16.8373 9.00357 16.712 8.80045 16.5451C8.57101 16.3565 8.39735 16.096 8.05003 15.575L8.05003 15.575L7.94997 15.425C7.60265 14.904 7.42899 14.6435 7.19955 14.4549C6.99643 14.288 6.76238 14.1627 6.5108 14.0863C6.22662 14 5.91355 14 5.28741 14H1.99988L2.48495 15.9403C3.02661 18.1069 3.29745 19.1903 3.90143 19.9969C4.43433 20.7086 5.14737 21.2653 5.96706 21.6097C6.89608 22 8.01275 22 10.2461 22H13.7537C15.987 22 17.1037 22 18.0327 21.6097C18.8524 21.2653 19.5654 20.7086 20.0983 19.9969C20.7023 19.1903 20.9731 18.107 21.5148 15.9403L21.5148 15.9403Z"
					fill="currentColor"
				/>
				<path
					d="M15.5002 3H16.0002C17.7714 3 19.3235 4.18549 19.7895 5.8943L21.0335 10.4561C21.1739 10.9708 21.2441 11.2282 21.3021 11.4846C21.6773 13.1435 21.6956 14.8632 21.3557 16.5297C21.3032 16.7873 21.2385 17.046 21.1091 17.5636C20.9549 18.1802 20.8779 18.4885 20.7781 18.7547C20.1188 20.5137 18.5293 21.7548 16.6629 21.9678C16.3804 22 16.0627 22 15.4271 22H8.57279C7.93734 22 7.61961 22 7.33717 21.9678C5.47072 21.7549 3.88112 20.5137 3.22188 18.7547C3.12212 18.4885 3.04506 18.1802 2.89093 17.5637C2.76155 17.0462 2.69686 16.7874 2.64434 16.5299C2.30445 14.8633 2.32275 13.1434 2.69804 11.4844C2.75603 11.228 2.82622 10.9707 2.96659 10.456L4.21076 5.89428C4.67683 4.18547 6.22892 3 8.00015 3H8.50015M2.50024 14H5.2875C5.91365 14 6.22672 14 6.51089 14.0863C6.76247 14.1627 6.99652 14.288 7.19964 14.4549C7.42908 14.6435 7.60274 14.904 7.95006 15.425L8.05012 15.575C8.39744 16.096 8.5711 16.3565 8.80054 16.5451C9.00366 16.712 9.23771 16.8373 9.48929 16.9137C9.77347 17 10.0865 17 10.7127 17H13.2875C13.9136 17 14.2267 17 14.5109 16.9137C14.7625 16.8373 14.9965 16.712 15.1996 16.5451C15.4291 16.3565 15.6027 16.096 15.9501 15.575L16.0501 15.425C16.3974 14.904 16.5711 14.6435 16.8005 14.4549C17.0037 14.288 17.2377 14.1627 17.4893 14.0863C17.7735 14 18.0865 14 18.7127 14H21.5002M9.00024 8L12.0002 11L15.0002 8M12.0002 11V2"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		);
	}
	if (key.includes("inbox") || key.includes("agent")) {
		return <Icon name="agent" className={className} />;
	}
	if (key.includes("webhook")) {
		return <Icon name="webhook" className={className} />;
	}
	if (key.includes("domain")) {
		return <Icon name="globe" className={className} />;
	}
	if (key.includes("transactional") || key.includes("campaign")) {
		return <Icon name="mega-phone" className={className} />;
	}
	if (key.includes("smtp")) {
		return <Icon name="smtp" className={className} />;
	}
	if (
		key.includes("analytics") ||
		key.includes("tracking") ||
		key.includes("reputation")
	) {
		return <Icon name="graph-up" className={className} />;
	}
	if (key.includes("attachment")) {
		return <Icon name="paperclip" className={className} />;
	}
	if (
		key.includes("support") ||
		key.includes("sla") ||
		key.includes("uptime")
	) {
		return <Icon name="headset" className={className} />;
	}
	if (
		key.includes("overage") ||
		key.includes("pricing") ||
		key.includes("invoice")
	) {
		return <Icon name="invoice" className={className} />;
	}
	if (
		key.includes("throughput") ||
		key.includes("second") ||
		key.includes("warmup")
	) {
		return <Icon name="zap" className={className} />;
	}
	if (
		key.includes("spf") ||
		key.includes("dkim") ||
		key.includes("dmarc") ||
		key.includes("auth") ||
		key.includes("validation")
	) {
		return <Icon name="shield" className={className} />;
	}
	if (key.includes("ip") || key.includes("relay") || key.includes("server")) {
		return <Icon name="mail-server" className={className} />;
	}
	if (
		key.includes("security") ||
		key.includes("lock") ||
		key.includes("audit")
	) {
		return <Icon name="lock" className={className} />;
	}
	if (key.includes("rest api") || key.includes("api") || key.includes("cli")) {
		return <Icon name="command" className={className} />;
	}
	if (key.includes("scheduled") || key.includes("calendar")) {
		return <Icon name="calendar" className={className} />;
	}
	if (key.includes("template") || key.includes("log") || key.includes("file")) {
		return <Icon name="file-text" className={className} />;
	}
	if (key.includes("sdk") || key.includes("workflow")) {
		return <Icon name="workflow" className={className} />;
	}
	if (key.includes("self-host")) {
		return <Icon name="home" className={className} />;
	}
	if (key.includes("integration") || key.includes("component")) {
		return <Icon name="grid" className={className} />;
	}
	if (key.includes("spam")) {
		return <Icon name="alert-triangle" className={className} />;
	}

	return <Icon name="sparkling" className={className} />;
}

function PlanColumn({
	plan,
	index,
}: {
	plan: (typeof pricingPlans)[number];
	index: number;
}) {
	const price = getPlanPrice(plan);
	const isCustom = price === null;

	const borderClasses = [
		"border-b sm:border-r sm:border-b lg:border-r lg:border-b-0",
		"border-b sm:border-r-0 sm:border-b lg:border-r lg:border-b-0",
		"border-b sm:border-r sm:border-b-0 lg:border-r lg:border-b-0",
		"border-b-0 sm:border-b-0 sm:border-r-0 lg:border-r-0 lg:border-b-0",
	][index];

	return (
		<div
			className={cn(
				"flex min-h-[440px] flex-col border-stroke-soft-200 p-6 pb-5 sm:min-h-[460px] sm:p-8 sm:pb-6 lg:p-6 lg:pb-5 xl:p-8 xl:pb-6 dark:border-white/10",
				borderClasses,
				plan.highlighted && "bg-bg-weak-50 dark:bg-white/[0.03]",
			)}
		>
			<div>
				<div className="flex items-center gap-2">
					<h3 className="font-semibold text-[15px] text-text-strong-950 dark:text-white">
						{plan.name}
					</h3>
					{plan.badge && (
						<span className="shrink-0 rounded-full bg-primary-base px-2 py-0.5 text-center font-semibold text-[10px] text-white uppercase tracking-[0.14em]">
							{plan.badge}
						</span>
					)}
				</div>

				<div className="mt-6 min-h-[96px]">
					{isCustom ? (
						<p className="font-serif text-[2.4rem] text-text-strong-950 leading-none tracking-tighter dark:text-white">
							Custom
						</p>
					) : (
						<div className="flex items-end gap-1">
							<span className="font-serif text-[2.4rem] text-text-strong-950 leading-none tracking-tighter dark:text-white">
								{formatPrice(price)}
							</span>
							{price > 0 && (
								<span className="mb-1 font-sans text-[15px] text-text-sub-600 dark:text-white/50">
									{plan.priceSubline}
								</span>
							)}
						</div>
					)}
					<p
						className={cn(
							"mt-2 text-[14px]",
							!isCustom && price > 0
								? "font-medium text-text-strong-950 dark:text-white"
								: "text-text-sub-600 dark:text-white/55",
						)}
					>
						{isCustom || price === 0 ? plan.priceSubline : plan.emailsLabel}
					</p>
					{plan.extraEmailsLabel && (
						<p className="mt-0.5 text-[12px] text-text-sub-600 dark:text-white/50">
							{plan.extraEmailsLabel}
						</p>
					)}
				</div>
			</div>

			<ul className="mt-5 flex-1 space-y-1.5">
				{plan.features.map((feature) => (
					<li
						key={feature}
						className="flex min-h-[24px] items-center gap-3 text-[14px] leading-snug"
					>
						{getFeatureIcon(feature)}
						<span className="text-text-sub-600 dark:text-white/60">
							{feature}
						</span>
					</li>
				))}
			</ul>

			<div
				className={cn(
					"mt-8 flex flex-col gap-3",
					plan.secondaryCta && "sm:flex-row sm:items-center",
				)}
			>
				<PlanCtaLink
					href={plan.ctaHref}
					label={plan.ctaLabel}
					external={plan.ctaExternal}
					variant={plan.highlighted ? "primary" : "default"}
				/>
				{plan.secondaryCta && (
					<PlanCtaLink
						href={plan.secondaryCta.href}
						label={plan.secondaryCta.label}
						external={plan.secondaryCta.external}
					/>
				)}
			</div>
		</div>
	);
}

function ComparisonCell({
	value,
	type,
}: {
	value: string | boolean;
	type: "text" | "boolean";
}) {
	const unavailable = type === "boolean" ? !value : value === "—";

	if (unavailable) {
		return (
			<span
				role="img"
				className="text-[14px] text-text-sub-600/60 dark:text-white/25"
				aria-label="Not included"
			>
				—
			</span>
		);
	}

	if (type === "boolean") {
		return (
			<Icon
				name="check-circle"
				className="size-4 text-text-strong-950 dark:text-white/85"
				aria-label="Included"
			/>
		);
	}

	return (
		<span className="inline-flex items-center gap-2.5 text-[14px]">
			<Icon
				name="check-circle"
				className="size-4 shrink-0 text-text-strong-950 dark:text-white/85"
				aria-hidden
			/>
			<span className="text-text-strong-950 dark:text-white/85">
				{value as string}
			</span>
		</span>
	);
}

const COMPARISON_GRID_COLS =
	"grid-cols-[minmax(160px,34%)_repeat(4,minmax(140px,1fr))]";

function comparisonPriceLine(plan: (typeof pricingPlans)[number]) {
	if (plan.monthlyPrice === null) {
		return { amount: "Custom", caption: "pricing" };
	}
	if (plan.monthlyPrice === 0) {
		return { amount: formatPrice(0), caption: "Free for everyone" };
	}
	return {
		amount: formatPrice(plan.monthlyPrice),
		caption: "per month",
	};
}

function highlightColumn(plan: (typeof pricingPlans)[number]) {
	return plan.highlighted
		? "border-stroke-soft-200 border-x bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]"
		: "";
}

const COMPARISON_PAD_LEFT = "pl-5 sm:pl-7 lg:pl-9";
const COMPARISON_PAD_RIGHT = "pr-5 sm:pr-7 lg:pr-9";

function ComparisonTable() {
	return (
		<div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto lg:overflow-visible">
			<div className={cn("grid w-full min-w-[760px]", COMPARISON_GRID_COLS)}>
				<div
					className={cn(
						"sticky top-16 z-20 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95",
						COMPARISON_PAD_LEFT,
					)}
				/>
				{pricingPlans.map((plan, planIndex) => {
					const price = comparisonPriceLine(plan);
					const isLast = planIndex === pricingPlans.length - 1;
					return (
						<div
							key={plan.id}
							className="sticky top-16 z-20 border-stroke-soft-200 border-b bg-bg-white-0/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95"
						>
							<div
								className={cn(
									"flex flex-col gap-4 px-5 pt-6 pb-4 sm:px-6 sm:pt-6 sm:pb-4",
									isLast && COMPARISON_PAD_RIGHT,
									plan.highlighted &&
										"rounded-t-2xl border-stroke-soft-200 border-x border-t bg-bg-weak-50/60 dark:border-white/10 dark:bg-white/[0.03]",
								)}
							>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-medium text-label-md text-text-strong-950 dark:text-white">
											{plan.name}
										</span>
										{plan.badge ? (
											<span className="shrink-0 rounded-full bg-primary-base px-2 py-0.5 text-center font-semibold text-[10px] text-white uppercase tracking-[0.14em]">
												{plan.badge}
											</span>
										) : null}
									</div>
									<div className="mt-2.5 flex items-baseline gap-1.5">
										<span className="font-semibold text-text-strong-950 text-title-h6 dark:text-white">
											{price.amount}
										</span>
										<span className="text-paragraph-xs text-text-sub-600 dark:text-white/50">
											{price.caption}
										</span>
									</div>
									<div className="mt-4 sm:mt-5">
										<PlanCtaLink
											href={plan.ctaHref}
											label={plan.ctaLabel}
											external={plan.ctaExternal}
											variant={plan.highlighted ? "primary" : "default"}
											size="small"
										/>
									</div>
								</div>
							</div>
						</div>
					);
				})}

				{comparisonSections.map((section, sectionIndex) => (
					<Fragment key={section.title}>
						<div
							className={cn(
								"flex items-end pb-3",
								COMPARISON_PAD_LEFT,
								sectionIndex > 0 ? "pt-10" : "pt-6",
							)}
						>
							<span className="font-medium text-[15px] text-text-strong-950 dark:text-white">
								{section.title}
							</span>
						</div>
						{pricingPlans.map((plan, planIndex) => (
							<div
								key={plan.id}
								className={cn(
									sectionIndex > 0 ? "pt-10" : "pt-6",
									"pb-3",
									planIndex === pricingPlans.length - 1 && COMPARISON_PAD_RIGHT,
									highlightColumn(plan),
								)}
							/>
						))}

						{section.rows.map((row) => (
							<Fragment key={row.key}>
								<div
									className={cn(
										"flex items-center gap-2.5 border-stroke-soft-200 border-b py-3 pr-4 dark:border-white/[0.06]",
										COMPARISON_PAD_LEFT,
									)}
								>
									{getFeatureIcon(
										row.label,
										"size-4 shrink-0 text-text-sub-600 dark:text-white/40",
									)}
									<span className="text-[14px] text-text-sub-600 dark:text-white/55">
										{row.label}
									</span>
								</div>
								{pricingPlans.map((plan, planIndex) => {
									const value = plan.comparison[row.key];
									return (
										<div
											key={plan.id}
											className={cn(
												"flex items-center border-stroke-soft-200 border-b px-4 py-3 dark:border-white/[0.06]",
												planIndex === pricingPlans.length - 1 &&
													COMPARISON_PAD_RIGHT,
												highlightColumn(plan),
											)}
										>
											<ComparisonCell
												value={value as string | boolean}
												type={row.type}
											/>
										</div>
									);
								})}
							</Fragment>
						))}
					</Fragment>
				))}

				<div className={COMPARISON_PAD_LEFT} />
				{pricingPlans.map((plan, planIndex) => (
					<div
						key={`cap-${plan.id}`}
						className={cn(
							"h-8",
							planIndex === pricingPlans.length - 1 && COMPARISON_PAD_RIGHT,
							plan.highlighted && "rounded-b-2xl border-b",
							highlightColumn(plan),
						)}
					/>
				))}
			</div>
		</div>
	);
}

export function PricingSection() {
	return (
		<>
			<div className="-mx-4 sm:-mx-6 lg:-mx-8 border-stroke-soft-200 border-y sm:grid sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
				{pricingPlans.map((plan, index) => (
					<PlanColumn key={plan.id} plan={plan} index={index} />
				))}
			</div>
			<div className="mt-24">
				<ComparisonTable />
			</div>
		</>
	);
}
