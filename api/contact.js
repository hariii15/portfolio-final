const CONTACT_EMAIL = process.env.CONTACT_TO_EMAIL || 'hariharpradeepjaybal@gmail.com';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const clean = (value, limit = 500) => String(value || '').trim().slice(0, limit);
const escapeHtml = (value) => clean(value, 3000)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(503).json({ error: 'Email service is not configured yet.' });
  }

  const body = request.body || {};
  if (clean(body.website)) return response.status(200).json({ ok: true });

  const name = clean(body.name, 100);
  const email = clean(body.email, 200).toLowerCase();
  const message = clean(body.message, 3000);
  if (!name || !isEmail(email) || !message) {
    return response.status(400).json({ error: 'Please complete your name, email and message.' });
  }

  const fields = [
    ['Name', name],
    ['Email', email],
    ['Phone', clean(body.phone, 50)],
    ['Business', clean(body.business, 150)],
    ['Help needed', clean(body.help, 150)],
    ['Budget', clean(body.budget, 100)],
  ].filter(([, value]) => value);
  const details = fields
    .map(([label, value]) => `<tr><td style="padding:8px 16px 8px 0;color:#666">${label}</td><td style="padding:8px 0"><strong>${escapeHtml(value)}</strong></td></tr>`)
    .join('');

  const resendResponse = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || 'Hari Portfolio <onboarding@resend.dev>',
      to: [CONTACT_EMAIL],
      reply_to: email,
      subject: body.business
        ? `Business enquiry from ${name} — ${clean(body.business, 80)}`
        : `Portfolio contact from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#171717">
          <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#777">New portfolio enquiry</p>
          <h1 style="font-size:26px;margin:12px 0 24px">Someone wants to discuss a project.</h1>
          <table style="border-collapse:collapse;font-size:15px">${details}</table>
          <div style="margin-top:24px;padding:20px;background:#f5f3ee;border-radius:12px;white-space:pre-wrap;line-height:1.6">${escapeHtml(message)}</div>
          <p style="margin-top:20px;color:#777;font-size:13px">Reply to this email to respond directly to ${escapeHtml(name)}.</p>
        </div>`,
    }),
  });

  const resendResult = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    console.error('Resend contact error', resendResponse.status, resendResult?.message || 'Unknown error');
    return response.status(502).json({ error: 'The email service could not deliver this message.' });
  }

  return response.status(200).json({ ok: true });
}
