import { NextAuthOptions } from "next-auth";
import { randomUUID } from "crypto";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async signIn({ profile }) {
            if (!profile?.email) {
                throw new Error("No profile");
            }

            const { email, given_name, family_name, picture } =
                profile as GoogleProfile;

            const defaultUserName = `user-${randomUUID()}`;
            const avatar = picture ?? null;

            await prisma.user.upsert({
                where: {
                    email: profile.email,
                },
                create: {
                    email,
                    firstName: given_name,
                    lastName: family_name,
                    username: defaultUserName,
                    avatar,
                },
                update: {
                    firstName: given_name,
                    lastName: family_name,
                },
            });

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email! },
                });

                if (dbUser) {
                    token.id = dbUser.id; // Attach user ID to the token
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string; // Attach user ID to the session
            }
            return session;
        },
    },
};
