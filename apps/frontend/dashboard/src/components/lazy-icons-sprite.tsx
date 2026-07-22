import { useEffect, useState, type ComponentType } from "react";

/**
 * Dynamically loads the shared `@reloop/ui` icon sprite (~300KB of SVG symbols).
 *
 * Eagerly importing `IconsSprite` in the root route pulled the entire sprite
 * into the critical JS graph (and co-bundled it with home). This module:
 * 1. Code-splits the sprite into its own async chunk
 * 2. Prefetches the chunk as soon as this module evaluates on the client
 * 3. Injects the sprite into the DOM only after mount (post-hydration)
 *
 * Icons may be blank for a brief moment on cold load until the chunk arrives.
 *
 * Important: first client render must match SSR (null). Never seed useState from
 * a module-level cache that may resolve before hydration — that caused:
 * "Hydration failed because the server rendered HTML didn't match the client".
 */
type SpriteComponent = ComponentType;

const loadSprite = (): Promise<SpriteComponent> =>
	import("@reloop/ui/icons-sprite").then((m) => m.IconsSprite);

let cached: SpriteComponent | null = null;
let pending: Promise<SpriteComponent> | null = null;

function ensureSprite(): Promise<SpriteComponent> {
	if (cached) return Promise.resolve(cached);
	if (!pending) {
		pending = loadSprite().then((C) => {
			cached = C;
			return C;
		});
	}
	return pending;
}

// Prefetch chunk early on the client (does not affect first paint HTML).
if (typeof window !== "undefined") {
	void ensureSprite();
}

export function LazyIconsSprite() {
	// Always start null so server HTML === first client HTML.
	const [Sprite, setSprite] = useState<SpriteComponent | null>(null);

	useEffect(() => {
		let cancelled = false;
		void ensureSprite().then((C) => {
			if (!cancelled) setSprite(() => C);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	if (!Sprite) return null;
	return <Sprite />;
}
