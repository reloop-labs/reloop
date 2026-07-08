import Image from "next/image";

export function MdxImage({
	src,
	alt,
	width = 1200,
	height = 675,
	caption,
}: {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	caption?: string;
}) {
	return (
		<figure className="my-8">
			<div className="overflow-hidden rounded-xl border border-stroke-soft-200 dark:border-white/10">
				<Image
					src={src}
					alt={alt}
					width={width}
					height={height}
					className="h-auto w-full"
				/>
			</div>
			{caption ? (
				<figcaption className="mt-2 text-center text-[13px] text-text-sub-600 dark:text-white/50">
					{caption}
				</figcaption>
			) : null}
		</figure>
	);
}
