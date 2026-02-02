import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured");
    }

    const { email, resetUrl }: PasswordResetRequest = await req.json();

    // Validate required fields
    if (!email || !resetUrl) {
      console.error("Missing required fields:", { email: !!email, resetUrl: !!resetUrl });
      throw new Error("Missing required fields: email and resetUrl are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      throw new Error("Invalid email format");
    }

    console.log("Sending password reset email to:", email);

    const emailResponse = await resend.emails.send({
      from: "MessageGuide <noreply@resend.dev>", // Update with your verified domain
      to: [email],
      subject: "Reset Your Password - MessageGuide",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td align="center" style="padding: 40px 0;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                      <td style="padding: 40px 40px 20px;">
                        <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: #18181b; text-align: center;">
                          Reset Your Password
                        </h1>
                        <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #52525b; text-align: center;">
                          We received a request to reset your password for your MessageGuide account. Click the button below to set a new password.
                        </p>
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #7c3aed; text-decoration: none; border-radius: 8px;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin: 24px 0 0; font-size: 14px; line-height: 20px; color: #71717a; text-align: center;">
                          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                        <p style="margin: 16px 0 0; font-size: 14px; line-height: 20px; color: #71717a; text-align: center;">
                          This link will expire in 1 hour for security reasons.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 40px 40px;">
                        <hr style="margin: 0 0 20px; border: none; border-top: 1px solid #e4e4e7;">
                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #a1a1aa; text-align: center;">
                          If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="margin: 8px 0 0; font-size: 12px; line-height: 18px; color: #7c3aed; text-align: center; word-break: break-all;">
                          ${resetUrl}
                        </p>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 24px 0 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                    © ${new Date().getFullYear()} MessageGuide. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-password-reset function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
