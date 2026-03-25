export async function getEmailSettings(db: any) {
  const result = await db.prepare('SELECT key, value FROM settings WHERE key IN ("resend_api_key", "sender_email")').all();
  const settings: Record<string, string> = {};
  for (const row of result.results) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function sendEmail(db: any, to: string, subject: string, html: string) {
  const settings = await getEmailSettings(db);
  const apiKey = settings.resend_api_key;
  const senderEmail = settings.sender_email;

  if (!apiKey || !senderEmail) {
    console.warn('Email settings not configured, skipping email send to', to);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [to],
        subject: subject,
        html: html
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to send email via Resend:', errorText);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error sending email:', err);
    return false;
  }
}
