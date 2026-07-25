// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDotMatrixPhases } from "./dotmatrix-hooks";

describe("useDotMatrixPhases cleanup", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("clears scheduled hover work when its owner unmounts", () => {
		vi.useFakeTimers();
		const { result, unmount } = renderHook(() =>
			useDotMatrixPhases({ hoverAnimated: true }),
		);

		act(() => {
			result.current.onMouseEnter();
		});
		expect(vi.getTimerCount()).toBe(1);

		unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
