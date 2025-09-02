import { buildApiUrl } from '../lib/api';

export interface SendRaceUpdatePayload {
  recipientEmail: string;
  raceDetails: string;
}

export interface SendRaceUpdateResponse {
  message: string;
  status: number;
  data?: unknown;
}

export async function sendRaceUpdate(payload: SendRaceUpdatePayload): Promise<SendRaceUpdateResponse> {
  const url = buildApiUrl('/api/notifications/send-race-update');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to send race update');
  }
  return data as SendRaceUpdateResponse;
}


