import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'STUDENT' | 'TRAINER'
    } & DefaultSession['user']
  }

  interface User {
    role: 'STUDENT' | 'TRAINER'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'STUDENT' | 'TRAINER'
  }
}
