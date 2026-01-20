import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://52.79.142.181:8080';

export async function GET(request) {
  try {
    // 클라이언트의 쿠키 가져오기
    const cookieHeader = request.headers.get('cookie') || '';
    
    // 백엔드 SSE 연결
    const backendResponse = await fetch(`${BACKEND_URL}/api/notifications/subscribe`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
      // fetch의 기본 동작을 변경하여 스트리밍 허용
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'SSE 연결 실패' },
        { status: backendResponse.status }
      );
    }

    // ReadableStream을 통해 백엔드에서 받은 데이터를 클라이언트로 스트리밍
    const stream = new ReadableStream({
      async start(controller) {
        const reader = backendResponse.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }

            // 백엔드에서 받은 데이터를 그대로 클라이언트로 전달
            controller.enqueue(value);
          }
        } catch (error) {
          console.error('SSE 스트리밍 오류:', error);
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      },
    });

    // SSE 응답 헤더 설정
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // nginx 버퍼링 비활성화
      },
    });
  } catch (error) {
    console.error('SSE 프록시 오류:', error);
    return NextResponse.json(
      { error: 'SSE 연결 중 오류 발생' },
      { status: 500 }
    );
  }
}

