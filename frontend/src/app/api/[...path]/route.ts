import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');
  const url = `${API_BASE_URL}/api/${path}`;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // 호스트/연결/CORS 관련 헤더는 제외
    const lowerKey = key.toLowerCase();
    if (!['host', 'connection', 'transfer-encoding', 'origin', 'referer'].includes(lowerKey)) {
      headers[key] = value;
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const body = await request.text();
    if (body) init.body = body;
  }

  try {
    const res = await fetch(url, init);
    const data = await res.text();

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', res.headers.get('Content-Type') || 'application/json');

    return new NextResponse(data, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: '백엔드 서버에 연결할 수 없습니다.', error: error.message },
      { status: 502 }
    );
  }
}
