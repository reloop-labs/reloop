"use client";

import { cn } from "@reloop/ui/cn";
import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { usePlayAnimationOnHover } from "./use-play-animation-on-hover";

type SidebarNavLinkProps = ComponentPropsWithoutRef<typeof Link>;

/**
 * Nav link that keeps icon hover animations running until they finish,
 * even if the pointer leaves mid-animation.
 */
export const SidebarNavLink = forwardRef<HTMLAnchorElement, SidebarNavLinkProps>(
	function SidebarNavLink(
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
	},
);
