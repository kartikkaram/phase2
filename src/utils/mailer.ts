import nodemailer, { SentMessageInfo, Transporter } from "nodemailer"





export const sendEmail=async(email:string, subject:string  ,postTitle:string , commentContent:string ,commenterName:string): Promise<SentMessageInfo | void> => {
  try {

   const transport:Transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_TRAP_USER as string,
      pass:process.env.MAIL_TRAP_PASSWORD as string
    }
  });

const message = {
  from: "Testing@gmail.com",
  to: email,
  subject:  subject,
  html: `
    <p>Hi,</p>

    <p>You received a new comment at <b>"${postTitle}"</b>:</p>

    <blockquote>
      ${commentContent}
    </blockquote>

    <p>— ${commenterName}</p>
  `,
};


   const mail=await transport.sendMail(message)

   return mail

  } catch (error:unknown) {
       if (error instanceof Error) {
      console.error("Mailer error:", error.message);
    }
  }
}