let runtimeDisableSignup: boolean | null = null;

export function setRuntimeDisableSignup(value: boolean): void {
	runtimeDisableSignup = value;
}

export function getRuntimeDisableSignup(): boolean | null {
	return runtimeDisableSignup;
}
