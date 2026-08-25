import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async ({
  to,
  fullName,
  token,
}: {
  to: string;
  fullName: string;
  token: string;
}) => {
  // Use environment variable for domain, or fallback to localhost during development
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/forgot-password/new-password/?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject: 'Career Map - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0a003c; margin-bottom: 16px;">Password Reset Request</h2>

        <p>Hello ${fullName},</p>

        <p>We received a request to reset your Career Map account password. Click the button below to set a new password:</p>

        <!-- CTA Button -->
        <div style="margin: 30px 0;">
          <a href="${resetLink}" 
             target="_blank"
             style="
               background-color: #773bec;
               color: #ffffff;
               padding: 14px 28px;
               text-decoration: none;
               border-radius: 8px;
               font-weight: bold;
               font-size: 16px;
               display: inline-block;
             ">
            Reset Password
          </a>
        </div>

        <!-- Fallback Link -->
        <p style="font-size: 13px; color: #666; margin-top: 24px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="font-size: 13px; word-break: break-all;">
          <a href="${resetLink}" style="color: #773bec;">${resetLink}</a>
        </p>

        <p style="margin-top: 24px;"><strong>Important:</strong> This link expires in 1 hour.</p>

        <p>If you did not request a password reset, you can safely ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

        <p style="color: #888; font-size: 13px;">
          Regards,<br/>
          <strong>Career Map Team</strong>
        </p>
      </div>
    `,
  });
};

export { sendPasswordResetEmail };