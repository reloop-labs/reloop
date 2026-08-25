// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmailPillsInput } from "./email-pills-input";

vi.mock("#/features/dashboard/keyboard-shortcuts-reveal", () => ({
	ActionKbd: ({ children }: { children: string }) => <kbd>{children}</kbd>,
}));

describe("EmailPillsInput suggestions", () => {
	it("keeps the portaled list clickable over a Radix dialog body lock", () => {
		const onChange = vi.fn();
		render(
			<EmailPillsInput
				emails={[]}
				onChange={onChange}
				suggestions={["hellow <hellow@local.reloop.sh>"]}
			/>,
		);

		const input = screen.getByRole("combobox");
		fireEvent.change(input, { target: { value: "he" } });

		document.body.style.pointerEvents = "none";
		const listbox = screen.getByRole("listbox", {
			name: "Recipient suggestions",
		});
		expect(listbox.className).toContain("pointer-events-auto");
		expect(listbox.style.pointerEvents).toBe("auto");
		expect(getComputedStyle(listbox).pointerEvents).toBe("auto");

		const option = screen.getByRole("option", { name: /hellow/i });
		fireEvent.pointerDown(option);

		expect(onChange).toHaveBeenCalledWith(["hellow <hellow@local.reloop.sh>"]);
	});
});
