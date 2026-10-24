"use client";

import type { PlanId } from "@reloop/pricing";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import Link from "next/link";
import { createContext, type ReactNode, useContext } from "react";

/** What a pricing button is for. Hosts use it to swap in their own action. */
export type PricingCtaTarget = PlanId | "credits" | "business" | "dedicated-ip";

/** Where the button sits, which sets its size. */
export type PricingCtaPlacement = "card" | "compare" | "strip";

export type PricingCtaRequest = {
	target: PricingCtaTarget;
	placement: PricingCtaPlacement;
	label: string;
	href: string;
	external?: boolean;
	primary: boolean;
	/** Emails picked on the slider, for volume-based buttons. */
	volume?: number;
};

/** A host's take on a button. Fields left out keep the default. */
export type PricingCtaOverride = {
	label?: string;
	primary?: boolean;
	disabled?: boolean;
	onClick?: () => void;
};

type PricingUiContextValue = {
	resolveCta?: (request: PricingCtaRequest) => PricingCtaOverride | undefined;
	/** Offset for sticky comparison headers (height of the host's top bar). */
	stickyTopClassName: string;
	/** Wraps the plan cards and tables, like the marketing PageSection. */
	Section: (props: { children: ReactNode }) => ReactNode;
};

function DefaultSection({ children }: { children: ReactNode }) {
	return <div className="px-4 sm:px-6 lg:px-8">{children}</div>;
}

const PricingUiContext = createContext<PricingUiContextValue>({
	stickyTopClassName: "top-16",
	Section: DefaultSection,
});

export function PricingUiProvider({
	children,
	resolveCta,
	stickyTopClassName = "top-16",
	Section = DefaultSection,
}: {
	children: ReactNode;
	resolveCta?: PricingUiContextValue["resolveCta"];
	stickyTopClassName?: string;
	Section?: PricingUiContextValue["Section"];
}) {
	return (
		<PricingUiContext.Provider
			value={{ resolveCta, stickyTopClassName, Section }}
		>
			{children}
		</PricingUiContext.Provider>
	);
}

export function usePricingUi() {
	return useContext(PricingUiContext);
}

const PLACEMENT_CLASS: Record<PricingCtaPlacement, string> = {
	card: "h-11! w-full! rounded-full! px-6!",
	compare: "h-10! w-full! rounded-full! px-5!",
	strip: "h-10! shrink-0 rounded-full! px-5!",
};

const LABEL_CLASS: Record<PricingCtaPlacement, string> = {
	card: "font-medium text-[14px]",
	compare: "truncate font-medium text-[14px] tracking-[-0.01em]",
	strip: "font-medium text-[14px]",
};

/** A pricing button: a link by default, or the host's action when resolved. */
export function PricingCta(request: PricingCtaRequest) {
	const { resolveCta } = usePricingUi();
	const override = resolveCta?.(request);
	const primary = override?.primary ?? request.primary;
	const label = override?.label ?? request.label;
	const className = cn(
		PLACEMENT_CLASS[request.placement],
		primary && "dark:text-black",
	);
	const content = (
		<span className={LABEL_CLASS[request.placement]}>{label}</span>
	);

	if (override?.onClick || override?.disabled) {
		return (
			<FancyButton.Root
				type="button"
				variant={primary ? "primary" : "basic"}
				size="medium"
				className={cn(className, override.disabled && "opacity-60")}
				disabled={override.disabled}
				onClick={override.onClick}
			>
				{content}
			</FancyButton.Root>
		);
	}

	return (
		<FancyButton.Root
			asChild
			variant={primary ? "primary" : "basic"}
			size="medium"
			className={className}
		>
			{request.external ? (
				<a href={request.href} target="_blank" rel="noopener noreferrer">
					{content}
				</a>
			) : (
				<Link href={request.href}>{content}</Link>
			)}
		</FancyButton.Root>
	);
}
