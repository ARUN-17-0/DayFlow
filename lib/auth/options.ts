import { type NextAuthOptions } from 'next-auth'
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

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          include: {
            profile: {
              include: {
                department: true,
                designation: true,
              },
            },
          },
        })

        if (!user) throw new Error('Invalid email or password')
        if (!user.isActive) throw new Error('Account is deactivated. Contact HR.')

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) throw new Error('Invalid email or password')

        return {
          id: user.id,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          name: user.profile
            ? `${user.profile.firstName} ${user.profile.lastName}`
            : user.email,
          image: user.profile?.avatar || null,
          isEmailVerified: user.isEmailVerified,
          department: user.profile?.department?.name || null,
          designation: user.profile?.designation?.name || null,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.employeeId = (user as any).employeeId
        token.role = (user as any).role
        token.isEmailVerified = (user as any).isEmailVerified
        token.department = (user as any).department
        token.designation = (user as any).designation
      }

      // Handle session update
      if (trigger === 'update' && session) {
        return { ...token, ...session }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        const u = session.user as any
        u.id = token.id as string
        u.employeeId = token.employeeId as string
        u.role = token.role as 'ADMIN' | 'HR_OFFICER' | 'EMPLOYEE'
        u.isEmailVerified = token.isEmailVerified as boolean
        u.department = token.department as string | null
        u.designation = token.designation as string | null
      }
      return session
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

  secret: process.env.NEXTAUTH_SECRET || 'dayflow-dev-secret-key-change-in-prod-min32chars',
}
