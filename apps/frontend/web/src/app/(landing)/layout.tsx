import { Footer } from "@web/components/footer";
import { Header } from "@web/components/header";

export default function LandingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Header />
			{children}
			<div className="mt-10">
				<Footer />
			</div>
		</>
	);
}
