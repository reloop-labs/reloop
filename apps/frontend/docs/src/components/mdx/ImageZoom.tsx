"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../../lib/cn";

export function MDXImage({ src, alt, className, ...props }: any) {
	const [isOpen, setIsOpen] = useState(false);

	if (!src) return null;

	return (
		<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
			<span
				onClick={() => setIsOpen(true)}
				className="group relative my-6 inline-block w-full cursor-zoom-in overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50"
			>
				<img
					src={src}
					alt={alt || ""}
					className={cn(
						"block w-full rounded-xl transition-transform duration-200 group-hover:scale-[1.008]",
						className,
					)}
					{...props}
				/>
				<span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/5">
					<span className="rounded-full bg-black/60 p-2.5 text-white opacity-0 shadow-lg backdrop-blur-xs transition-opacity group-hover:opacity-100 dark:bg-white/80 dark:text-black">
						<ZoomIn className="size-5" />
					</span>
				</span>
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
											{alt || "Full screen image view"}
										</Dialog.Title>
										<img
											src={src}
											alt={alt || ""}
											className="max-h-[85vh] max-w-full rounded-xl border border-white/10 object-contain shadow-2xl"
										/>
										{alt && (
											<p className="mt-3 text-center font-medium text-sm text-white/70">
												{alt}
											</p>
										)}
										<Dialog.Close asChild>
											<button
												type="button"
												className="-top-12 absolute right-0 cursor-pointer rounded-full bg-white/10 p-2 text-white/80 backdrop-blur-xs transition-colors hover:bg-white/20 hover:text-white focus:outline-none"
												aria-label="Close full screen view"
											>
												<X className="size-5" />
											</button>
										</Dialog.Close>
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
				className="group relative my-6 inline-block w-full cursor-zoom-in overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50"
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
