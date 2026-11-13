import { createClient } from 'npm:@supabase/supabase-js@2';

type AppointmentRecord = {
  id: string;
  customer_name: string;
  service_type: string;
  appointment_date: string;
  time_slot: string;
};

type DatabaseWebhook = {
  type: string;
  schema: string;
  table: string;
  record?: AppointmentRecord | null;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const webhookSecret = Deno.env.get('APPOINTMENT_WEBHOOK_SECRET');
  if (!webhookSecret || request.headers.get('x-webhook-secret') !== webhookSecret) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let event: DatabaseWebhook;
  try {
    event = await request.json() as DatabaseWebhook;
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400);
  }

  if (event.type !== 'INSERT' || event.schema !== 'public' || event.table !== 'appointments' || !event.record) {
    return json({ ignored: true });
  }

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const legacyServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const secretKeysValue = Deno.env.get('SUPABASE_SECRET_KEYS');
  let modernServiceKey: string | undefined;
  if (secretKeysValue) {
    try {
      modernServiceKey = JSON.parse(secretKeysValue).default;
    } catch {
      return json({ error: 'Supabase secret key configuration is invalid' }, 500);
    }
  }
  const serviceKey = legacyServiceKey || modernServiceKey;
  if (!projectUrl || !serviceKey) return json({ error: 'Supabase server configuration is missing' }, 500);

  const admin = createClient(projectUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: devices, error: devicesError } = await admin
    .from('admin_devices')
    .select('expo_push_token');
  if (devicesError) return json({ error: 'Could not load notification devices' }, 500);
  if (!devices?.length) return json({ sent: 0, reason: 'No owner devices registered' });

  const appointment = event.record;
  const messages = devices.map((device: { expo_push_token: string }) => ({
    to: device.expo_push_token,
    sound: 'default',
    title: 'New appointment booked',
    body: `${appointment.customer_name} · ${appointment.appointment_date} at ${appointment.time_slot}`,
    data: { type: 'new_appointment', appointmentId: appointment.id },
    channelId: 'appointments',
    priority: 'high',
  }));

  const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      ...(expoAccessToken ? { Authorization: `Bearer ${expoAccessToken}` } : {}),
    },
    body: JSON.stringify(messages),
  });

  if (!pushResponse.ok) return json({ error: 'Expo Push Service rejected the request' }, 502);

  const tickets = await pushResponse.json();
  const invalidTokens = Array.isArray(tickets?.data)
    ? tickets.data.flatMap((ticket: { status?: string; details?: { error?: string } }, index: number) =>
      ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered'
        ? [devices[index].expo_push_token]
        : [])
    : [];

  if (invalidTokens.length) {
    await admin.from('admin_devices').delete().in('expo_push_token', invalidTokens);
  }

  return json({ sent: messages.length, removedInvalidDevices: invalidTokens.length });
});
