import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
	],
	callbacks: {
		async signIn({ user }) {
			const allowed = [process.env.INTERNAL_EMAIL, process.env.DESIGNER_EMAIL];
			return allowed.includes(user.email);
		},
		async session({ session, token }) {
			if (token.role) session.user.role = token.role;
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				if (user.email === process.env.INTERNAL_EMAIL) token.role = 'internal';
				if (user.email === process.env.DESIGNER_EMAIL) token.role = 'designer';
			}
			return token;
		},
	},
	pages: {
		signIn: '/login',
		error: '/login',
	},
});
