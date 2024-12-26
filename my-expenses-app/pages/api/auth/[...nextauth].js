import NextAuth from 'next-auth'
import GoogleProvider from "next-auth/providers/google";

const authHandler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // authorization: {
            //     params: {
            //         prompt: "consent",
            //         access_type: "offline",
            //         response_type: "code",
            //         scope: "openid profile email https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly",
            //     },
            // },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account }) {
            // console.log("token", process.env.GOOGLE_CLIENT_ID);
            if (account) {
                token.id = account.id;
                token.expires_at = account.expires_at;
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token;
            return session;
        },
    },
});

export default authHandler;
