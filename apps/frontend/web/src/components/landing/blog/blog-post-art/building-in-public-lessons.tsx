import type { BlogPostArtProps } from "./types";

export function BuildingInPublicLessonsArt(_props: BlogPostArtProps) {
	return (
		<>
			{/* Divider vertical lines */}
			<line
				x1={36}
				y1={0}
				x2={36}
				y2={375}
				stroke="currentColor"
				strokeOpacity={0.06}
			/>
			<line
				x1={224}
				y1={0}
				x2={224}
				y2={375}
				stroke="currentColor"
				strokeOpacity={0.06}
			/>
			<line
				x1={376}
				y1={0}
				x2={376}
				y2={375}
				stroke="currentColor"
				strokeOpacity={0.06}
			/>
			<line
				x1={564}
				y1={0}
				x2={564}
				y2={375}
				stroke="currentColor"
				strokeOpacity={0.06}
			/>

			{/* PANEL 1: Decentralized graph (User & Facts/Assertions) */}
			{/* Center guidelines/rays */}
			<circle
				cx={130}
				cy={175}
				r={22}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.08}
				strokeWidth={1}
			/>
			{/* Center circle */}
			<circle
				cx={130}
				cy={175}
				r={14}
				fill="none"
				stroke="currentColor"
				className="text-primary-base dark:opacity-80"
				strokeWidth={1}
			/>
			<circle
				cx={130}
				cy={175}
				r={6}
				fill="currentColor"
				className="text-text-strong-950 dark:text-white"
				fillOpacity={0.8}
			/>

			{/* Left Connection */}
			<line
				x1={130}
				y1={175}
				x2={35}
				y2={175}
				stroke="currentColor"
				strokeOpacity={0.15}
			/>
			<rect
				x={27}
				y={167}
				width={16}
				height={16}
				rx={4}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
				strokeWidth={1}
			/>
			<rect
				x={48}
				y={166}
				width={54}
				height={18}
				rx={3}
				className="fill-bg-weak-50 dark:fill-[#111]"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeWidth={1}
			/>
			<text
				x={75}
				y={178}
				className="fill-current font-mono text-[9px] opacity-60 dark:opacity-75"
				textAnchor="middle"
			>
				assertion
			</text>

			{/* Right Connection */}
			<line
				x1={130}
				y1={175}
				x2={225}
				y2={175}
				stroke="currentColor"
				strokeOpacity={0.15}
			/>
			<rect
				x={217}
				y={167}
				width={16}
				height={16}
				rx={4}
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
				strokeWidth={1}
			/>
			<rect
				x={158}
				y={166}
				width={54}
				height={18}
				rx={3}
				className="fill-bg-weak-50 dark:fill-[#111]"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeWidth={1}
			/>
			<text
				x={185}
				y={178}
				className="fill-current font-mono text-[9px] opacity-60 dark:opacity-75"
				textAnchor="middle"
			>
				assertion
			</text>

			{/* Top Connection (Fact) */}
			<line
				x1={130}
				y1={175}
				x2={130}
				y2={80}
				stroke="currentColor"
				strokeOpacity={0.15}
			/>
			<rect
				x={122}
				y={72}
				width={16}
				height={16}
				rx={4}
				fill="none"
				stroke="currentColor"
				className="text-primary-base dark:opacity-80"
				strokeWidth={1}
			/>
			<rect
				x={112}
				y={111}
				width={36}
				height={18}
				rx={3}
				className="fill-bg-weak-50 text-primary-base dark:fill-[#111] dark:opacity-80"
				stroke="currentColor"
				strokeOpacity={0.4}
				strokeWidth={1}
			/>
			<text
				x={130}
				y={123}
				className="fill-current font-mono text-[9px] text-primary-base dark:opacity-90"
				textAnchor="middle"
			>
				fact
			</text>

			{/* Bottom Connection (Fact) */}
			{/* user label below center */}
			<rect
				x={110}
				y={206}
				width={40}
				height={18}
				rx={3}
				className="fill-bg-weak-50 dark:fill-[#111]"
				stroke="currentColor"
				strokeOpacity={0.25}
				strokeWidth={1}
			/>
			<text
				x={130}
				y={218}
				className="fill-current font-mono text-[9px] opacity-80 dark:opacity-90"
				textAnchor="middle"
			>
				user
			</text>
			<line
				x1={130}
				y1={224}
				x2={130}
				y2={310}
				stroke="currentColor"
				strokeOpacity={0.15}
			/>
			<rect
				x={122}
				y={302}
				width={16}
				height={16}
				rx={4}
				fill="none"
				stroke="currentColor"
				className="text-primary-base dark:opacity-80"
				strokeWidth={1}
			/>
			<rect
				x={112}
				y={261}
				width={36}
				height={18}
				rx={3}
				className="fill-bg-weak-50 text-primary-base dark:fill-[#111] dark:opacity-80"
				stroke="currentColor"
				strokeOpacity={0.4}
				strokeWidth={1}
			/>
			<text
				x={130}
				y={273}
				className="fill-current font-mono text-[9px] text-primary-base dark:opacity-90"
				textAnchor="middle"
			>
				fact
			</text>

			{/* PANEL 2: Isometric Platform Stack */}
			{/* Vertical guide lines at corners */}
			<line
				x1={250}
				y1={135}
				x2={250}
				y2={215}
				stroke="currentColor"
				strokeOpacity={0.12}
				strokeDasharray="2 2"
			/>
			<line
				x1={350}
				y1={135}
				x2={350}
				y2={215}
				stroke="currentColor"
				strokeOpacity={0.12}
				strokeDasharray="2 2"
			/>
			<line
				x1={300}
				y1={110}
				x2={300}
				y2={190}
				stroke="currentColor"
				strokeOpacity={0.12}
				strokeDasharray="2 2"
			/>
			<line
				x1={300}
				y1={160}
				x2={300}
				y2={240}
				stroke="currentColor"
				strokeOpacity={0.12}
				strokeDasharray="2 2"
			/>

			{/* Stack layers from bottom to top */}
			{/* Layer 5 (Bottom) */}
			<polygon
				points="300,190 350,215 300,240 250,215"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.1}
				strokeWidth={1}
			/>
			{/* Layer 4 */}
			<polygon
				points="300,170 350,195 300,220 250,195"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.15}
				strokeWidth={1}
			/>
			{/* Layer 3 */}
			<polygon
				points="300,150 350,175 300,200 250,175"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeWidth={1}
			/>
			{/* Layer 2 */}
			<polygon
				points="300,130 350,155 300,180 250,155"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
				strokeWidth={1}
			/>
			{/* Layer 1 (Top / Orange Active) */}
			<polygon
				points="300,110 350,135 300,160 250,135"
				fill="currentColor"
				fillOpacity={0.06}
				stroke="currentColor"
				className="text-primary-base dark:opacity-90"
				strokeWidth={1.5}
			/>

			{/* PANEL 3: Isometric Blocks with Core */}
			{/* Vertical guide axis */}
			<line
				x1={470}
				y1={75}
				x2={470}
				y2={300}
				stroke="currentColor"
				strokeOpacity={0.08}
				strokeDasharray="2 2"
			/>

			{/* Bottom Block */}
			{/* Sides */}
			<polygon
				points="430,230 470,250 470,266 430,246"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeWidth={1}
			/>
			<polygon
				points="470,250 510,230 510,246 470,266"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeWidth={1}
			/>
			{/* Top Face */}
			<polygon
				points="470,210 510,230 470,250 430,230"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
				strokeWidth={1}
			/>
			{/* Hourglass core */}
			<polygon
				points="465,207 475,207 472,230 475,253 465,253 468,230"
				fill="currentColor"
				fillOpacity={0.15}
				stroke="currentColor"
				className="text-primary-base dark:opacity-90"
				strokeWidth={1}
			/>

			{/* Top Block */}
			{/* Sides */}
			<polygon
				points="430,135 470,155 470,171 430,151"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeWidth={1}
			/>
			<polygon
				points="470,155 510,135 510,151 470,171"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeWidth={1}
			/>
			{/* Top Face */}
			<polygon
				points="470,115 510,135 470,155 430,135"
				fill="none"
				stroke="currentColor"
				strokeOpacity={0.25}
				strokeWidth={1}
			/>
			{/* Hourglass core */}
			<polygon
				points="465,112 475,112 472,135 475,158 465,158 468,135"
				fill="currentColor"
				fillOpacity={0.15}
				stroke="currentColor"
				className="text-primary-base dark:opacity-90"
				strokeWidth={1}
			/>
		</>
	);
}
