import pythonApi from '@/lib/pythonApi';

export async function POST(request) {
  try {
    const body = await request.json();

    // Start streaming from Python
    const pyRes = await pythonApi.startComicsStream({
      instructions: body.instructions,
      gradeLevel: body.gradeLevel,
      numPanels: body.numPanels,
    });

    if (!pyRes.ok || !pyRes.body) {
      const text = await pyRes.text().catch(() => '');
      return new Response(text || 'Failed to start comics stream', { status: 500 });
    }

    // Proxy the SSE stream to the browser
    const headers = new Headers(pyRes.headers);
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');

    return new Response(pyRes.body, { status: 200, headers });
  } catch (e) {
    return new Response(`Streaming error: ${e.message || e}`, { status: 500 });
  }
}
