import NextAuth from 'next-auth'
import GoogleProvider from "next-auth/providers/google";

const authHandler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "select_account", // Faster than "consent"
                    access_type: "online", // Faster than "offline"
                    response_type: "code",
                    scope: "openid profile email", // Minimal required scopes
                },
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/', // Custom sign-in page
        error: '/', // Custom error page
    },
    session: {
        strategy: "jwt", // Use JWT instead of database sessions for speed
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, account, user }) {
            // Only process on initial sign-in
            if (account && user) {
                return {
                    ...token,
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    accessToken: account.access_token,
                    expires_at: account.expires_at,
                };
            }
            return token;
        },
        async session({ session, token }) {
            // Return minimal session data for speed
            return {
                ...session,
                user: {
                    id: token.id,
                    email: token.email,
                    name: token.name,
                    image: token.image,
                },
            };
        },
    },
    events: {
        async signIn({ user }) {
            // Optional: Log sign-in events for debugging
            console.log('User signed in:', user.email);
        },
    },
    debug: process.env.NODE_ENV === 'development',
});

export default authHandler;
