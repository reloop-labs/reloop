import { AsyncLocalStorage } from "node:async_hooks";

const bootstrapBypass = new AsyncLocalStorage<true>();

export function runWithSetupBootstrapBypass<T>(
	operation: () => Promise<T>,
): Promise<T> {
	return bootstrapBypass.run(true, operation);
}

export function isSetupBootstrapBypassed(): boolean {
	return bootstrapBypass.getStore() === true;
}
