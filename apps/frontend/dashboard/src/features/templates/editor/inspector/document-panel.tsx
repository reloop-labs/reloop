import { Inspector } from "@react-email/editor/ui";
import { ColorRow } from "./color-row";
import { ScrubRow } from "./scrub-field";
import { SectionHeader } from "./section-header";

/* ------------------------------------------------------------------ */
/* Document panel                                                       */
/* ------------------------------------------------------------------ */
export function DocumentPanel() {
	return (
		<Inspector.Document>
			{({ findStyleValue, setGlobalStyle }) => (
				<div className="flex flex-col divide-y divide-stroke-soft-200">
					<div className="flex flex-col py-2">
						<SectionHeader label="Background" />
						<ColorRow
							label="Color"
							value={String(findStyleValue("body", "backgroundColor") ?? "")}
							onChange={(v) => setGlobalStyle("body", "backgroundColor", v)}
						/>
						<ScrubRow
							label="Padding"
							value={findStyleValue("body", "padding")}
							onChange={(v) => setGlobalStyle("body", "padding", v)}
							min={0}
							max={128}
							suffix="px"
						/>
					</div>

					<div className="flex flex-col py-2">
						<SectionHeader label="Container" />
						<ColorRow
							label="Color"
							value={String(findStyleValue("container", "backgroundColor") ?? "")}
							onChange={(v) => setGlobalStyle("container", "backgroundColor", v)}
						/>
						<ScrubRow
							label="Width"
							value={findStyleValue("container", "width")}
							onChange={(v) => setGlobalStyle("container", "width", v)}
							min={200}
							max={800}
							suffix="px"
						/>
						<ScrubRow
							label="Padding"
							value={findStyleValue("container", "padding")}
							onChange={(v) => setGlobalStyle("container", "padding", v)}
							min={0}
							max={128}
							suffix="px"
						/>
						<ScrubRow
							label="Rounded"
							value={findStyleValue("container", "borderRadius")}
							onChange={(v) => setGlobalStyle("container", "borderRadius", v)}
							min={0}
							max={64}
							suffix="px"
						/>
					</div>
				</div>
			)}
		</Inspector.Document>
	);
}
