"use client";

import { NodeSelection } from "@tiptap/pm/state";
import { type Editor, useCurrentEditor } from "@tiptap/react";
import axios from "axios";
import {
	Check,
	ExternalLink,
	Link as LinkIcon,
	Loader2,
	RefreshCw,
	Unlink,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";
import { setInlineCssDeclaration } from "../../utils/resolve-inspector-text-style";

interface OverlayRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

type ResizeDirection = "top" | "bottom" | "left" | "right";

export function EmailImageSelectionOverlay({
	editor: passedEditor,
}: {
	editor?: Editor | null;
}) {
	const currentEditorContext = useCurrentEditor();
	const editor = passedEditor ?? currentEditorContext?.editor;

	const [selectedImage, setSelectedImage] = useState<{
		pos: number;
		src: string;
		href?: string | null;
		alignment?: string;
	} | null>(null);

	const [rect, setRect] = useState<OverlayRect | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isLinkOpen, setIsLinkOpen] = useState(false);
	const [linkInputValue, setLinkInputValue] = useState("");

	const fileInputRef = useRef<HTMLInputElement>(null);
	const linkInputRef = useRef<HTMLInputElement>(null);
	const activeImgRef = useRef<HTMLImageElement | null>(null);
	const targetImagePosRef = useRef<number | null>(null);
	const isDraggingRef = useRef(false);
	const isUploadingRef = useRef(false);
	const isLinkOpenRef = useRef(false);

	isUploadingRef.current = isUploading;
	isLinkOpenRef.current = isLinkOpen;

	// Detect if selection is an image node
	const updateSelection = useCallback(() => {
		if (!editor || editor.isDestroyed) {
			setSelectedImage(null);
			setRect(null);
			return;
		}

		const { selection } = editor.state;
		if (
			selection instanceof NodeSelection &&
			selection.node.type.name === "image"
		) {
			const node = selection.node;
			const attrs = node.attrs || {};
			const pos = selection.from;
			targetImagePosRef.current = pos;
			setSelectedImage({
				pos,
				src: attrs.src || "",
				href: attrs.href || null,
				alignment: attrs.alignment || attrs.align || "center",
			});
			return;
		}

		// Preserve selection while uploading or editing link to avoid focus-loss dismiss
		if (isUploadingRef.current || isLinkOpenRef.current) {
			return;
		}

		setSelectedImage(null);
		setRect(null);
		setIsLinkOpen(false);
		activeImgRef.current = null;
	}, [editor]);

	// Listen to editor selection and transaction changes
	useEffect(() => {
		if (!editor) return;

		updateSelection();
		editor.on("selectionUpdate", updateSelection);
		editor.on("transaction", updateSelection);

		return () => {
			editor.off("selectionUpdate", updateSelection);
			editor.off("transaction", updateSelection);
		};
	}, [editor, updateSelection]);

	// Update the overlay bounding rectangle
	const updateRect = useCallback(() => {
		if (!editor || !selectedImage || isDraggingRef.current) return;

		try {
			const domNode = editor.view.nodeDOM(selectedImage.pos);
			const imgEl =
				domNode instanceof HTMLImageElement
					? domNode
					: (domNode as HTMLElement | null)?.querySelector("img");

			if (!imgEl) {
				setRect(null);
				activeImgRef.current = null;
				return;
			}

			activeImgRef.current = imgEl;

			const container =
				imgEl.closest(".overflow-y-auto") ||
				imgEl.closest(".tiptap")?.parentElement ||
				editor.view.dom.parentElement;

			if (!container) return;

			const containerRect = container.getBoundingClientRect();
			const imgRect = imgEl.getBoundingClientRect();

			setRect({
				top: imgRect.top - containerRect.top + container.scrollTop,
				left: imgRect.left - containerRect.left + container.scrollLeft,
				width: imgRect.width,
				height: imgRect.height,
			});
		} catch {
			setRect(null);
			activeImgRef.current = null;
		}
	}, [editor, selectedImage]);

	// Keep overlay position synchronized with scroll, resize, and DOM changes
	useEffect(() => {
		if (!selectedImage) return;

		updateRect();

		const img = activeImgRef.current;
		let resizeObserver: ResizeObserver | null = null;
		if (img) {
			resizeObserver = new ResizeObserver(() => {
				if (!isDraggingRef.current) updateRect();
			});
			resizeObserver.observe(img);
		}

		const handleScrollOrResize = () => {
			if (!isDraggingRef.current) updateRect();
		};

		window.addEventListener("resize", handleScrollOrResize);
		window.addEventListener("scroll", handleScrollOrResize, true);

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener("resize", handleScrollOrResize);
			window.removeEventListener("scroll", handleScrollOrResize, true);
		};
	}, [selectedImage, updateRect]);

	// Synchronize link input value when selected image changes
	useEffect(() => {
		setLinkInputValue(selectedImage?.href || "");
	}, [selectedImage?.href]);

	// Focus input when link popover opens
	useEffect(() => {
		if (isLinkOpen) {
			setTimeout(() => linkInputRef.current?.focus(), 50);
		}
	}, [isLinkOpen]);

	// Handle Image Replacement File Upload
	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		const targetPos = targetImagePosRef.current ?? selectedImage?.pos;
		if (!file || !editor || targetPos === null || targetPos === undefined)
			return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		if (file.size > 15 * 1024 * 1024) {
			toast.error("File size must be under 15MB");
			return;
		}

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const { data } = await axios.post("/api/upload/v1/upload", formData, {
				withCredentials: true,
			});

			const uploadedUrl = ensureAbsoluteUrl(data.url as string);

			// Re-select target image node and update src attribute in TipTap
			editor
				.chain()
				.setNodeSelection(targetPos)
				.updateAttributes("image", { src: uploadedUrl })
				.run();

			setSelectedImage((prev) => (prev ? { ...prev, src: uploadedUrl } : null));
			toast.success("Image replaced successfully");
		} catch (error) {
			console.error("Image replacement upload error:", error);
			toast.error("Failed to upload and replace image. Please try again.");
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	// Handle Link Application
	const handleApplyLink = () => {
		const targetPos = targetImagePosRef.current ?? selectedImage?.pos;
		if (!editor || targetPos === null || targetPos === undefined) return;
		const trimmed = linkInputValue.trim();
		editor
			.chain()
			.setNodeSelection(targetPos)
			.updateAttributes("image", { href: trimmed || null })
			.run();

		setSelectedImage((prev) =>
			prev ? { ...prev, href: trimmed || null } : null,
		);
		setIsLinkOpen(false);
		toast.success(trimmed ? "Link updated" : "Link removed");
	};

	const handleRemoveLink = () => {
		const targetPos = targetImagePosRef.current ?? selectedImage?.pos;
		if (!editor || targetPos === null || targetPos === undefined) return;
		editor
			.chain()
			.setNodeSelection(targetPos)
			.updateAttributes("image", { href: null })
			.run();

		setSelectedImage((prev) => (prev ? { ...prev, href: null } : null));
		setLinkInputValue("");
		setIsLinkOpen(false);
		toast.success("Link removed");
	};

	// Handle Drag-to-Resize on 4 Handles
	const handlePointerDown = (
		e: React.PointerEvent<HTMLDivElement>,
		direction: ResizeDirection,
	) => {
		e.preventDefault();
		e.stopPropagation();

		const img = activeImgRef.current;
		if (!img || !editor || !selectedImage || !rect) return;

		const targetPos = targetImagePosRef.current ?? selectedImage.pos;
		targetImagePosRef.current = targetPos;

		isDraggingRef.current = true;
		const startX = e.clientX;
		const startY = e.clientY;
		const startWidth = rect.width;
		const startHeight = rect.height;
		const alignment = selectedImage.alignment || "center";

		let currentWidth = startWidth;
		let currentHeight: number | "auto" = "auto";

		// Update cursor style
		const prevCursor = document.body.style.cursor;
		const prevUserSelect = document.body.style.userSelect;
		document.body.style.cursor =
			direction === "left" || direction === "right" ? "ew-resize" : "ns-resize";
		document.body.style.userSelect = "none";

		const handlePointerMove = (moveEvent: PointerEvent) => {
			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;

			if (direction === "right") {
				if (alignment === "center") {
					currentWidth = Math.max(
						40,
						Math.min(1200, Math.round(startWidth + deltaX * 2)),
					);
				} else {
					currentWidth = Math.max(
						40,
						Math.min(1200, Math.round(startWidth + deltaX)),
					);
				}
				img.style.width = `${currentWidth}px`;
				img.style.maxWidth = "100%";
				img.style.height = "auto";
			} else if (direction === "left") {
				if (alignment === "center") {
					currentWidth = Math.max(
						40,
						Math.min(1200, Math.round(startWidth - deltaX * 2)),
					);
				} else {
					currentWidth = Math.max(
						40,
						Math.min(1200, Math.round(startWidth - deltaX)),
					);
				}
				img.style.width = `${currentWidth}px`;
				img.style.maxWidth = "100%";
				img.style.height = "auto";
			} else if (direction === "bottom") {
				const newHeight = Math.max(20, Math.round(startHeight + deltaY));
				currentHeight = newHeight;
				img.style.height = `${newHeight}px`;
			} else if (direction === "top") {
				const newHeight = Math.max(20, Math.round(startHeight - deltaY));
				currentHeight = newHeight;
				img.style.height = `${newHeight}px`;
			}

			// Synchronize overlay rect
			const container =
				img.closest(".overflow-y-auto") ||
				img.closest(".tiptap")?.parentElement ||
				editor.view.dom.parentElement;

			if (container) {
				const containerRect = container.getBoundingClientRect();
				const imgRect = img.getBoundingClientRect();
				setRect({
					top: imgRect.top - containerRect.top + container.scrollTop,
					left: imgRect.left - containerRect.left + container.scrollLeft,
					width: imgRect.width,
					height: imgRect.height,
				});
			}
		};

		const handlePointerUp = () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			document.body.style.cursor = prevCursor;
			document.body.style.userSelect = prevUserSelect;
			isDraggingRef.current = false;

			const resolvedPos = targetImagePosRef.current ?? selectedImage?.pos;
			if (!editor || resolvedPos === null || resolvedPos === undefined) return;

			const targetNode = editor.state.doc.nodeAt(resolvedPos);
			if (!targetNode) return;

			const currentStyle = (targetNode.attrs.style as string) || "";
			const nextWidth = Math.round(currentWidth);
			let nextStyle = currentStyle;
			nextStyle = setInlineCssDeclaration(nextStyle, "width", `${nextWidth}px`);

			// Commit dimensions to TipTap node (both HTML attributes AND inline style)
			const updateAttrs: Record<string, string | number> = {
				width: nextWidth,
			};

			if (currentHeight !== "auto") {
				const nextHeight = Math.round(currentHeight);
				updateAttrs.height = nextHeight;
				nextStyle = setInlineCssDeclaration(
					nextStyle,
					"height",
					`${nextHeight}px`,
				);
			} else if (direction === "left" || direction === "right") {
				// Horizontal resize: maintain aspect ratio
				updateAttrs.height = "auto";
				nextStyle = setInlineCssDeclaration(nextStyle, "height", "auto");
			}

			// Ensure max-width doesn't constrain the new width
			const maxWidthMatch = nextStyle.match(/max-width\s*:\s*(\d+)px/i);
			if (maxWidthMatch && Number(maxWidthMatch[1]) < nextWidth) {
				nextStyle = setInlineCssDeclaration(nextStyle, "maxWidth", "100%");
			}

			updateAttrs.style = nextStyle;

			editor
				.chain()
				.focus()
				.setNodeSelection(resolvedPos)
				.updateAttributes("image", updateAttrs)
				.run();

			// Directly sync overlay rect to final element dimensions without delay
			if (img) {
				const container =
					img.closest(".overflow-y-auto") ||
					img.closest(".tiptap")?.parentElement ||
					editor.view.dom.parentElement;

				if (container) {
					const containerRect = container.getBoundingClientRect();
					const imgRect = img.getBoundingClientRect();
					setRect({
						top: imgRect.top - containerRect.top + container.scrollTop,
						left: imgRect.left - containerRect.left + container.scrollLeft,
						width: imgRect.width,
						height: imgRect.height,
					});
				}
			}
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	};

	if (!selectedImage || !rect) return null;

	return (
		<div
			className="pointer-events-none absolute z-30 transition-none"
			style={{
				top: `${rect.top}px`,
				left: `${rect.left}px`,
				width: `${rect.width}px`,
				height: `${rect.height}px`,
			}}
		>
			{/* Blue selection border */}
			<div className="pointer-events-none absolute inset-0 border-2 border-[#3b82f6]" />

			{/* 4 Capsule / Pill Resize Handles */}
			{/* Top handle */}
			<div
				title="Resize image top"
				className="pointer-events-auto absolute -top-1 left-1/2 h-2 w-8 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize rounded-full border-[1.5px] border-white bg-[#3b82f6] shadow-sm transition-transform hover:scale-110 active:scale-110"
				onPointerDown={(e) => handlePointerDown(e, "top")}
			/>

			{/* Bottom handle */}
			<div
				title="Resize image bottom"
				className="pointer-events-auto absolute -bottom-1 left-1/2 h-2 w-8 -translate-x-1/2 translate-y-1/2 cursor-ns-resize rounded-full border-[1.5px] border-white bg-[#3b82f6] shadow-sm transition-transform hover:scale-110 active:scale-110"
				onPointerDown={(e) => handlePointerDown(e, "bottom")}
			/>

			{/* Left handle */}
			<div
				title="Resize image left"
				className="pointer-events-auto absolute top-1/2 -left-1 h-8 w-2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-[1.5px] border-white bg-[#3b82f6] shadow-sm transition-transform hover:scale-110 active:scale-110"
				onPointerDown={(e) => handlePointerDown(e, "left")}
			/>

			{/* Right handle */}
			<div
				title="Resize image right"
				className="pointer-events-auto absolute top-1/2 -right-1 h-8 w-2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-[1.5px] border-white bg-[#3b82f6] shadow-sm transition-transform hover:scale-110 active:scale-110"
				onPointerDown={(e) => handlePointerDown(e, "right")}
			/>

			{/* Floating Bottom Dark Pill Toolbar */}
			<div
				onMouseDown={(e) => e.preventDefault()}
				className="fade-in zoom-in-95 pointer-events-auto absolute top-[calc(100%+12px)] left-1/2 z-40 flex -translate-x-1/2 animate-in items-center gap-1 rounded-full border border-white/15 bg-[#121417] px-2 py-1 text-white shadow-2xl duration-150"
			>
				{/* Hidden file input for system image picker */}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={handleFileSelect}
				/>

				{/* Replace Image Round Rotation Button */}
				<button
					type="button"
					title="Replace image from computer"
					aria-label="Replace image from computer"
					disabled={isUploading}
					onMouseDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onClick={() => {
						if (selectedImage) {
							targetImagePosRef.current = selectedImage.pos;
						}
						fileInputRef.current?.click();
					}}
					className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-50"
				>
					{isUploading ? (
						<Loader2 className="h-4 w-4 animate-spin text-blue-400" />
					) : (
						<RefreshCw className="h-3.5 w-3.5" />
					)}
				</button>

				{/* Link Button */}
				<button
					type="button"
					title={selectedImage.href ? "Edit link" : "Add link"}
					aria-label="Add or edit link"
					onMouseDown={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					onClick={() => setIsLinkOpen((v) => !v)}
					className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
						selectedImage.href
							? "bg-blue-600/30 text-blue-400 hover:bg-blue-600/50 hover:text-white"
							: "text-zinc-300 hover:bg-white/15 hover:text-white"
					} ${isLinkOpen ? "bg-white/20 text-white" : ""}`}
				>
					<LinkIcon className="h-3.5 w-3.5" />
				</button>
			</div>

			{/* Floating Link Popover */}
			{isLinkOpen && (
				<div
					onMouseDown={(e) => e.stopPropagation()}
					className="fade-in slide-in-from-top-1 pointer-events-auto absolute top-[calc(100%+52px)] left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-1.5 rounded-xl border border-white/15 bg-[#121417] p-1.5 text-white shadow-2xl duration-150"
					style={{ minWidth: "280px" }}
				>
					<input
						ref={linkInputRef}
						type="url"
						value={linkInputValue}
						onChange={(e) => setLinkInputValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleApplyLink();
							} else if (e.key === "Escape") {
								setIsLinkOpen(false);
							}
						}}
						placeholder="https://example.com"
						className="flex-1 rounded-lg bg-white/10 px-2.5 py-1 text-white text-xs placeholder-zinc-400 outline-none focus:bg-white/15 focus:ring-1 focus:ring-blue-500"
					/>
					<button
						type="button"
						title="Apply link"
						aria-label="Apply link"
						onClick={handleApplyLink}
						className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-500"
					>
						<Check className="h-3.5 w-3.5" />
					</button>

					{selectedImage.href && (
						<>
							<a
								href={selectedImage.href}
								target="_blank"
								rel="noopener noreferrer"
								title="Open link in new tab"
								className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-white/15 hover:text-white"
							>
								<ExternalLink className="h-3.5 w-3.5" />
							</a>
							<button
								type="button"
								title="Remove link"
								aria-label="Remove link"
								onClick={handleRemoveLink}
								className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
							>
								<Unlink className="h-3.5 w-3.5" />
							</button>
						</>
					)}
				</div>
			)}
		</div>
	);
}
