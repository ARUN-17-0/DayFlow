import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { loginSchema } from '@/lib/validations'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Validate input
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) throw new Error('Invalid credentials')

        const { email, password } = parsed.data

        // Find user - generic error to prevent enumeration
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            profile: {
              select: { firstName: true, lastName: true, avatar: true },
            },
          },
        })

        if (!user) throw new Error('Invalid email or password')
        if (!user.isActive) throw new Error('Account has been deactivated')

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) throw new Error('Invalid email or password')

        return {
          id: user.id,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          name: user.profile
            ? `${user.profile.firstName} ${user.profile.lastName}`
            : user.employeeId,
          image: user.profile?.avatar || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.employeeId = (user as any).employeeId
        token.role = (user as any).role
        token.isEmailVerified = (user as any).isEmailVerified
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).employeeId = token.employeeId
        ;(session.user as any).role = token.role
        ;(session.user as any).isEmailVerified = token.isEmailVerified
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl
    },
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
