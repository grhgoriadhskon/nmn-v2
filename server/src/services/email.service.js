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

export async function sendBookingConfirmation({ to, customerName, proName, serviceName, date, time, reference, price }) {
  if (!transport) return; // SMTP not configured — skip silently

  const subject = `Booking confirmed – ${serviceName} with ${proName}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
      <h2 style="color:#6c47ff">Booking confirmed! ✓</h2>
      <p>Hi ${customerName},</p>
      <p>Your appointment has been booked successfully.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Professional</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${proName}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Service</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${serviceName}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Date</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${date}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888">Time</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-weight:600">${time}</td></tr>
        <tr><td style="padding:10px 0;color:#888">Price</td><td style="padding:10px 0;font-weight:600">€${Number(price).toFixed(2)}</td></tr>
      </table>
      <p style="font-size:13px;color:#888">Reference: <strong style="font-family:monospace">${reference}</strong></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="font-size:12px;color:#aaa">NMN – Nail Me Now</p>
    </div>
  `;

  await transport.sendMail({ from: config.smtp.from, to, subject, html });
}

export async function sendBookingStatusUpdate({ to, customerName, status, serviceName, reference }) {
  if (!transport) return;

  const labels = { confirmed: 'confirmed ✓', cancelled: 'cancelled', completed: 'completed ✓' };
  const subject = `Your booking has been ${labels[status] || status} – ${reference}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#222">
      <h2 style="color:#6c47ff">Booking ${labels[status] || status}</h2>
      <p>Hi ${customerName},</p>
      <p>Your booking for <strong>${serviceName}</strong> (ref: <code>${reference}</code>) has been <strong>${labels[status] || status}</strong>.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="font-size:12px;color:#aaa">NMN – Nail Me Now</p>
    </div>
  `;

  await transport.sendMail({ from: config.smtp.from, to, subject, html });
}
