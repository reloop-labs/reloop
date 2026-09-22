import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const IconsSprite = lazy(() =>
	import("@reloop/ui/icons-sprite").then((m) => ({ default: m.IconsSprite })),
);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Suspense fallback={null}>
			<IconsSprite />
		</Suspense>
		<App />
	</StrictMode>,
);
