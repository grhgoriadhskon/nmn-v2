import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

function createTransport() {
  if (!config.smtp.host) return null;
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

const transport = createTransport();

function layout(content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Inter',system-ui,sans-serif">
  <div style="max-width:520px;margin:40px auto;padding:0 16px">
    <div style="text-align:center;margin-bottom:32px">
      <p style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#C9A96E;letter-spacing:4px;margin:0">NMN</p>
      <p style="font-size:12px;color:#78716C;margin:4px 0 0;letter-spacing:.08em;text-transform:uppercase">Nail Me Now</p>
    </div>
    <div style="background:#FFFFFF;border:1px solid #EDE8E1;border-radius:16px;padding:36px;box-shadow:0 4px 16px rgba(28,25,23,.06)">
      ${content}
    </div>
    <p style="text-align:center;font-size:12px;color:#A8A29E;margin-top:24px">
      © ${new Date().getFullYear()} Nail Me Now · All rights reserved
    </p>
  </div>
</body>
</html>`;
}

function table(rows) {
  return `
<table style="width:100%;border-collapse:collapse;margin:20px 0">
  ${rows.map(([label, value], i, arr) => `
  <tr>
    <td style="padding:11px 0;${i < arr.length - 1 ? 'border-bottom:1px solid #EDE8E1;' : ''}color:#78716C;font-size:14px">${label}</td>
    <td style="padding:11px 0;${i < arr.length - 1 ? 'border-bottom:1px solid #EDE8E1;' : ''}font-weight:600;font-size:14px;color:#1C1917;text-align:right">${value}</td>
  </tr>`).join('')}
</table>`;
}

export async function sendBookingConfirmation({ to, customerName, proName, serviceName, date, time, reference, price }) {
  if (!transport) return;

  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject: `Booking confirmed – ${serviceName} with ${proName}`,
    html: layout(`
      <div style="text-align:center;margin-bottom:28px">
        <div style="width:56px;height:56px;border-radius:50%;background:#E8F5E9;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px">✓</div>
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:#1C1917;margin:0 0 8px">Booking confirmed</h1>
        <p style="color:#78716C;font-size:14px;margin:0">Hi ${customerName}, you're all set!</p>
      </div>
      ${table([
        ['Professional', proName],
        ['Service', serviceName],
        ['Date', date],
        ['Time', time],
        ['Price', `€${Number(price).toFixed(2)}`],
      ])}
      <div style="background:#FBF7F0;border:1px solid #EDE8E1;border-radius:10px;padding:14px 18px;margin-top:8px">
        <p style="font-size:11px;color:#78716C;text-transform:uppercase;letter-spacing:.08em;margin:0 0 4px">Reference number</p>
        <p style="font-family:monospace;font-size:17px;font-weight:700;color:#A88748;margin:0">${reference}</p>
      </div>
    `),
  });
}

export async function sendBookingStatusUpdate({ to, customerName, status, serviceName, proName, date, time, reference }) {
  if (!transport) return;

  const info = {
    confirmed: { icon: '✓', title: 'Booking confirmed', color: '#14532D', bg: '#F0FDF4', msg: `Your booking has been confirmed by ${proName}. See you soon!` },
    cancelled: { icon: '✕', title: 'Booking cancelled', color: '#7F1D1D', bg: '#FEF2F2', msg: 'Your booking has been cancelled. You can make a new booking anytime.' },
    completed: { icon: '★', title: 'Visit completed', color: '#78350F', bg: '#FBF7F0', msg: 'Thank you for your visit! We hope you loved your experience.' },
  };
  const { icon, title, color, bg, msg } = info[status] || info.cancelled;

  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject: `${title} – ${reference}`,
    html: layout(`
      <div style="text-align:center;margin-bottom:28px">
        <div style="width:56px;height:56px;border-radius:50%;background:${bg};display:inline-flex;align-items:center;justify-content:center;font-size:24px;color:${color};margin-bottom:16px">${icon}</div>
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:#1C1917;margin:0 0 8px">${title}</h1>
        <p style="color:#78716C;font-size:14px;margin:0">Hi ${customerName}, ${msg}</p>
      </div>
      ${table([
        ['Service', serviceName],
        ...(proName ? [['Professional', proName]] : []),
        ...(date    ? [['Date', date]]            : []),
        ...(time    ? [['Time', time]]            : []),
        ['Reference', reference],
      ])}
    `),
  });
}
