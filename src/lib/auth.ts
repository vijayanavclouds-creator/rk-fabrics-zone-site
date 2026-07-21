import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

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
        password: { label: "Password", type: "password" }
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          dob: user.dob,
          image: user.image,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // If it's an OAuth provider, we might want to check isActive
      if (account?.provider !== "credentials" && user.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser && dbUser.isActive === false) {
          // Returning this specific URL redirects them to the page with a custom error query
          return `/reactivate?email=${encodeURIComponent(user.email)}`;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role || "CUSTOMER";
        token.id = user.id;
        token.phone = user.phone;
        token.dob = user.dob;
        token.image = user.image;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.phone !== undefined) token.phone = session.phone;
        if (session.dob !== undefined) token.dob = session.dob;
        if (session.image !== undefined) token.image = session.image;
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
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
