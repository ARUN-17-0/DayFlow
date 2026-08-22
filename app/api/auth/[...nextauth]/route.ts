import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/options'

export function generateStaticParams() {
  return [{ nextauth: ['session'] }]
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
