import { buildApiUrl } from '../lib/api';

export interface SendRaceUpdatePayload {
  raceDetails: string;
}

export interface SendRaceUpdateResponse {
  message: string;
  status: number;
  data?: unknown;
}

export async function sendRaceUpdate(payload: SendRaceUpdatePayload, accessToken?: string): Promise<SendRaceUpdateResponse> {
  const url = buildApiUrl('/api/notifications/send-race-update');

  console.log('Sending race update to:', url);
  console.log('With token:', accessToken ? 'Present' : 'Missing');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  console.log('Response status:', res.status);
  console.log('Response headers:', Object.fromEntries(res.headers.entries()));

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Error response body:', data);
    throw new Error(data?.message || 'Failed to send race update');
  }
  return data as SendRaceUpdateResponse;
}


