"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";

export const EmptyState = () => {
	const { activeOrganization } = useUserOrganization();

	return (
		<div className="flex flex-col items-center justify-center h-[calc(100dvh-150px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
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

				{/* Center icon container */}
				<div className="relative">
					<div className="absolute -top-3 -left-3 h-16 w-16 rounded-full bg-neutral-alpha-10 animate-pulse" />
					<div
						className="absolute -right-2 -bottom-2 h-12 w-12 rounded-full bg-neutral-alpha-10 animate-pulse"
						style={{ animationDelay: "1s" }}
					/>
					<div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-stroke-soft-200/50 bg-bg-white-0 shadow-regular-md group">
						<div className="relative">
							<div
								className="absolute inset-0 blur-xl rounded-full bg-primary-alpha-16 animate-pulse"
								style={{ animationDuration: "2s" }}
							/>
							{/* Globe icon with wiggle animation */}
							<Icon
								name="globe"
								className="relative h-10 w-10 text-natural-base"
								style={{
									animation: "globeWiggle 4s ease-in-out infinite",
								}}
							/>
						</div>
					</div>
					<div
						className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-alpha-24"
						style={{
							animation: "floatParticle 3s ease-in-out infinite",
						}}
					/>
					<div
						className="absolute bottom-4 left-0 h-1.5 w-1.5 rounded-full bg-primary-alpha-16"
						style={{
							animation: "floatParticle 3s ease-in-out infinite 0.5s",
						}}
					/>
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
				@keyframes globeWiggle {
					0%, 100% {
						transform: rotate(0deg) scale(1);
					}
					15% {
						transform: rotate(-12deg) scale(1.05);
					}
					30% {
						transform: rotate(10deg) scale(1.02);
					}
					45% {
						transform: rotate(-8deg) scale(1.03);
					}
					60% {
						transform: rotate(5deg) scale(1);
					}
					75% {
						transform: rotate(-3deg) scale(1);
					}
					90% {
						transform: rotate(0deg) scale(1);
					}
				}

				@keyframes floatParticle {
					0%, 100% {
						transform: translateY(0) translateX(0) scale(1);
						opacity: 0.6;
					}
					25% {
						transform: translateY(-6px) translateX(3px) scale(1.2);
						opacity: 1;
					}
					50% {
						transform: translateY(-10px) translateX(-2px) scale(0.8);
						opacity: 0.8;
					}
					75% {
						transform: translateY(-4px) translateX(4px) scale(1.1);
						opacity: 0.5;
					}
				}

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
