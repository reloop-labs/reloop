// Global helpers to protect access to browser globals in a way that is safer for different targets
// like DOM, SSR, Web workers etc.

const win: (Window & typeof globalThis) | undefined =
	typeof window !== "undefined" ? window : undefined;

export const global: typeof globalThis | undefined =
	typeof globalThis !== "undefined" ? globalThis : win;

export const navigator = global?.navigator;
export const document = global?.document;
export const location = global?.location;
export const userAgent = navigator?.userAgent;
