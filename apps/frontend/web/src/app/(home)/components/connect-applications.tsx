import Link from "next/link";

export function ConnectApplications() {
	return (
		<section
			aria-labelledby="connect-applications-heading"
			className="w-full overflow-hidden bg-white dark:bg-black"
		>
			{/* Part 1: Header Block */}
			<div className="@container grid w-full grid-cols-[auto_1fr_auto] bg-[#ebebeb] lg:grid-cols-[1fr_auto_1fr] dark:bg-[#292929]">
				{/* Left Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="w-full p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>

				{/* Center Content Column */}
				<div className="mx-auto w-full max-w-276 max-w-[1104px] p-[0.5px] lg:min-w-276 lg:min-w-[1104px]">
					<div
						data-slot="content"
						className="h-full rounded bg-card/90 py-16 lg:py-24"
					>
						<div className="mx-auto w-full max-w-5xl px-6 xl:px-0">
							<div className="mx-auto max-w-2xl space-y-6 text-center">
								<h2
									id="connect-applications-heading"
									className="text-balance font-semibold text-4xl text-foreground lg:text-5xl"
								>
									Connect all your preferred applications
								</h2>
								<p className="mb-8 text-balance text-lg text-muted-foreground">
									Reloop provides a seamless integration experience, allowing you to
									connect and synchronize data from multiple sources with ease.
								</p>
								<Link
									href="/integrations"
									className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-card px-3 font-medium text-xs text-foreground shadow-black/15 shadow-sm ring-1 ring-foreground/10 duration-200 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:ring-foreground/15 dark:hover:bg-muted/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
								>
									See all integrations
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>
			</div>

			{/* Part 2: Integration Tiles Grid */}
			<div className="@container grid w-full grid-cols-[auto_1fr_auto] bg-[#ebebeb] lg:grid-cols-[1fr_auto_1fr] dark:bg-[#292929]">
				{/* Left Column Spacer */}
				<div
					className="grid"
					style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}
				>
					<div aria-hidden="true" className="w-full p-[0.5px]">
						<div className="h-full w-2 rounded bg-card/90 md:w-6 lg:w-full" />
					</div>
				</div>

				{/* Center Content Column */}
				<div className="mx-auto w-full max-w-276 max-w-[1104px] lg:min-w-276 lg:min-w-[1104px]">
					<div className="grid grid-cols-1 bg-[#ebebeb] *:p-[0.5px] @4xl:grid-cols-6 **:data-grid-content:h-full **:data-grid-content:rounded **:data-grid-content:bg-card/90 dark:bg-[#292929]">
						{/* Left border spacer on 4xl screens */}
						<div aria-hidden="true" className="@max-4xl:hidden">
							<div data-grid-content="true" />
						</div>

						{/* Center 4 Columns */}
						<div className="@4xl:col-span-4">
							<div className="grid grid-cols-2 gap-px bg-[#ebebeb] @lg:grid-cols-4 dark:bg-[#292929]">
								{/* Category Header: Platform */}
								<div
									data-grid-content="true"
									className="col-span-2 p-4 text-center"
								>
									<span className="font-mono text-muted-foreground text-sm">
										Platform
									</span>
								</div>

								{/* Category Header: LLMs */}
								<div
									data-grid-content="true"
									className="col-span-2 p-4 text-center @max-lg:row-start-3"
								>
									<span className="font-mono text-muted-foreground text-sm">
										LLMs
									</span>
								</div>

								{/* Tile 1: Cloudflare */}
								<div className="group relative flex aspect-square hover:z-10 hover:bg-card">
									<div className="pointer-events-none absolute inset-0 z-1 flex size-full duration-200 ease-out *:m-auto *:size-10 *:duration-200 group-hover:opacity-65 group-hover:*:-translate-y-3">
										<svg viewBox="0 0 256 116" preserveAspectRatio="xMidYMid">
											<path
												fill="#FFF"
												d="m202.357 49.394-5.311-2.124C172.085 103.434 72.786 69.289 66.81 85.997c-.996 11.286 54.227 2.146 93.706 4.059 12.039.583 18.076 9.671 12.964 24.484l10.069.031c11.615-36.209 48.683-17.73 50.232-29.68-2.545-7.857-42.601 0-31.425-35.497Z"
											/>
											<path
												fill="#F4811F"
												d="M176.332 108.348c1.593-5.31 1.062-10.622-1.593-13.809-2.656-3.187-6.374-5.31-11.154-5.842L71.17 87.634c-.531 0-1.062-.53-1.593-.53-.531-.532-.531-1.063 0-1.594.531-1.062 1.062-1.594 2.124-1.594l92.946-1.062c11.154-.53 22.839-9.56 27.087-20.182l5.312-13.809c0-.532.531-1.063 0-1.594C191.203 20.182 166.772 0 138.091 0 111.535 0 88.697 16.995 80.73 40.896c-5.311-3.718-11.684-5.843-19.12-5.31-12.747 1.061-22.838 11.683-24.432 24.43-.531 3.187 0 6.374.532 9.56C16.996 70.107 0 87.103 0 108.348c0 2.124 0 3.718.531 5.842 0 1.063 1.062 1.594 1.594 1.594h170.489c1.062 0 2.125-.53 2.125-1.594l1.593-5.842Z"
											/>
											<path
												fill="#FAAD3F"
												d="M205.544 48.863h-2.656c-.531 0-1.062.53-1.593 1.062l-3.718 12.747c-1.593 5.31-1.062 10.623 1.594 13.809 2.655 3.187 6.373 5.31 11.153 5.843l19.652 1.062c.53 0 1.062.53 1.593.53.53.532.53 1.063 0 1.594-.531 1.063-1.062 1.594-2.125 1.594l-20.182 1.062c-11.154.53-22.838 9.56-27.087 20.182l-1.063 4.78c-.531.532 0 1.594 1.063 1.594h70.108c1.062 0 1.593-.531 1.593-1.593 1.062-4.25 2.124-9.03 2.124-13.81 0-27.618-22.838-50.456-50.456-50.456"
											/>
										</svg>
									</div>
									<span className="pointer-events-none absolute inset-0 z-10 m-auto block size-fit translate-y-[125%] font-medium text-sm text-foreground opacity-0 duration-200 group-hover:scale-100 group-hover:opacity-100">
										Cloudflare
									</span>
									<div className="absolute inset-0 rounded opacity-0 shadow-2xl shadow-indigo-900/15 duration-200 group-hover:opacity-100" />
									<div
										data-grid-content="true"
										className="relative flex size-full *:m-auto *:size-10 *:duration-200 **:fill-foreground group-hover:**:fill-muted-foreground group-hover:*:-translate-y-3"
									>
										<svg viewBox="0 0 256 116" preserveAspectRatio="xMidYMid">
											<path
												fill="#FFF"
												d="m202.357 49.394-5.311-2.124C172.085 103.434 72.786 69.289 66.81 85.997c-.996 11.286 54.227 2.146 93.706 4.059 12.039.583 18.076 9.671 12.964 24.484l10.069.031c11.615-36.209 48.683-17.73 50.232-29.68-2.545-7.857-42.601 0-31.425-35.497Z"
											/>
											<path
												fill="#F4811F"
												d="M176.332 108.348c1.593-5.31 1.062-10.622-1.593-13.809-2.656-3.187-6.374-5.31-11.154-5.842L71.17 87.634c-.531 0-1.062-.53-1.593-.53-.531-.532-.531-1.063 0-1.594.531-1.062 1.062-1.594 2.124-1.594l92.946-1.062c11.154-.53 22.839-9.56 27.087-20.182l5.312-13.809c0-.532.531-1.063 0-1.594C191.203 20.182 166.772 0 138.091 0 111.535 0 88.697 16.995 80.73 40.896c-5.311-3.718-11.684-5.843-19.12-5.31-12.747 1.061-22.838 11.683-24.432 24.43-.531 3.187 0 6.374.532 9.56C16.996 70.107 0 87.103 0 108.348c0 2.124 0 3.718.531 5.842 0 1.063 1.062 1.594 1.594 1.594h170.489c1.062 0 2.125-.53 2.125-1.594l1.593-5.842Z"
											/>
											<path
												fill="#FAAD3F"
												d="M205.544 48.863h-2.656c-.531 0-1.062.53-1.593 1.062l-3.718 12.747c-1.593 5.31-1.062 10.623 1.594 13.809 2.655 3.187 6.373 5.31 11.153 5.843l19.652 1.062c.53 0 1.062.53 1.593.53.53.532.53 1.063 0 1.594-.531 1.063-1.062 1.594-2.125 1.594l-20.182 1.062c-11.154.53-22.838 9.56-27.087 20.182l-1.063 4.78c-.531.532 0 1.594 1.063 1.594h70.108c1.062 0 1.593-.531 1.593-1.593 1.062-4.25 2.124-9.03 2.124-13.81 0-27.618-22.838-50.456-50.456-50.456"
											/>
										</svg>
									</div>
								</div>

								{/* Tile 2: Vercel */}
								<div className="group relative flex aspect-square hover:z-10 hover:bg-card">
									<div className="pointer-events-none absolute inset-0 z-1 flex size-full duration-200 ease-out *:m-auto *:size-10 *:duration-200 group-hover:opacity-65 group-hover:*:-translate-y-3">
										<svg
											viewBox="0 0 256 222"
											preserveAspectRatio="xMidYMid"
											className="fill-zinc-950 dark:fill-white"
										>
											<path d="m128 0 128 221.705H0z" />
										</svg>
									</div>
									<span className="pointer-events-none absolute inset-0 z-10 m-auto block size-fit translate-y-[125%] font-medium text-sm text-foreground opacity-0 duration-200 group-hover:scale-100 group-hover:opacity-100">
										Vercel
									</span>
									<div className="absolute inset-0 rounded opacity-0 shadow-2xl shadow-indigo-900/15 duration-200 group-hover:opacity-100" />
									<div
										data-grid-content="true"
										className="relative flex size-full *:m-auto *:size-10 *:duration-200 **:fill-foreground group-hover:**:fill-muted-foreground group-hover:*:-translate-y-3"
									>
										<svg
											viewBox="0 0 256 222"
											preserveAspectRatio="xMidYMid"
											className="fill-zinc-950 dark:fill-white"
										>
											<path d="m128 0 128 221.705H0z" />
										</svg>
									</div>
								</div>

								{/* Tile 3: Google PaLM */}
								<div className="group relative flex aspect-square hover:z-10 hover:bg-card">
									<div className="pointer-events-none absolute inset-0 z-1 flex size-full duration-200 ease-out *:m-auto *:size-10 *:duration-200 group-hover:opacity-65 group-hover:*:-translate-y-3">
										<svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 229">
											<path
												fill="#F9AB00"
												d="M128 228.542c9.895 0 17.91-8.015 17.91-17.91V55.413h-35.82v155.219c0 9.895 8.015 17.91 17.91 17.91Z"
											/>
											<path
												fill="#5BB974"
												d="M199.356 112.053C180.043 92.755 151.193 88.845 128 100.307l76.669 76.67c3.164 3.163 8.612 1.91 9.955-2.344 6.746-21.357 1.657-45.64-15.268-62.58Z"
											/>
											<path
												fill="#129EAF"
												d="M56.644 112.053C75.957 92.755 104.807 88.845 128 100.307l-76.669 76.67c-3.164 3.163-8.612 1.91-9.955-2.344-6.746-21.357-1.657-45.64 15.268-62.58Z"
											/>
											<path
												fill="#AF5CF7"
												d="M193.67 52.548c-30.507 0-56.402 20-65.67 47.76h121.25c4.97 0 8.283-5.254 6.03-9.687-11.523-22.611-34.776-38.073-61.61-38.073Z"
											/>
											<path
												fill="#FF8BCB"
												d="M140.671 20.101C119.09 41.682 114.926 74.114 128 100.307l85.743-85.743c3.523-3.522 2.15-9.582-2.582-11.119-24.148-7.836-51.52-2.313-70.49 16.656Z"
											/>
											<path
												fill="#FA7B17"
												d="M115.329 20.101C136.91 41.682 141.074 74.114 128 100.307L42.257 14.564c-3.523-3.522-2.15-9.582 2.582-11.119 24.148-7.836 51.52-2.313 70.49 16.656Z"
											/>
											<path
												fill="#4285F4"
												d="M62.33 52.548c30.507 0 56.402 20 65.67 47.76H6.75c-4.97 0-8.283-5.254-6.03-9.687C12.244 68.01 35.497 52.548 62.33 52.548Z"
											/>
										</svg>
									</div>
									<span className="pointer-events-none absolute inset-0 z-10 m-auto block size-fit translate-y-[125%] font-medium text-sm text-foreground opacity-0 duration-200 group-hover:scale-100 group-hover:opacity-100">
										Google PaLM
									</span>
									<div className="absolute inset-0 rounded opacity-0 shadow-2xl shadow-indigo-900/15 duration-200 group-hover:opacity-100" />
									<div
										data-grid-content="true"
										className="relative flex size-full *:m-auto *:size-10 *:duration-200 **:fill-foreground group-hover:**:fill-muted-foreground group-hover:*:-translate-y-3"
									>
										<svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 229">
											<path
												fill="#F9AB00"
												d="M128 228.542c9.895 0 17.91-8.015 17.91-17.91V55.413h-35.82v155.219c0 9.895 8.015 17.91 17.91 17.91Z"
											/>
											<path
												fill="#5BB974"
												d="M199.356 112.053C180.043 92.755 151.193 88.845 128 100.307l76.669 76.67c3.164 3.163 8.612 1.91 9.955-2.344 6.746-21.357 1.657-45.64-15.268-62.58Z"
											/>
											<path
												fill="#129EAF"
												d="M56.644 112.053C75.957 92.755 104.807 88.845 128 100.307l-76.669 76.67c-3.164 3.163-8.612 1.91-9.955-2.344-6.746-21.357-1.657-45.64 15.268-62.58Z"
											/>
											<path
												fill="#AF5CF7"
												d="M193.67 52.548c-30.507 0-56.402 20-65.67 47.76h121.25c4.97 0 8.283-5.254 6.03-9.687-11.523-22.611-34.776-38.073-61.61-38.073Z"
											/>
											<path
												fill="#FF8BCB"
												d="M140.671 20.101C119.09 41.682 114.926 74.114 128 100.307l85.743-85.743c3.523-3.522 2.15-9.582-2.582-11.119-24.148-7.836-51.52-2.313-70.49 16.656Z"
											/>
											<path
												fill="#FA7B17"
												d="M115.329 20.101C136.91 41.682 141.074 74.114 128 100.307L42.257 14.564c-3.523-3.522-2.15-9.582 2.582-11.119 24.148-7.836 51.52-2.313 70.49 16.656Z"
											/>
											<path
												fill="#4285F4"
												d="M62.33 52.548c30.507 0 56.402 20 65.67 47.76H6.75c-4.97 0-8.283-5.254-6.03-9.687C12.244 68.01 35.497 52.548 62.33 52.548Z"
											/>
										</svg>
									</div>
								</div>

								{/* Tile 4: Claude AI */}
								<div className="group relative flex aspect-square hover:z-10 hover:bg-card">
									<div className="pointer-events-none absolute inset-0 z-1 flex size-full duration-200 ease-out *:m-auto *:size-10 *:duration-200 group-hover:opacity-65 group-hover:*:-translate-y-3">
										<svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 257">
											<path
												fill="#D97757"
												d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z"
											/>
										</svg>
									</div>
									<span className="pointer-events-none absolute inset-0 z-10 m-auto block size-fit translate-y-[125%] font-medium text-sm text-foreground opacity-0 duration-200 group-hover:scale-100 group-hover:opacity-100">
										Claude AI
									</span>
									<div className="absolute inset-0 rounded opacity-0 shadow-2xl shadow-indigo-900/15 duration-200 group-hover:opacity-100" />
									<div
										data-grid-content="true"
										className="relative flex size-full *:m-auto *:size-10 *:duration-200 **:fill-foreground group-hover:**:fill-muted-foreground group-hover:*:-translate-y-3"
									>
										<svg preserveAspectRatio="xMidYMid" viewBox="0 0 256 257">
											<path
												fill="#D97757"
												d="m50.228 170.321 50.357-28.257.843-2.463-.843-1.361h-2.462l-8.426-.518-28.775-.778-24.952-1.037-24.175-1.296-6.092-1.297L0 125.796l.583-3.759 5.12-3.434 7.324.648 16.202 1.101 24.304 1.685 17.629 1.037 26.118 2.722h4.148l.583-1.685-1.426-1.037-1.101-1.037-25.147-17.045-27.22-18.017-14.258-10.37-7.713-5.25-3.888-4.925-1.685-10.758 7-7.713 9.397.649 2.398.648 9.527 7.323 20.35 15.75L94.817 91.9l3.889 3.24 1.555-1.102.195-.777-1.75-2.917-14.453-26.118-15.425-26.572-6.87-11.018-1.814-6.61c-.648-2.723-1.102-4.991-1.102-7.778l7.972-10.823L71.42 0 82.05 1.426l4.472 3.888 6.61 15.101 10.694 23.786 16.591 32.34 4.861 9.592 2.592 8.879.973 2.722h1.685v-1.556l1.36-18.211 2.528-22.36 2.463-28.776.843-8.1 4.018-9.722 7.971-5.25 6.222 2.981 5.12 7.324-.713 4.73-3.046 19.768-5.962 30.98-3.889 20.739h2.268l2.593-2.593 10.499-13.934 17.628-22.036 7.778-8.749 9.073-9.657 5.833-4.601h11.018l8.1 12.055-3.628 12.443-11.342 14.388-9.398 12.184-13.48 18.147-8.426 14.518.778 1.166 2.01-.194 30.46-6.481 16.462-2.982 19.637-3.37 8.88 4.148.971 4.213-3.5 8.62-20.998 5.184-24.628 4.926-36.682 8.685-.454.324.519.648 16.526 1.555 7.065.389h17.304l32.21 2.398 8.426 5.574 5.055 6.805-.843 5.184-12.962 6.611-17.498-4.148-40.83-9.721-14-3.5h-1.944v1.167l11.666 11.406 21.387 19.314 26.767 24.887 1.36 6.157-3.434 4.86-3.63-.518-23.526-17.693-9.073-7.972-20.545-17.304h-1.36v1.814l4.73 6.935 25.017 37.59 1.296 11.536-1.814 3.76-6.481 2.268-7.13-1.297-14.647-20.544-15.1-23.138-12.185-20.739-1.49.843-7.194 77.448-3.37 3.953-7.778 2.981-6.48-4.925-3.436-7.972 3.435-15.749 4.148-20.544 3.37-16.333 3.046-20.285 1.815-6.74-.13-.454-1.49.194-15.295 20.999-23.267 31.433-18.406 19.702-4.407 1.75-7.648-3.954.713-7.064 4.277-6.286 25.47-32.405 15.36-20.092 9.917-11.6-.065-1.686h-.583L44.07 198.125l-12.055 1.555-5.185-4.86.648-7.972 2.463-2.593 20.35-13.999-.064.065Z"
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>

						{/* Right border spacer on 4xl screens */}
						<div aria-hidden="true" className="@max-4xl:hidden">
							<div data-grid-content="true" />
						</div>
					</div>
				</div>

				{/* Right Column Spacer */}
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
	);
}
