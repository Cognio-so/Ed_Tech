import { NextResponse } from 'next/server';

export async function POST(request) {
	try {
		const { text, webSearchEnabled, sessionId } = await request.json();
		if (!text) {
			return NextResponse.json({ error: 'No text provided' }, { status: 400 });
		}

		const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

		// Send pure JSON so FastAPI Body(...) parses correctly
		const res = await fetch(`${baseUrl}/chatbot_endpoint`, {
			method: 'POST',
			headers: {
				'Accept': 'text/event-stream',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				session_id: sessionId || 'voice-coaching-session',
				query: text,
				history: [],
				web_search_enabled: !!webSearchEnabled,
			}),
		});

		if (!res.ok || !res.body) {
			return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 502 });
		}

		return new NextResponse(res.body, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'X-Accel-Buffering': 'no',
			},
		});
	} catch (err) {
		console.error('Chatbot proxy error:', err);
		return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
	}
}