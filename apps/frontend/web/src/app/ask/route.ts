import { ask, NLWEB_VERSION, type NlwebItem } from "@reloop/web/lib/nlweb";

type AskRequest = {
	query?: { text?: string; site?: string };
	prefer?: { streaming?: boolean | string };
};

const CORS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Accept",
};

function failure(code: string, message: string, status = 200) {
	return Response.json(
		{
			_meta: { response_type: "failure", version: NLWEB_VERSION },
			error: { code, message },
		},
		{ status, headers: CORS },
	);
}

function sse(items: NlwebItem[]) {
	const meta = {
		response_type: "answer",
		response_format: "conversational_search",
		version: NLWEB_VERSION,
	};
	const encoder = new TextEncoder();
	const event = (name: string, data: unknown) =>
		encoder.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);

	const body = new ReadableStream({
		start(controller) {
			controller.enqueue(
				event("start", { _meta: { ...meta, streaming: true } }),
			);
			items.forEach((item, index) => {
				controller.enqueue(event("result", { index, item }));
			});
			controller.enqueue(event("complete", { _meta: meta }));
			controller.close();
		},
	});
	return new Response(body, {
		headers: {
			...CORS,
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache",
		},
	});
}

async function answer(request: Request, input: AskRequest) {
	const text = input.query?.text?.trim();
	if (!text) {
		return failure("INVALID_QUERY", "query.text is required.", 400);
	}

	const streaming =
		input.prefer?.streaming === true ||
		input.prefer?.streaming === "true" ||
		(request.headers.get("accept") ?? "").includes("text/event-stream");

	const results = await ask(text.slice(0, 500), input.query?.site);
	if (results.length === 0) {
		return streaming
			? sse([])
			: failure("NO_RESULTS", `Nothing on reloop.sh matched "${text}".`);
	}
	if (streaming) return sse(results);

	return Response.json(
		{
			_meta: {
				response_type: "answer",
				response_format: "conversational_search",
				version: NLWEB_VERSION,
			},
			results,
		},
		{ headers: CORS },
	);
}

/** NLWeb `ask` (v0.55): natural-language search over the Reloop site and docs. */
export async function POST(request: Request) {
	let input: AskRequest;
	try {
		input = (await request.json()) as AskRequest;
	} catch {
		return failure(
			"INVALID_QUERY",
			'Body must be JSON: {"query":{"text":"..."}}.',
			400,
		);
	}
	return answer(request, input);
}

/** GET form for quick probes: /ask?query=...&site=docs&streaming=true */
export function GET(request: Request) {
	const params = new URL(request.url).searchParams;
	return answer(request, {
		query: {
			text: params.get("query") ?? params.get("q") ?? undefined,
			site: params.get("site") ?? undefined,
		},
		prefer: { streaming: params.get("streaming") ?? undefined },
	});
}

export function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS });
}
