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
						"w-full block rounded-xl transition-transform duration-200 group-hover:scale-[1.008]",
						className,
					)}
					{...props}
				/>
				<span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/5 pointer-events-none flex items-center justify-center">
					<span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 dark:bg-white/80 text-white dark:text-black p-2.5 rounded-full shadow-lg backdrop-blur-xs">
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
								className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md cursor-zoom-out flex items-center justify-center p-4 sm:p-8"
							>
								<Dialog.Content asChild onClick={(e) => e.stopPropagation()}>
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ type: "spring", stiffness: 300, damping: 25 }}
										className="relative max-w-[92vw] max-h-[92vh] flex flex-col items-center justify-center outline-none"
									>
										<Dialog.Title className="sr-only">
											{alt || "Full screen image view"}
										</Dialog.Title>
										<img
											src={src}
											alt={alt || ""}
											className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
										/>
										{alt && (
											<p className="mt-3 text-sm text-white/70 text-center font-medium">
												{alt}
											</p>
										)}
										<Dialog.Close asChild>
											<button
												type="button"
												className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-xs cursor-pointer focus:outline-none"
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
					className={cn(
						"w-full block m-0 p-0 border-none outline-none transition-transform duration-200 group-hover:scale-[1.008]",
						className,
					)}
					autoPlay
					loop
					muted
					playsInline
					{...props}
				>
					{children}
				</video>
				<span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/5 pointer-events-none flex items-center justify-center">
					<span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 dark:bg-white/80 text-white dark:text-black p-2.5 rounded-full shadow-lg backdrop-blur-xs">
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
								className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md cursor-zoom-out flex items-center justify-center p-4 sm:p-8"
							>
								<Dialog.Content asChild onClick={(e) => e.stopPropagation()}>
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ type: "spring", stiffness: 300, damping: 25 }}
										className="relative max-w-[92vw] max-h-[92vh] flex flex-col items-center justify-center outline-none"
									>
										<Dialog.Title className="sr-only">
											Full screen video view
										</Dialog.Title>
										<video
											src={videoSrc}
											controls
											autoPlay
											loop
											muted
											playsInline
											className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
										>
											{children}
										</video>
										<Dialog.Close asChild>
											<button
												type="button"
												className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-xs cursor-pointer focus:outline-none"
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
