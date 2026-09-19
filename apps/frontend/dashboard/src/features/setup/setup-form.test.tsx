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

vi.mock("@reloop/ui/spinner", () => ({ default: () => null }));

vi.mock("./setup-api", () => ({
	completeSetup: vi.fn(),
	SetupRequestError: class SetupRequestError extends Error {},
}));

describe("SetupForm signup warning", () => {
	test("warns that anyone reaching the URL can register once sign-ups are allowed", () => {
		render(<SetupForm step={2} direction={1} onStepChange={vi.fn()} />);

		const toggle = screen.getByRole("switch", {
			name: /allow public sign-ups/i,
		});
		expect(screen.queryByRole("status")).toBeNull();

		fireEvent.click(toggle);

		expect(screen.getByRole("status").textContent).toContain(
			"anyone who can reach this URL can create an account",
		);

		fireEvent.click(toggle);

		expect(screen.queryByRole("status")).toBeNull();
	});

	test("only advances once the current step is valid", () => {
		const onStepChange = vi.fn();
		render(<SetupForm step={0} direction={1} onStepChange={onStepChange} />);

		const next = screen.getByRole("button", { name: "Continue" });
		fireEvent.submit(next.closest("form") as HTMLFormElement);
		expect(onStepChange).not.toHaveBeenCalled();

		fireEvent.change(screen.getByLabelText("Setup key"), {
			target: { value: "key" },
		});
		fireEvent.submit(next.closest("form") as HTMLFormElement);
		expect(onStepChange).toHaveBeenCalledWith(1);
	});
});
