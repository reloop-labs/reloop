"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useReducedMotion } from "framer-motion";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

type PlaybackContextValue = {
	paused: boolean;
	hasStarted: boolean;
	start: () => void;
	pause: () => void;
	resume: () => void;
	toggle: () => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function HeroDemoPlaybackProvider({
	children,
	started = false,
}: {
	children: ReactNode;
	started?: boolean;
}) {
	const [hasStarted, setHasStarted] = useState(started);
	const [paused, setPaused] = useState(!started);

	useEffect(() => {
		if (started) {
			setHasStarted(true);
			setPaused(false);
		}
	}, [started]);

	const start = useCallback(() => {
		setHasStarted(true);
		setPaused(false);
	}, []);

	const pause = useCallback(() => {
		setPaused(true);
	}, []);

	const resume = useCallback(() => {
		setPaused(false);
	}, []);

	const toggle = useCallback(() => {
		setPaused((current) => !current);
	}, []);

	const value = useMemo(
		() => ({ hasStarted, paused, start, pause, resume, toggle }),
		[hasStarted, paused, start, pause, resume, toggle],
	);

	return (
		<PlaybackContext.Provider value={value}>
			{children}
		</PlaybackContext.Provider>
	);
}

export function useHeroDemoPlayback() {
	return useContext(PlaybackContext);
}

export function HeroDemoPlaybackButton() {
	const playback = useHeroDemoPlayback();
	const reduceMotion = useReducedMotion();
	if (!playback || reduceMotion) return null;

	const { paused, toggle } = playback;

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={paused ? "Play preview" : "Pause preview"}
			aria-pressed={paused}
			title={paused ? "Play preview" : "Pause preview"}
			className={cn(
				"inline-flex size-6 items-center justify-center rounded-md",
				"text-text-sub-600 transition-[transform,background-color,color] duration-150 ease-out",
				"hover:bg-black/[0.06] hover:text-text-strong-950",
				"active:scale-[0.97]",
				"dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white",
			)}
		>
			<span className="relative inline-grid size-3.5">
				<Icon
					name="pause"
					className={cn(
						"col-start-1 row-start-1 size-3.5 transition-[opacity,transform,filter] duration-200 ease-in-out",
						paused
							? "scale-75 opacity-0 blur-[2px]"
							: "scale-100 opacity-100 blur-0",
					)}
				/>
				<Icon
					name="play"
					className={cn(
						"col-start-1 row-start-1 size-3.5 transition-[opacity,transform,filter] duration-200 ease-in-out",
						paused
							? "scale-100 opacity-100 blur-0"
							: "scale-75 opacity-0 blur-[2px]",
					)}
				/>
			</span>
		</button>
	);
}
