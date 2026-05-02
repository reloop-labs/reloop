import { Inspector } from "@react-email/editor/ui";
import * as DividerPrimitive from "@reloop/ui/divider";
import { ColorRow } from "./color-row";
import { MarkButton } from "./mark-button";
import { NumInput } from "./num-input";
import { PropRow } from "./prop-row";
import { SectionHeader } from "./section-header";

/* ------------------------------------------------------------------ */
/* Text panel                                                           */
/* ------------------------------------------------------------------ */
export function TextPanel() {
	return (
		<Inspector.Text>
			{({
				marks,
				toggleMark,
				alignment,
				setAlignment,
				linkColor,
				setLinkColor,
				isLinkActive,
				getStyle,
				setStyle,
			}) => (
				<div>
					<SectionHeader label="Text" />
					<div className="pb-3">
						{/* ── Color ── */}
						<ColorRow
							label="Color"
							value={String(getStyle("color") ?? "")}
							onChange={(v) => setStyle("color", v)}
						/>

						{/* ── Font size ── */}
						<PropRow label="Font size">
							<NumInput
								value={getStyle("fontSize")}
								onChange={(v) => setStyle("fontSize", v as number)}
								unit="px"
							/>
						</PropRow>

						{/* ── Line height ── */}
						<PropRow label="Line height">
							<NumInput
								value={getStyle("lineHeight")}
								onChange={(v) => setStyle("lineHeight", v as number)}
								unit="%"
							/>
						</PropRow>

						{/* ── Letter spacing ── */}
						<PropRow label="Letter spacing">
							<NumInput
								value={getStyle("letterSpacing")}
								onChange={(v) => setStyle("letterSpacing", v as number)}
								unit="px"
							/>
						</PropRow>

						{/* ── Format marks row ── */}
						<div className="mt-1 flex gap-1">
							{[
								{ label: "B", mark: "bold", cls: "font-bold" },
								{ label: "I", mark: "italic", cls: "italic" },
								{ label: "U", mark: "underline", cls: "underline" },
								{ label: "S", mark: "strike", cls: "line-through" },
							].map(({ label, mark, cls }) => (
								<MarkButton
									key={mark}
									label={label}
									active={marks[mark] ?? false}
									onClick={() => toggleMark(mark)}
									className={cls}
								/>
							))}
						</div>

						{/* ── Alignment rows ── */}
						<div className="mt-1 flex gap-1">
							{(["left", "center", "right"] as const).map((a) => (
								<button
									key={a}
									type="button"
									onClick={() => setAlignment(a)}
									className={`flex h-8 flex-1 items-center justify-center rounded-lg border text-xs transition-colors ${
										alignment === a
											? "border-stroke-soft-200 bg-bg-weak-50 text-text-strong-950 shadow-regular-xs"
											: "border-transparent bg-transparent text-text-sub-600 hover:bg-bg-weak-50"
									}`}
								>
									{/* align icon */}
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
									>
										{a === "left" && (
											<>
												<path d="M3 6h18M3 12h12M3 18h15" />
											</>
										)}
										{a === "center" && (
											<>
												<path d="M3 6h18M6 12h12M4.5 18h15" />
											</>
										)}
										{a === "right" && (
											<>
												<path d="M3 6h18M9 12h12M6 18h15" />
											</>
										)}
									</svg>
								</button>
							))}
						</div>

						{/* ── Link colour ── */}
						{isLinkActive && (
							<ColorRow
								label="Link color"
								value={linkColor}
								onChange={setLinkColor}
							/>
						)}
					</div>
					<DividerPrimitive.Root variant="line" />
				</div>
			)}
		</Inspector.Text>
	);
}
