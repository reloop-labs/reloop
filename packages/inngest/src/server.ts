import { serve as serveBun } from "inngest/bun";
import { inngest } from "./client";

export function createBunHandler(
	functions: Parameters<typeof serveBun>[0]["functions"],
) {
	return serveBun({
		client: inngest,
		functions,
	});
}

export { serveBun };
