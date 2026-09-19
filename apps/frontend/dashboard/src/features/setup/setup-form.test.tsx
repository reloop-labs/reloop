// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { SetupForm } from "./setup-form";

beforeAll(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
});

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("@tanstack/react-query", () => ({
	useQueryClient: () => ({}),
}));

vi.mock("#/features/auth/session-query", () => ({
	clearClientAuthState: vi.fn(),
}));

vi.mock("#/lib/rate-limit-toast", () => ({
	toastApiError: vi.fn(),
}));

vi.mock("./setup-api", () => ({
	completeSetup: vi.fn(),
	SetupRequestError: class SetupRequestError extends Error {},
}));

describe("SetupForm signup warning", () => {
	test("warns that anyone reaching the URL can register once sign-ups stay open", () => {
		render(<SetupForm />);

		const checkbox = screen.getByRole("checkbox", {
			name: /turn off public sign-ups/i,
		});
		expect(screen.queryByRole("status")).toBeNull();

		fireEvent.click(checkbox);

		expect(screen.getByRole("status").textContent).toContain(
			"anyone who can reach this URL can create an account",
		);

		fireEvent.click(checkbox);

		expect(screen.queryByRole("status")).toBeNull();
	});
});
