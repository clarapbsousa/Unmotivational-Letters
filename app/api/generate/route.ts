import { NextRequest, NextResponse } from 'next/server';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callOpenAI(baseUrl: string, apiKey: string, model: string, messages: any[]) {
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const url = `${normalizedBase}/chat/completions`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${apiKey}`);
  headers.set('HTTP-Referer', 'http://localhost:3000');
  headers.set('X-Title', 'Unmotivational Letters');

  console.log('[Proxy] Calling:', url);
  console.log('[Proxy] Model:', model);
  console.log('[Proxy] Key prefix:', apiKey.slice(0, 10) + '...');

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1200,
    }),
  });

  const data = await response.json();

  console.log('[Proxy] Status:', response.status);
  console.log('[Proxy] Response:', JSON.stringify(data, null, 2));

  return { response, data };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, messages } = body;

    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server API key not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Retry logic with exponential backoff for rate limits
    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        await sleep(1000 * Math.pow(2, attempt));
      }

      const { response, data } = await callOpenAI(baseUrl, apiKey, model, messages);

      if (response.ok) {
        return NextResponse.json(data);
      }

      lastError = data;

      // Don't retry 401 (unauthorized)
      if (response.status === 401) {
        break;
      }

      // Don't retry on client errors except 429
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        break;
      }
    }

    // Return the exact error from the provider so the user sees the real message
    const providerMessage = lastError?.error?.message || lastError?.error?.code || JSON.stringify(lastError);
    const statusCode = lastError?.error?.code === 'rate_limit_exceeded' ? 429 : 500;

    return NextResponse.json(
      { error: providerMessage },
      { status: statusCode }
    );
  } catch (error) {
    console.error('[Proxy] Exception:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
