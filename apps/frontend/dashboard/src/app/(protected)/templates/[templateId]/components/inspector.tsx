import { Inspector } from "@react-email/editor/ui";

export const EmailInspector = () => {
	return (
		<aside className="flex w-72 shrink-0 flex-col gap-3 overflow-y-auto p-3 text-xs">
			<aside className="flex w-60 shrink-0 flex-col gap-3 overflow-y-auto p-4 text-xs">
				<Inspector.Root>
					<Inspector.Document>
						{({ findStyleValue, setGlobalStyle }) => (
							<fieldset className="m-0 rounded p-2">
								<legend className="px-1 font-bold text-xs">Document</legend>
								<Row label="Background">
									<ColorPicker
										value={String(
											findStyleValue("body", "backgroundColor") ?? "",
										)}
										onChange={(v) =>
											setGlobalStyle("body", "backgroundColor", v)
										}
									/>
								</Row>
								<Row label="Container width">
									<NumberField
										value={findStyleValue("container", "width")}
										onChange={(v) => setGlobalStyle("container", "width", v)}
										unit="px"
									/>
								</Row>
								<Row label="Container radius">
									<NumberField
										value={findStyleValue("container", "borderRadius")}
										onChange={(v) =>
											setGlobalStyle("container", "borderRadius", v)
										}
										unit="px"
									/>
								</Row>
							</fieldset>
						)}
					</Inspector.Document>

					<Inspector.Node>
						{({ nodeType, getStyle, setStyle, getAttr, setAttr }) => (
							<fieldset className="m-0 rounded border border-(--re-border) p-2">
								<legend className="px-1 font-bold text-xs">{nodeType}</legend>
								<Row label="Background">
									<ColorPicker
										value={String(getStyle("backgroundColor") ?? "")}
										onChange={(v) => setStyle("backgroundColor", v)}
									/>
								</Row>
								<Row label="Padding">
									<NumberField
										value={getStyle("paddingTop")}
										onChange={(v) => setStyle("paddingTop", v)}
										unit="px"
									/>
								</Row>
								{nodeType === "image" && (
									<>
										<Row label="Width">
											<NumberField
												value={getAttr("width") as number}
												onChange={(v) => setAttr("width", v)}
												unit="px"
											/>
										</Row>
										<Row label="Alt">
											<input
												type="text"
												value={String(getAttr("alt") ?? "")}
												onChange={(e) => setAttr("alt", e.target.value)}
												className="w-full rounded border border-(--re-border) bg-transparent px-1.5 py-1 text-xs"
											/>
										</Row>
									</>
								)}
								{nodeType === "button" && (
									<Row label="Link">
										<input
											type="text"
											value={String(getAttr("href") ?? "")}
											onChange={(e) => setAttr("href", e.target.value)}
											className="w-full rounded border border-(--re-border) bg-transparent px-1.5 py-1 text-xs"
										/>
									</Row>
								)}
							</fieldset>
						)}
					</Inspector.Node>

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
							<fieldset className="m-0 rounded border border-(--re-border) p-2">
								<legend className="px-1 font-bold text-xs">Text</legend>
								<Row label="Format">
									<span className="flex gap-0.5">
										<MarkButton
											label="B"
											active={marks.bold}
											onClick={() => toggleMark("bold")}
											className="font-bold"
										/>
										<MarkButton
											label="I"
											active={marks.italic}
											onClick={() => toggleMark("italic")}
											className="italic"
										/>
										<MarkButton
											label="U"
											active={marks.underline}
											onClick={() => toggleMark("underline")}
											className="underline"
										/>
										<MarkButton
											label="S"
											active={marks.strike}
											onClick={() => toggleMark("strike")}
											className="line-through"
										/>
									</span>
								</Row>
								<Row label="Align">
									<span className="flex gap-0.5">
										{(["left", "center", "right"] as const).map((a) => (
											<MarkButton
												key={a}
												label={a[0].toUpperCase()}
												active={alignment === a}
												onClick={() => setAlignment(a)}
											/>
										))}
									</span>
								</Row>
								<Row label="Color">
									<ColorPicker
										value={String(getStyle("color") ?? "")}
										onChange={(v) => setStyle("color", v)}
									/>
								</Row>
								<Row label="Size">
									<NumberField
										value={getStyle("fontSize")}
										onChange={(v) => setStyle("fontSize", v)}
										unit="px"
									/>
								</Row>
								{isLinkActive && (
									<Row label="Link color">
										<ColorPicker value={linkColor} onChange={setLinkColor} />
									</Row>
								)}
							</fieldset>
						)}
					</Inspector.Text>
				</Inspector.Root>
			</aside>
		</aside>
	);
};

function Row({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mt-1.5 flex items-center justify-between gap-2 first:mt-0">
			<span className="shrink-0 text-(--re-text-muted)">{label}</span>
			{children}
		</div>
	);
}

function ColorPicker({
	value,
	onChange,
}: {
	value: string;
	onChange: (v: string) => void;
}) {
	const normalized = normalizeHex(value);
	return (
		<span className="flex items-center gap-1">
			<input
				type="color"
				value={normalized}
				onChange={(e) => onChange(e.target.value)}
				className="h-5 w-5 cursor-pointer border-0 p-0"
			/>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-16 rounded border border-(--re-border) bg-transparent px-1 py-0.5 text-xs"
			/>
		</span>
	);
}

function NumberField({
	value,
	onChange,
	unit,
}: {
	value: string | number | undefined;
	onChange: (v: number | "") => void;
	unit?: string;
}) {
	return (
		<span className="flex items-center gap-1">
			<input
				type="number"
				value={value ?? ""}
				onChange={(e) => {
					const raw = e.target.value;
					onChange(raw === "" ? "" : Number.parseFloat(raw));
				}}
				className="w-14 rounded border border-(--re-border) bg-transparent px-1 py-0.5 text-xs"
			/>
			{unit && <span className="text-(--re-text-muted)">{unit}</span>}
		</span>
	);
}

function MarkButton({
	label,
	active,
	onClick,
	className = "",
}: {
	label: string;
	active: boolean;
	onClick: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`h-6 w-6 cursor-pointer rounded border text-xs ${
				active
					? "border-(--re-text) bg-(--re-text) text-(--re-bg)"
					: "border-(--re-border) bg-transparent text-(--re-text)"
			} ${className}`}
		>
			{label}
		</button>
	);
}

function normalizeHex(value: string): string {
	if (!value) return "#000000";
	const v = value.trim();
	const shortHex = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(v);
	if (shortHex) {
		return `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`;
	}
	if (/^#[0-9a-f]{6}$/i.test(v)) return v;
	return "#000000";
}
