"use client";

import { cn } from "@reloop/ui/cn";
import Link from "next/link";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { usePlayAnimationOnHover } from "./use-play-animation-on-hover";

type SidebarNavLinkProps = ComponentPropsWithoutRef<typeof Link>;

/**
 * Nav link that keeps icon hover animations running until they finish,
 * even if the pointer leaves mid-animation.
 */
export const SidebarNavLink = forwardRef<
	HTMLAnchorElement,
	SidebarNavLinkProps
>(function SidebarNavLink(
	{
		className,
		onPointerEnter,
		onPointerLeave,
		onAnimationStart,
		onAnimationEnd,
		children,
		...rest
	},
	ref,
) {
	const {
		isAnimating,
		onPointerEnter: onHoverEnter,
		onPointerLeave: onHoverLeave,
		onAnimationStart: onAnimStart,
		onAnimationEnd: onAnimEnd,
	} = usePlayAnimationOnHover();

	return (
		<Link
			ref={ref}
			data-animating={isAnimating || undefined}
			className={cn("group", className)}
			onPointerEnter={(e) => {
				onHoverEnter();
				onPointerEnter?.(e);
			}}
			onPointerLeave={(e) => {
				onHoverLeave();
				onPointerLeave?.(e);
			}}
			onAnimationStart={(e) => {
				onAnimStart();
				onAnimationStart?.(e);
			}}
			onAnimationEnd={(e) => {
				onAnimEnd();
				onAnimationEnd?.(e);
			}}
			{...rest}
		>
			{children}
		</Link>
	);
});

type SidebarNavButtonProps = ComponentPropsWithoutRef<"button">;

/** Same hover-animation chrome as `SidebarNavLink`, for in-sidebar swaps. */
export const SidebarNavButton = forwardRef<
	HTMLButtonElement,
	SidebarNavButtonProps
>(function SidebarNavButton(
	{
		className,
		onPointerEnter,
		onPointerLeave,
		onAnimationStart,
		onAnimationEnd,
		type = "button",
		children,
		...rest
	},
	ref,
) {
	const {
		isAnimating,
		onPointerEnter: onHoverEnter,
		onPointerLeave: onHoverLeave,
		onAnimationStart: onAnimStart,
		onAnimationEnd: onAnimEnd,
	} = usePlayAnimationOnHover();

	return (
		<button
			ref={ref}
			type={type}
			data-animating={isAnimating || undefined}
			className={cn("group", className)}
			onPointerEnter={(e) => {
				onHoverEnter();
				onPointerEnter?.(e);
			}}
			onPointerLeave={(e) => {
				onHoverLeave();
				onPointerLeave?.(e);
			}}
			onAnimationStart={(e) => {
				onAnimStart();
				onAnimationStart?.(e);
			}}
			onAnimationEnd={(e) => {
				onAnimEnd();
				onAnimationEnd?.(e);
			}}
			{...rest}
		>
			{children}
		</button>
	);
});
