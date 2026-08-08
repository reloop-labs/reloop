"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { cn } from "../../lib/cn";

/** Small label + image, flush together (for Reloop/Cloudflare screenshot pairs). */
export function DocImage({
	label,
	src,
	alt,
	className,
}: {
	label: string;
	src: string;
	alt?: string;
	className?: string;
}) {
	return (
		<figure className={cn("not-prose my-5", className)}>
			<figcaption className="mb-1 font-medium text-[11px] text-text-sub-600 leading-none dark:text-white/50">
				{label}
			</figcaption>
			<MDXImage src={src} alt={alt || label} className="my-0!" />
		</figure>
	);
}

export function MDXImage({ src, alt, className, ...props }: any) {
	const [isOpen, setIsOpen] = useState(false);

	if (!src) return null;

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<motion.img
				src={src}
				layoutId={src}
				alt={alt || ""}
				onClick={() => setIsOpen(true)}
				className={cn("block w-full rounded-xl", className)}
				{...props}
			/>

			<AnimatePresence>
				{isOpen && (
					<Dialog.Portal forceMount>
						<Dialog.Overlay asChild>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8"
							>
								<Dialog.Content asChild onClick={(e) => e.stopPropagation()}>
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ type: "spring", stiffness: 300, damping: 25 }}
										className="relative flex max-h-[92vh] max-w-[92vw] flex-col items-center justify-center outline-none"
									>
										<Dialog.Title className="sr-only">
											{alt || "Full screen image view"}
										</Dialog.Title>
										<motion.img
											layoutId={src}
											src={src}
											alt={alt || ""}
											className="max-h-[85vh]"
										/>
									</motion.div>
								</Dialog.Content>
							</motion.div>
						</Dialog.Overlay>
					</Dialog.Portal>
				)}
			</AnimatePresence>
		</Dialog.Root>
	);
}

export function MDXVideo({ src, children, className, ...props }: any) {
	const [isOpen, setIsOpen] = useState(false);

	let videoSrc = src;
	if (!videoSrc && children) {
		React.Children.forEach(children, (child: any) => {
			if (child?.props?.src) {
				videoSrc = child.props.src;
			}
		});
	}

	if (!videoSrc && !children) return null;

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<span
				onClick={() => setIsOpen(true)}
				className="group relative my-6 inline-block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-stroke-soft-100 dark:border-stroke-soft-100/50"
			>
				<video
					src={videoSrc}
					onClick={(e) => {
						e.stopPropagation();
						setIsOpen(true);
					}}
					className={cn("m-0 block w-full", className)}
					autoPlay
					loop
					muted
					playsInline
					{...props}
				>
					{children}
				</video>
			</span>
			<AnimatePresence>
				{isOpen && (
					<Dialog.Portal forceMount>
						<Dialog.Overlay asChild>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8"
							>
								<Dialog.Content asChild onClick={(e) => e.stopPropagation()}>
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ type: "spring", stiffness: 300, damping: 25 }}
										className="relative flex max-h-[92vh] max-w-[92vw] flex-col items-center justify-center outline-none"
									>
										<Dialog.Title className="sr-only">
											Full screen video view
										</Dialog.Title>
										<video
											src={videoSrc}
											autoPlay
											loop
											muted
											playsInline
											className="max-h-[85vh] max-w-full rounded-xl border border-white/10 object-contain shadow-2xl"
										>
											{children}
										</video>
									</motion.div>
								</Dialog.Content>
							</motion.div>
						</Dialog.Overlay>
					</Dialog.Portal>
				)}
			</AnimatePresence>
		</Dialog.Root>
	);
}
