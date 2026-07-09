"use client";

import { useTheme } from "next-themes";

interface InboxEmptyStateIconProps {
	width?: number;
	height?: number;
	className?: string;
}

const EmptyStateBase = ({
	width = 200,
	height = 200,
	className,
	isDarkTheme = true,
}: InboxEmptyStateIconProps & { isDarkTheme?: boolean }) => {
	const paintId = isDarkTheme ? "2689_12764" : "3099_2693";

	const envelopeLetterFill = isDarkTheme ? "white" : "#B0B0B0";
	const envelopeLetterOpacity = isDarkTheme ? "0.3" : "1";
	const lineColors = isDarkTheme
		? ["white", "white", "white", "white"]
		: ["#E7E7E7", "#F0F0F0", "#F6F6F6", "#FAFAFA"];
	const lineOpacities = isDarkTheme
		? ["0.1", "0.075", "0.05", "0.025"]
		: ["1", "1", "1", "1"];

	const paint0Stop0Opacity = isDarkTheme ? "0.1" : "1";
	const paint0Stop1Opacity = isDarkTheme ? "0.05" : "1";

	return (
		<svg
			width={width}
			height={height}
			viewBox="40 35 112 122"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden
		>
			{!isDarkTheme && (
				<defs>
					<filter
						id="filter0_dd_3099_2693"
						x="22.2402"
						y="17"
						width="146.548"
						height="157.455"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB"
					>
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feColorMatrix
							in="SourceAlpha"
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							result="hardAlpha"
						/>
						<feMorphology
							radius="0.5"
							operator="dilate"
							in="SourceAlpha"
							result="effect1_dropShadow_3099_2693"
						/>
						<feOffset />
						<feComposite in2="hardAlpha" operator="out" />
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0.86 0 0 0 0 0.86 0 0 0 0 0.86 0 0 0 1 0"
						/>
						<feBlend
							mode="normal"
							in2="BackgroundImageFix"
							result="effect1_dropShadow_3099_2693"
						/>
						<feColorMatrix
							in="SourceAlpha"
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							result="hardAlpha"
						/>
						<feOffset dy="1" />
						<feGaussianBlur stdDeviation="1" />
						<feComposite in2="hardAlpha" operator="out" />
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
						/>
						<feBlend
							mode="normal"
							in2="effect1_dropShadow_3099_2693"
							result="effect2_dropShadow_3099_2693"
						/>
						<feBlend
							mode="normal"
							in="SourceGraphic"
							in2="effect2_dropShadow_3099_2693"
							result="shape"
						/>
					</filter>
					<filter
						id="filter1_dd_3099_2693"
						x="14.2393"
						y="17"
						width="162.547"
						height="181.455"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB"
					>
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feColorMatrix
							in="SourceAlpha"
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							result="hardAlpha"
						/>
						<feMorphology
							radius="0.5"
							operator="dilate"
							in="SourceAlpha"
							result="effect1_dropShadow_3099_2693"
						/>
						<feOffset />
						<feComposite in2="hardAlpha" operator="out" />
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0.86 0 0 0 0 0.86 0 0 0 0 0.86 0 0 0 1 0"
						/>
						<feBlend
							mode="normal"
							in2="BackgroundImageFix"
							result="effect1_dropShadow_3099_2693"
						/>
						<feColorMatrix
							in="SourceAlpha"
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							result="hardAlpha"
						/>
						<feOffset dy="16" />
						<feGaussianBlur stdDeviation="16" />
						<feComposite in2="hardAlpha" operator="out" />
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
						/>
						<feBlend
							mode="normal"
							in2="effect1_dropShadow_3099_2693"
							result="effect2_dropShadow_3099_2693"
						/>
						<feBlend
							mode="normal"
							in="SourceGraphic"
							in2="effect2_dropShadow_3099_2693"
							result="shape"
						/>
					</filter>
				</defs>
			)}

			<g
				opacity="0.5"
				filter={!isDarkTheme ? "url(#filter0_dd_3099_2693)" : undefined}
			>
				<path
					d="M47.4356 56.7697C47.0746 52.6434 50.127 49.0056 54.2534 48.6446L127.972 42.1951C132.098 41.8341 135.736 44.8865 136.097 49.0129L143.592 134.686C143.953 138.812 140.901 142.45 136.775 142.811L63.0561 149.26C58.9297 149.621 55.292 146.569 54.931 142.442L47.4356 56.7697Z"
					fill={`url(#paint0_linear_${paintId})`}
				/>
				<path
					d="M47.4356 56.7697C47.0746 52.6434 50.127 49.0056 54.2534 48.6446L127.972 42.1951C132.098 41.8341 135.736 44.8865 136.097 49.0129L143.592 134.686C143.953 138.812 140.901 142.45 136.775 142.811L63.0561 149.26C58.9297 149.621 55.292 146.569 54.931 142.442L47.4356 56.7697Z"
					stroke={`url(#paint1_linear_${paintId})`}
					strokeLinecap="round"
				/>
			</g>

			<g filter={!isDarkTheme ? "url(#filter1_dd_3099_2693)" : undefined}>
				<g clipPath={`url(#clip0_${paintId})`}>
					<path
						d="M54.4317 48.9696C54.8167 44.5681 58.697 41.3122 63.0985 41.6972L136.817 48.1468C141.218 48.5318 144.474 52.4121 144.089 56.8136L136.594 142.486C136.209 146.888 132.328 150.144 127.927 149.759L54.2086 143.309C49.8071 142.924 46.5512 139.044 46.9363 134.642L54.4317 48.9696Z"
						fill={`url(#paint2_linear_${paintId})`}
					/>
					<g clipPath={`url(#clip1_${paintId})`}>
						<path
							d="M64.63 52.8729C63.8048 52.8007 63.0772 53.4112 63.005 54.2365L62.9359 55.0264C62.9607 55.0377 62.9851 55.0505 63.0091 55.0647L69.3042 58.8128C69.5008 58.9299 69.74 58.9508 69.9539 58.8697L76.8043 56.2717C76.8302 56.2618 76.8564 56.2535 76.8826 56.2467L76.9517 55.4567C77.0239 54.6314 76.4135 53.9038 75.5882 53.8316L64.63 52.8729Z"
							fill={envelopeLetterFill}
							fillOpacity={envelopeLetterOpacity}
						/>
						<path
							d="M76.7379 57.9011L70.4858 60.2722C69.8441 60.5156 69.1265 60.4528 68.5369 60.1017L62.7912 56.6807L62.3949 61.2098C62.3227 62.0351 62.9332 62.7627 63.7585 62.8349L74.7166 63.7936C75.5419 63.8658 76.2694 63.2553 76.3416 62.43L76.7379 57.9011Z"
							fill={envelopeLetterFill}
							fillOpacity={envelopeLetterOpacity}
						/>
					</g>
					<path
						d="M59.2855 85.2807C59.466 83.2175 61.2848 81.6913 63.348 81.8718L113.158 86.2295C115.221 86.41 116.747 88.2289 116.567 90.2921C116.386 92.3553 114.567 93.8815 112.504 93.701L62.6944 89.3432C60.6312 89.1627 59.105 87.3438 59.2855 85.2807Z"
						fill={lineColors[0]}
						fillOpacity={lineOpacities[0]}
					/>
					<path
						d="M57.9349 100.722C58.1154 98.6589 59.9343 97.1327 61.9974 97.3132L128.244 103.109C130.308 103.29 131.834 105.108 131.653 107.172C131.473 109.235 129.654 110.761 127.591 110.58L61.3438 104.785C59.2806 104.604 57.7544 102.785 57.9349 100.722Z"
						fill={lineColors[1]}
						fillOpacity={lineOpacities[1]}
					/>
					<path
						d="M56.5833 116.163C56.7638 114.1 58.5827 112.574 60.6459 112.755L120.218 117.966C122.281 118.147 123.807 119.966 123.627 122.029C123.446 124.092 121.627 125.618 119.564 125.438L59.9922 120.226C57.929 120.046 56.4028 118.227 56.5833 116.163Z"
						fill={lineColors[2]}
						fillOpacity={lineOpacities[2]}
					/>
					<path
						d="M55.2327 131.603C55.4132 129.54 57.2321 128.014 59.2953 128.194L96.6526 131.462C98.7158 131.643 100.242 133.462 100.061 135.525C99.881 137.588 98.0621 139.114 95.9989 138.934L58.6416 135.665C56.5784 135.485 55.0522 133.666 55.2327 131.603Z"
						fill={lineColors[3]}
						fillOpacity={lineOpacities[3]}
					/>
				</g>
				<path
					d="M54.9298 49.0131C55.2908 44.8868 58.9285 41.8343 63.0549 42.1953L136.773 48.6449C140.9 49.0059 143.952 52.6436 143.591 56.77L136.096 142.443C135.735 146.569 132.097 149.622 127.971 149.261L54.2522 142.811C50.1258 142.45 47.0734 138.812 47.4344 134.686L54.9298 49.0131Z"
					stroke={`url(#paint3_linear_${paintId})`}
					strokeLinecap="round"
				/>
			</g>

			<defs>
				<linearGradient
					id={`paint0_linear_${paintId}`}
					x1="91.069"
					y1="44.9217"
					x2="99.9589"
					y2="146.534"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="white" stopOpacity={paint0Stop0Opacity} />
					<stop offset="1" stopColor="white" stopOpacity={paint0Stop1Opacity} />
				</linearGradient>
				<linearGradient
					id={`paint1_linear_${paintId}`}
					x1="91.069"
					y1="44.9217"
					x2="99.9589"
					y2="146.534"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="white" stopOpacity="0.1" />
					<stop offset="1" stopColor="#323232" stopOpacity="0" />
				</linearGradient>
				<linearGradient
					id={`paint2_linear_${paintId}`}
					x1="99.9577"
					y1="44.922"
					x2="91.0678"
					y2="146.534"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="white" stopOpacity={paint0Stop0Opacity} />
					<stop offset="1" stopColor="white" stopOpacity={paint0Stop1Opacity} />
				</linearGradient>
				<linearGradient
					id={`paint3_linear_${paintId}`}
					x1="99.9577"
					y1="44.922"
					x2="91.0678"
					y2="146.534"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="white" stopOpacity="0.1" />
					<stop offset="1" stopColor="#323232" stopOpacity="0" />
				</linearGradient>
				<clipPath id={`clip0_${paintId}`}>
					<path
						d="M54.4317 48.9696C54.8167 44.5681 58.697 41.3122 63.0985 41.6972L136.817 48.1468C141.218 48.5318 144.474 52.4121 144.089 56.8136L136.594 142.486C136.209 146.888 132.328 150.144 127.927 149.759L54.2086 143.309C49.8071 142.924 46.5512 139.044 46.9363 134.642L54.4317 48.9696Z"
						fill="white"
					/>
				</clipPath>
				<clipPath id={`clip1_${paintId}`}>
					<rect
						width="16"
						height="16"
						fill="white"
						transform="translate(62.4014 49.666) rotate(5)"
					/>
				</clipPath>
			</defs>
		</svg>
	);
};

export const InboxEmptyStateIcon = ({
	width = 200,
	height = 200,
	className,
}: InboxEmptyStateIconProps) => {
	const { resolvedTheme } = useTheme();
	const isDark = resolvedTheme === "dark";

	return (
		<EmptyStateBase
			width={width}
			height={height}
			className={className}
			isDarkTheme={isDark}
		/>
	);
};
