import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LoadingDot } from "./loading-dot";

vi.mock("#/components/ui/dotm-square-1", () => ({
	DotmSquare1: () => <span data-loader="one" />,
}));
vi.mock("#/components/ui/dotm-square-3", () => ({
	DotmSquare3: () => <span data-loader="three" />,
}));
vi.mock("#/components/ui/dotm-square-11", () => ({
	DotmSquare11: () => <span data-loader="eleven" />,
}));
vi.mock("#/components/ui/dotm-square-12", () => ({
	DotmSquare12: () => <span data-loader="twelve" />,
}));

describe("LoadingDot hydration boundary", () => {
	it("does not evaluate random state while server rendering", () => {
		const random = vi.spyOn(Math, "random");

		const html = renderToString(<LoadingDot />);

		expect(html).toContain('role="status"');
		expect(random).not.toHaveBeenCalled();
		random.mockRestore();
	});
});
