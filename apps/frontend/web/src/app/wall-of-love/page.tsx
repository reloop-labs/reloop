import { JsonLd } from "@reloop/web/components/json-ld";
import { getSiteUrl, hostedSignupHref } from "@reloop/web/lib/site";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { type TweetItem, wallOfLoveTweets } from "./wall-of-love-data";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/wall-of-love`;
const pageTitle = "Wall of Love | Reloop";
const pageDescription =
	"Real feedback from our community that fuels our passion to create.";

export const metadata: Metadata = {
	title: "Wall of Love",
	description: pageDescription,
	keywords: [
		"Reloop wall of love",
		"Reloop reviews",
		"developer feedback",
		"Reloop testimonials",
		"open source email reviews",
	],
	alternates: { canonical: pageUrl },
	openGraph: {
		title: pageTitle,
		description: pageDescription,
		type: "website",
		url: pageUrl,
		siteName: "Reloop",
	},
	twitter: {
		card: "summary_large_image",
		title: pageTitle,
		description: pageDescription,
	},
};

const wallOfLoveSchema = {
	"@context": "https://schema.org",
	"@type": "CollectionPage",
	name: pageTitle,
	description: pageDescription,
	url: pageUrl,
};

function VerifiedBadge() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			height="14"
			width="14"
			viewBox="0 0 14 14"
			className="shrink-0"
			aria-label="Verified"
		>
			<g>
				<path
					d="M10.811 2.479c.133.322.388.577.71.711l1.127.467a1.31 1.31 0 0 1 .71.71c.133.322.133.683 0 1.005l-.466 1.126a1.31 1.31 0 0 0 0 1.005l.466 1.126a1.31 1.31 0 0 1 .1.502c0 .172-.034.343-.1.502a1.31 1.31 0 0 1-.711.71l-1.126.466a1.31 1.31 0 0 0-.711.71l-.467 1.127a1.31 1.31 0 0 1-1.715.71l-1.126-.466a1.31 1.31 0 0 0-1.004.001l-1.127.466c-.321.133-.682.133-1.004 0s-.577-.388-.71-.71l-.467-1.127c-.133-.322-.388-.577-.71-.711l-1.127-.467a1.31 1.31 0 0 1-.71-.71C.511 9.312.51 8.951.643 8.629l.466-1.126c.133-.322.133-.683-.001-1.004L.643 5.371a1.31 1.31 0 0 1 0-1.005 1.31 1.31 0 0 1 .711-.71l1.126-.466c.321-.133.577-.388.71-.709l.467-1.127c.133-.322.389-.577.71-.71a1.31 1.31 0 0 1 1.005 0l1.126.466c.322.133.683.133 1.004-.001L8.63.644c.322-.133.683-.133 1.004 0s.577.389.71.71l.467 1.127z"
					fill="#0788f5"
				/>
				<path
					d="M9.742 5.165c.094-.147.125-.325.087-.495s-.141-.318-.288-.412-.325-.125-.495-.087-.318.141-.412.288l-2.57 4.038-1.176-1.47c-.109-.136-.267-.223-.44-.242s-.347.031-.483.14-.223.267-.243.44.031.347.14.483l1.75 2.188c.065.082.149.146.244.189s.2.062.304.056.206-.036.296-.089.166-.126.222-.215z"
					fill="#fff"
					fillRule="evenodd"
				/>
			</g>
		</svg>
	);
}

function ChatGptIcon({ className = "size-5" }: { className?: string }) {
	return (
		<svg
			className={className}
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 256 260"
			fill="currentColor"
		>
			<path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
		</svg>
	);
}

function GeminiIcon({ className = "size-5" }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 296 298" fill="none">
			<mask
				id="gemini__a"
				width="296"
				height="298"
				x="0"
				y="0"
				maskUnits="userSpaceOnUse"
				style={{ maskType: "alpha" }}
			>
				<path
					fill="#3186FF"
					d="M141.201 4.886c2.282-6.17 11.042-6.071 13.184.148l5.985 17.37a184.004 184.004 0 0 0 111.257 113.049l19.304 6.997c6.143 2.227 6.156 10.91.02 13.155l-19.35 7.082a184.001 184.001 0 0 0-109.495 109.385l-7.573 20.629c-2.241 6.105-10.869 6.121-13.133.025l-7.908-21.296a184 184 0 0 0-109.02-108.658l-19.698-7.239c-6.102-2.243-6.118-10.867-.025-13.132l20.083-7.467A183.998 183.998 0 0 0 133.291 26.28l7.91-21.394Z"
				/>
			</mask>
			<g mask="url(#gemini__a)">
				<g filter="url(#gemini__b)">
					<ellipse cx="163" cy="149" fill="#3689FF" rx="196" ry="159" />
				</g>
				<g filter="url(#gemini__c)">
					<ellipse cx="33.5" cy="142.5" fill="#F6C013" rx="68.5" ry="72.5" />
				</g>
				<g filter="url(#gemini__d)">
					<ellipse cx="19.5" cy="148.5" fill="#F6C013" rx="68.5" ry="72.5" />
				</g>
				<g filter="url(#gemini__e)">
					<path
						fill="#FA4340"
						d="M194 10.5C172 82.5 65.5 134.333 22.5 135L144-66l50 76.5Z"
					/>
				</g>
				<g filter="url(#gemini__f)">
					<path
						fill="#FA4340"
						d="M190.5-12.5C168.5 59.5 62 111.333 19 112L140.5-89l50 76.5Z"
					/>
				</g>
				<g filter="url(#gemini__g)">
					<path
						fill="#14BB69"
						d="M194.5 279.5C172.5 207.5 66 155.667 23 155l121.5 201 50-76.5Z"
					/>
				</g>
				<g filter="url(#gemini__h)">
					<path
						fill="#14BB69"
						d="M196.5 320.5C174.5 248.5 68 196.667 25 196l121.5 201 50-76.5Z"
					/>
				</g>
			</g>
			<defs>
				<filter
					id="gemini__b"
					width="464"
					height="390"
					x="-69"
					y="-46"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="18"
					/>
				</filter>
				<filter
					id="gemini__c"
					width="265"
					height="273"
					x="-99"
					y="6"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id="gemini__d"
					width="265"
					height="273"
					x="-113"
					y="12"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id="gemini__e"
					width="299.5"
					height="329"
					x="-41.5"
					y="-130"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id="gemini__f"
					width="299.5"
					height="329"
					x="-45"
					y="-153"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id="gemini__g"
					width="299.5"
					height="329"
					x="-41"
					y="91"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
				<filter
					id="gemini__h"
					width="299.5"
					height="329"
					x="-39"
					y="132"
					colorInterpolationFilters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feBlend
						in="SourceGraphic"
						in2="BackgroundImageFix"
						result="shape"
					/>
					<feGaussianBlur
						result="effect1_foregroundBlur_69_17998"
						stdDeviation="32"
					/>
				</filter>
			</defs>
		</svg>
	);
}

function ClaudeIcon({ className = "size-5" }: { className?: string }) {
	return (
		<svg
			className={className}
			preserveAspectRatio="xMidYMid"
			viewBox="0 0 256 257"
		>
			<path
				fill="#D97757"
				d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z"
			/>
		</svg>
	);
}

function TweetCard({ item }: { item: TweetItem }) {
	return (
		<div
			data-grid-content="true"
			className="@4xl:p-12 flex flex-col justify-between space-y-6 rounded bg-card/90 p-6 transition-colors duration-200 hover:bg-card"
		>
			<div>
				<div className="flex items-center gap-3">
					<div className="after:border-foreground/10 relative size-7 sm:size-8 shrink-0 overflow-hidden rounded-xl after:absolute after:inset-0 after:rounded-xl after:border">
						<img
							alt={item.name}
							loading="lazy"
							width={32}
							height={32}
							decoding="async"
							className="size-full object-cover"
							src={item.avatar}
						/>
					</div>
					<div className="flex min-w-0 items-center gap-1.5">
						<h3 className="truncate font-medium text-muted-foreground text-xl lg:tracking-tight">
							{item.name}
						</h3>
						{item.verified && <VerifiedBadge />}
					</div>
				</div>
				<p className="mt-4 text-pretty font-medium text-foreground text-xl leading-relaxed whitespace-pre-line">
					{item.content}
				</p>
			</div>
			{item.handle && (
				<div className="pt-2">
					<span className="font-mono text-muted-foreground/60 text-xs">
						@{item.handle}
					</span>
				</div>
			)}
		</div>
	);
}

function GridSpacer({ heightClass = "h-12" }: { heightClass?: string }) {
	return (
		<div
			aria-hidden="true"
			className="@container grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]"
		>
			<div
				className="grid"
				style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
			>
				<div aria-hidden="true" className="w-full p-[0.5px]">
					<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
				</div>
			</div>
			<div className="mx-auto w-full max-w-276 p-[0.5px] lg:min-w-276">
				<div data-slot="content" className="h-full rounded bg-card/90">
					<div className={heightClass} />
				</div>
			</div>
			<div
				className="grid"
				style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
			>
				<div aria-hidden="true" className="p-[0.5px]">
					<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
				</div>
			</div>
		</div>
	);
}

// Chunk tweets into rows of 4 for sectioning
function chunkArray<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}

export default function WallOfLovePage() {
	const tweetChunks = chunkArray(wallOfLoveTweets, 4);

	return (
		<div className="w-full bg-foreground/3 pt-16 sm:pt-20">
			<JsonLd data={wallOfLoveSchema} />

			{/* Hero & AI Summary Section */}
			<section id="home" className="overflow-hidden">
				{/* Title row */}
				<div className="@container grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]">
					<div
						className="grid"
						style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
					>
						<div aria-hidden="true" className="w-full p-[0.5px]">
							<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
						</div>
					</div>
					<div className="mx-auto w-full max-w-276 lg:min-w-276">
						<div className="grid *:p-[0.5px] **:data-grid-content:h-full **:data-grid-content:rounded **:data-grid-content:bg-card/90">
							<div className="grid grid-cols-10 gap-px">
								<div aria-hidden="true" className="max-sm:hidden">
									<div
										data-grid-content="true"
										className="h-full rounded bg-card/90"
									/>
								</div>
								<div
									data-grid-content="true"
									className="@4xl:p-12 col-span-full rounded bg-card/90 p-6 sm:col-span-8"
								>
									<h1 className="text-balance font-semibold text-5xl text-foreground tracking-tight lg:text-6xl">
										Wall of love
									</h1>
									<p className="mx-auto mt-4 text-balance text-lg text-muted-foreground">
										Real feedback from our community that fuels our passion to
										create.
									</p>
								</div>
								<div aria-hidden="true" className="max-sm:hidden">
									<div
										data-grid-content="true"
										className="h-full rounded bg-card/90"
									/>
								</div>
							</div>
						</div>
					</div>
					<div
						className="grid"
						style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
					>
						<div aria-hidden="true" className="p-[0.5px]">
							<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
						</div>
					</div>
				</div>

				{/* AI Summary row */}
				<div className="@container grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]">
					<div
						className="grid"
						style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
					>
						<div aria-hidden="true" className="w-full p-[0.5px]">
							<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
						</div>
					</div>
					<div className="mx-auto w-full max-w-276 lg:min-w-276">
						<div className="grid *:p-[0.5px] **:data-grid-content:h-full **:data-grid-content:rounded **:data-grid-content:bg-card/90">
							<div className="grid grid-cols-10 gap-px">
								<div aria-hidden="true" className="max-sm:hidden">
									<div
										data-grid-content="true"
										className="h-full rounded bg-card/90"
									/>
								</div>
								<div className="col-span-full sm:col-span-8">
									<div
										data-grid-content="true"
										className="@4xl:p-12 rounded bg-card/90 p-6"
									>
										<h2 className="text-balance font-medium text-foreground text-xl lg:tracking-tight">
											Get AI Summary
										</h2>
										<p className="mt-2 text-balance text-muted-foreground">
											Need help understanding this document? Get an AI-powered
											explanation from your favorite AI models.
										</p>
										<div className="mt-6 flex flex-wrap gap-3">
											{/* ChatGPT */}
											<div className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card">
												<ChatGptIcon className="size-5" />
												<a
													target="_blank"
													rel="noopener noreferrer"
													className="font-medium text-foreground text-sm after:absolute after:inset-0"
													href="https://chatgpt.com/?q=Explain%20the%20following%20%22Wall%20of%20love%22%20document%20in%20simple%20terms%3A%20"
												>
													ChatGPT
												</a>
												<ArrowUpRight className="size-4 opacity-50 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
											</div>

											{/* Gemini */}
											<div className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card">
												<GeminiIcon className="size-5" />
												<a
													target="_blank"
													rel="noopener noreferrer"
													className="font-medium text-foreground text-sm after:absolute after:inset-0"
													href="https://gemini.google.com/search?udm=Explain%20the%20following%20%22Wall%20of%20love%22%20document%20in%20simple%20terms%3A%20"
												>
													Gemini
												</a>
												<ArrowUpRight className="size-4 opacity-50 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
											</div>

											{/* Claude */}
											<div className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card">
												<ClaudeIcon className="size-5" />
												<a
													target="_blank"
													rel="noopener noreferrer"
													className="font-medium text-foreground text-sm after:absolute after:inset-0"
													href="https://claude.ai/new?q=Explain%20the%20following%20%22Wall%20of%20love%22%20document%20in%20simple%20terms%3A%20"
												>
													Claude
												</a>
												<ArrowUpRight className="size-4 opacity-50 duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
											</div>
										</div>
									</div>
								</div>
								<div aria-hidden="true" className="max-sm:hidden">
									<div
										data-grid-content="true"
										className="h-full rounded bg-card/90"
									/>
								</div>
							</div>
						</div>
					</div>
					<div
						className="grid"
						style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
					>
						<div aria-hidden="true" className="p-[0.5px]">
							<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
						</div>
					</div>
				</div>
			</section>

			{/* Testimonial Tweet Sections */}
			{tweetChunks.map((chunk, chunkIndex) => (
				<section key={`chunk-${chunkIndex}`} className="overflow-hidden">
					<div className="@container grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]">
						{/* Left Spacer */}
						<div
							className="grid"
							style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
						>
							<div aria-hidden="true" className="w-full p-[0.5px]">
								<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
							</div>
						</div>

						{/* Center Grid */}
						<div className="mx-auto w-full max-w-276 lg:min-w-276">
							<div className="grid *:p-[0.5px] **:data-grid-content:h-full **:data-grid-content:rounded **:data-grid-content:bg-card/90">
								<div className="grid grid-cols-10 gap-px">
									<div aria-hidden="true" className="max-sm:hidden">
										<div
											data-grid-content="true"
											className="h-full rounded bg-card/90"
										/>
									</div>
									<div className="@4xl:grid-cols-2 col-span-full grid gap-px sm:col-span-8">
										{chunk.map((item) => (
											<TweetCard key={item.id} item={item} />
										))}
									</div>
									<div aria-hidden="true" className="max-sm:hidden">
										<div
											data-grid-content="true"
											className="h-full rounded bg-card/90"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Right Spacer */}
						<div
							className="grid"
							style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
						>
							<div aria-hidden="true" className="p-[0.5px]">
								<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
							</div>
						</div>
					</div>

					{/* Spacer between sections */}
					<GridSpacer heightClass="h-12" />
				</section>
			))}

			{/* Bottom CTA Section */}
			<section className="overflow-hidden">
				<GridSpacer heightClass="h-16" />

				<div className="@container grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr]">
					<div
						className="grid"
						style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
					>
						<div aria-hidden="true" className="w-full p-[0.5px]">
							<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
						</div>
					</div>
					<div className="mx-auto w-full max-w-276 p-[0.5px] lg:min-w-276">
						<div data-slot="content" className="h-full rounded bg-card/90">
							<div className="@3xl:p-20 @lg:p-8 relative overflow-hidden p-6 py-16 text-center">
								<div className="mx-auto max-w-xl text-center">
									<h2 className="text-balance font-semibold text-4xl text-foreground lg:text-5xl">
										Create, Sell and Grow
									</h2>
									<p className="mt-4 mb-8 text-balance text-lg text-muted-foreground">
										Join a community of over 1,000+ companies and developers
										who have already discovered the power of Reloop.
									</p>
									<Link
										className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-foreground px-6 font-medium text-background text-sm shadow-xl transition-all duration-200 hover:bg-foreground/90 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										href={hostedSignupHref}
									>
										Start Testing for free
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div
						className="grid"
						style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
					>
						<div aria-hidden="true" className="p-[0.5px]">
							<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
						</div>
					</div>
				</div>

				<GridSpacer heightClass="h-16" />
			</section>
		</div>
	);
}
