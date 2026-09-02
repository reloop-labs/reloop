export function CompactApi({
	method = "POST",
	path,
	body,
}: {
	method?: string;
	path: string;
	body: string;
}) {
	return (
		<div className="mx-auto max-w-3xl px-5 pb-12 sm:px-6 md:px-8">
			<pre className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-[#0b0b0b] p-5 font-mono text-[13px] text-white/85 dark:border-white/10">
				{`curl -X ${method} https://reloop.sh${path} \\
  -H 'content-type: application/json' \\
  -d '${body}'`}
			</pre>
			<p className="mt-3 text-[13px] text-text-sub-600 dark:text-white/45">
				Public, no API key. Rate limited to 60 requests per minute per IP.
			</p>
		</div>
	);
}
