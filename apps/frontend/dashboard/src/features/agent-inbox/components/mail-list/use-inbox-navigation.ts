import { atom, useAtom } from "jotai";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useInboxMail } from "./use-inbox-mail";

export const focusedIndexAtom = atom<number | null>(null);

export interface UseInboxNavigationProps {
	items: { id: string }[];
	containerRef: React.RefObject<HTMLDivElement | null>;
	onNavigate: (threadId: string | null) => void;
	onMarkRead?: (id: string) => void;
	isCommandPaletteOpen?: boolean;
}

export function useInboxNavigation({
	items,
	containerRef,
	onNavigate,
	onMarkRead,
	isCommandPaletteOpen = false,
}: UseInboxNavigationProps) {
	const [, setMail] = useInboxMail();
	const [focusedIndex, setFocusedIndex] = useAtom(focusedIndexAtom);
	const [threadId] = useQueryState("threadId", parseAsString);
	const itemsRef = useRef(items);
	itemsRef.current = items;
	const onNavigateRef = useRef(onNavigate);
	onNavigateRef.current = onNavigate;

	const hoveredMailRef = useRef<string | null>(null);
	const keyboardActiveRef = useRef(false);

	const getThreadElement = useCallback(
		(index: number | null) => {
			if (index === null || !containerRef.current) return null;
			return containerRef.current.querySelector(
				`[data-thread-id="${itemsRef.current[index]?.id}"]`,
			) as HTMLElement | null;
		},
		[containerRef],
	);

	const scrollIntoView = useCallback(
		(index: number, behavior: ScrollBehavior = "smooth") => {
			const threadElement = getThreadElement(index);
			if (!threadElement || !containerRef.current) return;

			const container = containerRef.current;
			const containerRect = container.getBoundingClientRect();
			const threadRect = threadElement.getBoundingClientRect();

			if (
				threadRect.top < containerRect.top ||
				threadRect.bottom > containerRect.bottom
			) {
				threadElement.scrollIntoView({ block: "nearest", behavior });
			}
		},
		[containerRef, getThreadElement],
	);

	const navigateToThread = useCallback(
		(index: number) => {
			if (index === null || !itemsRef.current[index]) return;
			const message = itemsRef.current[index];
			if (message.id) {
				onNavigateRef.current(message.id);
				onMarkRead?.(message.id);
			}
			setMail((prev) => ({ ...prev, bulkSelected: [] }));
		},
		[setMail, onMarkRead],
	);

	const moveFocus = useCallback(
		(direction: "up" | "down") => {
			keyboardActiveRef.current = true;

			setFocusedIndex((prevIndex) => {
				let newIndex: number;
				if (prevIndex === null) {
					newIndex = direction === "up" ? itemsRef.current.length - 1 : 0;
				} else {
					newIndex =
						direction === "up"
							? Math.max(0, prevIndex - 1)
							: Math.min(itemsRef.current.length - 1, prevIndex + 1);
				}

				if (newIndex === prevIndex && prevIndex !== null) return prevIndex;

				scrollIntoView(newIndex, "smooth");
				navigateToThread(newIndex);
				return newIndex;
			});
		},
		[setFocusedIndex, scrollIntoView, navigateToThread],
	);

	const handleArrowUp = useCallback(() => moveFocus("up"), [moveFocus]);
	const handleArrowDown = useCallback(() => moveFocus("down"), [moveFocus]);

	const handleEnter = useCallback(() => {
		if (focusedIndex === null) return;
		const message = itemsRef.current[focusedIndex];
		if (message) onNavigateRef.current(message.id);
	}, [focusedIndex]);

	const handleEscape = useCallback(() => {
		setFocusedIndex(null);
		onNavigateRef.current(null);
		keyboardActiveRef.current = false;
		setMail((prev) => ({ ...prev, bulkSelected: [] }));
	}, [setFocusedIndex, setMail]);

	const handleToggleBulk = useCallback(() => {
		if (focusedIndex === null) return;
		const item = itemsRef.current[focusedIndex];
		if (!item) return;
		setMail((prev) => {
			const isSelected = prev.bulkSelected.includes(item.id);
			return {
				...prev,
				bulkSelected: isSelected
					? prev.bulkSelected.filter((x) => x !== item.id)
					: [...prev.bulkSelected, item.id],
			};
		});
	}, [focusedIndex, setMail]);

	const enabled = !isCommandPaletteOpen && !threadId;

	useHotkeys("ArrowUp", handleArrowUp, { preventDefault: true, enabled });
	useHotkeys("ArrowDown", handleArrowDown, { preventDefault: true, enabled });
	useHotkeys("j", handleArrowDown, { enabled });
	useHotkeys("k", handleArrowUp, { enabled });
	useHotkeys("Enter", handleEnter, { preventDefault: true, enabled });
	useHotkeys("Escape", handleEscape, { preventDefault: true });
	useHotkeys("x", handleToggleBulk, { enabled });

	const handleMouseEnter = useCallback((id: string) => {
		hoveredMailRef.current = id;
		if (keyboardActiveRef.current) {
			keyboardActiveRef.current = false;
		}
	}, []);

	const resetNavigation = useCallback(() => {
		setFocusedIndex(null);
		onNavigateRef.current(null);
		keyboardActiveRef.current = false;
	}, [setFocusedIndex]);

	useEffect(() => {
		if (isCommandPaletteOpen) {
			keyboardActiveRef.current = false;
		}
	}, [isCommandPaletteOpen]);

	return {
		focusedIndex,
		handleMouseEnter,
		resetNavigation,
	};
}
