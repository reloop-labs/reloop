"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Globe3D } from "@fe/dashboard/components/three/globe-3d";
import Link from "next/link";
import { Suspense } from "react";

export const EmptyState = () => {
	const { activeOrganization } = useUserOrganization();

	return (
		<div className="flex flex-col items-center justify-center h-[calc(100dvh-150px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Illustration with floating orbs */}
			<div className="relative mb-8 flex items-center justify-center">
				{/* Left side floating orbs */}
				<div className="absolute -left-24 -top-4 flex flex-col gap-3 items-end">
					<div
						className="h-6 w-6 rounded-full bg-neutral-alpha-24"
						style={{ animation: "floatOrb 3s ease-in-out infinite" }}
					/>
					<div
						className="h-3 w-3 rounded-full bg-neutral-alpha-16 -mr-2"
						style={{ animation: "floatOrb 3s ease-in-out infinite 0.5s" }}
					/>
				</div>

				{/* Background circle */}
				<div className="absolute h-36 w-36 rounded-full border border-stroke-soft-200/50" />

				{/* 3D Globe - no box container */}
				<div className="relative z-10">
					<Suspense
						fallback={
							<Icon
								name="globe"
								className="h-16 w-16 text-text-sub-600 animate-spin"
								style={{ animationDuration: "3s" }}
							/>
						}
					>
						<Globe3D size={160} />
					</Suspense>
				</div>

				{/* Right side floating orbs - mirroring left side */}
				<div className="absolute -right-24 flex flex-col gap-3 items-start">
					<div
						className="h-6 w-6 rounded-full bg-neutral-alpha-24"
						style={{ animation: "floatOrb 3s ease-in-out infinite 0.3s" }}
					/>
					<div
						className="h-3 w-3 rounded-full bg-neutral-alpha-16 -ml-2"
						style={{ animation: "floatOrb 3s ease-in-out infinite 0.8s" }}
					/>
				</div>
			</div>

			{/* Content */}
			<div className="flex max-w-md flex-col items-center text-center">
				<h3
					className="mb-2 font-semibold text-text-strong-950 text-xl animate-in fade-in slide-in-from-bottom-2 duration-500"
					style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
				>
					No domains yet
				</h3>
				<p
					className="mb-2 text-text-sub-600 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
					style={{ animationDelay: "250ms", animationFillMode: "backwards" }}
				>
					Add your first domain to begin sending emails from your custom domain.
				</p>
				<p
					className="mb-6 text-text-soft-400 text-xs animate-in fade-in slide-in-from-bottom-2 duration-500"
					style={{ animationDelay: "350ms", animationFillMode: "backwards" }}
				>
					Configure DNS records to verify ownership and enable email delivery.
				</p>

				{/* CTA */}
				<div
					className="animate-in fade-in slide-in-from-bottom-2 duration-500"
					style={{ animationDelay: "450ms", animationFillMode: "backwards" }}
				>
					<Link
						href={`/${activeOrganization.slug}/domain/add`}
						className={Button.buttonVariants({
							variant: "neutral",
							size: "small",
						}).root()}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add your first domain
					</Link>
				</div>

				{/* Help link */}
				<a
					href="https://reloop.sh/docs/domains"
					target="_blank"
					rel="noopener noreferrer"
					className="mt-4 flex items-center gap-1 text-text-sub-600 text-xs transition-colors hover:text-text-strong-950 animate-in fade-in slide-in-from-bottom-2 duration-500"
					style={{ animationDelay: "550ms", animationFillMode: "backwards" }}
				>
					<Icon name="book-closed" className="h-3 w-3" />
					Learn more about custom domains
				</a>
			</div>

			{/* Custom keyframe animations */}
			<style jsx global>{`
				@keyframes floatOrb {
					0%, 100% {
						transform: translateY(0);
					}
					50% {
						transform: translateY(-8px);
					}
				}
			`}</style>
		</div>
	);
};
