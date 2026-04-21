import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = ({ to, subject, html, from, phoneNumber }) => {
    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to || 'dabojohnson98@gmail.com',
      subject: subject,
      phoneNumber: phoneNumber,
      html: html
    });
}
