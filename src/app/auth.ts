import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

// Providers
import Twitter from "next-auth/providers/twitter";

// Adapters
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/prisma";

// Prisma Types
import { User as PrismaUser } from "@prisma/client";

type UserWithRole = {
  role: string;
} & DefaultSession["user"];

declare module "next-auth" {
  interface Session {
    user: UserWithRole;
  }
}

// Configure NextAuth
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Twitter],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async ({ session, user }) => {
      const dbUser = user as PrismaUser;
      return {
        ...session,
        user: {
          ...session.user,
          role: dbUser.role,
        },
      };
    },
  },
});
