import { describe, expect, it } from "vitest";
import { lowercaseInput } from "./lowercase-input";

describe("lowercaseInput", () => {
	it("lowercases the field value in place and keeps the caret", () => {
		const calls: [number, number][] = [];
		const input = {
			value: "steVE@apple.com",
			selectionStart: 5,
			selectionEnd: 5,
			setSelectionRange: (a: number, b: number) => calls.push([a, b]),
		} as unknown as HTMLInputElement;
		lowercaseInput(input);
		expect(input.value).toBe("steve@apple.com");
		expect(calls).toEqual([[5, 5]]);
	});

	it("leaves an already-lowercase value untouched", () => {
		let writes = 0;
		const input = {
			selectionStart: null,
			selectionEnd: null,
			setSelectionRange: () => {},
			get value() {
				return "steve@apple.com";
			},
			set value(_v: string) {
				writes++;
			},
		} as unknown as HTMLInputElement;
		lowercaseInput(input);
		expect(writes).toBe(0);
	});
});
