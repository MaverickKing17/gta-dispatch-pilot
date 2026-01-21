// app/api/token/route.ts
import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room') || 'voice-demo-room';
  const identity = searchParams.get('identity') || 'guest-user';

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity }
  );

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,      // allow microphone
    canSubscribe: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({ token });
}
