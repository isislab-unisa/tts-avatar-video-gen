import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendEmail } from "@/lib/email";
import { nextCookies } from "better-auth/next-js";
import { cookies } from "next/headers";
import { client } from "./db";
import { getTranslations } from "next-intl/server";

const getEmailHTML = (
  title: string,
  description: string,
  buttonText: string,
  buttonUrl: string,
  footerNote: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f0f0;">
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #000000; padding: 32px; border-radius: 16px; border: 1px solid #333333; max-width: 600px; margin: 20px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="color: #ffffff; font-size: 40px; margin: 0 0 12px 0;">DUBME</h2>
          <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0; line-height: 1.2;">
            ${title}
          </h1>
        </div>
        
        <div style="text-align: center; margin-bottom: 32px;">
          <p style="font-size: 16px; color: #cccccc; margin: 0; line-height: 1.6; max-width: 480px; margin-left: auto; margin-right: auto;">
            ${description}
          </p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${buttonUrl}" 
             style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #ffffff; min-width: 160px; box-sizing: border-box;">
            ${buttonText}
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 32px;">
          <p style="font-size: 14px; color: #888888; margin: 0; line-height: 1.4;">
            ${footerNote}          
          </p>
        </div>
        
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #333333;" />
        
        <div style="text-align: center;">
          <p style="font-size: 12px; color: #666666; margin: 0;">
            © ${new Date().getFullYear()} DUBME
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const cookieStore = await cookies();
      const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
      const locale = cookieLocale ?? "en";

      const t = await getTranslations({ locale, namespace: "Email" });
      await sendEmail({
        to: user.email,
        subject: t("reset.subject"),
        text: `Click the link to reset your password: ${url}`,
        html: getEmailHTML(
          t.raw("reset.title"),
          t("reset.description"),
          t("reset.button"),
          url,
          t("reset.footerNote")
        ),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: ["openid", "email", "profile"],
      profile: (profile: {
        id: string;
        name: string;
        email: string;
        picture: string;
      }) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      scope: ["user:email"],
      profile: (profile: {
        id: string;
        name: string;
        email: string;
        avatar_url: string;
      }) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.avatar_url,
      }),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const cookieStore = await cookies();
      const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
      const locale = cookieLocale ?? "en";

      const t = await getTranslations({ locale, namespace: "Email" });

      const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;

      await sendEmail({
        to: user.email,
        subject: t("verify.subject"),
        text: `Click the link to verify your email address: ${verificationUrl}`,
        html: getEmailHTML(
          t.raw("verify.title"),
          t("verify.description"),
          t("verify.button"),
          verificationUrl,
          t("verify.footerNote")
        ),
      });
    },
  },
  plugins: [nextCookies()],
});
