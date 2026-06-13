"use client";

import type { SVGProps } from "react";
import type { SimpleIcon as SimpleIconType } from "simple-icons";
import {
	siCloudflare,
	siCoolify,
	siCursor,
	siDocker,
	siDotnet,
	siElixir,
	siExpress,
	siGo,
	siLaravel,
	siNetlify,
	siNextdotjs,
	siNodedotjs,
	siOpenjdk,
	siPhp,
	siPython,
	siRailway,
	siReadthedocs,
	siRuby,
	siRubyonrails,
	siRust,
	siVercel,
} from "simple-icons";

const Icons: Record<string, SimpleIconType> = {
	siNodedotjs,
	siNextdotjs,
	siExpress,
	siPhp,
	siLaravel,
	siPython,
	siRuby,
	siRubyonrails,
	siGo,
	siRust,
	siElixir,
	siOpenjdk,
	siDotnet,
	siCursor,
	siReadthedocs,
	siCoolify,
	siVercel,
	siRailway,
	siCloudflare,
	siNetlify,
	siDocker,
};

interface SimpleIconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
	name: string;
	size?: number | string;
	color?: string;
}

export function SimpleIcon({
	name,
	size = 24,
	color,
	...props
}: SimpleIconProps) {
	try {
		// Normalize the name to find it in the Icons object
		let iconKey = name;
		if (name.startsWith("Si")) {
			iconKey = `si${name.slice(2)}`;
		} else if (!name.startsWith("si")) {
			iconKey = `si${name.charAt(0).toUpperCase()}${name.slice(1)}`;
		}

		const icon = Icons[iconKey];

		if (!icon) {
			console.warn(`SimpleIcon: Icon "${name}" (key: ${iconKey}) not found.`);
			// Return a placeholder so we can see something
			return (
				<div
					style={{
						width: size,
						height: size,
						backgroundColor: "rgba(255,0,0,0.1)",
						border: "1px solid red",
						borderRadius: "4px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: "10px",
						color: "red",
						overflow: "hidden",
					}}
				>
					?
				</div>
			);
		}

		return (
			<svg
				role="img"
				viewBox="0 0 24 24"
				width={size}
				height={size}
				fill={color || `#${icon.hex}`}
				xmlns="http://www.w3.org/2000/svg"
				className="size-6 shrink-0"
				{...props}
			>
				<title>{icon.title}</title>
				<path d={icon.path} />
			</svg>
		);
	} catch (error) {
		console.error("SimpleIcon error:", error);
		return null;
	}
}
