import { useEffect, useRef } from "react";

/**
 * Tracks step depth changes for horizontal enter/exit animations.
 * Level increases → forward; decreases → back.
 */
export function useAuthStepDirection(currentLevel: number) {
	const prevLevel = useRef(currentLevel);
	const prevDirection = useRef(1);
	let direction = prevDirection.current;
	if (currentLevel !== prevLevel.current) {
		direction = currentLevel > prevLevel.current ? 1 : -1;
	}
	useEffect(() => {
		prevLevel.current = currentLevel;
		prevDirection.current = direction;
	}, [currentLevel, direction]);

	return direction;
}
