import Image from "next/image";

export function InfrastructureDiagram({
	src,
	alt,
}: {
	src: string;
	alt: string;
}) {
	return (
		<figure className="overflow-hidden rounded-[28px] border border-stroke-soft-200 bg-[#f7f7f5] dark:border-white/10 dark:bg-white/[0.03]">
			<Image
				src={src}
				alt={alt}
				width={1280}
				height={853}
				className="h-auto w-full"
				priority={false}
			/>
			<figcaption className="border-stroke-soft-200 border-t px-5 py-4 text-center text-[13px] text-text-sub-600 dark:border-white/10 dark:text-white/45">
				Architectural difference based on public Resend delivery path (Amazon
				SES) and Reloop&apos;s KumoMTA stack—not a latency benchmark.
			</figcaption>
		</figure>
	);
}
