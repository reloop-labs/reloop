import { Footer } from "@reloop/web/components/footer";
import { Header } from "@reloop/web/components/header";

export default function MainLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	);
}
