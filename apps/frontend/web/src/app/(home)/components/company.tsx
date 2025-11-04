export default function Company() {
	const companies = [
		// Row 1
		{ name: "CURSOR", logo: null },
		{ name: "Spotify", logo: "spotify" },
	];

	const renderLogo = (logo: string | null) => {
		if (!logo) return null;

		switch (logo) {
			case "spotify":
				return (
					<svg
						className="h-8 w-8"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="12" cy="12" r="12" fill="white" />
						<path
							d="M17.5 10.5c-2.5-1.5-6.5-1.8-9.5-1-0.5 0.1-1-0.2-1.1-0.7-0.1-0.5 0.2-1 0.7-1.1 3.5-0.9 8-0.6 11 1 0.5 0.3 0.7 0.9 0.4 1.4-0.3 0.5-0.9 0.7-1.4 0.4zm-1.5 2.5c-2-1.2-5-1.5-7.5-0.8-0.4 0.1-0.8-0.1-0.9-0.5-0.1-0.4 0.1-0.8 0.5-0.9 2.8-0.8 6.2-0.5 8.5 1 0.4 0.2 0.5 0.7 0.3 1.1-0.2 0.4-0.7 0.5-1.1 0.3zm-1.5 2.5c-1.5-0.9-3.5-1.2-5.5-0.6-0.3 0.1-0.6-0.1-0.7-0.4-0.1-0.3 0.1-0.6 0.4-0.7 2.3-0.7 4.8-0.4 6.5 0.7 0.3 0.2 0.4 0.6 0.2 0.9-0.2 0.3-0.6 0.4-0.9 0.2z"
							fill="#1DB954"
						/>
					</svg>
				);
			case "soundcloud":
				return (
					<svg
						className="h-8 w-8"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M1.175 13.5c-.61 0-1.175.51-1.175 1.12 0 .62.56 1.13 1.175 1.13h.793c.61 0 1.175-.51 1.175-1.13 0-.61-.56-1.12-1.175-1.12h-.793zm2.366-2.5c-.61 0-1.175.51-1.175 1.12v4c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-4c0-.61-.56-1.12-1.175-1.12zm2.366-1.5c-.61 0-1.175.51-1.175 1.12v7c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-7c0-.61-.56-1.12-1.175-1.12zm2.366-1.5c-.61 0-1.175.51-1.175 1.12v10c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-10c0-.61-.56-1.12-1.175-1.12zm2.366 1.5c-.61 0-1.175.51-1.175 1.12v7c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-7c0-.61-.56-1.12-1.175-1.12zm2.366-2.5c-.61 0-1.175.51-1.175 1.12v12c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-12c0-.61-.56-1.12-1.175-1.12zm2.366 3.5c-.61 0-1.175.51-1.175 1.12v5c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-5c0-.61-.56-1.12-1.175-1.12zm2.366-4.5c-.61 0-1.175.51-1.175 1.12v14c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-14c0-.61-.56-1.12-1.175-1.12zm2.366 4.5c-.61 0-1.175.51-1.175 1.12v5c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-5c0-.61-.56-1.12-1.175-1.12zm2.366-2.5c-.61 0-1.175.51-1.175 1.12v10c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-10c0-.61-.56-1.12-1.175-1.12zm2.366 0c-.61 0-1.175.51-1.175 1.12v10c0 .62.56 1.13 1.175 1.13.61 0 1.175-.51 1.175-1.13v-10c0-.61-.56-1.12-1.175-1.12z"
							fill="white"
						/>
						<path
							d="M20 9.5c-1.5 0-2.8.8-3.5 2-.1.2-.1.4 0 .6.1.2.3.3.5.3h7c.3 0 .5-.2.5-.5v-2c0-1.4-1.1-2.5-2.5-2.5-.5 0-1 .1-1.5.4 0-.2 0-.4 0-.6 0-2.2 1.8-4 4-4s4 1.8 4 4v6c0 .3-.2.5-.5.5h-7.5c.7-1.2 2-2 3.5-2z"
							fill="white"
						/>
					</svg>
				);
			case "basecamp":
				return (
					<svg
						className="h-8 w-8"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 2L2 8l10 6 10-6-10-6zm0 2.83L18.17 8 12 11.17 5.83 8 12 4.83zM2 10l10 6 10-6v6l-10 6L2 16v-6zm10 3.17L18.17 14 12 17.17 5.83 14 12 13.17z"
							fill="white"
						/>
					</svg>
				);
			case "godaddy":
				return (
					<svg
						className="h-8 w-8"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="12" cy="12" r="10" fill="white" />
						<path
							d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
							fill="#1A1A1A"
						/>
						<circle cx="12" cy="12" r="2" fill="#1A1A1A" />
					</svg>
				);
			case "airbnb":
				return (
					<svg
						className="h-8 w-8"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 2L2 22h20L12 2zm0 3.5L18.5 19h-13L12 5.5z"
							fill="white"
						/>
						<path d="M10 14h4l-2-4-2 4z" fill="white" />
					</svg>
				);
			case "vercel":
				return (
					<svg
						className="h-8 w-8"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M12 2L2 22h20L12 2z" fill="white" />
					</svg>
				);
			default:
				return null;
		}
	};

	return (
		<div className="border-stroke-soft-100 border-t border-b">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">[02] COMPANY</span>
					<span className="text-sm text-text-sub-600">
						/ TRUSTED BY INDUSTRY LEADERS
					</span>
				</div>
				<div className="">
					<div className="mx-auto max-w-5xl px-10 py-20">
						<div className="mb-16 space-y-4 text-center">
							<h2 className="font-semibold text-3xl text-white">
								You're in good company.
							</h2>
							<p className="mx-auto max-w-2xl text-gray-300 text-lg">
								Over the past two decades, countless companies have grown from
								their first users to millions, reaching billions in market
								value.
							</p>
						</div>
						<div className="grid grid-cols-4 gap-0 border-white/10 border-t border-l">
							{companies.map((company, index) => (
								<div
									key={index}
									className="flex min-h-[120px] flex-col items-center justify-center border-white/10 border-r border-b p-8"
								>
									{company.logo && renderLogo(company.logo)}
									{company.name && (
										<span className="mt-3 font-medium text-sm text-white">
											{company.name}
										</span>
									)}
									{!company.name && !company.logo && (
										<div className="h-12 w-12 rounded bg-gray-700/50 blur-sm" />
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
