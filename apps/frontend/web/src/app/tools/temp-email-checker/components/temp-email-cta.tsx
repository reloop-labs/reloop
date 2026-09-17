"use client";

import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";
import { useState } from "react";

export interface TempEmailCtaProps {
	headlineLine1?: string;
	headlineLine2?: string;
	subtext?: string;
	primaryLabel?: string;
	primaryHref?: string;
	secondaryLabel?: string;
	secondaryHref?: string;
	secondaryExternal?: boolean;
}

export function TempEmailCta({
	headlineLine1 = "Ready to block fake signups?",
	headlineLine2 = "Let's talk.",
	subtext = "3,000 free API checks every month. Stop throwaway emails at signup with zero hassle.",
	primaryLabel = "Get started free",
	primaryHref = hostedSignupHref,
	secondaryLabel = "Schedule call",
	secondaryHref = "https://cal.com/pranavp/30",
	secondaryExternal = true,
}: TempEmailCtaProps) {
	const [isNodeHovered, setIsNodeHovered] = useState(false);

	return (
		<section className="w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
			<div className="group relative mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/20 bg-[#256bf5] p-8 transition-all duration-300 sm:rounded-[32px] sm:p-12 lg:p-14">
				{/* Left Column: Heading, Subhead, and Actions */}
				<div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
					<div className="flex flex-col items-start text-left lg:col-span-7">
						<h2 className="font-normal text-3xl text-white tracking-[-0.03em] sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
							<span>{headlineLine1}</span>
							<br />
							<span className="font-normal text-white">{headlineLine2}</span>
						</h2>

						{subtext && (
							<p className="mt-4 max-w-lg text-[14.5px] text-white/85 leading-relaxed sm:text-[15.5px]">
								{subtext}
							</p>
						)}

						<div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-10">
							{/* Primary Button */}
							<Link
								href={primaryHref}
								className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-2.5 font-medium text-[#0f172a] text-[14.5px] transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98]"
							>
								{primaryLabel}
							</Link>

							{/* Secondary Button */}
							{secondaryExternal ? (
								<a
									href={secondaryHref}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/12 px-6 py-2.5 font-medium text-[14.5px] text-white backdrop-blur-xs transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:scale-[0.98]"
								>
									{secondaryLabel}
								</a>
							) : (
								<Link
									href={secondaryHref}
									className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/12 px-6 py-2.5 font-medium text-[14.5px] text-white backdrop-blur-xs transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:scale-[0.98]"
								>
									{secondaryLabel}
								</Link>
							)}
						</div>
					</div>

					{/* Right Column: Architectural Blueprint Grid & CAD Monogram */}
					<div className="relative flex items-center justify-center lg:col-span-5 lg:justify-end">
						<div className="relative w-full max-w-[460px] overflow-hidden rounded-2xl">
							<svg
								viewBox="0 0 460 260"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className="h-auto w-full select-none"
							>
								<title>Reloop Architectural Blueprint</title>

								<defs>
									{/* Gradient stroke for dynamic vector curves */}
									<linearGradient
										id="vectorStroke"
										x1="0"
										y1="0"
										x2="460"
										y2="260"
										gradientUnits="userSpaceOnUse"
									>
										<stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
										<stop offset="50%" stopColor="#dbeafe" stopOpacity="0.85" />
										<stop
											offset="100%"
											stopColor="#ffffff"
											stopOpacity="0.65"
										/>
									</linearGradient>
								</defs>

								{/* Blueprint Grid Lines */}
								<g opacity="0.4">
									{/* Vertical grid lines (spaced at 70px intervals starting at x=40) */}
									<line
										x1="40"
										y1="10"
										x2="40"
										y2="250"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="110"
										y1="10"
										x2="110"
										y2="250"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="180"
										y1="10"
										x2="180"
										y2="250"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="250"
										y1="10"
										x2="250"
										y2="250"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="320"
										y1="10"
										x2="320"
										y2="250"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="390"
										y1="10"
										x2="390"
										y2="250"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="450"
										y1="10"
										x2="450"
										y2="250"
										stroke="white"
										strokeWidth="1"
									/>

									{/* Horizontal grid lines (spaced at 60px intervals) */}
									<line
										x1="40"
										y1="10"
										x2="450"
										y2="10"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="40"
										y1="70"
										x2="450"
										y2="70"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="40"
										y1="130"
										x2="450"
										y2="130"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="40"
										y1="190"
										x2="450"
										y2="190"
										stroke="white"
										strokeWidth="1"
									/>
									<line
										x1="40"
										y1="250"
										x2="450"
										y2="250"
										stroke="white"
										strokeWidth="1"
									/>
								</g>

								{/* Subtle CAD Intersection Marks (Tick Marks) */}
								<g opacity="0.3" stroke="white" strokeWidth="1">
									<path d="M 106 70 H 114 M 110 66 V 74" />
									<path d="M 176 70 H 184 M 180 66 V 74" />
									<path d="M 246 70 H 254 M 250 66 V 74" />
									<path d="M 316 70 H 324 M 320 66 V 74" />
									<path d="M 386 70 H 394 M 390 66 V 74" />

									<path d="M 176 130 H 184 M 180 126 V 134" />
									<path d="M 246 130 H 254 M 250 126 V 134" />
									<path d="M 316 130 H 324 M 320 126 V 134" />
									<path d="M 386 130 H 394 M 390 126 V 134" />
								</g>

								{/* The Blueprint Monogram Continuous Curves (Reloop Wave Loops) */}
								{/* Geometric pill loops and sweeping arches traversing the grid */}
								<g
									className="transition-transform duration-500 ease-out group-hover:scale-[1.01]"
									style={{ transformOrigin: "240px 180px" }}
								>
									{/* Outer looping contour - continuous interlocking arches */}
									<path
										d="
											M 40 220
											L 88 152
											C 100 134, 126 134, 138 152
											L 174 204
											C 186 222, 212 222, 224 204
											L 260 152
											C 272 134, 298 134, 310 152
											L 346 204
											C 358 222, 384 222, 396 204
											L 444 136
											C 458 116, 480 132, 468 150
											L 418 222
											C 400 248, 364 248, 346 222
											L 310 172
											C 298 154, 272 154, 260 172
											L 224 222
											C 206 248, 170 248, 152 222
											L 116 172
											C 104 154, 78 154, 66 172
											L 22 234
											C 10 252, -12 236, 4 214
											Z
										"
										stroke="url(#vectorStroke)"
										strokeWidth="1.75"
										strokeLinecap="round"
										strokeLinejoin="round"
										fill="rgba(255, 255, 255, 0.03)"
									/>

									{/* Secondary inner architectural curve echoing the loop geometry */}
									<path
										d="
											M 70 190
											C 90 150, 140 150, 160 190
											C 180 230, 230 230, 250 190
											C 270 150, 320 150, 340 190
											C 360 230, 410 230, 430 190
										"
										stroke="rgba(255, 255, 255, 0.28)"
										strokeWidth="1.25"
										strokeDasharray="4 4"
										fill="none"
									/>
								</g>

								{/* CAD Vector Anchor Point Handle (Exact feature from reference) */}
								{/* Located at key grid node (x=40, y=130) on the leftmost vertical grid line */}
								<g
									className="cursor-pointer transition-all duration-300"
									onMouseEnter={() => setIsNodeHovered(true)}
									onMouseLeave={() => setIsNodeHovered(false)}
								>
									{/* Subtle coordinate guide lines when hovered */}
									{isNodeHovered && (
										<g opacity="0.6">
											<line
												x1="0"
												y1="130"
												x2="40"
												y2="130"
												stroke="white"
												strokeWidth="1"
												strokeDasharray="2 2"
											/>
											<text
												x="10"
												y="124"
												fill="white"
												fontSize="9"
												fontFamily="monospace"
											>
												P(40,130)
											</text>
										</g>
									)}

									{/* The Vector Square Node */}
									<rect
										x="36"
										y="126"
										width="8"
										height="8"
										rx="1.5"
										fill="#ffffff"
										stroke="#1660f0"
										strokeWidth="1.5"
										className="transition-transform duration-200 hover:scale-125"
									/>

									{/* Tiny center core dot */}
									<rect
										x="39"
										y="129"
										width="2"
										height="2"
										fill="#1660f0"
										opacity="0.8"
									/>
								</g>

								{/* Secondary vector handle on line intersection (x=180, y=70) */}
								<g opacity="0.75">
									<rect
										x="177"
										y="67"
										width="6"
										height="6"
										rx="1"
										fill="#ffffff"
										stroke="#1660f0"
										strokeWidth="1"
									/>
								</g>
							</svg>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
