export function TransactionalEmailsAtmosphere() {
	const fx = {
		glow: "linear-gradient(to top, rgba(249, 115, 22, 0.28) 0%, rgba(249, 115, 22, 0.08) 50%, transparent 85%)",
		line: "rgba(249, 115, 22, 0.16)",
	};
	const lineMask = "linear-gradient(to top, black 0%, rgba(0, 0, 0, 0.4) 100%)";

	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 z-0">
			<div className="absolute inset-0" style={{ backgroundImage: fx.glow }} />
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent 3px, ${fx.line} 3px, ${fx.line} 3.55px)`,
					maskImage: lineMask,
					WebkitMaskImage: lineMask,
				}}
			/>
		</div>
	);
}
