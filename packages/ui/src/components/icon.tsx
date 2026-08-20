import type { SVGProps } from "react";

export type IconName = string;

export type ISvgPropType = {
	name: IconName;
} & SVGProps<SVGSVGElement>;

export const Icon = ({
	name,
	viewBox = "0 0 24 24",
	fill = "currentColor",
	...props
}: ISvgPropType) => (
	<svg viewBox={viewBox} fill={fill} aria-hidden {...props}>
		<use href={`#${name}`} width="24" height="24" />
	</svg>
);
