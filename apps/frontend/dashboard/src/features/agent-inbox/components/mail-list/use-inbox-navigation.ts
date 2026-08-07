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

	const openThreadAt = useCallback(
		(index: number) => {
			const message = itemsRef.current[index];
			if (!message?.id) return;
			onNavigateRef.current(message.id);
			onMarkRead?.(message.id);
			setMail((prev) => ({ ...prev, bulkSelected: [] }));
		},
		[setMail, onMarkRead],
	);

	/** List mode: move focus highlight only (Gmail-style). Detail mode: open next/prev. */
	const moveFocus = useCallback(
		(direction: "up" | "down", { open }: { open: boolean }) => {
			keyboardActiveRef.current = true;

			setFocusedIndex((prevIndex) => {
				let base = prevIndex;
				if (base === null && open && threadId) {
					const openIdx = itemsRef.current.findIndex((t) => t.id === threadId);
					if (openIdx >= 0) base = openIdx;
				}

				const newIndex =
					base === null
						? direction === "up"
							? itemsRef.current.length - 1
							: 0
						: direction === "up"
							? Math.max(0, base - 1)
							: Math.min(itemsRef.current.length - 1, base + 1);

				if (newIndex === base && base !== null) {
					if (open) openThreadAt(newIndex);
					return base;
				}

				if (!open) scrollIntoView(newIndex, "smooth");
				if (open) openThreadAt(newIndex);
				return newIndex;
			});
		},
		[setFocusedIndex, scrollIntoView, openThreadAt, threadId],
	);

	const handleArrowUp = useCallback(
		() => moveFocus("up", { open: false }),
		[moveFocus],
	);
	const handleArrowDown = useCallback(
		() => moveFocus("down", { open: false }),
		[moveFocus],
	);
	const handleNextOpen = useCallback(
		() => moveFocus("down", { open: true }),
		[moveFocus],
	);
	const handlePrevOpen = useCallback(
		() => moveFocus("up", { open: true }),
		[moveFocus],
	);

	const handleEnter = useCallback(() => {
		if (focusedIndex === null) return;
		openThreadAt(focusedIndex);
	}, [focusedIndex, openThreadAt]);

	const handleEscape = useCallback(() => {
		if (threadId) {
			onNavigateRef.current(null);
			return;
		}
		setFocusedIndex(null);
		keyboardActiveRef.current = false;
		setMail((prev) => ({ ...prev, bulkSelected: [] }));
	}, [setFocusedIndex, setMail, threadId]);

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

	const listEnabled = !isCommandPaletteOpen && !threadId;
	const detailEnabled = !isCommandPaletteOpen && !!threadId;

	// List: j/k focus only; Enter opens detail (replaces list).
	useHotkeys("ArrowUp", handleArrowUp, {
		preventDefault: true,
		enabled: listEnabled,
	});
	useHotkeys("ArrowDown", handleArrowDown, {
		preventDefault: true,
		enabled: listEnabled,
	});
	useHotkeys("j", handleArrowDown, { enabled: listEnabled });
	useHotkeys("k", handleArrowUp, { enabled: listEnabled });
	useHotkeys("Enter", handleEnter, {
		preventDefault: true,
		enabled: listEnabled,
	});
	useHotkeys("x", handleToggleBulk, { enabled: listEnabled });

	// Detail: j/k open next/prev conversation (list stays replaced).
	useHotkeys("j", handleNextOpen, { enabled: detailEnabled });
	useHotkeys("k", handlePrevOpen, { enabled: detailEnabled });
	useHotkeys("ArrowDown", handleNextOpen, {
		preventDefault: true,
		enabled: detailEnabled,
	});
	useHotkeys("ArrowUp", handlePrevOpen, {
		preventDefault: true,
		enabled: detailEnabled,
	});

	useHotkeys("Escape", handleEscape, { preventDefault: true });

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
