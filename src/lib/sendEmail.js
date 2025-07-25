import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  await resend.emails.send({
    from: "MotoFest <no-reply@salaomotofest.com.br>",
    to,
    subject,
    html,
  });
}
