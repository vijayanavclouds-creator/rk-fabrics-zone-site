import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    phone?: string | null
    dob?: string | null
    image?: string | null
  }
  
  interface Session {
    user: User & {
      id: string
      role: string
      phone?: string | null
      dob?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    phone?: string | null
    dob?: string | null
    image?: string | null
  }
}
