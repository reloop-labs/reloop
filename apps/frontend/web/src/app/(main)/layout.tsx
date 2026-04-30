import { Footer } from "@reloop/web/components/footer";
import { Header } from "@reloop/web/components/header";

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div>
			<Header />
			<main className="pt-24">{children}</main>
			<Footer />
		</div>
	);
}
