import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portalType: { label: "Portal Type", type: "text" },
        otp: { label: "OTP Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }
        
        if (user.isActive === false) {
          throw new Error("AccountDeactivated");
        }

        // Portal Isolation Logic
        if (credentials.portalType === "customer") {
          if (user.role === "ADMIN" || user.role === "SUPPORT") {
            throw new Error("Executive accounts must log in through their authorized staff portal.");
          }
        }

        // Executive / Support OTP 2FA Verification
        if (credentials.portalType === "admin" || credentials.portalType === "support") {
          const requiredRole = credentials.portalType === "admin" ? "ADMIN" : "SUPPORT";
          if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
            throw new Error("Unauthorized: Administrator privileges required.");
          }
          if (requiredRole === "SUPPORT" && user.role !== "SUPPORT" && user.role !== "ADMIN") {
            throw new Error("Unauthorized: Staff privileges required.");
          }

          if (!credentials.otp) {
            throw new Error("Verification code (OTP) is required.");
          }

          const otpType = requiredRole === "ADMIN" ? "EXECUTIVE_LOGIN" : "SUPPORT_LOGIN";
          const validOtp = await prisma.otp.findFirst({
            where: {
              email: credentials.email,
              type: otpType,
              otp: credentials.otp,
              expiresAt: { gt: new Date() }
            }
          });

          if (!validOtp) {
            throw new Error("Invalid or expired verification code.");
          }

          // Delete OTP once verified
          await prisma.otp.delete({ where: { id: validOtp.id } });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          dob: user.dob,
          image: user.image,
          receiveOrderEmails: user.receiveOrderEmails,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // If it's an OAuth provider, we might want to check isActive
      if (account?.provider !== "credentials" && user.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        
        // Block Google Login if user doesn't exist and intent is strictly "login"
        if (!dbUser && account?.provider === "google") {
          let intent = "register";
          try {
            const cookieStore = await cookies();
            intent = cookieStore.get("oauth_intent")?.value || "register";
          } catch (error) {
            console.error("Could not read oauth_intent cookie", error);
          }
          
          if (intent === "login") {
            return `/register?error=AccountNotFound&email=${encodeURIComponent(user.email)}`;
          }
        }

        if (dbUser && dbUser.isActive === false) {
          // Returning this specific URL redirects them to the page with a custom error query
          return `/reactivate?email=${encodeURIComponent(user.email)}`;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // user object from OAuth providers only contains basic fields (id, name, email, image).
        // We must fetch the full user from the database to ensure we don't lose custom fields like phone/dob in the session.
        const dbUser = user.email ? await prisma.user.findUnique({ where: { email: user.email } }) : null;
        
        if (dbUser) {
          // If user exists in DB, use ONLY the DB information. 
          // Do not overwrite or fallback to Google's information for ANY field.
          token.role = dbUser.role || "CUSTOMER";
          token.id = dbUser.id;
          token.phone = dbUser.phone;
          token.dob = dbUser.dob;
          token.image = dbUser.image;
          token.receiveOrderEmails = dbUser.receiveOrderEmails;
          token.name = dbUser.name;
          token.email = dbUser.email;
        } else {
          // New user (or not found in DB)
          token.role = user.role || "CUSTOMER";
          token.id = user.id;
          token.phone = user.phone;
          token.dob = user.dob;
          token.image = user.image;
          token.receiveOrderEmails = user.receiveOrderEmails;
          token.name = user.name;
          token.email = user.email;
        }
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.dob !== undefined) token.dob = session.dob;
        if (session.image !== undefined) token.image = session.image;
        if (session.receiveOrderEmails !== undefined) token.receiveOrderEmails = session.receiveOrderEmails;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.phone = token.phone as string | null | undefined;
        session.user.dob = token.dob as string | null | undefined;
        session.user.image = token.image as string | null | undefined;
        session.user.receiveOrderEmails = token.receiveOrderEmails as boolean | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
