"use client";

import { Calligraph } from "calligraph";
import { useEffect, useState } from "react";

const alternatives = [
	"Resend",
	"Mailgun",
	"SendGrid",
	"AWS SES",
	"Postmark",
	"Loops",
];

export function AnimatedAlternative() {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % alternatives.length);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

	return (
		<span className="inline-flex items-center gap-1.5 text-sm">
			<span className="font-medium text-white/40">
				An open-source alternative to
			</span>
			<span className="inline-block text-left font-semibold">
				<Calligraph>{alternatives[currentIndex] ?? ""}</Calligraph>
			</span>
		</span>
	);
}
