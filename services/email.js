import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = ({ to, subject, html, from, phoneNumber }) => {
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to || 'daultimatestores@gmail.com',
      title: {subject},
      subject: subject,
      phoneNumber: phoneNumber,
      html: html
    });
}
