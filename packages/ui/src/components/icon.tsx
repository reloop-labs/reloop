import type { SVGProps } from "react";

export type ISvgPropType = {
	name: string;
} & SVGProps<SVGSVGElement>;

export const Icon = ({ name, ...props }: ISvgPropType) => (
	<svg {...props} fill="currentColor">
		<use href={`#${name}`} />
	</svg>
);
