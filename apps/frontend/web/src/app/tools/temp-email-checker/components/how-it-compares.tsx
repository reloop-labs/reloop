const COLUMNS = ["Reloop", "Other providers"];

const ROWS: { capability: string; cells: ("yes" | "no")[] }[] = [
	{ capability: "~210k disposable-domain catalogue", cells: ["yes", "no"] },
	{
		capability: "Wildcard suffix & role-prefix signals",
		cells: ["yes", "no"],
	},
	{ capability: "MX verification over DNS", cells: ["yes", "no"] },
	{ capability: "Never touches the mailbox", cells: ["yes", "no"] },
	{
		capability: "Confidence, risk score & flags",
		cells: ["yes", "no"],
	},
	{ capability: "Free in the browser, no signup", cells: ["yes", "no"] },
];

function CheckIcon() {
	return (
		<svg
			fill="none"
			height="20"
			viewBox="0 0 20 20"
			width="20"
			xmlns="http://www.w3.org/2000/svg"
			className="text-primary-base"
			aria-label="Included"
			role="img"
		>
			<circle cx="10" cy="10" fill="currentColor" fillOpacity="0.08" r="8" />
			<path
				d="M7 10.5L9 12.5L13 7.5"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.25"
			/>
		</svg>
	);
}

function CrossIcon() {
	return (
		<svg
			fill="none"
			height="20"
			viewBox="0 0 20 20"
			width="20"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Not included"
			role="img"
		>
			<path
				d="M7 7L13 13M13 7L7 13"
				stroke="#060606"
				strokeOpacity="0.37"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="dark:stroke-white dark:stroke-opacity-30"
			/>
		</svg>
	);
}

import { TempEmailDottedMap } from "./dotted-map";

const QUOTES: {
	name: string;
	handle: string;
	initials: string;
	avatar?: string;
	tweetUrl?: string;
	quote: string;
}[] = [
	{
		name: "Alexis Maresca",
		handle: "@MarescaAlexis",
		initials: "AM",
		avatar:
			"https://pbs.twimg.com/profile_images/2092634806647455744/oDSXFFr0.jpg",
		tweetUrl: "https://x.com/MarescaAlexis/status/2092973405553238462",
		quote: "Most underated Github project",
	},
	{
		name: "Farhan Shaikh",
		handle: "@farhansklife",
		initials: "FS",
		avatar:
			"https://pbs.twimg.com/profile_images/2094764538948399104/RSXaxJIa.jpg",
		tweetUrl: "https://x.com/farhansklife/status/2097725657845563431",
		quote:
			"We are using @reloop_labs for all transactional emails. Really impressed with the DX and overall UX clean, simple, and very easy to integrate. The pricing is also very competitive: $10 for 50K emails.",
	},
	{
		name: "Luna",
		handle: "@puppygirllulu",
		initials: "LU",
		avatar:
			"https://pbs.twimg.com/profile_images/2054742255479525376/ev8lvRV4.png",
		tweetUrl: "https://x.com/puppygirllulu/status/2097816263623836047",
		quote:
			"Lately i been working at @reloop_labs as a fullstack engineer and the experience has been great its been so great ive moved most my projects off resend started working on a CLI tool as well for the project and introduced selfhost for people who prefer selfhostinf #devops…",
	},
];

function QuoteText({ text }: { text: string }) {
	const parts = text.split(/(@reloop_labs|@reloop)/g);
	return (
		<>
			&ldquo;
			{parts.map((part, i) =>
				part === "@reloop_labs" || part === "@reloop" ? (
					<span key={i} className="text-primary-base">
						{part}
					</span>
				) : (
					<span key={i}>{part}</span>
				),
			)}
			&rdquo;
		</>
	);
}
function Mark({ value }: { value: "yes" | "no" }) {
	return (
		<span className="inline-flex items-center justify-center">
			{value === "yes" ? <CheckIcon /> : <CrossIcon />}
		</span>
	);
}

export function HowItCompares() {
	return (
		<section
			id="how-it-compares"
			aria-labelledby="how-it-compares-heading"
			className="w-full"
		>
			<div className="border-stroke-soft-100 border-b px-4 py-8 sm:px-8 sm:py-10 lg:px-12 dark:border-white/10">
				<p className="mb-3 font-medium text-[12px] uppercase">
					<span className="text-primary-base">04.</span>{" "}
					<span className="text-text-sub-600 dark:text-white/50">
						How it compares
					</span>
				</p>
				<h2
					id="how-it-compares-heading"
					className="text-balance font-semibold text-2xl text-text-strong-950 tracking-[-0.025em] sm:text-3xl lg:text-[2rem] lg:leading-[1.15] dark:text-white"
				>
					How <span className="text-primary-base">Reloop</span>{" "}
					compares:
				</h2>
				<p className="mt-4 max-w-3xl text-[15px] text-stone-500 leading-relaxed sm:text-[16px] dark:text-white/60">
					Syntax checks miss throwaway domains. Mailbox probing burns your
					sender reputation. Reloop checks the signals that matter — safely.
				</p>
			</div>

			<div className="overflow-x-auto border-stroke-soft-100 border-b dark:border-white/10">
				<table className="w-full min-w-[420px] border-collapse">
					<thead>
						<tr className="border-stroke-soft-100 border-b dark:border-white/10">
							<th className="w-[58%] px-4 py-4 text-left sm:px-8 lg:px-12" />
							{COLUMNS.map((column, i) => (
								<th
									key={column}
									className={`px-4 py-4 text-center font-medium text-[13px] tracking-[-0.025em] sm:text-[14px] ${
										i === 0
											? "text-text-strong-950 dark:text-white"
											: "text-text-sub-600 dark:text-white/50"
									}`}
								>
									{column}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{ROWS.map((row) => (
							<tr
								key={row.capability}
								className="border-stroke-soft-100 border-b last:border-b-0 dark:border-white/10"
							>
								<th
									scope="row"
									className="px-4 py-4 text-left font-medium text-[13.5px] text-text-strong-950 tracking-[-0.025em] sm:px-8 sm:text-[14px] lg:px-12 dark:text-white"
								>
									{row.capability}
								</th>
								{row.cells.map((cell, i) => (
									<td key={i} className="px-4 py-4 text-center">
										<Mark value={cell} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<TempEmailDottedMap />

			{/* Loved by developers */}
			<div className="flex flex-col items-center border-stroke-soft-100 border-b px-4 py-16 text-center sm:px-8 sm:py-20 lg:px-12 lg:py-24 dark:border-white/10">
				<div>
					<span className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary-base/10 px-2.5 py-1 font-medium text-[13px] text-primary-base">
						Community
					</span>
				</div>
				<div className="mt-5 sm:mt-6">
					<h3 className="mx-auto max-w-3xl text-balance font-semibold text-[2.5rem] text-text-strong-950 leading-[1.06] tracking-[-0.04em] sm:text-[3.5rem] lg:text-[4.25rem] dark:text-white">
						People love building with{" "}
						<span className="text-primary-base">Reloop</span>
					</h3>
					<p className="mx-auto mt-5 max-w-2xl text-balance text-[16.5px] text-stone-500 leading-relaxed sm:mt-6 sm:text-[18.5px] lg:text-[20px] dark:text-white/60">
						Discover why developers choose Reloop every day.
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 divide-y divide-stroke-soft-100 border-stroke-soft-100 border-b lg:grid-cols-3 lg:divide-x lg:divide-y-0 dark:divide-white/10 dark:border-white/10">
				{QUOTES.map((quote) => {
					const body = (
						<>
							<div className="flex items-center gap-3">
								{quote.avatar ? (
									<img
										src={quote.avatar}
										alt={quote.name}
										width={40}
										height={40}
										loading="lazy"
										className="size-10 shrink-0 rounded-full object-cover"
									/>
								) : (
									<span
										aria-hidden
										className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-base/10 font-semibold text-[13px] text-primary-base"
									>
										{quote.initials}
									</span>
								)}
								<div className="flex flex-col">
									<span className="font-medium text-[14.5px] text-text-strong-950 tracking-[-0.025em] dark:text-white">
										{quote.name}
									</span>
									<span className="text-[13px] text-text-sub-600 dark:text-white/50">
										{quote.handle}
									</span>
								</div>
							</div>
							<blockquote className="mt-4 text-[14.5px] text-text-strong-950 leading-relaxed tracking-[-0.025em] sm:text-[15px] dark:text-white/85">
								<QuoteText text={quote.quote} />
							</blockquote>
						</>
					);

					return quote.tweetUrl ? (
						<a
							key={quote.handle}
							href={quote.tweetUrl}
							target="_blank"
							rel="noreferrer"
							className="flex flex-col px-4 py-6 transition-colors hover:bg-bg-weak-50/60 sm:px-8 sm:py-8 lg:px-12 lg:py-10 dark:hover:bg-white/[0.03]"
						>
							{body}
						</a>
					) : (
						<figure
							key={quote.handle}
							className="flex flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
						>
							{body}
						</figure>
					);
				})}
			</div>
		</section>
	);
}
