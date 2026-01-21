// api/token.ts (Vercel serverless function)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const room = req.query.room as string || 'voice-demo-room';
  const identity = req.query.identity as string || 'guest-user';

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    { identity }
  );

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();

  res.status(200).json({ token });
}
