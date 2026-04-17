import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = ({ to, subject, html, from, phoneNumber }) => {
  

    resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to || 'dabojohnson98@gmail.com',
      title: {subject},
      subject: subject,
      phoneNumber: phoneNumber,
      html: html
    });
}


// // services/email.js
// import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({ to, subject, html, from }) => {
//   console.log(
//     to, subject, from, html
//   );
  
//   try {
//     const { data, error } = await resend.emails.send({
//       from: from || 'onboarding@resend.dev',
//       to: [to || 'dabojohnson98@gmail.com'], // to must be an array
//       subject: subject,
//       html: html
//     });
    
//     if (error) {
//       console.error("Resend error:", error);
//       return { success: false, error };
//     }
    
//     console.log("Email sent successfully:", data);
//     return { success: true, data };
    
//   } catch (error) {
//     console.error("Email sending failed:", error);
//     return { success: false, error };
//   }
// };