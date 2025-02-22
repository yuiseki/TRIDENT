import NextAuth from "next-auth";

// Providers
import Twitter from "next-auth/providers/twitter";

// Adapters
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/app/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Twitter],
  adapter: PrismaAdapter(prisma),
});
