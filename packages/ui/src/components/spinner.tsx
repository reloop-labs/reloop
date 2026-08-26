import React from "react";
import { LoadingDot } from "./dotmatrix/loading-dot";

const Spinner = ({
	size = 20,
	color,
	className,
}: {
	size?: number;
	color?: string;
	className?: string;
}) => {
	const dotSize = Math.max(1.8, Math.round(size * 0.125 * 10) / 10);

	return (
		<LoadingDot
			size={size}
			dotSize={dotSize}
			color={color}
			className={className}
		/>
	);
};

export default Spinner;
export { Spinner, LoadingDot };
