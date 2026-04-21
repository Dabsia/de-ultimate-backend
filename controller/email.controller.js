import Email from "../model/Email.model.js";
import { sendEmail } from "../services/email.js";

export const sendEmailToAdmin = async (req, res) => {
    const { name, phoneNumber, subject, message, from } = req.body;
    const email = await Email.create({ name, phoneNumber, subject, message, from });
    sendEmail({
        to: 'dabojohnson98@gmail.com',
        name: name,
        phoneNumber: phoneNumber,
        message: message,
        // from: from,
        subject: subject,
        html: `<h1>${name} with phone Number : ${phoneNumber} and Email address : ${from} sent:
         ${message}</h1>`
      });

    res.status(200).json({ message: "Email sent successfully", email });
}